import React from 'react';
import { supabaseServer } from '@/lib/supabaseServer';
import { serverEnv } from '@/config/env';
import {
  FileText,
  Download,
  Calendar,
  Plus,
  DollarSign,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import PageHeader from '@/components/admin/ui/PageHeader';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import EmptyState from '@/components/admin/ui/EmptyState';
import StatCard from '@/components/admin/ui/StatCard';
import { AdminButtonLink } from '@/components/admin/ui/AdminButton';

export const dynamic = 'force-dynamic';

async function getInvoices() {
  const { data, error } = await supabaseServer
    .from('invoices')
    .select('*, lead:leads(name, company)')
    .order('created_at', { ascending: false });

  if (error) console.error('Error fetching invoices:', error);
  return data || [];
}

function formatMoney(value: number | string | null, currency = 'USD') {
  const amount = Number(value) || 0;
  return `$${amount.toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Bogota',
  });
}

export default async function AdminInvoicesPage() {
  const invoices = await getInvoices();
  const activeInvoices = invoices.filter(
    (invoice) => invoice.status !== 'cancelled'
  );
  const totalBilled = activeInvoices.reduce(
    (sum, invoice) => sum + (Number(invoice.total) || 0),
    0
  );
  const pending = invoices
    .filter((invoice) => invoice.status === 'sent')
    .reduce((sum, invoice) => sum + (Number(invoice.total) || 0), 0);
  const collected = invoices
    .filter((invoice) => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + (Number(invoice.total) || 0), 0);

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        overline="Finanzas"
        title="Facturación"
        description="Gestión de facturas, cobros y documentos."
        actions={
          <AdminButtonLink
            href="/admin/invoices/new"
            variant="primary"
            size="sm"
            icon={<Plus size={15} />}
          >
            Nueva factura
          </AdminButtonLink>
        }
      />

      <section
        aria-label="Resumen de facturación"
        className="grid grid-cols-2 gap-3 xl:grid-cols-4"
      >
        <StatCard
          title="Total facturado"
          value={formatMoney(totalBilled)}
          icon={<DollarSign size={19} />}
          color="primary"
          description="Facturas vigentes emitidas"
        />
        <StatCard
          title="Pendiente"
          value={formatMoney(pending)}
          icon={<Clock size={19} />}
          color="warning"
          description="Enviadas sin cobrar"
        />
        <StatCard
          title="Cobrado"
          value={formatMoney(collected)}
          icon={<CheckCircle2 size={19} />}
          color="success"
          description="Pagos confirmados"
        />
        <StatCard
          title="Emitidas"
          value={invoices.length.toString()}
          icon={<FileText size={19} />}
          color="info"
          description="Documentos registrados"
        />
      </section>

      <div className="space-y-3 lg:hidden">
        {invoices.length > 0 ? (
          invoices.map((invoice) => (
            <article
              key={invoice.id}
              className="rounded-2xl border border-admin-line bg-card-bg p-4 shadow-[0_18px_45px_-32px_rgba(0,0,0,0.95)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-admin-ink">
                    {invoice.number}
                  </p>
                  <p className="font-mono-label text-[8px] text-text-muted/50">
                    ID: {invoice.id.substring(0, 8)}
                  </p>
                </div>
                <StatusBadge status={invoice.status} size="sm" />
              </div>

              <div className="mt-3 rounded-xl border border-admin-line bg-admin-raised/40 p-3">
                <p className="text-xs font-bold text-admin-ink">
                  {invoice.lead?.name || 'Sin cliente'}
                </p>
                {invoice.lead?.company && (
                  <p className="text-[10px] text-text-muted/60">
                    {invoice.lead.company}
                  </p>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 font-mono-label text-[8px] text-text-muted/50">
                  <Calendar size={10} />
                  Vence {formatDate(invoice.due_date)}
                </span>
                <span className="text-sm font-black text-admin-success">
                  {formatMoney(invoice.total, invoice.currency)}
                </span>
              </div>

              {invoice.pdf_url && (
                <a
                  href={`${serverEnv.SUPABASE_URL}/storage/v1/object/public/invoices/${invoice.pdf_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2.5 text-[11px] font-bold text-primary transition-colors hover:bg-primary/15"
                >
                  <Download size={14} />
                  Descargar PDF
                </a>
              )}
            </article>
          ))
        ) : (
          <EmptyState
            icon={<FileText size={24} />}
            title="Sin facturas"
            description="No hay facturas generadas todavía."
          />
        )}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-admin-line bg-card-bg shadow-[0_18px_45px_-32px_rgba(0,0,0,0.95)] lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-admin-line bg-white/[0.02]">
                <th className="px-5 py-3 font-mono-label text-[9px] text-text-muted/60">
                  Nro. factura
                </th>
                <th className="px-5 py-3 font-mono-label text-[9px] text-text-muted/60">
                  Cliente
                </th>
                <th className="px-5 py-3 font-mono-label text-[9px] text-text-muted/60">
                  Vencimiento
                </th>
                <th className="px-5 py-3 font-mono-label text-[9px] text-text-muted/60">
                  Total
                </th>
                <th className="px-5 py-3 font-mono-label text-[9px] text-text-muted/60">
                  Estado
                </th>
                <th className="px-5 py-3 text-right font-mono-label text-[9px] text-text-muted/60">
                  PDF
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-line">
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="group transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-admin-ink transition-colors group-hover:text-primary">
                        {invoice.number}
                      </p>
                      <p className="font-mono-label text-[8px] text-text-muted/50">
                        ID: {invoice.id.substring(0, 8)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-semibold text-admin-ink">
                        {invoice.lead?.name || 'Sin cliente'}
                      </p>
                      <p className="text-[10px] text-text-muted/60">
                        {invoice.lead?.company || '—'}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="flex items-center gap-1.5 text-[10px] font-medium text-text-muted">
                        <Calendar size={10} />
                        {formatDate(invoice.due_date)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-black text-admin-success">
                      {formatMoney(invoice.total, invoice.currency)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={invoice.status} size="sm" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      {invoice.pdf_url ? (
                        <a
                          href={`${serverEnv.SUPABASE_URL}/storage/v1/object/public/invoices/${invoice.pdf_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Descargar factura ${invoice.number}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary transition-colors hover:bg-primary/15"
                        >
                          <Download size={14} />
                        </a>
                      ) : (
                        <span className="text-[10px] text-text-muted/30">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10">
                    <EmptyState
                      icon={<FileText size={24} />}
                      title="Sin facturas"
                      description="No hay facturas generadas todavía."
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
