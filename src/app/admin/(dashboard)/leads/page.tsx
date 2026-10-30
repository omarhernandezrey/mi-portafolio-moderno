import { supabaseServer } from '@/lib/supabaseServer';
import {
  Search,
  Filter,
  Plus,
  Mail,
  Calendar,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/admin/ui/PageHeader';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import EmptyState from '@/components/admin/ui/EmptyState';
import Pagination from '@/components/admin/ui/Pagination';
import ExportLeadsButton from '@/components/admin/ExportLeadsButton';
import { AdminButton, AdminButtonLink } from '@/components/admin/ui/AdminButton';
import {
  DEFAULT_PAGE_SIZE,
  LEAD_STATUS_OPTIONS,
  type Lead,
  type PaginatedResult,
  isLeadStatus,
} from '@/lib/admin/types';
import { pageRange, parsePage, sanitizeSearchTerm } from '@/lib/admin/query';
import { getAdminRole } from '@/lib/admin/auth';
import { hasMinRole } from '@/lib/admin/roles';

export const dynamic = 'force-dynamic';

async function getLeads(
  search?: string,
  status?: string,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<PaginatedResult<Lead>> {
  const { from, to } = pageRange(page, pageSize);
  const safeSearch = search ? sanitizeSearchTerm(search) : '';

  let query = supabaseServer
    .from('leads')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (safeSearch) {
    query = query.or(
      `name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%,company.ilike.%${safeSearch}%`
    );
  }

  if (status && isLeadStatus(status)) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;

  if (error) console.error('Error fetching leads:', error);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    data: (data || []) as Lead[],
    total,
    page,
    pageSize,
    totalPages,
  };
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Bogota',
  });
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.q || '';
  const statusFilter = params.status || '';
  const page = parsePage(params.page);
  const result = await getLeads(search, statusFilter, page);
  const { data: leads, total, totalPages, pageSize } = result;
  const role = await getAdminRole();
  const canWrite = hasMinRole(role ?? 'viewer', 'assistant');

  const queryPreserved = {
    q: search || undefined,
    status: statusFilter || undefined,
  };

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        overline="CRM Pipeline"
        title="Leads"
        description="Administración y seguimiento de oportunidades comerciales."
        actions={
          <>
            <ExportLeadsButton leads={leads} />
            {canWrite && (
              <AdminButtonLink
                href="/admin/leads/new"
                variant="primary"
                size="sm"
                icon={<Plus size={15} />}
              >
                Añadir lead
              </AdminButtonLink>
            )}
          </>
        }
      />

      <form
        method="GET"
        action="/admin/leads"
        className="flex flex-col gap-2.5 rounded-2xl border border-admin-line bg-card-bg p-3 sm:flex-row sm:items-center"
      >
        <div className="group relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary"
          />
          <input
            type="text"
            name="q"
            defaultValue={search}
            placeholder="Buscar por nombre, correo o empresa..."
            className="w-full rounded-xl border border-transparent bg-transparent py-2.5 pl-9 pr-3 text-sm font-medium text-admin-ink outline-none transition-colors placeholder:text-text-muted/50 focus:border-admin-line focus:bg-white/[0.03]"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            name="status"
            defaultValue={statusFilter}
            aria-label="Filtrar por estado"
            className="min-w-0 flex-1 rounded-xl border border-admin-line bg-admin-bg/60 px-3 py-2.5 text-xs font-bold text-text-muted outline-none transition-colors focus:border-primary/40 sm:w-44 sm:flex-none"
          >
            <option value="">Todos los estados</option>
            {LEAD_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <AdminButton type="submit" size="sm" icon={<Filter size={14} />}>
            Filtrar
          </AdminButton>
        </div>
      </form>

      <div className="space-y-3 lg:hidden">
        {leads.length > 0 ? (
          leads.map((lead) => (
            <article
              key={lead.id}
              className="rounded-2xl border border-admin-line bg-card-bg p-4 shadow-[0_18px_45px_-32px_rgba(0,0,0,0.95)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-admin-line bg-white/[0.04] text-xs font-black text-admin-ink">
                    {lead.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-admin-ink">
                      {lead.name || 'Sin identificar'}
                    </p>
                    <p className="flex items-center gap-1 truncate text-[10px] text-text-muted">
                      <Mail size={10} className="shrink-0" />
                      {lead.email || 'Sin correo'}
                    </p>
                  </div>
                </div>
                <StatusBadge status={lead.status || 'new'} size="sm" />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-admin-line bg-admin-raised/40 p-2.5">
                  <p className="font-mono-label text-[8px] text-text-muted/50">
                    Servicio
                  </p>
                  <p className="mt-1 truncate text-[11px] font-bold text-text-muted">
                    {lead.service_requested || 'Consulta general'}
                  </p>
                </div>
                <div className="rounded-lg border border-admin-line bg-admin-raised/40 p-2.5">
                  <p className="font-mono-label text-[8px] text-text-muted/50">
                    Presupuesto
                  </p>
                  <p className="mt-1 truncate text-[11px] font-black text-admin-ink">
                    {lead.budget || 'N/D'}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-admin-line pt-3">
                <span className="flex items-center gap-1.5 font-mono-label text-[8px] text-text-muted/50">
                  <Calendar size={10} />
                  {formatDate(lead.created_at)}
                </span>
                <Link
                  href={`/admin/leads/${lead.id}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-admin-line bg-white/[0.03] px-3 py-1.5 text-[10px] font-bold text-text-muted transition-colors hover:border-primary/30 hover:text-primary"
                >
                  Ver perfil
                  <ChevronRight size={13} />
                </Link>
              </div>
            </article>
          ))
        ) : (
          <EmptyState
            icon={<Search size={24} />}
            title="Sin resultados"
            description="No se encontraron oportunidades con esos filtros."
          />
        )}

        {leads.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-admin-line bg-card-bg">
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              basePath="/admin/leads"
              query={queryPreserved}
            />
          </div>
        )}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-admin-line bg-card-bg shadow-[0_18px_45px_-32px_rgba(0,0,0,0.95)] lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-admin-line bg-white/[0.02]">
                <th className="px-5 py-3 font-mono-label text-[9px] text-text-muted/60">
                  Identidad
                </th>
                <th className="px-5 py-3 font-mono-label text-[9px] text-text-muted/60">
                  Contexto
                </th>
                <th className="px-5 py-3 font-mono-label text-[9px] text-text-muted/60">
                  Requerimiento
                </th>
                <th className="px-5 py-3 font-mono-label text-[9px] text-text-muted/60">
                  Presupuesto
                </th>
                <th className="px-5 py-3 text-center font-mono-label text-[9px] text-text-muted/60">
                  Estado
                </th>
                <th className="px-5 py-3 text-right font-mono-label text-[9px] text-text-muted/60">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-line">
              {leads.length > 0 ? (
                leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="group transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-admin-line bg-white/[0.04] text-[11px] font-black text-admin-ink transition-colors group-hover:border-primary/30 group-hover:text-primary">
                          {lead.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-admin-ink transition-colors group-hover:text-primary">
                            {lead.name || 'Sin identificar'}
                          </p>
                          <p className="flex items-center gap-1 truncate text-[10px] text-text-muted/70">
                            <Mail size={9} />
                            {lead.email || 'Sin correo'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold italic text-text-muted">
                        {lead.company || 'N/A'}
                      </p>
                      <p className="mt-0.5 font-mono-label text-[8px] text-primary/60">
                        {lead.type || 'other'}
                      </p>
                    </td>
                    <td className="max-w-[240px] px-5 py-4">
                      <p className="flex items-center gap-1.5 truncate text-xs font-semibold text-text-muted">
                        <Briefcase size={12} className="shrink-0 text-primary/50" />
                        {lead.service_requested || 'Consulta general'}
                      </p>
                      <p className="mt-1 flex items-center gap-1 font-mono-label text-[8px] text-text-muted/40">
                        <Calendar size={9} />
                        {formatDate(lead.created_at)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-lg border border-admin-line bg-white/[0.04] px-2.5 py-1 text-xs font-black text-admin-ink">
                        {lead.budget || 'N/D'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <StatusBadge status={lead.status || 'new'} size="sm" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-admin-line bg-white/[0.03] px-3 py-1.5 text-[10px] font-bold text-text-muted transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                      >
                        Perfil
                        <ChevronRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10">
                    <EmptyState
                      icon={<Search size={24} />}
                      title="Sin resultados"
                      description="No se encontraron oportunidades con esos filtros."
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
          basePath="/admin/leads"
          query={queryPreserved}
        />
      </div>
    </div>
  );
}
