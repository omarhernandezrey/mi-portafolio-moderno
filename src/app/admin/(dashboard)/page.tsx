import React from 'react';
import { supabaseServer } from '@/lib/supabaseServer';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  DollarSign, 
  ChevronRight,
  Ticket,
  Clock,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Search
} from 'lucide-react';
import Link from 'next/link';
import PageHeader from '@/components/admin/ui/PageHeader';
import StatCard from '@/components/admin/ui/StatCard';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import EmptyState from '@/components/admin/ui/EmptyState';

export const dynamic = 'force-dynamic';

async function getStats() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const firstDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

  const { count: totalLeads } = await supabaseServer
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', firstDayOfMonth);

  const { count: prevLeads } = await supabaseServer
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', firstDayOfPrevMonth)
    .lte('created_at', lastDayOfPrevMonth);

  const { count: paidLeads } = await supabaseServer
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'paid')
    .gte('created_at', firstDayOfMonth);

  const { count: totalConvs } = await supabaseServer
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', firstDayOfMonth);

  const { count: prevConvs } = await supabaseServer
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', firstDayOfPrevMonth)
    .lte('created_at', lastDayOfPrevMonth);

  const { count: openTickets } = await supabaseServer
    .from('tickets')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'closed');

  const { data: recentTickets } = await supabaseServer
    .from('tickets')
    .select('id, title, status, priority, created_at')
    .neq('status', 'closed')
    .order('created_at', { ascending: false })
    .limit(3);

  const { data: recentLeads } = await supabaseServer
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  const leadsTrend = prevLeads && prevLeads > 0
    ? `${((totalLeads || 0) - prevLeads) >= 0 ? '+' : ''}${(((totalLeads || 0) - prevLeads) / prevLeads * 100).toFixed(1)}%`
    : 'Nuevo';

  const convsTrend = prevConvs && prevConvs > 0
    ? `${((totalConvs || 0) - prevConvs) >= 0 ? '+' : ''}${(((totalConvs || 0) - prevConvs) / prevConvs * 100).toFixed(1)}%`
    : 'Nuevo';

  const conversionRate = totalConvs && totalConvs > 0 
    ? ((totalLeads || 0) / totalConvs * 100).toFixed(1) 
    : '0';

  return {
    monthLeads: totalLeads || 0,
    monthPaid: paidLeads || 0,
    monthConvs: totalConvs || 0,
    openTickets: openTickets || 0,
    conversionRate,
    recentLeads: recentLeads || [],
    recentTickets: recentTickets || [],
    leadsTrend,
    convsTrend,
  };
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin}m`;
  if (diffHrs < 24) return `Hace ${diffHrs}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', timeZone: 'America/Bogota' });
}

