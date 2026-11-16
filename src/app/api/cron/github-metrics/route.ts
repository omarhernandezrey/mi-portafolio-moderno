import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireCronAuth } from '@/lib/cronAuth';
import { serverEnv } from '@/config/env';
import { CupoAgotadoError, obtenerMetricasDeRepositorio, obtenerReposDelUsuario } from '@/lib/github';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/** `PRODUCT.md`: "las métricas de actividad provienen de los repositorios de GitHub del usuario omarhernandezrey". */
const GITHUB_USERNAME = 'omarhernandezrey';

function hoyEnBogota(): string {
  return new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const authError = requireCronAuth(req);
  if (authError) return authError;

  const token = serverEnv.GITHUB_TOKEN;
  if (!token) {
    console.error('[github-metrics] GITHUB_TOKEN no configurado — cron deshabilitado');
    return NextResponse.json({ error: 'GITHUB_TOKEN no configurado' }, { status: 503 });
  }

  try {
    const repos = await obtenerReposDelUsuario(GITHUB_USERNAME, token);
    const capturedAt = hoyEnBogota();

    const procesados: string[] = [];
    const saltados: Array<{ repo: string; motivo: string }> = [];

    for (const repo of repos) {
      let metricas;
      try {
        metricas = await obtenerMetricasDeRepositorio(repo, token);
      } catch (error) {
        if (error instanceof CupoAgotadoError) {
          // Sin cupo no hay nada más que intentar esta corrida: se detiene
          // entera en vez de seguir gastando lo poco que quede.
          console.error(`[github-metrics] ${error.message} — se detiene tras ${procesados.length}/${repos.length} repos.`);
          break;
        }
        // Un repo puntual roto (renombrado, sin stats todavía, etc.) no debe
        // tumbar la corrida de los demás.
        const motivo = error instanceof Error ? error.message : String(error);
        console.error(`[github-metrics] ${repo}: ${motivo}`);
        saltados.push({ repo, motivo });
        continue;
      }

      const { error: upsertError } = await supabaseServer.from('github_metrics').upsert(
        {
          repo: metricas.repo,
          captured_at: capturedAt,
          commits: metricas.commits,
          additions: metricas.additions,
          deletions: metricas.deletions,
          languages: metricas.languages,
          stars: metricas.stars,
          forks: metricas.forks,
          open_prs: metricas.openPrs,
          closed_prs: metricas.closedPrs,
          daily_activity: metricas.dailyActivity,
          current_streak: metricas.currentStreak,
          longest_streak: metricas.longestStreak,
        },
        { onConflict: 'repo,captured_at' }
      );

      if (upsertError) {
        console.error(`[github-metrics] upsert de ${repo} falló:`, upsertError.message);
        saltados.push({ repo, motivo: upsertError.message });
        continue;
      }

      procesados.push(repo);
    }

    return NextResponse.json({
      success: true,
      capturedAt,
      totalRepos: repos.length,
      procesados: procesados.length,
      saltados,
    });
  } catch (error) {
    console.error('[github-metrics] error del cron:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
