import React from 'react';
import { supabaseServer } from '@/lib/supabaseServer';
import { 
  FileText, 
  Download, 
  ArrowLeft,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-500/20 text-emerald-400';
      case 'sent': return 'bg-blue-500/20 text-blue-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--white-color)]">
      <nav className="border-b border-[var(--primary-color)]/10 bg-[var(--card-bg-color)]/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-[var(--muted-color)] hover:text-[var(--primary-color)] transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center gap-2">
                <FileText className="text-[var(--primary-color)]" size={24} />
                <span className="font-bold text-xl tracking-tight">Facturación</span>
              </div>
            </div>
            <Link 
              href="/admin/invoices/new" 
              className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all"
            >
              Generar Factura
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[var(--card-bg-color)] p-6 rounded-2xl border border-[var(--primary-color)]/10 shadow-lg">
            <div className="text-[var(--muted-color)] text-xs uppercase font-bold mb-1">Total Facturado</div>
            <div className="text-3xl font-black text-emerald-400">
              ${invoices.reduce((acc, inv) => acc + Number(inv.total), 0).toFixed(2)}
            </div>
          </div>
          <div className="bg-[var(--card-bg-color)] p-6 rounded-2xl border border-[var(--primary-color)]/10 shadow-lg">
            <div className="text-[var(--muted-color)] text-xs uppercase font-bold mb-1">Pendiente de Cobro</div>
            <div className="text-3xl font-black text-blue-400">
              ${invoices.filter(i => i.status === 'sent').reduce((acc, inv) => acc + Number(inv.total), 0).toFixed(2)}
            </div>
          </div>
          <div className="bg-[var(--card-bg-color)] p-6 rounded-2xl border border-[var(--primary-color)]/10 shadow-lg">
            <div className="text-[var(--muted-color)] text-xs uppercase font-bold mb-1">Facturas Emitidas</div>
            <div className="text-3xl font-black text-[var(--primary-color)]">{invoices.length}</div>
          </div>
        </div>

        <div className="bg-[var(--card-bg-color)] rounded-2xl border border-[var(--primary-color)]/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs uppercase text-[var(--muted-color)] bg-[var(--background-color)]/50 border-b border-[var(--primary-color)]/10">
                <tr>
                  <th className="px-6 py-4">Nro Factura</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Fecha Venc.</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--primary-color)]/5">
                {invoices.length > 0 ? invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[var(--primary-color)]/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-[var(--white-color)] group-hover:text-[var(--primary-color)]">
                        {inv.number}
                      </div>
                      <div className="text-[10px] text-[var(--muted-color)] font-mono">
                        ID: {inv.id.substring(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm">
                      <div className="font-medium">{inv.lead?.name || 'N/A'}</div>
                      <div className="text-[10px] text-[var(--muted-color)]">{inv.lead?.company || ''}</div>
                    </td>
                    <td className="px-6 py-5 text-xs text-[var(--muted-color)]">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {inv.due_date}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-black text-emerald-400 font-mono text-lg">
                      {inv.total} {inv.currency}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      {inv.pdf_url && (
                        <a 
                          href={`${process.env.SUPABASE_URL}/storage/v1/object/public/invoices/${inv.pdf_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--primary-color)]/10 text-[var(--primary-color)] hover:bg-[var(--primary-color)] hover:text-white transition-all shadow-lg"
                        >
                          <Download size={18} />
                        </a>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-[var(--muted-color)]">
                      <div className="flex flex-col items-center gap-2">
                        <FileText size={40} className="opacity-20" />
                        <p>No hay facturas generadas aún.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
