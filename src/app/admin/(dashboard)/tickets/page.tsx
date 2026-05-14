import React from 'react';
import { supabaseServer } from '@/lib/supabaseServer';
import { 
  ChevronRight, 
  Ticket,
  AlertCircle,
  Clock,
  Plus,
  User,
  Building2
} from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/admin/ui/PageHeader';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import EmptyState from '@/components/admin/ui/EmptyState';

export const dynamic = 'force-dynamic';

async function getTickets() {
  const { data, error } = await supabaseServer
    .from('tickets')
    .select('*, lead:leads(name, company)')
    .order('updated_at', { ascending: false });

  if (error) console.error('Error fetching tickets:', error);
  return data || [];
}

export default async function AdminTicketsPage() {
  const tickets = await getTickets();

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 font-bold';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-amber-300';
      case 'low': return 'text-emerald-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return priority;
    }
  };

  const isOverSLA = (updatedAt: string, status: string) => {
    if (status === 'closed') return false;
    const lastUpdate = new Date(updatedAt);
    const now = new Date();
    const diffHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    return diffHours > 24;
  };

  return (
    <div className="space-y-6 sm:space-y-10">
      <PageHeader
        overline="Soporte Técnico"
        title="Tickets"
        description="Seguimiento de incidencias y soporte al cliente."
        actions={
          <Link 
            href="/admin/tickets/new" 
            className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-primary text-background text-sm font-black hover:scale-105 transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nuevo Ticket</span>
            <span className="sm:hidden">Nuevo</span>
          </Link>
        }
      />

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-card-bg p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-white/5 shadow-xl">
          <div className="text-text-muted text-[9px] sm:text-xs uppercase font-black tracking-widest mb-1 sm:mb-2">Abiertos</div>
          <div className="text-xl sm:text-3xl font-black text-blue-400">{tickets.filter(t => t.status === 'open').length}</div>
        </div>
        <div className="bg-card-bg p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-white/5 shadow-xl">
          <div className="text-text-muted text-[9px] sm:text-xs uppercase font-black tracking-widest mb-1 sm:mb-2">En Proceso</div>
          <div className="text-xl sm:text-3xl font-black text-amber-400">{tickets.filter(t => t.status === 'in_progress').length}</div>
        </div>
        <div className="bg-card-bg p-3 sm:p-6 rounded-xl sm:rounded-2xl border border-white/5 shadow-xl">
          <div className="text-text-muted text-[9px] sm:text-xs uppercase font-black tracking-widest mb-1 sm:mb-2">Pendiente</div>
          <div className="text-xl sm:text-3xl font-black text-purple-400">{tickets.filter(t => t.status === 'waiting_client').length}</div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-3">
        {tickets.length > 0 ? tickets.map((ticket) => (
          <div key={ticket.id} className="bg-card-bg rounded-2xl border border-white/5 p-4 shadow-xl">
            {/* Header: Title + Alert + Status */}
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {isOverSLA(ticket.updated_at, ticket.status) && (
                    <AlertCircle size={14} className="text-red-500 animate-pulse shrink-0" />
                  )}
                  <div className="font-bold text-white-custom text-sm truncate">{ticket.title}</div>
                </div>
                <div className="text-[10px] text-text-muted/60 font-mono uppercase tracking-tighter mt-0.5">
                  ID: {ticket.id.substring(0, 8)}
                </div>
              </div>
              <StatusBadge status={ticket.status} />
            </div>
            
            {/* Client Info */}
            <div className="flex items-center gap-2 mb-3 p-2 bg-background/40 rounded-lg">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <User size={14} className="text-text-muted/60" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white-custom truncate">{ticket.lead?.name || 'N/A'}</div>
                {ticket.lead?.company && (
                  <div className="text-[10px] text-text-muted/60 flex items-center gap-1">
                    <Building2 size={9} />
                    <span className="truncate">{ticket.lead.company}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-background/40 rounded-lg p-2">
                <div className="text-[9px] uppercase tracking-wider text-text-muted/40 font-black">Prioridad</div>
                <span className={`text-xs uppercase font-black tracking-wider ${getPriorityStyle(ticket.priority)}`}>
                  {getPriorityLabel(ticket.priority)}
                </span>
              </div>
              <div className="bg-background/40 rounded-lg p-2">
                <div className="text-[9px] uppercase tracking-wider text-text-muted/40 font-black">Actualizado</div>
                <div className="text-[10px] text-text-muted flex items-center gap-1">
                  <Clock size={10} />
                  {new Date(ticket.updated_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' })}
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            <Link 
              href={`/admin/tickets/${ticket.id}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-wider text-text-muted hover:bg-primary hover:text-background hover:border-primary transition-all"
            >
              Ver Ticket
              <ChevronRight size={16} />
            </Link>
          </div>
        )) : (
          <div className="bg-card-bg rounded-2xl border border-white/5 p-8">
            <EmptyState 
              icon={<Ticket size={32} />}
              title="No hay tickets activos"
              description="Crea un nuevo ticket para comenzar"
            />
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-card-bg rounded-[32px] border border-white/5 shadow-2xl overflow-hidden backdrop-blur-sm">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-background/40">
              <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Ticket / Asunto</th>
              <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Cliente</th>
              <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Prioridad</th>
              <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Estado</th>
              <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Última Actividad</th>
              <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tickets.length > 0 ? tickets.map((ticket) => (
              <tr key={ticket.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    {isOverSLA(ticket.updated_at, ticket.status) && (
                      <AlertCircle size={16} className="text-red-500 animate-pulse shrink-0" />
                    )}
                    <div>
                      <div className="font-bold text-white-custom text-sm group-hover:text-primary transition-colors">
                        {ticket.title}
                      </div>
                      <div className="text-[10px] text-text-muted/60 font-mono uppercase tracking-tighter">
                        ID: {ticket.id.substring(0, 8)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm text-text-muted">
                  <div className="font-medium text-white-custom">{ticket.lead?.name || 'N/A'}</div>
                  <div className="text-[10px] text-text-muted/60">{ticket.lead?.company || ''}</div>
                </td>
                <td className="px-8 py-6">
                  <span className={`text-xs uppercase font-black tracking-wider ${getPriorityStyle(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="px-8 py-6 text-xs text-text-muted">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(ticket.updated_at).toLocaleString()}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <Link href={`/admin/tickets/${ticket.id}`} className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:bg-primary hover:text-background hover:border-primary transition-all">
                    <ChevronRight size={18} />
                  </Link>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-8 py-24 text-center">
                  <EmptyState 
                    icon={<Ticket size={40} />}
                    title="No hay tickets activos"
                    description="Crea un nuevo ticket para comenzar"
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
