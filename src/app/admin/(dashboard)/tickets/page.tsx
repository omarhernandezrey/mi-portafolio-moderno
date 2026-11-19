import React from 'react';
import { supabaseServer } from '@/lib/supabaseServer';
import {
  ChevronRight,
  Ticket,
  AlertCircle,
  Clock,
  Filter,
  Plus,
  User,
  Building2,
} from 'lucide-react';
import Link from 'next/link';
import { PageHeader, StatusBadge, EmptyState, ErrorState, StatCard, PriorityBadge, Pagination } from '@/components/admin/ui';
import { AdminButton, AdminButtonLink } from '@/components/admin/ui/AdminButton';
import {
  DEFAULT_PAGE_SIZE,
  TICKET_STATUS_OPTIONS,
  type PaginatedResult,
  type Ticket as TicketRow,
  isTicketStatus,
} from '@/lib/admin/types';
import { pageRange, parsePage } from '@/lib/admin/query';
import { getAdminRole } from '@/lib/admin/auth';
import { hasMinRole } from '@/lib/admin/roles';

export const dynamic = 'force-dynamic';

/**
 * T-31: antes traía TODA la historia de tickets sin tope (`order()` sin
 * `range`/`limit`) y los 4 contadores de arriba se calculaban filtrando
 * ese array completo en el cliente — página y conteos repetían el mismo
 * trabajo. Ahora: lista paginada con filtro por estado + 4 `count`
 * baratos (`count: 'exact', head: true`, sin traer filas) para los
 * contadores, que así reflejan el total real sin importar la página.
 */
async function getTickets(
  status?: string,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<PaginatedResult<TicketRow> & { error: boolean }> {
  const { from, to } = pageRange(page, pageSize);

  let query = supabaseServer
    .from('tickets')
    .select('*, lead:leads(name, company)', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(from, to);

  if (status && isTicketStatus(status)) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;
  if (error) console.error('Error fetching tickets:', error);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return { data: (data || []) as TicketRow[], total, page, pageSize, totalPages, error: Boolean(error) };
}

async function getTicketCounts() {
  const [open, inProgress, waitingClient, closed] = await Promise.all(
    TICKET_STATUS_OPTIONS.map((option) =>
      supabaseServer.from('tickets').select('*', { count: 'exact', head: true }).eq('status', option.value)
    )
  );
  return {
    open: open.count ?? 0,
    in_progress: inProgress.count ?? 0,
    waiting_client: waitingClient.count ?? 0,
    closed: closed.count ?? 0,
  };
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

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status || '';
  const page = parsePage(params.page);
  const [{ data: tickets, total, totalPages, pageSize, error: cargaFallida }, counts] = await Promise.all([
    getTickets(statusFilter, page),
    getTicketCounts(),
  ]);
  const role = await getAdminRole();
  const canWrite = hasMinRole(role ?? 'viewer', 'assistant');

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

      {cargaFallida ? (
        <ErrorState description="No se pudieron cargar los tickets. Intenta de nuevo en unos segundos." />
      ) : (
        <>
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

      <form
        method="GET"
        action="/admin/tickets"
        className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-admin-line bg-card-bg p-3"
      >
        <select
          name="status"
          defaultValue={statusFilter}
          aria-label="Filtrar por estado"
          className="min-w-0 flex-1 rounded-xl border border-admin-line bg-admin-bg/60 px-3 py-2.5 text-xs font-bold text-text-muted outline-none transition-colors focus:border-primary/40 sm:w-52 sm:flex-none"
        >
          <option value="">Todos los estados</option>
          {TICKET_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <AdminButton type="submit" size="sm" icon={<Filter size={14} />}>
          Filtrar
        </AdminButton>
      </form>

      <div className="space-y-3 lg:hidden">
        {tickets.length > 0 ? (
          tickets.map((ticket) => {
            const overSLA = isOverSLA(ticket.updated_at, ticket.status);

            return (
              <article
                key={ticket.id}
                className="rounded-2xl border border-admin-line bg-card-bg p-4 shadow-e3"
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
                    <p className="mt-0.5 font-mono-label text-4xs text-text-muted/50">
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
                      <p className="flex items-center gap-1 text-4xs text-text-muted/60">
                        <Building2 size={8} className="shrink-0" />
                        <span className="truncate">{ticket.lead.company}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-admin-line bg-admin-raised/40 p-2.5">
                    <p className="font-mono-label text-4xs text-text-muted/50">
                      Prioridad
                    </p>
                    <PriorityBadge priority={ticket.priority} className="mt-1" />
                  </div>
                  <div className="rounded-lg border border-admin-line bg-admin-raised/40 p-2.5">
                    <p className="font-mono-label text-4xs text-text-muted/50">
                      Actualizado
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-3xs font-medium text-text-muted">
                      <Clock size={9} />
                      {formatDateTime(ticket.updated_at)}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/admin/tickets/${ticket.id}`}
                  className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-admin-line bg-white/[0.03] px-3 py-2.5 text-2xs font-bold text-text-muted transition-colors hover:border-primary/30 hover:text-primary"
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

        {tickets.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-admin-line bg-card-bg">
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              basePath="/admin/tickets"
              query={{ status: statusFilter || undefined }}
            />
          </div>
        )}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-admin-line bg-card-bg shadow-e3 lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-admin-line bg-white/[0.02]">
                <th className="px-5 py-3 font-mono-label text-4xs text-text-muted/60">
                  Ticket / Asunto
                </th>
                <th className="px-5 py-3 font-mono-label text-4xs text-text-muted/60">
                  Cliente
                </th>
                <th className="px-5 py-3 font-mono-label text-4xs text-text-muted/60">
                  Prioridad
                </th>
                <th className="px-5 py-3 font-mono-label text-4xs text-text-muted/60">
                  Estado
                </th>
                <th className="px-5 py-3 font-mono-label text-4xs text-text-muted/60">
                  Última actividad
                </th>
                <th className="px-5 py-3 text-right font-mono-label text-4xs text-text-muted/60">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-line">
              {tickets.length > 0 ? (
                tickets.map((ticket) => {
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
                            <p className="font-mono-label text-4xs text-text-muted/50">
                              ID: {ticket.id.substring(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs font-semibold text-admin-ink">
                          {ticket.lead?.name || 'Sin cliente'}
                        </p>
                        <p className="text-3xs text-text-muted/60">
                          {ticket.lead?.company || '—'}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={ticket.status} size="sm" />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="flex items-center gap-1.5 text-3xs font-medium text-text-muted">
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

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          basePath="/admin/tickets"
          query={{ status: statusFilter || undefined }}
        />
      </div>
      </>
      )}
    </div>
  );
}
