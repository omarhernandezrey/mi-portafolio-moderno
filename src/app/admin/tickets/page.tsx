import React from 'react';
import { supabaseServer } from '@/lib/supabaseServer';
import { 
  ChevronRight, 
  ArrowLeft,
  Ticket,
  AlertCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';

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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500/20 text-blue-400';
      case 'in_progress': return 'bg-amber-500/20 text-amber-400';
      case 'waiting_client': return 'bg-purple-500/20 text-purple-400';
      case 'closed': return 'bg-emerald-500/20 text-emerald-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

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
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--white-color)]">
      <nav className="border-b border-[var(--primary-color)]/10 bg-[var(--card-bg-color)]/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-[var(--muted-color)] hover:text-[var(--primary-color)] transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center gap-2">
                <Ticket className="text-[var(--primary-color)]" size={24} />
                <span className="font-bold text-xl tracking-tight">Sistema de Tickets</span>
              </div>
            </div>
            <Link 
              href="/admin/tickets/new" 
              className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all"
            >
              Nuevo Ticket
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-[var(--card-bg-color)] p-4 rounded-2xl border border-[var(--primary-color)]/10">
            <div className="text-[var(--muted-color)] text-xs uppercase font-bold mb-1">Abiertos</div>
            <div className="text-2xl font-black text-blue-400">{tickets.filter(t => t.status === 'open').length}</div>
          </div>
          <div className="bg-[var(--card-bg-color)] p-4 rounded-2xl border border-[var(--primary-color)]/10">
            <div className="text-[var(--muted-color)] text-xs uppercase font-bold mb-1">En Proceso</div>
            <div className="text-2xl font-black text-amber-400">{tickets.filter(t => t.status === 'in_progress').length}</div>
          </div>
          <div className="bg-[var(--card-bg-color)] p-4 rounded-2xl border border-[var(--primary-color)]/10">
            <div className="text-[var(--muted-color)] text-xs uppercase font-bold mb-1">Pendiente Cliente</div>
            <div className="text-2xl font-black text-purple-400">{tickets.filter(t => t.status === 'waiting_client').length}</div>
          </div>
        </div>

        <div className="bg-[var(--card-bg-color)] rounded-2xl border border-[var(--primary-color)]/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs uppercase text-[var(--muted-color)] bg-[var(--background-color)]/50 border-b border-[var(--primary-color)]/10">
                <tr>
                  <th className="px-6 py-4">Ticket / Asunto</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Prioridad</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Última Actividad</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--primary-color)]/5">
                {tickets.length > 0 ? tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-[var(--primary-color)]/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {isOverSLA(ticket.updated_at, ticket.status) && (
                          <AlertCircle size={16} className="text-red-500 animate-pulse" />
                        )}
                        <div>
                          <div className="font-semibold text-[var(--white-color)] group-hover:text-[var(--primary-color)] transition-colors">
                            {ticket.title}
                          </div>
                          <div className="text-[10px] text-[var(--muted-color)] font-mono uppercase tracking-tighter">
                            ID: {ticket.id.substring(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-[var(--muted-color)]">
                      {ticket.lead?.name || 'N/A'}
                      <div className="text-[10px]">{ticket.lead?.company || ''}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-xs uppercase font-bold tracking-wider ${getPriorityStyle(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-xs text-[var(--muted-color)]">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(ticket.updated_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link href={`/admin/tickets/${ticket.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-[var(--primary-color)]/20 text-[var(--primary-color)] transition-all">
                        <ChevronRight size={20} />
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-[var(--muted-color)]">
                      <div className="flex flex-col items-center gap-2">
                        <Ticket size={40} className="opacity-20" />
                        <p>No hay tickets activos.</p>
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
