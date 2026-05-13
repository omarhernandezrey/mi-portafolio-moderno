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

// Evitar cacheo para ver datos frescos
export const dynamic = 'force-dynamic';

async function getStats() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const firstDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

  // 1. Total leads este mes
  const { count: totalLeads } = await supabaseServer
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', firstDayOfMonth);

  // Leads del mes anterior para calcular trend
  const { count: prevLeads } = await supabaseServer
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', firstDayOfPrevMonth)
    .lte('created_at', lastDayOfPrevMonth);

  // 2. Leads pagados (conversion)
  const { count: paidLeads } = await supabaseServer
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'paid')
    .gte('created_at', firstDayOfMonth);

  // 3. Conversaciones totales
  const { count: totalConvs } = await supabaseServer
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', firstDayOfMonth);

  const { count: prevConvs } = await supabaseServer
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', firstDayOfPrevMonth)
    .lte('created_at', lastDayOfPrevMonth);

  // 4. Tickets abiertos
  const { count: openTickets } = await supabaseServer
    .from('tickets')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'closed');

  // 5. Ultimos tickets abiertos para el panel lateral
  const { data: recentTickets } = await supabaseServer
    .from('tickets')
    .select('id, title, status, priority, created_at')
    .neq('status', 'closed')
    .order('created_at', { ascending: false })
    .limit(3);

  // 6. Ultimos 5 leads
  const { data: recentLeads } = await supabaseServer
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  // Calcular tendencias reales
  const leadsTrend = prevLeads && prevLeads > 0
    ? `${((totalLeads || 0) - prevLeads) >= 0 ? '+' : ''}${(((totalLeads || 0) - prevLeads) / prevLeads * 100).toFixed(1)}%`
    : 'Nuevo';

  const convsTrend = prevConvs && prevConvs > 0
    ? `${((totalConvs || 0) - prevConvs) >= 0 ? '+' : ''}${(((totalConvs || 0) - prevConvs) / prevConvs * 100).toFixed(1)}%`
    : 'Nuevo';

  const conversionRate = totalConvs && totalConvs > 0 
    ? ((totalLeads || 0) / totalConvs * 100).toFixed(1) 
    : '0';

  const paidPercent = 'Meta mensual';

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
    paidPercent
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();
  const currentDate = new Date().toLocaleDateString('es-CO', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="p-4 md:p-8 lg:p-12 space-y-10 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-3">
            <span className="w-8 h-px bg-primary/30" />
            Control Center
          </div>
          <h1 className="text-4xl font-black text-white-custom tracking-tight mb-2 italic">Dashboard</h1>
          <p className="text-text-muted text-sm font-medium flex items-center gap-2">
            <Clock size={14} className="text-primary" />
            {currentDate.charAt(0).toUpperCase() + currentDate.slice(1)}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-text-muted hover:text-white-custom hover:bg-white/10 transition-all">
            <RefreshCw size={16} />
            Sincronizar
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-background text-sm font-black hover:scale-105 transition-all shadow-lg shadow-primary/20">
            <TrendingUp size={16} />
            Generar Reporte
          </button>
        </div>
      </div>

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
            title="Tasa de Conversion" 
            value={`${stats.conversionRate}%`} 
            icon={<TrendingUp size={22} />} 
            trend="Leads/Conv"
            color="primary"
            description="Proporcion leads sobre conversaciones este mes"
          />
          <StatCard 
            title="Ventas Confirmadas" 
            value={stats.monthPaid.toString()} 
            icon={<DollarSign size={22} />} 
            trend={stats.paidPercent}
            color="accent"
            description="Pagos procesados este mes"
          />
        <StatCard 
          title="Conversaciones" 
          value={stats.monthConvs.toString()} 
          icon={<MessageSquare size={22} />} 
          trend="+5.1%" 
          color="accent"
          description="Interacciones del chatbot"
        />
        <StatCard 
          title="Tasa de Cierre" 
          value={`${stats.conversionRate}%`} 
          icon={<TrendingUp size={22} />} 
          trend="Estable" 
          color="primary"
          description="Conversión visita → lead"
        />
        <StatCard 
          title="Ventas Confirmadas" 
          value={stats.monthPaid.toString()} 
          icon={<DollarSign size={22} />} 
          trend="80% Meta" 
          color="accent"
          description="Pagos procesados este mes"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Leads Table Container */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-card-bg rounded-[32px] border border-white/5 shadow-2xl overflow-hidden backdrop-blur-sm">
            <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white-custom flex items-center gap-2">
                  Actividad Reciente
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase">Live</span>
                </h2>
                <p className="text-text-muted text-xs font-medium mt-1">Últimos clientes que interactuaron con el sistema</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative group">
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
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr className="bg-background/20">
                    <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Cliente</th>
                    <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Requerimiento</th>
                    <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Estado</th>
                    <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.recentLeads.length > 0 ? stats.recentLeads.map((lead) => (
                    <tr key={lead.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-6">
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
                      <td className="px-8 py-6">
                        <div className="text-sm font-bold text-text-muted group-hover:text-white-custom transition-colors italic">
                          {lead.service_requested || 'Consulta General'}
                        </div>
                        <div className="text-[10px] text-text-muted/50 font-black uppercase mt-1 tracking-widest flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(lead.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="px-8 py-6 text-right">
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
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted/20">
                            <Users size={32} />
                          </div>
                          <p className="text-text-muted text-sm font-bold italic tracking-tight opacity-40">No hay registros para mostrar</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Link 
              href="/admin/leads" 
              className="flex items-center justify-center p-6 text-[10px] uppercase tracking-[0.4em] font-black text-text-muted hover:text-primary transition-colors border-t border-white/5 bg-background/10"
            >
              Ver repositorio completo
              <ChevronRight size={14} className="ml-2" />
            </Link>
          </div>
        </div>

        {/* Sidebar Info Panel */}
        <div className="space-y-8">
          {/* Active Tickets */}
          <div className="bg-card-bg rounded-[32px] border border-white/5 p-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
              <Ticket size={120} className="-rotate-12" />
            </div>
            
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-white-custom">Tickets Activos</h3>
              <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                {stats.openTickets} Pendientes
              </span>
            </div>
            
            <div className="space-y-4 relative z-10">
              {stats.recentTickets.length > 0 ? stats.recentTickets.map((ticket: { id: string; title: string; status: string; priority: string; created_at: string }) => {
                const priorityColor = ticket.priority === 'high' ? 'text-red-400' : ticket.priority === 'medium' ? 'text-amber-400' : 'text-text-muted';
                const statusLabel = ticket.status === 'open' ? 'Abierto' : ticket.status === 'in_progress' ? 'En curso' : ticket.status;
                const timeAgo = getTimeAgo(new Date(ticket.created_at));
                return (
                  <Link 
                    key={ticket.id}
                    href={`/admin/tickets/${ticket.id}`}
                    className="block p-5 rounded-2xl bg-background/40 border border-white/5 hover:border-primary/20 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${priorityColor}`}>{ticket.title}</span>
                      <span className="text-[8px] text-text-muted">{timeAgo}</span>
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed font-medium capitalize">{statusLabel}</p>
                  </Link>
                );
              }) : (
                <div className="p-5 rounded-2xl bg-background/40 border border-white/5 text-center">
                  <p className="text-xs text-text-muted/50 italic">No hay tickets pendientes</p>
                </div>
              )}
              <Link 
                href="/admin/tickets"
                className="block w-full py-4 rounded-2xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white-custom hover:bg-white/10 transition-all border border-dashed border-white/10 text-center"
              >
                Gestionar Tickets
              </Link>
            </div>
          </div>

          {/* Resumen del Mes */}
          <div className="bg-background rounded-[32px] border border-white/5 p-8 shadow-xl">
            <h3 className="font-bold text-white-custom mb-8 flex items-center gap-2">
              <RefreshCw size={16} className="text-primary" />
              Resumen del Mes
            </h3>
            <div className="space-y-6">
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

function StatCard({ title, value, icon, trend, color, description }: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  trend: string;
  color: 'primary' | 'accent';
  description: string;
}) {
  const isPrimary = color === 'primary';
  
  return (
    <div className="bg-card-bg p-8 rounded-[32px] border border-white/5 shadow-xl relative overflow-hidden group hover:border-primary/20 transition-all duration-500">
      {/* Decorative Glow */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${isPrimary ? 'bg-primary' : 'bg-accent'}`} />
      
      <div className="flex items-start justify-between mb-8">
        <div className={`p-4 rounded-2xl border transition-all duration-500 ${
          isPrimary 
            ? 'bg-primary/5 border-primary/10 text-primary group-hover:bg-primary group-hover:text-background' 
            : 'bg-accent/5 border-accent/10 text-accent group-hover:bg-accent group-hover:text-background'
        }`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter ${isPrimary ? 'text-primary' : 'text-accent'}`}>
          {trend}
          <ArrowUpRight size={12} />
        </div>
      </div>
      
      <div className="relative z-10">
        <div className="text-4xl font-black text-white-custom tracking-tight mb-2 tracking-tighter">{value}</div>
        <div className="text-[10px] uppercase font-black tracking-[0.2em] text-white-custom/60 group-hover:text-white-custom transition-colors">{title}</div>
        <div className="text-[10px] text-text-muted mt-3 font-medium italic opacity-60 line-clamp-1">{description}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string, color: string }> = {
    paid: { label: 'Completado', color: 'text-primary bg-primary/10 border-primary/20' },
    cold: { label: 'Sin Acción', color: 'text-text-muted bg-white/5 border-white/10 opacity-60' },
    new: { label: 'Pendiente', color: 'text-accent bg-accent/10 border-accent/20 animate-pulse' },
    contacted: { label: 'En Curso', color: 'text-white-custom bg-white/10 border-white/20' },
  };

  const config = configs[status] || configs.new;

  return (
    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${config.color}`}>
      {config.label}
    </span>
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
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
}