export default async function AdminDashboardPage() {
  const stats = await getStats();
  const currentDate = new Date().toLocaleDateString('es-CO', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'America/Bogota'
  });

  return (
    <div className="space-y-10">
      <PageHeader
        overline="Control Center"
        title="Dashboard"
        description={
          <span className="flex items-center gap-2 text-text-muted text-sm font-medium">
            <Clock size={14} className="text-primary" />
            {currentDate.charAt(0).toUpperCase() + currentDate.slice(1)}
          </span>
        }
        actions={
          <>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-text-muted hover:text-white-custom hover:bg-white/10 transition-all">
              <RefreshCw size={16} />
              Sincronizar
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-background text-sm font-black hover:scale-105 transition-all shadow-lg shadow-primary/20">
              <TrendingUp size={16} />
              Generar Reporte
            </button>
          </>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Leads Mensuales" 
          value={stats.monthLeads.toString()} 
          icon={<Users size={22} />} 
          trend={stats.leadsTrend}
          color="primary"
          description="Nuevos clientes potenciales vs mes anterior"
        />
        <StatCard 
          title="Conversaciones" 
          value={stats.monthConvs.toString()} 
          icon={<MessageSquare size={22} />} 
          trend={stats.convsTrend}
          color="accent"
          description="Interacciones del chatbot vs mes anterior"
        />
        <StatCard 
          title="Tasa de Conversión" 
          value={`${stats.conversionRate}%`} 
          icon={<TrendingUp size={22} />} 
          trend="Leads/Conv"
          color="primary"
          description="Proporción leads sobre conversaciones este mes"
        />
        <StatCard 
          title="Ventas Confirmadas" 
          value={stats.monthPaid.toString()} 
          icon={<DollarSign size={22} />} 
          trend="Meta mensual"
          color="accent"
          description="Pagos procesados este mes"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Recent Leads Section */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-card-bg rounded-[24px] sm:rounded-[32px] border border-white/5 shadow-2xl overflow-hidden backdrop-blur-sm">
            <div className="p-4 sm:p-6 lg:p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white-custom flex items-center gap-2">
                  Actividad Reciente
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase">Live</span>
                </h2>
                <p className="text-text-muted text-xs font-medium mt-1">Últimos clientes que interactuaron con el sistema</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative group flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/50 group-focus-within:text-primary transition-colors" size={14} />
                  <input 
                    type="text" 
                    placeholder="Buscar lead..." 
                    className="bg-background/50 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white-custom outline-none focus:border-primary/40 transition-all w-full sm:w-48"
                  />
                </div>
                <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-white-custom transition-all">
                  <Filter size={18} />
                </button>
              </div>
            </div>
            
            {/* Mobile Card View */}
            <div className="block lg:hidden">
              {stats.recentLeads.length > 0 ? stats.recentLeads.map((lead) => (
                <div key={lead.id} className="p-4 border-b border-white/5 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white-custom shrink-0">
                      {lead.name?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white-custom text-sm">{lead.name || 'Anónimo'}</div>
                      <div className="text-[10px] text-text-muted/70 truncate">{lead.email}</div>
                      <div className="text-xs text-text-muted mt-1 italic">{lead.service_requested || 'Consulta General'}</div>
                      <div className="flex items-center justify-between mt-2">
                        <StatusBadge status={lead.status} size="sm" />
                        <Link 
                          href={`/admin/leads/${lead.id}`} 
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-text-muted hover:bg-primary hover:text-background transition-all"
                        >
                          <ArrowUpRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center">
                  <EmptyState 
                    icon={<Users size={32} />}
                    title="No hay registros"
                    description="No hay leads recientes para mostrar"
                  />
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-0 min-w-[600px]">
                <thead>
                  <tr className="bg-background/20">
                    <th className="px-4 xl:px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Cliente</th>
                    <th className="px-4 xl:px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Requerimiento</th>
                    <th className="px-4 xl:px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Estado</th>
                    <th className="px-4 xl:px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.recentLeads.length > 0 ? stats.recentLeads.map((lead) => (
                    <tr key={lead.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 xl:px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white-custom">
                            {lead.name?.[0] || '?'}
                          </div>
                          <div>
                            <div className="font-bold text-white-custom text-sm group-hover:text-primary transition-colors">{lead.name || 'Anónimo'}</div>
                            <div className="text-[10px] text-text-muted/70 font-medium tracking-tight mt-0.5">{lead.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 xl:px-8 py-6">
                        <div className="text-sm font-bold text-text-muted group-hover:text-white-custom transition-colors italic">
                          {lead.service_requested || 'Consulta General'}
                        </div>
                        <div className="text-[10px] text-text-muted/50 font-black uppercase mt-1 tracking-widest flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(lead.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', timeZone: 'America/Bogota' })}
                        </div>
                      </td>
                      <td className="px-4 xl:px-8 py-6">
                        <StatusBadge status={lead.status} size="sm" />
                      </td>
                      <td className="px-4 xl:px-8 py-6 text-right">
                        <Link 
                          href={`/admin/leads/${lead.id}`} 
                          className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:bg-primary hover:text-background hover:border-primary transition-all group/btn"
                        >
                          <ArrowUpRight size={18} className="group-hover/btn:scale-110 transition-transform" />
                        </Link>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <EmptyState 
                          icon={<Users size={32} />}
                          title="No hay registros"
                          description="No hay leads recientes para mostrar"
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Link 
              href="/admin/leads" 
              className="flex items-center justify-center p-4 sm:p-6 text-[10px] uppercase tracking-[0.4em] font-black text-text-muted hover:text-primary transition-colors border-t border-white/5 bg-background/10"
            >
              Ver repositorio completo
              <ChevronRight size={14} className="ml-2" />
            </Link>
          </div>
        </div>

        {/* Sidebar Info Panel */}
        <div className="space-y-4 sm:space-y-8">
          {/* Active Tickets */}
          <div className="bg-card-bg rounded-[24px] sm:rounded-[32px] border border-white/5 p-4 sm:p-6 lg:p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
              <Ticket size={80} sm:size={120} className="-rotate-12" />
            </div>
            
            <div className="flex items-center justify-between mb-4 sm:mb-8">
              <h3 className="font-bold text-white-custom text-sm sm:text-base">Tickets Activos</h3>
              <span className="px-2 sm:px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                {stats.openTickets} Pendientes
              </span>
            </div>
            
            <div className="space-y-3 sm:space-y-4 relative z-10">
              {stats.recentTickets.length > 0 ? stats.recentTickets.map((ticket: { id: string; title: string; status: string; priority: string; created_at: string }) => {
                const priorityColor = ticket.priority === 'high' ? 'text-red-400' : ticket.priority === 'medium' ? 'text-amber-400' : 'text-text-muted';
                const statusLabel = ticket.status === 'open' ? 'Abierto' : ticket.status === 'in_progress' ? 'En curso' : ticket.status;
                const timeAgo = getTimeAgo(new Date(ticket.created_at));
                return (
                  <Link 
                    key={ticket.id}
                    href={`/admin/tickets/${ticket.id}`}
                    className="block p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-background/40 border border-white/5 hover:border-primary/20 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${priorityColor} truncate flex-1 mr-2`}>{ticket.title}</span>
                      <span className="text-[8px] text-text-muted shrink-0">{timeAgo}</span>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed font-medium capitalize">{statusLabel}</p>
                  </Link>
                );
              }) : (
                <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-background/40 border border-white/5 text-center">
                  <p className="text-xs text-text-muted/50 italic">No hay tickets pendientes</p>
                </div>
              )}
              <Link 
                href="/admin/tickets"
                className="block w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white-custom hover:bg-white/10 transition-all border border-dashed border-white/10 text-center"
              >
                Gestionar Tickets
              </Link>
            </div>
          </div>

          {/* Resumen del Mes */}
          <div className="bg-background rounded-[24px] sm:rounded-[32px] border border-white/5 p-4 sm:p-6 lg:p-8 shadow-xl">
            <h3 className="font-bold text-white-custom mb-4 sm:mb-8 flex items-center gap-2 text-sm sm:text-base">
              <RefreshCw size={14} sm:size={16} className="text-primary" />
              Resumen del Mes
            </h3>
            <div className="space-y-4 sm:space-y-6">
              <MetricItem label="Total Leads" value={stats.monthLeads.toString()} />
              <MetricItem label="Conversaciones" value={stats.monthConvs.toString()} />
              <MetricItem label="Tickets Abiertos" value={stats.openTickets.toString()} />
              <MetricItem label="Ventas" value={stats.monthPaid.toString()} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between group">
      <span className="text-[10px] text-text-muted font-black uppercase tracking-wider group-hover:text-white-custom transition-colors">{label}</span>
      <span className="text-sm font-black text-white-custom">{value}</span>
    </div>
  );
}
