import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireCronAuth } from '@/lib/cronAuth';
import { serverEnv } from '@/config/env';
import {
  CupoAgotadoError,
  obtenerMetricasDeRepositorio,
  obtenerReposDelUsuario,
  type MetricasRepositorio,
} from '@/lib/github';
import { construirProyectoPropuesto } from '@/lib/portfolio/githubSync';
import { notifyTelegram } from '@/lib/chatbot/telegram';

/**
 * Con Fluid Compute (Hobby y Pro) el máximo es 300s. Sin Fluid, Hobby se
 * queda en 60 — y 60 no alcanza: procesar los repos uno por uno, con los
 * reintentos de `obtenerConReintento202` cuando GitHub responde 202, tarda
 * ~7s por repo. Con más de 8-9 repos ya no cabía en 60s y Vercel cortaba con
 * un 504 silencioso (sin cuerpo, sin pista de qué pasó). Medido en producción
 * el 2026-11-17: con 9 de los repos reales de Omar, se agotaron los 60s.
 */
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/** `PRODUCT.md`: "las métricas de actividad provienen de los repositorios de GitHub del usuario omarhernandezrey". */
const GITHUB_USERNAME = 'omarhernandezrey';

/**
 * Repos procesados a la vez. Cada repo ya lanza 6 peticiones en paralelo
 * (`obtenerMetricasDeRepositorio`), así que 5 workers → ~30 peticiones
 * simultáneas: lejos del límite secundario de GitHub (unas 100).
 */
const CONCURRENCIA = 5;

/**
 * Margen antes del límite de `maxDuration` en el que ya no se empieza un
 * repo nuevo. Un repo con las estadísticas "en cálculo" (202) puede tardar
 * hasta ~30s en reintentos (`2+4+6+8+10`s) más la propia petición: con 45s
 * de margen, mejor terminar con una corrida parcial y respuesta 200 que
 * arriesgarse a otro 504 que no informa nada.
 */
const MARGEN_MS = 45_000;
const PRESUPUESTO_MS = maxDuration * 1000 - MARGEN_MS;

function hoyEnBogota(): string {
  return new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 10);
}

/**
 * Propone como borrador cada repo procesado que todavía no tiene fila en
 * `portfolio_projects` (T-21). `is_published` siempre `false` — nunca se
 * publica solo. Devuelve los slugs creados, para el aviso de Telegram
 * (sin novedad no hay mensaje: si la lista viene vacía, no se avisa).
 */
async function proponerProyectosNuevos(metricasPorRepo: ReadonlyMap<string, MetricasRepositorio>): Promise<string[]> {
  if (metricasPorRepo.size === 0) return [];

  const { data: existentes, error } = await supabaseServer.from('portfolio_projects').select('slug, repository');
  if (error) {
    console.error(`[github-metrics] no se pudo leer portfolio_projects para T-21: ${error.message}`);
    return [];
  }

  const slugsExistentes = new Set((existentes ?? []).map((p) => p.slug as string));
  const reposExistentes = new Set((existentes ?? []).map((p) => p.repository as string).filter(Boolean));

  const propuestos: string[] = [];
  for (const [repoFullName, metricas] of metricasPorRepo) {
    const urlRepo = `https://github.com/${repoFullName}`;
    if (reposExistentes.has(urlRepo)) continue;

    const propuesta = construirProyectoPropuesto(
      { repoFullName, languagesBytes: metricas.languagesBytes },
      slugsExistentes,
    );
    slugsExistentes.add(propuesta.slug); // evita colisiones dentro del mismo lote

    const { error: insertError } = await supabaseServer.from('portfolio_projects').insert(propuesta);
    if (insertError) {
      console.error(`[github-metrics] T-21: no se pudo proponer ${repoFullName}: ${insertError.message}`);
      continue;
    }
    propuestos.push(propuesta.slug);
  }

  return propuestos;
}

/** Devuelve el mensaje de error del upsert, o `null` si se guardó. */
async function guardarMetricas(m: MetricasRepositorio, capturedAt: string): Promise<string | null> {
  const { error } = await supabaseServer.from('github_metrics').upsert(
    {
      repo: m.repo,
      captured_at: capturedAt,
      commits: m.commits,
      additions: m.additions,
      deletions: m.deletions,
      languages: m.languages,
      languages_bytes: m.languagesBytes,
      stars: m.stars,
      forks: m.forks,
      open_prs: m.openPrs,
      closed_prs: m.closedPrs,
      daily_activity: m.dailyActivity,
      current_streak: m.currentStreak,
      longest_streak: m.longestStreak,
    },
    { onConflict: 'repo,captured_at' }
  );
  return error ? error.message : null;
}

