import React from 'react';
import { supabaseServer } from '@/lib/supabaseServer';
import { 
  ChevronRight, 
  Ticket,
  AlertCircle,
  Clock,
  Plus
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

  const isOverSLA = (updatedAt: string, status: string) => {
    if (status === 'closed') return false;
    const lastUpdate = new Date(updatedAt);
    const now = new Date();
    const diffHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    return diffHours > 24;
  };

  return (
    <div className="space-y-10">
      <PageHeader
        overline="Soporte Técnico"
        title="Tickets"
        description="Seguimiento de incidencias y soporte al cliente."
        actions={
          <Link 
            href="/admin/tickets/new" 
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-background text-sm font-black hover:scale-105 transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={16} />
            Nuevo Ticket
          </Link>
        }
      />

      {/* Stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card-bg p-6 rounded-2xl border border-white/5 shadow-xl">
          <div className="text-text-muted text-xs uppercase font-black tracking-widest mb-2">Abiertos</div>
          <div className="text-3xl font-black text-blue-400">{tickets.filter(t => t.status === 'open').length}</div>
        </div>
        <div className="bg-card-bg p-6 rounded-2xl border border-white/5 shadow-xl">
          <div className="text-text-muted text-xs uppercase font-black tracking-widest mb-2">En Proceso</div>
          <div className="text-3xl font-black text-amber-400">{tickets.filter(t => t.status === 'in_progress').length}</div>
        </div>
        <div className="bg-card-bg p-6 rounded-2xl border border-white/5 shadow-xl">
          <div className="text-text-muted text-xs uppercase font-black tracking-widest mb-2">Pendiente Cliente</div>
          <div className="text-3xl font-black text-purple-400">{tickets.filter(t => t.status === 'waiting_client').length}</div>
        </div>
      </div>

      <div className="bg-card-bg rounded-[32px] border border-white/5 shadow-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
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
    </div>
  );
}
