import React from 'react';
import { supabaseServer } from '@/lib/supabaseServer';
import {
  ChevronRight,
  Ticket,
  AlertCircle,
  Clock,
  Plus,
  User,
  Building2,
} from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/admin/ui/PageHeader';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import EmptyState from '@/components/admin/ui/EmptyState';
import StatCard from '@/components/admin/ui/StatCard';
import { AdminButtonLink } from '@/components/admin/ui/AdminButton';
import { getAdminRole } from '@/lib/admin/auth';
import { hasMinRole } from '@/lib/admin/roles';

export const dynamic = 'force-dynamic';

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

async function getTickets() {
  const { data, error } = await supabaseServer
    .from('tickets')
    .select('*, lead:leads(name, company)')
    .order('updated_at', { ascending: false });

  if (error) console.error('Error fetching tickets:', error);
  return data || [];
}

function isOverSLA(updatedAt: string, status: string) {
  if (status === 'closed') return false;
  const diffHours =
    (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60);
  return diffHours > 24;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Bogota',
  });
}

export default async function AdminTicketsPage() {
  const tickets = await getTickets();
  const role = await getAdminRole();
  const canWrite = hasMinRole(role ?? 'viewer', 'assistant');

  const counts = {
    open: tickets.filter((ticket) => ticket.status === 'open').length,
    in_progress: tickets.filter((ticket) => ticket.status === 'in_progress')
      .length,
    waiting_client: tickets.filter(
      (ticket) => ticket.status === 'waiting_client'
    ).length,
    closed: tickets.filter((ticket) => ticket.status === 'closed').length,
  };

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        overline="Soporte Técnico"
        title="Tickets"
        description="Seguimiento de incidencias y soporte al cliente."
        actions={
          canWrite ? (
            <AdminButtonLink
              href="/admin/tickets/new"
              variant="primary"
              size="sm"
              icon={<Plus size={15} />}
            >
              Nuevo ticket
            </AdminButtonLink>
          ) : undefined
        }
      />

      <section
        aria-label="Resumen de tickets"
        className="grid grid-cols-2 gap-3 xl:grid-cols-4"
      >
        <StatCard
          title="Abiertos"
          value={counts.open.toString()}
          icon={<Ticket size={19} />}
          color="info"
          description="Sin atender todavía"
        />
        <StatCard
          title="En proceso"
          value={counts.in_progress.toString()}
          icon={<Clock size={19} />}
          color="warning"
          description="Trabajo en curso"
        />
        <StatCard
          title="Esperando cliente"
          value={counts.waiting_client.toString()}
          icon={<User size={19} />}
          color="accent"
          description="Pendientes de respuesta"
        />
        <StatCard
          title="Cerrados"
          value={counts.closed.toString()}
          icon={<Ticket size={19} />}
          color="success"
          description="Resueltos"
        />
      </section>

      <div className="space-y-3 lg:hidden">
        {tickets.length > 0 ? (
          tickets.map((ticket) => {
            const priority = PRIORITY_META[ticket.priority] || PRIORITY_META.low;
            const overSLA = isOverSLA(ticket.updated_at, ticket.status);

            return (
              <article
                key={ticket.id}
                className="rounded-2xl border border-admin-line bg-card-bg p-4 shadow-[0_18px_45px_-32px_rgba(0,0,0,0.95)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {overSLA && (
                        <AlertCircle
                          size={13}
                          className="shrink-0 animate-pulse text-admin-danger"
                        />
                      )}
                      <p className="truncate text-sm font-bold text-admin-ink">
                        {ticket.title}
                      </p>
                    </div>
                    <p className="mt-0.5 font-mono-label text-[8px] text-text-muted/50">
                      ID: {ticket.id.substring(0, 8)}
                    </p>
                  </div>
                  <StatusBadge status={ticket.status} size="sm" />
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-xl border border-admin-line bg-admin-raised/40 p-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-admin-line bg-white/[0.03]">
                    <User size={13} className="text-text-muted/60" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-admin-ink">
                      {ticket.lead?.name || 'Sin cliente'}
                    </p>
                    {ticket.lead?.company && (
                      <p className="flex items-center gap-1 text-[9px] text-text-muted/60">
                        <Building2 size={8} className="shrink-0" />
                        <span className="truncate">{ticket.lead.company}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-admin-line bg-admin-raised/40 p-2.5">
                    <p className="font-mono-label text-[8px] text-text-muted/50">
                      Prioridad
                    </p>
                    <span
                      className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold ${priority.className}`}
                    >
                      <span
                        className={`h-1 w-1 rounded-full ${priority.dot}`}
                      />
                      {priority.label}
                    </span>
                  </div>
                  <div className="rounded-lg border border-admin-line bg-admin-raised/40 p-2.5">
                    <p className="font-mono-label text-[8px] text-text-muted/50">
                      Actualizado
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-text-muted">
                      <Clock size={9} />
                      {formatDateTime(ticket.updated_at)}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/admin/tickets/${ticket.id}`}
                  className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-admin-line bg-white/[0.03] px-3 py-2.5 text-[11px] font-bold text-text-muted transition-colors hover:border-primary/30 hover:text-primary"
                >
                  Ver ticket
                  <ChevronRight size={14} />
                </Link>
              </article>
            );
          })
        ) : (
          <EmptyState
            icon={<Ticket size={24} />}
            title="No hay tickets activos"
            description="Crea un nuevo ticket para comenzar."
          />
        )}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-admin-line bg-card-bg shadow-[0_18px_45px_-32px_rgba(0,0,0,0.95)] lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-admin-line bg-white/[0.02]">
                <th className="px-5 py-3 font-mono-label text-[9px] text-text-muted/60">
                  Ticket / Asunto
                </th>
                <th className="px-5 py-3 font-mono-label text-[9px] text-text-muted/60">
                  Cliente
                </th>
                <th className="px-5 py-3 font-mono-label text-[9px] text-text-muted/60">
                  Prioridad
                </th>
                <th className="px-5 py-3 font-mono-label text-[9px] text-text-muted/60">
                  Estado
                </th>
                <th className="px-5 py-3 font-mono-label text-[9px] text-text-muted/60">
                  Última actividad
                </th>
                <th className="px-5 py-3 text-right font-mono-label text-[9px] text-text-muted/60">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-line">
              {tickets.length > 0 ? (
                tickets.map((ticket) => {
                  const priority =
                    PRIORITY_META[ticket.priority] || PRIORITY_META.low;
                  const overSLA = isOverSLA(
                    ticket.updated_at,
                    ticket.status
                  );

                  return (
                    <tr
                      key={ticket.id}
                      className="group transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          {overSLA && (
                            <AlertCircle
                              size={14}
                              className="shrink-0 animate-pulse text-admin-danger"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-admin-ink transition-colors group-hover:text-primary">
                              {ticket.title}
                            </p>
                            <p className="font-mono-label text-[8px] text-text-muted/50">
                              ID: {ticket.id.substring(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs font-semibold text-admin-ink">
                          {ticket.lead?.name || 'Sin cliente'}
                        </p>
                        <p className="text-[10px] text-text-muted/60">
                          {ticket.lead?.company || '—'}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold ${priority.className}`}
                        >
                          <span
                            className={`h-1 w-1 rounded-full ${priority.dot}`}
                          />
                          {priority.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={ticket.status} size="sm" />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="flex items-center gap-1.5 text-[10px] font-medium text-text-muted">
                          <Clock size={10} />
                          {formatDateTime(ticket.updated_at)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/tickets/${ticket.id}`}
                          aria-label={`Ver ticket ${ticket.title}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-admin-line bg-white/[0.03] text-text-muted transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                        >
                          <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10">
                    <EmptyState
                      icon={<Ticket size={24} />}
                      title="No hay tickets activos"
                      description="Crea un nuevo ticket para comenzar."
                      className="border-0 bg-transparent"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
