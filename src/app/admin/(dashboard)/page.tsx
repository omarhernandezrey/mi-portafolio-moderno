import React from 'react';
import Link from 'next/link';
import {
  Users,
  TrendingUp,
  DollarSign,
  ChevronRight,
  Ticket,
  Clock,
  ArrowUpRight,
  ArrowRight,
  RefreshCw,
  CalendarDays,
  Target,
  BarChart3,
  BadgeCheck,
  Inbox,
  Activity,
} from 'lucide-react';
import { supabaseServer } from '@/lib/supabaseServer';
import PageHeader from '@/components/admin/ui/PageHeader';
import StatCard from '@/components/admin/ui/StatCard';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import EmptyState from '@/components/admin/ui/EmptyState';
import AdminCard from '@/components/admin/ui/AdminCard';
import { AdminButton, AdminButtonLink } from '@/components/admin/ui/AdminButton';
import { getAdminRole } from '@/lib/admin/auth';
import { canAccessAdminPath } from '@/lib/admin/permissions';

export const dynamic = 'force-dynamic';

const PIPELINE_STAGES = [
  { key: 'new', label: 'Nuevos', color: 'bg-accent' },
  { key: 'contacted', label: 'Contactados', color: 'bg-admin-info' },
  { key: 'followed_up', label: 'En seguimiento', color: 'bg-primary' },
  { key: 'paid', label: 'Pagados', color: 'bg-admin-success' },
  { key: 'cold', label: 'Fríos', color: 'bg-text-muted' },
  { key: 'lost', label: 'Perdidos', color: 'bg-admin-danger' },
] as const;

const PRIORITY_META: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  urgent: {
    label: 'Urgente',
    className: 'text-admin-danger bg-admin-danger/10 border-admin-danger/20',
    dot: 'bg-admin-danger',
  },
  high: {
    label: 'Alta',
    className: 'text-admin-warning bg-admin-warning/10 border-admin-warning/20',
    dot: 'bg-admin-warning',
  },
  medium: {
    label: 'Media',
    className: 'text-admin-info bg-admin-info/10 border-admin-info/20',
    dot: 'bg-admin-info',
  },
  low: {
    label: 'Baja',
    className: 'text-text-muted bg-white/[0.04] border-admin-line',
    dot: 'bg-text-muted',
  },
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    timeZone: 'America/Bogota',
  });
}

function getTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin}m`;
  if (diffHrs < 24) return `Hace ${diffHrs}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    timeZone: 'America/Bogota',
  });
}

function getBogotaDateKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'America/Bogota',
  }).format(date);
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString('es-CO')}`;
}

async function getStats(includeRevenue: boolean) {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const firstDayOfPrevMonth = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1
  ).toISOString();
  const lastDayOfPrevMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59
  ).toISOString();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    { count: monthLeads },
    { count: prevLeads },
    { count: monthPaid },
    { count: openTickets },
    { count: urgentTickets },
    { data: recentTickets },
    { data: recentLeads },
    { data: leadStatuses },
    { data: activityLeads },
  ] = await Promise.all([
    supabaseServer
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayOfMonth),
    supabaseServer
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayOfPrevMonth)
      .lte('created_at', lastDayOfPrevMonth),
    supabaseServer
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'paid')
      .gte('created_at', firstDayOfMonth),
    supabaseServer
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'closed'),
    supabaseServer
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'closed')
      .in('priority', ['high', 'urgent']),
    supabaseServer
      .from('tickets')
      .select('id, title, status, priority, created_at')
      .neq('status', 'closed')
      .order('created_at', { ascending: false })
      .limit(4),
    supabaseServer
      .from('leads')
      .select('id, name, email, service_requested, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabaseServer.from('leads').select('status').limit(1000),
    supabaseServer
      .from('leads')
      .select('created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .limit(1000),
  ]);

  let invoiceData: Array<{ total: number | null }> = [];
  let prevInvoiceData: Array<{ total: number | null }> = [];

  if (includeRevenue) {
    const [currentInvoices, previousInvoices] = await Promise.all([
      supabaseServer
        .from('invoices')
        .select('total')
        .gte('created_at', firstDayOfMonth)
        .eq('status', 'paid'),
      supabaseServer
        .from('invoices')
        .select('total')
        .gte('created_at', firstDayOfPrevMonth)
        .lte('created_at', lastDayOfPrevMonth)
        .eq('status', 'paid'),
    ]);

    invoiceData = currentInvoices.data ?? [];
    prevInvoiceData = previousInvoices.data ?? [];
  }

  const statusCounts = (leadStatuses ?? []).reduce<Record<string, number>>(
    (acc, lead) => {
      const key = lead.status || 'new';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {}
  );

  const activityDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(sevenDaysAgo);
    date.setDate(sevenDaysAgo.getDate() + index);
    return {
      key: getBogotaDateKey(date),
      label: date
        .toLocaleDateString('es-CO', {
          weekday: 'short',
          timeZone: 'America/Bogota',
        })
        .replace('.', ''),
      count: 0,
    };
  });

  for (const lead of activityLeads ?? []) {
    const key = getBogotaDateKey(new Date(lead.created_at));
    const day = activityDays.find((entry) => entry.key === key);
    if (day) day.count += 1;
  }

  const monthRevenue = invoiceData.reduce(
    (sum, invoice) => sum + (invoice.total || 0),
    0
  );
  const prevRevenue = prevInvoiceData.reduce(
    (sum, invoice) => sum + (invoice.total || 0),
    0
  );
  const leadsDelta =
    prevLeads && prevLeads > 0
      ? ((monthLeads || 0) - prevLeads) / prevLeads * 100
      : null;
  const revenueDelta =
    prevRevenue > 0 ? ((monthRevenue - prevRevenue) / prevRevenue) * 100 : null;
  const conversionRate =
    monthLeads && monthLeads > 0 ? ((monthPaid || 0) / monthLeads) * 100 : 0;

  return {
    monthLeads: monthLeads || 0,
    monthPaid: monthPaid || 0,
    openTickets: openTickets || 0,
    urgentTickets: urgentTickets || 0,
    recentLeads: recentLeads || [],
    recentTickets: recentTickets || [],
    statusCounts,
    activityDays,
    activityTotal: activityDays.reduce((sum, day) => sum + day.count, 0),
    monthRevenue,
    invoiceCount: invoiceData.length,
    leadsDelta,
    revenueDelta,
    conversionRate,
  };
}

export default async function AdminDashboardPage() {
  const role = (await getAdminRole()) ?? 'viewer';
  const canSeeRevenue = role === 'owner';
  const canSeeReports = canAccessAdminPath('/admin/reports/time', role);
  const stats = await getStats(canSeeRevenue);

  const currentDate = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Bogota',
  });

  const maxActivity = Math.max(...stats.activityDays.map((day) => day.count), 1);
  const pipelineTotal = PIPELINE_STAGES.reduce(
    (sum, stage) => sum + (stats.statusCounts[stage.key] || 0),
    0
  );
  const averageTicket =
    stats.invoiceCount > 0 ? stats.monthRevenue / stats.invoiceCount : 0;
  const leadsTrend =
    stats.leadsDelta === null
      ? {
          value: 'Sin base',
          direction: 'neutral' as const,
          label: 'Primer mes con datos',
        }
      : {
          value: `${stats.leadsDelta >= 0 ? '+' : ''}${stats.leadsDelta.toFixed(1)}%`,
          direction: stats.leadsDelta >= 0 ? ('up' as const) : ('down' as const),
          label: 'vs mes anterior',
        };

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader
        overline="Control Center"
        title="Dashboard"
        description={
          <span className="inline-flex items-center gap-2">
            <CalendarDays size={14} className="text-primary" />
            {currentDate.charAt(0).toUpperCase() + currentDate.slice(1)}
          </span>
        }
        actions={
          <>
            <form action="/admin" method="GET">
              <AdminButton
                type="submit"
                size="sm"
                icon={<RefreshCw size={15} />}
              >
                Actualizar
              </AdminButton>
            </form>
            {canSeeReports && (
              <AdminButtonLink
                href="/admin/reports/time"
                variant="primary"
                size="sm"
                icon={<BarChart3 size={15} />}
              >
                Reporte de horas
              </AdminButtonLink>
            )}
          </>
        }
      />

      <section
        aria-label="Indicadores principales"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          title="Leads del mes"
          value={stats.monthLeads.toString()}
          icon={<Users size={20} />}
          trend={leadsTrend}
          color="primary"
          description="Nuevos contactos registrados este mes"
          sparkline={stats.activityDays.map((day) => day.count)}
        />
        <StatCard
          title="Tickets abiertos"
          value={stats.openTickets.toString()}
          icon={<Ticket size={20} />}
          trend={
            stats.urgentTickets > 0
              ? {
                  value: `${stats.urgentTickets} urgentes`,
                  direction: 'down',
                  label: 'Requieren atención',
                }
              : {
                  value: 'Sin urgentes',
                  direction: 'up',
                  label: 'Bandeja al día',
                }
          }
          color="info"
          description="Tickets de soporte pendientes de cierre"
        />
        <StatCard
          title="Ventas cerradas"
          value={stats.monthPaid.toString()}
          icon={<BadgeCheck size={20} />}
          trend={{
            value: `${stats.conversionRate.toFixed(0)}%`,
            direction: stats.conversionRate >= 20 ? 'up' : 'neutral',
            label: 'Tasa de conversión',
          }}
          color="success"
          description="Leads convertidos en clientes este mes"
        />
        {canSeeRevenue ? (
          <StatCard
            title="Ingresos del mes"
            value={formatCurrency(stats.monthRevenue)}
            icon={<DollarSign size={20} />}
            trend={
              stats.revenueDelta === null
                ? {
                    value: 'Sin base',
                    direction: 'neutral',
                    label: 'Primer mes con datos',
                  }
                : {
                    value: `${stats.revenueDelta >= 0 ? '+' : ''}${stats.revenueDelta.toFixed(1)}%`,
                    direction:
                      stats.revenueDelta >= 0 ? 'up' : 'down',
                    label: 'vs mes anterior',
                  }
            }
            color="accent"
            description="Facturación cobrada durante el mes"
            sparkline={stats.activityDays.map((day) => day.count)}
          />
        ) : (
          <StatCard
            title="Conversión"
            value={`${stats.conversionRate.toFixed(0)}%`}
            icon={<Target size={20} />}
            trend={{
              value: 'Leads → ventas',
              direction: 'neutral',
              label: 'Conversión del mes',
            }}
            color="accent"
            description="Porcentaje de leads que terminaron en venta"
          />
        )}
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-8">
          <section className="overflow-hidden rounded-2xl border border-admin-line bg-card-bg shadow-[0_18px_45px_-32px_rgba(0,0,0,0.95)]">
            <div className="flex flex-col gap-3 border-b border-admin-line p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-base font-bold text-admin-ink">
                  Actividad de leads
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono-label text-[9px] text-primary">
                    Últimos 7 días
                  </span>
                </h2>
                <p className="mt-1 text-xs font-medium text-text-muted">
                  Contactos recibidos por día
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-admin-ink">
                  {stats.activityTotal}
                </p>
                <p className="font-mono-label text-[9px] text-text-muted/60">
                  Total semanal
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {stats.activityTotal === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-admin-line bg-admin-raised/20 text-center">
                  <Activity size={22} className="text-text-muted/50" />
                  <p className="text-xs font-bold text-admin-ink">
                    Sin actividad esta semana
                  </p>
                  <p className="text-[11px] font-medium text-text-muted">
                    Los nuevos leads aparecerán aquí.
                  </p>
                </div>
              ) : (
                <div className="flex h-40 items-end gap-2 sm:gap-3">
                  {stats.activityDays.map((day) => {
                    const height = Math.max(
                      10,
                      (day.count / maxActivity) * 100
                    );
                    return (
                      <div
                        key={day.key}
                        className="group flex h-full flex-1 flex-col justify-end gap-2"
                      >
                        <div className="relative flex h-32 items-end">
                          <div
                            className="relative w-full rounded-t-md bg-gradient-to-t from-primary/15 to-primary/70 transition-all duration-300 group-hover:to-primary"
                            style={{ height: `${height}%` }}
                            title={`${day.count} leads`}
                          >
                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-md border border-admin-line bg-admin-raised px-1.5 py-0.5 text-[9px] font-bold text-admin-ink opacity-0 transition-opacity group-hover:opacity-100">
                              {day.count}
                            </span>
                          </div>
                        </div>
                        <span className="text-center font-mono-label text-[9px] text-text-muted/70">
                          {day.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-admin-line bg-card-bg shadow-[0_18px_45px_-32px_rgba(0,0,0,0.95)]">
            <div className="flex flex-col gap-3 border-b border-admin-line p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-admin-ink">
                  Leads recientes
                </h2>
                <p className="mt-1 text-xs font-medium text-text-muted">
                  Últimos contactos que interactuaron con el sistema
                </p>
              </div>
              <AdminButtonLink
                href="/admin/leads"
                size="sm"
                icon={<ArrowUpRight size={14} />}
              >
                Ver todos
              </AdminButtonLink>
            </div>

            <div className="divide-y divide-admin-line md:hidden">
              {stats.recentLeads.length > 0 ? (
                stats.recentLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/admin/leads/${lead.id}`}
                    className="flex items-start gap-3 p-4 transition-colors hover:bg-white/[0.03]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-admin-line bg-white/[0.04] text-xs font-black text-admin-ink">
                      {lead.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-bold text-admin-ink">
                          {lead.name || 'Anónimo'}
                        </p>
                        <StatusBadge status={lead.status || 'new'} size="sm" />
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-text-muted">
                        {lead.email || 'Sin correo'}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="truncate text-xs font-medium italic text-text-muted">
                          {lead.service_requested || 'Consulta general'}
                        </p>
                        <span className="shrink-0 font-mono-label text-[9px] text-text-muted/60">
                          {formatDate(new Date(lead.created_at))}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-4">
                  <EmptyState
                    icon={<Users size={24} />}
                    title="Sin leads recientes"
                    description="Los nuevos contactos aparecerán aquí."
                  />
                </div>
              )}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-admin-line bg-white/[0.02]">
                    <th className="px-5 py-3 font-mono-label text-[9px] text-text-muted/60">
                      Cliente
                    </th>
                    <th className="px-5 py-3 font-mono-label text-[9px] text-text-muted/60">
                      Interés
                    </th>
                    <th className="px-5 py-3 font-mono-label text-[9px] text-text-muted/60">
                      Estado
                    </th>
                    <th className="px-5 py-3 font-mono-label text-[9px] text-text-muted/60">
                      Fecha
                    </th>
                    <th className="px-5 py-3 text-right font-mono-label text-[9px] text-text-muted/60">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-line">
                  {stats.recentLeads.length > 0 ? (
                    stats.recentLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="group transition-colors hover:bg-white/[0.03]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-admin-line bg-white/[0.04] text-[11px] font-black text-admin-ink">
                              {lead.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-admin-ink transition-colors group-hover:text-primary">
                                {lead.name || 'Anónimo'}
                              </p>
                              <p className="truncate text-[10px] text-text-muted/70">
                                {lead.email || 'Sin correo'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="max-w-[220px] px-5 py-4">
                          <p className="truncate text-xs font-medium italic text-text-muted">
                            {lead.service_requested || 'Consulta general'}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={lead.status || 'new'} size="sm" />
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-mono-label text-[9px] text-text-muted/60">
                          {formatDate(new Date(lead.created_at))}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            aria-label={`Ver lead ${lead.name || 'anónimo'}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-admin-line bg-white/[0.03] text-text-muted transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                          >
                            <ArrowUpRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-10">
                        <EmptyState
                          icon={<Inbox size={24} />}
                          title="Sin leads recientes"
                          description="Los nuevos contactos aparecerán aquí."
                          className="border-0 bg-transparent"
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Link
              href="/admin/leads"
              className="flex items-center justify-center gap-2 border-t border-admin-line p-4 font-mono-label text-[9px] text-text-muted transition-colors hover:text-primary"
            >
              Ver repositorio completo
              <ChevronRight size={13} />
            </Link>
          </section>
        </div>

        <aside className="space-y-5 xl:col-span-4">
          <AdminCard padding="normal">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-admin-ink">Pipeline</h2>
                <p className="mt-1 text-xs font-medium text-text-muted">
                  Distribución actual de leads
                </p>
              </div>
              <span className="rounded-full border border-admin-line bg-white/[0.04] px-2.5 py-1 text-xs font-bold text-admin-ink">
                {pipelineTotal}
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {PIPELINE_STAGES.map((stage) => {
                const count = stats.statusCounts[stage.key] || 0;
                const percent =
                  pipelineTotal > 0 ? (count / pipelineTotal) * 100 : 0;

                return (
                  <div key={stage.key}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-xs font-semibold text-text-muted">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${stage.color}`}
                        />
                        {stage.label}
                      </span>
                      <span className="text-xs font-bold text-admin-ink">
                        {count}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                      <div
                        className={`h-full rounded-full ${stage.color} transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              href="/admin/leads"
              className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-admin-line bg-white/[0.03] px-3 py-2.5 text-xs font-bold text-text-muted transition-colors hover:border-primary/25 hover:text-primary"
            >
              Gestionar leads
              <ArrowRight size={14} />
            </Link>
          </AdminCard>

          <AdminCard padding="normal">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-admin-ink">
                  Tickets activos
                </h2>
                <p className="mt-1 text-xs font-medium text-text-muted">
                  Prioriza lo que requiere atención
                </p>
              </div>
              <span className="rounded-full border border-admin-danger/20 bg-admin-danger/10 px-2.5 py-1 text-xs font-bold text-admin-danger">
                {stats.openTickets}
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {stats.recentTickets.length > 0 ? (
                stats.recentTickets.map((ticket) => {
                  const priority =
                    PRIORITY_META[ticket.priority] || PRIORITY_META.low;
                  return (
                    <Link
                      key={ticket.id}
                      href={`/admin/tickets/${ticket.id}`}
                      className="group block rounded-xl border border-admin-line bg-admin-raised/50 p-3.5 transition-colors hover:border-primary/25 hover:bg-admin-raised"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 truncate text-xs font-bold text-admin-ink transition-colors group-hover:text-primary">
                          {ticket.title}
                        </p>
                        <span
                          className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${priority.className}`}
                        >
                          <span
                            className={`h-1 w-1 rounded-full ${priority.dot}`}
                          />
                          {priority.label}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <StatusBadge status={ticket.status} size="sm" />
                        <span className="flex items-center gap-1 font-mono-label text-[8px] text-text-muted/60">
                          <Clock size={9} />
                          {getTimeAgo(new Date(ticket.created_at))}
                        </span>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-admin-line bg-admin-raised/30 p-5 text-center">
                  <p className="text-xs font-medium text-text-muted">
                    No hay tickets pendientes.
                  </p>
                </div>
              )}
            </div>

            <Link
              href="/admin/tickets"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-admin-line bg-white/[0.03] px-3 py-2.5 text-xs font-bold text-text-muted transition-colors hover:border-primary/25 hover:text-primary"
            >
              Gestionar tickets
              <ArrowRight size={14} />
            </Link>
          </AdminCard>

          <AdminCard padding="normal">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              <h2 className="text-base font-bold text-admin-ink">
                Resumen del mes
              </h2>
            </div>

            <dl className="mt-4 space-y-3">
              <MetricItem label="Leads" value={stats.monthLeads.toString()} />
              <MetricItem
                label="Conversión"
                value={`${stats.conversionRate.toFixed(0)}%`}
              />
              <MetricItem
                label="Ventas cerradas"
                value={stats.monthPaid.toString()}
              />
              {canSeeRevenue && (
                <>
                  <MetricItem
                    label="Ingresos"
                    value={formatCurrency(stats.monthRevenue)}
                  />
                  <MetricItem
                    label="Ticket promedio"
                    value={formatCurrency(averageTicket)}
                  />
                </>
              )}
            </dl>

            <div className="mt-4 rounded-xl border border-primary/15 bg-primary/5 p-3">
              <p className="text-[11px] font-medium leading-relaxed text-text-muted">
                {stats.openTickets > 0
                  ? `Tienes ${stats.openTickets} ticket${stats.openTickets === 1 ? '' : 's'} abierto${stats.openTickets === 1 ? '' : 's'}. ${
                      stats.urgentTickets > 0
                        ? `${stats.urgentTickets} con prioridad alta o urgente.`
                        : 'Ninguno es urgente.'
                    }`
                  : 'La bandeja de soporte está al día.'}
              </p>
            </div>
          </AdminCard>
        </aside>
      </div>
    </div>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-admin-line pb-3 last:border-0 last:pb-0">
      <dt className="font-mono-label text-[9px] text-text-muted/70">{label}</dt>
      <dd className="text-sm font-black text-admin-ink">{value}</dd>
    </div>
  );
}
