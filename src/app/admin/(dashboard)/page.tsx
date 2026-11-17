import React from 'react';
import { Activity, Briefcase, CalendarDays, Flame, FolderKanban, Gauge, GitCommit, LayoutGrid } from 'lucide-react';
import PageHeader from '@/components/admin/ui/PageHeader';
import AdminCard from '@/components/admin/ui/AdminCard';
import EmptyState from '@/components/admin/ui/EmptyState';
import StatCard from '@/components/admin/ui/StatCard';
import { AdminButtonLink } from '@/components/admin/ui/AdminButton';
import { supabaseServer } from '@/lib/supabaseServer';
import { hoyEnBogota } from '@/lib/github';
import { calcularResumenDePortafolio, type FilaMetricasRepo } from '@/lib/metrics/github-summary';
import { DailyActivityChart } from '@/components/admin/metrics/DailyActivityChart';
import { ContributionHeatmap } from '@/components/admin/metrics/ContributionHeatmap';
import { LanguagesBarChart } from '@/components/admin/metrics/LanguagesBarChart';
import { RepoCommitsBarChart } from '@/components/admin/metrics/RepoCommitsBarChart';

export const dynamic = 'force-dynamic';

async function contarFilas(tabla: string): Promise<number | null> {
  const { count, error } = await supabaseServer.from(tabla).select('*', { count: 'exact', head: true });
  if (error) {
    console.error(`[admin/portafolio] ${tabla}: ${error.message}`);
    return null;
  }
  return count ?? 0;
}

/**
 * Última fila capturada por repo (T-14). `github_metrics` guarda una fila
 * por (repo, día): se piden todas ordenadas por fecha descendente y se
 * queda la primera que aparece de cada repo, sin pedirle a Postgres un
 * `DISTINCT ON` desde el cliente de Supabase.
 */
async function obtenerUltimasMetricasPorRepo(): Promise<FilaMetricasRepo[] | null> {
  const { data, error } = await supabaseServer
    .from('github_metrics')
    .select('repo, daily_activity, languages_bytes, captured_at')
    .order('captured_at', { ascending: false });

  if (error) {
    console.error(`[admin/portafolio] github_metrics: ${error.message}`);
    return null;
  }

  const vistos = new Set<string>();
  const filas: FilaMetricasRepo[] = [];
  for (const fila of data ?? []) {
    if (vistos.has(fila.repo)) continue;
    vistos.add(fila.repo);
    filas.push({
      repo: fila.repo,
      daily_activity: fila.daily_activity ?? [],
      languages_bytes: fila.languages_bytes ?? {},
    });
  }
  return filas;
}

function formatearVariacion(variacion: number | null): { value: string; direction: 'up' | 'down' | 'neutral' } | undefined {
  if (variacion === null) return undefined;
  const direccion = variacion > 0 ? 'up' : variacion < 0 ? 'down' : 'neutral';
  const signo = variacion > 0 ? '+' : '';
  return { value: `${signo}${variacion.toFixed(0)}%`, direction: direccion };
}

/**
 * Módulos de contenido que ya tienen su propia pantalla de edición
 * (T-09 en adelante). Cada uno se lista aquí con su tabla real, no con una
 * cifra inventada; el resto del contenido sigue en el `EmptyState` de abajo
 * hasta que tenga su propia tarea.
 */
const MODULOS_LISTOS = [
  { tabla: 'portfolio_projects', icon: FolderKanban, nombre: 'Proyectos', nombrePlural: 'proyectos', href: '/admin/proyectos', accion: 'Gestionar proyectos' },
  { tabla: 'portfolio_skills', icon: Gauge, nombre: 'Skills', nombrePlural: 'skills', href: '/admin/skills', accion: 'Gestionar skills' },
] as const;

