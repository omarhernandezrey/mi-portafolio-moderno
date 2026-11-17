import React from 'react';
import Link from 'next/link';
import { Activity, AlertTriangle, Briefcase, CalendarDays, ChevronRight, Flame, FolderKanban, Gauge, GitCommit, LayoutGrid, Users } from 'lucide-react';
import PageHeader from '@/components/admin/ui/PageHeader';
import AdminCard from '@/components/admin/ui/AdminCard';
import EmptyState from '@/components/admin/ui/EmptyState';
import ErrorState from '@/components/admin/ui/ErrorState';
import StatCard from '@/components/admin/ui/StatCard';
import { AdminButtonLink } from '@/components/admin/ui/AdminButton';
import { supabaseServer } from '@/lib/supabaseServer';
import { hoyEnBogota } from '@/lib/github';
import { calcularResumenDePortafolio, type FilaMetricasRepo } from '@/lib/metrics/github-summary';
import { FUENTES_DEL_SITIO, bogotaStartOfMonth, calcularVariacionMensual } from '@/lib/admin/alcanceDelSitio';
import { DailyActivityChart } from '@/components/admin/metrics/DailyActivityChart';
import { ContributionHeatmap } from '@/components/admin/metrics/ContributionHeatmap';
import { LanguagesBarChart } from '@/components/admin/metrics/LanguagesBarChart';
import { RepoCommitsBarChart } from '@/components/admin/metrics/RepoCommitsBarChart';

export const dynamic = 'force-dynamic';

/**
 * `soloPublicados`: `portfolio_projects` acumula, junto a los proyectos
 * reales, los borradores que el sync de GitHub propone solo (T-21, nunca se
 * publican solos) — 77 de las 99 filas de hoy lo son. Contarlas todas aquí
 * diría «99 proyectos» cuando de verdad hay 22; el resumen cuenta lo real.
 */
async function contarFilas(tabla: string, soloPublicados = false): Promise<number | null> {
  let query = supabaseServer.from(tabla).select('*', { count: 'exact', head: true });
  if (soloPublicados) query = query.eq('is_published', true);
  const { count, error } = await query;
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

async function contarLeads(desde: Date, hasta?: Date): Promise<number | null> {
  let query = supabaseServer
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .in('source', FUENTES_DEL_SITIO)
    .gte('created_at', desde.toISOString());
  if (hasta) query = query.lt('created_at', hasta.toISOString());
  const { count, error } = await query;
  if (error) {
    console.error(`[admin/portafolio] leads (alcance del sitio): ${error.message}`);
    return null;
  }
  return count ?? 0;
}

/**
 * Quinto KPI (T-27): cuántos leads llegan de verdad desde el sitio público
 * este mes, comparado con el anterior. `leadsDelta === null` cuando el mes
 * anterior no tiene base para comparar (no se inventa un porcentaje).
 */
async function obtenerAlcanceDelSitio(): Promise<{ esteMes: number; delta: number | null } | null> {
  const inicioMesActual = bogotaStartOfMonth(0);
  const inicioMesAnterior = bogotaStartOfMonth(1);
  const [esteMes, mesAnterior] = await Promise.all([
    contarLeads(inicioMesActual),
    contarLeads(inicioMesAnterior, inicioMesActual),
  ]);
  if (esteMes === null || mesAnterior === null) return null;
  return { esteMes, delta: calcularVariacionMensual(esteMes, mesAnterior) };
}

/**
 * Franja de Negocio (T-27): dos señales, no veinte consultas — el dashboard
 * de portafolio solo necesita decir «hay algo pendiente», no reconstruir el
 * resumen completo de `negocio/page.tsx` (eso sigue siendo su propia vista).
 */
async function obtenerSenalesDeNegocio(): Promise<{ leadsNuevos: number; ticketsUrgentes: number } | null> {
  const inicioMes = bogotaStartOfMonth(0);
  const [{ count: leadsNuevos, error: errorLeads }, { count: ticketsUrgentes, error: errorTickets }] =
    await Promise.all([
      supabaseServer
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', inicioMes.toISOString()),
      supabaseServer
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'closed')
        .in('priority', ['high', 'urgent']),
    ]);
  if (errorLeads || errorTickets) {
    console.error(`[admin/portafolio] señales de negocio: ${errorLeads?.message ?? errorTickets?.message}`);
    return null;
  }
  return { leadsNuevos: leadsNuevos ?? 0, ticketsUrgentes: ticketsUrgentes ?? 0 };
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
  { tabla: 'portfolio_projects', soloPublicados: true, icon: FolderKanban, nombre: 'Proyectos', nombrePlural: 'proyectos', href: '/admin/proyectos', accion: 'Gestionar proyectos' },
  { tabla: 'portfolio_skills', soloPublicados: false, icon: Gauge, nombre: 'Skills', nombrePlural: 'skills', href: '/admin/skills', accion: 'Gestionar skills' },
] as const;

