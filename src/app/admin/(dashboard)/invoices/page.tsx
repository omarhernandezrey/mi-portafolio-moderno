import React from 'react';
import { supabaseServer } from '@/lib/supabaseServer';
import { serverEnv } from '@/config/env';
import {
  FileText,
  Download,
  Calendar,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/admin/ui/PageHeader';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import EmptyState from '@/components/admin/ui/EmptyState';

export const dynamic = 'force-dynamic';

async function getInvoices() {
  const { data, error } = await supabaseServer
    .from('invoices')
    .select('*, lead:leads(name, company)')
    .order('created_at', { ascending: false });

  if (error) console.error('Error fetching invoices:', error);
  return data || [];
}

export default async function AdminInvoicesPage() {
  const invoices = await getInvoices();

  return (
    <div className="space-y-10">
      <PageHeader
        overline="Finanzas"
        title="Facturación"
        description="Gestión de facturas y cobros."
        actions={
          <Link 
            href="/admin/invoices/new" 
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-background text-sm font-black hover:scale-105 transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={16} />
            Nueva Factura
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card-bg p-6 rounded-2xl border border-white/5 shadow-xl">
          <div className="text-text-muted text-xs uppercase font-black tracking-widest mb-2">Total Facturado</div>
          <div className="text-3xl font-black text-emerald-400">
            ${invoices.reduce((acc, inv) => acc + Number(inv.total), 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-card-bg p-6 rounded-2xl border border-white/5 shadow-xl">
          <div className="text-text-muted text-xs uppercase font-black tracking-widest mb-2">Pendiente de Cobro</div>
          <div className="text-3xl font-black text-blue-400">
            ${invoices.filter(i => i.status === 'sent').reduce((acc, inv) => acc + Number(inv.total), 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-card-bg p-6 rounded-2xl border border-white/5 shadow-xl">
          <div className="text-text-muted text-xs uppercase font-black tracking-widest mb-2">Facturas Emitidas</div>
          <div className="text-3xl font-black text-primary">{invoices.length}</div>
        </div>
      </div>

      <div className="bg-card-bg rounded-[32px] border border-white/5 shadow-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-background/40">
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Nro Factura</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Cliente</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Fecha Venc.</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Total</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Estado</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5 text-right">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.length > 0 ? invoices.map((inv) => (
                <tr key={inv.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="font-bold text-white-custom text-sm group-hover:text-primary transition-colors">
                      {inv.number}
                    </div>
                    <div className="text-[10px] text-text-muted/60 font-mono uppercase tracking-tighter">
                      ID: {inv.id.substring(0, 8)}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm">
                    <div className="font-medium text-white-custom">{inv.lead?.name || 'N/A'}</div>
                    <div className="text-[10px] text-text-muted/60">{inv.lead?.company || ''}</div>
                  </td>
                  <td className="px-8 py-6 text-xs text-text-muted">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      {inv.due_date}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-black text-emerald-400 font-mono text-lg">
                    {inv.total} {inv.currency}
                  </td>
                  <td className="px-8 py-6">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="px-8 py-6 text-right">
                    {inv.pdf_url && (
                      <a 
                        href={`${serverEnv.SUPABASE_URL}/storage/v1/object/public/invoices/${inv.pdf_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-background transition-all shadow-lg"
                      >
                        <Download size={18} />
                      </a>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <EmptyState 
                      icon={<FileText size={40} />}
                      title="Sin facturas"
                      description="No hay facturas generadas aún"
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
