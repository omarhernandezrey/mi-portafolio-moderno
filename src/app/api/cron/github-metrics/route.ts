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

    return NextResponse.json({
      success: true,
      completo: pendientes.length === 0 && !motivoDetencion,
      capturedAt,
      totalRepos: repos.length,
      procesados: procesados.length,
      saltados,
      pendientes,
      duracionMs: Date.now() - inicio,
    });
  } catch (error) {
    console.error('[github-metrics] error del cron:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