export default async function PortafolioDashboardPage() {
  const currentDate = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Bogota',
  });
  const [conteos, filasMetricas, alcanceDelSitio, senalesDeNegocio] = await Promise.all([
    Promise.all(MODULOS_LISTOS.map((m) => contarFilas(m.tabla, m.soloPublicados))),
    obtenerUltimasMetricasPorRepo(),
    obtenerAlcanceDelSitio(),
    obtenerSenalesDeNegocio(),
  ]);

  const errorMetricas = filasMetricas === null;
  const resumen = filasMetricas ? calcularResumenDePortafolio(filasMetricas, hoyEnBogota()) : null;
  const hayMetricas = resumen !== null && resumen.totalRepos > 0;
  const sparklineActividad = resumen?.actividadReciente.slice(-14).map((d) => d.commits);

  const [totalProyectos, totalSkills] = conteos;
  const descripcionAlcance =
    totalProyectos !== null && totalSkills !== null
      ? `${totalProyectos} ${totalProyectos === 1 ? 'proyecto' : 'proyectos'} · ${totalSkills} skills publicados`
      : null;

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader
        overline="Portafolio"
        title="Resumen"
        description={
          <span className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={14} className="text-primary" />
              {currentDate.charAt(0).toUpperCase() + currentDate.slice(1)}
            </span>
            {descripcionAlcance && (
              <span className="text-text-muted/70">· {descripcionAlcance}</span>
            )}
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
              className="sm:col-span-2"
              size="featured"
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
              color="neutral"
              description={`Racha máxima registrada: ${resumen.rachaMaxima} ${resumen.rachaMaxima === 1 ? 'día' : 'días'}.`}
            />
            <StatCard
              title="REPOSITORIOS ACTIVOS"
              value={String(resumen.reposActivos)}
              icon={<FolderKanban size={18} />}
              color="neutral"
              description={`De ${resumen.totalRepos} ${resumen.totalRepos === 1 ? 'repositorio capturado' : 'repositorios capturados'} en total.`}
            />
            <StatCard
              className="sm:col-span-2"
              title="LENGUAJE PRINCIPAL"
              value={resumen.lenguajePrincipal?.lenguaje ?? 'Sin datos'}
              icon={<Gauge size={18} />}
              color="neutral"
              description={
                resumen.lenguajePrincipal
                  ? `${resumen.lenguajePrincipal.porcentaje.toFixed(1)}% de los bytes agregados.`
                  : 'El cron guarda bytes por lenguaje desde esta tarea; aparecerá en la próxima corrida.'
              }
            />
            <StatCard
              className="sm:col-span-2"
              title="LEADS DESDE EL SITIO ESTE MES"
              value={alcanceDelSitio ? String(alcanceDelSitio.esteMes) : '—'}
              icon={<Users size={18} />}
              color="neutral"
              trend={
                !alcanceDelSitio
                  ? undefined
                  : alcanceDelSitio.delta === null
                    ? { value: 'Sin base', direction: 'neutral', label: 'Primer mes con registros' }
                    : formatearVariacion(alcanceDelSitio.delta)
              }
              description={
                alcanceDelSitio
                  ? 'Formulario de contacto y calculadora, comparado con el mes anterior.'
                  : 'No se pudo calcular este mes; se reintenta en la próxima carga.'
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <AdminCard padding="normal" className="lg:col-span-2">
              <DailyActivityChart data={resumen.actividadReciente} />
            </AdminCard>
            <AdminCard padding="normal" className="lg:col-span-2">
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
          {errorMetricas ? (
            <ErrorState description="No se pudieron cargar las métricas de GitHub. Intenta de nuevo en unos segundos." />
          ) : (
            <EmptyState
              icon={<Activity size={22} />}
              title="Aún sin panel de métricas"
              description="Los commits, rachas y lenguajes de los repositorios se recopilan cada día. Esta vista los mostrará en cuanto el cron de GitHub haga su primera captura."
            />
          )}
        </AdminCard>
      )}

      {senalesDeNegocio && (
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3 rounded-panel border border-admin-line bg-admin-raised/40 px-5 py-4">
          <p className="font-mono-label text-3xs text-text-muted/60">Mientras tanto en Negocio</p>
          <Link
            href="/admin/leads"
            className="group inline-flex min-h-11 items-center gap-2 text-sm font-bold text-admin-ink transition-colors hover:text-primary"
          >
            <span className="tabular-nums text-admin-ink">{senalesDeNegocio.leadsNuevos}</span>
            {senalesDeNegocio.leadsNuevos === 1 ? 'lead nuevo este mes' : 'leads nuevos este mes'}
            <ChevronRight size={14} className="text-text-muted/50 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <span className="hidden h-4 w-px bg-admin-line sm:block" />
          <Link
            href="/admin/tickets"
            className="group inline-flex min-h-11 items-center gap-2 text-sm font-bold text-admin-ink transition-colors hover:text-admin-warning"
          >
            {senalesDeNegocio.ticketsUrgentes > 0 && (
              <AlertTriangle size={14} className="text-admin-warning" />
            )}
            <span
              className={`tabular-nums ${senalesDeNegocio.ticketsUrgentes > 0 ? 'text-admin-warning' : 'text-admin-ink'}`}
            >
              {senalesDeNegocio.ticketsUrgentes}
            </span>
            {senalesDeNegocio.ticketsUrgentes === 1 ? 'ticket urgente' : 'tickets urgentes'}
            <ChevronRight size={14} className="text-text-muted/50 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {MODULOS_LISTOS.map((modulo, i) => {
          const total = conteos[i];
          const Icon = modulo.icon;
          return (
            <AdminCard key={modulo.tabla} padding="normal" className="flex flex-col justify-between gap-4">
              <div className="flex items-start gap-3">
                <Icon size={20} className="mt-0.5 shrink-0 text-text-muted/50" />
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