export default async function PortafolioDashboardPage() {
  const currentDate = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Bogota',
  });
  const [conteos, filasMetricas] = await Promise.all([
    Promise.all(MODULOS_LISTOS.map((m) => contarFilas(m.tabla))),
    obtenerUltimasMetricasPorRepo(),
  ]);

  const resumen = filasMetricas ? calcularResumenDePortafolio(filasMetricas, hoyEnBogota()) : null;
  const hayMetricas = resumen !== null && resumen.totalRepos > 0;
  const sparklineActividad = resumen?.actividadReciente.slice(-14).map((d) => d.commits);

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader
        overline="Portafolio"
        title="Resumen"
        description={
          <span className="inline-flex items-center gap-2">
            <CalendarDays size={14} className="text-primary" />
            {currentDate.charAt(0).toUpperCase() + currentDate.slice(1)}
          </span>
        }
        actions={
          <AdminButtonLink
            href="/admin/negocio"
            variant="primary"
            size="sm"
            icon={<Briefcase size={15} />}
          >
            Ir a Negocio
          </AdminButtonLink>
        }
      />

      {hayMetricas ? (
        <div className="space-y-5 lg:space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="COMMITS, ÚLTIMOS 30 DÍAS"
              value={String(resumen.commitsUltimos30Dias)}
              icon={<GitCommit size={18} />}
              color="primary"
              trend={formatearVariacion(resumen.variacionCommits30Dias)}
              description={
                resumen.variacionCommits30Dias === null
                  ? 'Sin actividad en los 30 días anteriores para comparar.'
                  : 'Comparado con los 30 días anteriores.'
              }
              sparkline={sparklineActividad}
            />
            <StatCard
              title="RACHA ACTUAL"
              value={`${resumen.rachaActual} ${resumen.rachaActual === 1 ? 'día' : 'días'}`}
              icon={<Flame size={18} />}
              color="accent"
              description={`Racha máxima registrada: ${resumen.rachaMaxima} ${resumen.rachaMaxima === 1 ? 'día' : 'días'}.`}
            />
            <StatCard
              title="REPOSITORIOS ACTIVOS"
              value={String(resumen.reposActivos)}
              icon={<FolderKanban size={18} />}
              color="info"
              description={`De ${resumen.totalRepos} ${resumen.totalRepos === 1 ? 'repositorio capturado' : 'repositorios capturados'} en total.`}
            />
            <StatCard
              title="LENGUAJE PRINCIPAL"
              value={resumen.lenguajePrincipal?.lenguaje ?? 'Sin datos'}
              icon={<Gauge size={18} />}
              color="success"
              description={
                resumen.lenguajePrincipal
                  ? `${resumen.lenguajePrincipal.porcentaje.toFixed(1)}% de los bytes agregados.`
                  : 'El cron guarda bytes por lenguaje desde esta tarea; aparecerá en la próxima corrida.'
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <AdminCard padding="normal">
              <DailyActivityChart data={resumen.actividadReciente} />
            </AdminCard>
            <AdminCard padding="normal">
              <ContributionHeatmap data={resumen.actividadAnual} />
            </AdminCard>
            <AdminCard padding="normal">
              <LanguagesBarChart data={resumen.lenguajesOrdenados} />
            </AdminCard>
            <AdminCard padding="normal">
              <RepoCommitsBarChart data={resumen.commitsPorRepositorio} />
            </AdminCard>
          </div>
        </div>
      ) : (
        <AdminCard padding="normal">
          <EmptyState
            icon={<Activity size={22} />}
            title="Aún sin panel de métricas"
            description="Los commits, rachas y lenguajes de los repositorios se recopilan cada día. Esta vista los mostrará en cuanto el cron de GitHub haga su primera captura."
          />
        </AdminCard>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {MODULOS_LISTOS.map((modulo, i) => {
          const total = conteos[i];
          const Icon = modulo.icon;
          return (
            <AdminCard key={modulo.tabla} padding="normal" className="flex flex-col justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                  <Icon size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-admin-ink">{modulo.nombre}</p>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-text-muted">
                    {total === null
                      ? `Crea, edita, publica y reordena ${modulo.nombrePlural} desde aquí.`
                      : `${total} ${modulo.nombrePlural}: crea, edita, publica y reordena.`}
                  </p>
                </div>
              </div>
              <AdminButtonLink href={modulo.href} size="sm" className="self-start">
                {modulo.accion}
              </AdminButtonLink>
            </AdminCard>
          );
        })}

        <AdminCard padding="normal">
          <EmptyState
            icon={<LayoutGrid size={22} />}
            title="El resto del contenido aún no se edita desde aquí"
            description="Educación, servicios y tecnologías se irán sumando a esta área con el mismo patrón que ya usan proyectos y skills."
          />
        </AdminCard>
      </div>
    </div>
  );
}