export async function GET(req: NextRequest) {
  const authError = requireCronAuth(req);
  if (authError) return authError;

  const token = serverEnv.GITHUB_TOKEN;
  if (!token) {
    console.error('[github-metrics] GITHUB_TOKEN no configurado — cron deshabilitado');
    return NextResponse.json({ error: 'GITHUB_TOKEN no configurado' }, { status: 503 });
  }

  const inicio = Date.now();

  try {
    const repos = await obtenerReposDelUsuario(GITHUB_USERNAME, token);
    const capturedAt = hoyEnBogota();

    const procesados: string[] = [];
    const saltados: Array<{ repo: string; motivo: string }> = [];
    // Para T-21 (proponer proyecto nuevo): solo de los repos que de verdad
    // se guardaron esta corrida, con los lenguajes ya calculados.
    const metricasPorRepo = new Map<string, MetricasRepositorio>();
    let siguiente = 0;
    let detener = false;
    let motivoDetencion: string | null = null;

    // Pool de `CONCURRENCIA` workers: cada uno toma el siguiente índice
    // disponible hasta que no quede presupuesto de tiempo, se agote el cupo
    // de GitHub, o no queden repos. `siguiente++` es seguro sin candado: no
    // hay ningún `await` entre leerlo e incrementarlo.
    const worker = async (): Promise<void> => {
      while (!detener) {
        if (Date.now() - inicio > PRESUPUESTO_MS) {
          detener = true;
          motivoDetencion ??= 'presupuesto de tiempo agotado';
          return;
        }

        const i = siguiente++;
        if (i >= repos.length) return;
        const repo = repos[i];

        try {
          const metricas = await obtenerMetricasDeRepositorio(repo, token);
          const errorUpsert = await guardarMetricas(metricas, capturedAt);
          if (errorUpsert) {
            console.error(`[github-metrics] upsert de ${repo} falló:`, errorUpsert);
            saltados.push({ repo, motivo: errorUpsert });
          } else {
            procesados.push(repo);
            metricasPorRepo.set(repo, metricas);
          }
        } catch (error) {
          if (error instanceof CupoAgotadoError) {
            // Sin cupo no tiene sentido seguir: se frena a todos los
            // workers (no cancela el que ya esté en vuelo en cada uno, pero
            // ninguno empieza uno nuevo).
            detener = true;
            motivoDetencion = error.message;
            saltados.push({ repo, motivo: error.message });
            return;
          }
          // Un repo puntual roto (renombrado, sin stats todavía, etc.) no
          // debe tumbar la corrida de los demás.
          const motivo = error instanceof Error ? error.message : String(error);
          console.error(`[github-metrics] ${repo}: ${motivo}`);
          saltados.push({ repo, motivo });
        }
      }
    };

    await Promise.all(Array.from({ length: Math.min(CONCURRENCIA, repos.length) }, worker));

    const pendientes = repos.slice(Math.min(siguiente, repos.length));
    if (motivoDetencion) {
      console.error(
        `[github-metrics] corrida detenida (${motivoDetencion}) tras ${procesados.length}/${repos.length} repos; ${pendientes.length} pendientes.`
      );
    }

    // T-21: repos que ya tienen métricas pero todavía no tienen proyecto en
    // el panel se proponen como borrador (nunca publicados). Solo se avisa
    // por Telegram si de verdad se propuso algo — sin novedad no hay mensaje.
    const propuestos = await proponerProyectosNuevos(metricasPorRepo);
    if (propuestos.length > 0) {
      await notifyTelegram(
        `🆕 *${propuestos.length} proyecto${propuestos.length > 1 ? 's' : ''} propuesto${propuestos.length > 1 ? 's' : ''} desde GitHub*\n${propuestos.map((s) => `• ${s}`).join('\n')}\nRevísalos en /admin/proyectos — quedaron sin publicar.`,
      );
    }

    return NextResponse.json({
      success: true,
      completo: pendientes.length === 0 && !motivoDetencion,
      capturedAt,
      totalRepos: repos.length,
      procesados: procesados.length,
      saltados,
      pendientes,
      propuestos,
      duracionMs: Date.now() - inicio,
    });
  } catch (error) {
    console.error('[github-metrics] error del cron:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
