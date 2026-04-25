import React from 'react';
import { supabaseServer } from '@/lib/supabaseServer';
import { 
  ChevronRight, 
  Search, 
  Filter
} from 'lucide-react';
import Link from 'next/link';
import ExportLeadsButton from '@/components/admin/ExportLeadsButton';

export const dynamic = 'force-dynamic';

async function getLeads() {
  const { data, error } = await supabaseServer
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) console.error('Error fetching leads:', error);
  return data || [];
}

export default async function AdminLeadsPage() {
  const leads = await getLeads();

  return (
    <div className="p-0">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Leads</h1>
            <p className="text-[var(--muted-color)] mt-2">Administra y exporta tus contactos comerciales</p>
          </div>
          <ExportLeadsButton leads={leads} />
        </div>
        {/* Filtros Placeholder */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-color)]" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o email..." 
              className="w-full pl-10 pr-4 py-2 bg-[var(--card-bg-color)] border border-[var(--primary-color)]/10 rounded-xl outline-none focus:border-[var(--primary-color)] transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--card-bg-color)] border border-[var(--primary-color)]/10 rounded-xl text-sm font-medium hover:bg-[var(--primary-color)]/5 transition-all">
              <Filter size={16} />
              <span>Filtrar</span>
            </button>
          </div>
        </div>

        <div className="bg-[var(--card-bg-color)] rounded-2xl border border-[var(--primary-color)]/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs uppercase text-[var(--muted-color)] bg-[var(--background-color)]/50 border-b border-[var(--primary-color)]/10">
                <tr>
                  <th className="px-6 py-4">Información del Cliente</th>
                  <th className="px-6 py-4">Empresa / Rol</th>
                  <th className="px-6 py-4">Servicio Solicitado</th>
                  <th className="px-6 py-4">Presupuesto</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--primary-color)]/5">
                {leads.length > 0 ? leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[var(--primary-color)]/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-semibold text-[var(--white-color)] group-hover:text-[var(--primary-color)] transition-colors">
                        {lead.name || 'Sin nombre'}
                      </div>
                      <div className="text-xs text-[var(--muted-color)]">{lead.email}</div>
                      {lead.phone && <div className="text-[10px] text-[var(--muted-color)]">{lead.phone}</div>}
                    </td>
                    <td className="px-6 py-5 text-sm text-[var(--muted-color)]">
                      {lead.company || 'N/A'}
                      <div className="text-[10px] italic">{lead.type}</div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium">
                      {lead.service_requested || 'N/A'}
                    </td>
                    <td className="px-6 py-5 text-sm text-emerald-400 font-mono">
                      {lead.budget || 'N/A'}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        lead.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                        lead.status === 'cold' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-xs text-[var(--muted-color)]">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link href={`/admin/leads/${lead.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-[var(--primary-color)]/20 text-[var(--primary-color)] transition-all">
                        <ChevronRight size={20} />
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center text-[var(--muted-color)]">
                      <div className="flex flex-col items-center gap-2">
                        <Search size={40} className="opacity-20" />
                        <p>No se encontraron leads.</p>
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
