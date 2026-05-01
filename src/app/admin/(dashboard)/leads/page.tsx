import React from 'react';
import { supabaseServer } from '@/lib/supabaseServer';
import { 
  Search, 
  Filter,
  Plus,
  MoreVertical,
  Mail,
  User,
  Calendar,
  Briefcase
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
    <div className="p-4 md:p-8 lg:p-12 space-y-10 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-3">
            <span className="w-8 h-px bg-primary/30" />
            CRM Pipeline
          </div>
          <h1 className="text-4xl font-black text-white-custom tracking-tight mb-2 italic">Leads</h1>
          <p className="text-text-muted text-sm font-medium">Administración y seguimiento de oportunidades comerciales.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <ExportLeadsButton leads={leads} />
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-background text-sm font-black hover:scale-105 transition-all shadow-lg shadow-primary/20">
            <Plus size={16} />
            Añadir Lead
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col xl:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, correo o empresa..." 
            className="w-full pl-12 pr-4 py-4 bg-card-bg border border-white/5 rounded-[20px] text-white-custom outline-none focus:border-primary/30 transition-all shadow-xl"
          />
        </div>
        <div className="flex gap-3">
          <select className="bg-card-bg border border-white/5 rounded-[20px] px-6 py-4 text-xs font-bold text-text-muted outline-none focus:border-primary/30 transition-all shadow-xl appearance-none min-w-[160px]">
            <option>Todos los Estados</option>
            <option>Pendiente</option>
            <option>En Curso</option>
            <option>Completado</option>
            <option>Sin Acción</option>
          </select>
          <button className="flex items-center gap-2 px-6 py-4 bg-card-bg border border-white/5 rounded-[20px] text-xs font-bold text-text-muted hover:text-white-custom transition-all shadow-xl">
            <Filter size={16} />
            Filtros Avanzados
          </button>
        </div>
      </div>

      {/* Main Content Table */}
      <div className="bg-card-bg rounded-[32px] border border-white/5 shadow-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-background/40">
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Identidad</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Contexto</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Requerimiento</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Presupuesto</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5 text-center">Estatus</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {leads.length > 0 ? leads.map((lead) => (
                <tr key={lead.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white-custom shadow-inner group-hover:border-primary/20 transition-colors">
                        <User size={18} className="opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all" />
                      </div>
                      <div>
                        <div className="font-bold text-white-custom text-[15px] tracking-tight group-hover:text-primary transition-colors">{lead.name || 'Sin identificar'}</div>
                        <div className="flex items-center gap-1 text-[10px] text-text-muted/60 font-medium tracking-tight mt-0.5">
                          <Mail size={10} />
                          {lead.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-white-custom/80 italic">{lead.company || 'N/A'}</div>
                    <div className="text-[10px] text-primary font-black uppercase tracking-widest mt-1 opacity-60 italic">{lead.type}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-text-muted group-hover:text-white-custom transition-colors">
                      <Briefcase size={14} className="text-primary/40" />
                      {lead.service_requested || 'Consulta Directa'}
                    </div>
                    <div className="text-[10px] text-text-muted/40 font-black uppercase mt-1 tracking-[0.15em] flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(lead.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-black text-white-custom font-mono bg-white/5 inline-block px-3 py-1 rounded-lg border border-white/5 group-hover:border-primary/20 transition-colors">
                      {lead.budget || 'N/D'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/admin/leads/${lead.id}`} 
                        className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-text-muted hover:bg-primary hover:text-background hover:border-primary transition-all"
                      >
                        Perfil
                      </Link>
                      <button className="p-2.5 rounded-xl hover:bg-white/5 text-text-muted/40 hover:text-white-custom transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-6">
                      <div className="w-20 h-20 rounded-[30px] bg-white/5 border border-white/5 flex items-center justify-center text-text-muted/10">
                        <Search size={40} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-white-custom font-bold text-lg tracking-tight">Sin resultados</p>
                        <p className="text-text-muted text-sm font-medium italic">No se encontraron oportunidades registradas en la base de datos.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {leads.length > 0 && (
          <div className="p-8 border-t border-white/5 bg-background/20 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/40 italic">
              Mostrando {leads.length} de {leads.length} registros totales
            </span>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-text-muted cursor-not-allowed opacity-50">Anterior</button>
              <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-text-muted cursor-not-allowed opacity-50">Siguiente</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string, color: string }> = {
    paid: { label: 'Completado', color: 'text-primary bg-primary/10 border-primary/20 shadow-[0_0_15px_rgba(var(--primary-color-rgb),0.1)]' },
    cold: { label: 'Sin Acción', color: 'text-text-muted bg-white/5 border-white/10 opacity-60' },
    new: { label: 'Pendiente', color: 'text-accent bg-accent/10 border-accent/20 animate-pulse' },
    contacted: { label: 'En Curso', color: 'text-white-custom bg-white/10 border-white/20' },
  };

  const config = configs[status] || configs.new;

  return (
    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border transition-all inline-block min-w-[100px] ${config.color}`}>
      {config.label}
    </span>
  );
}
