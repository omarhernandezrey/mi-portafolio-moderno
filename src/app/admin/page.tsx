import React from 'react';
import { supabaseServer } from '@/lib/supabaseServer';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

// Evitar cacheo para ver datos frescos
export const dynamic = 'force-dynamic';

async function getStats() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // 1. Total leads este mes
  const { count: totalLeads } = await supabaseServer
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', firstDayOfMonth);

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

  // 4. Últimos 5 leads
  const { data: recentLeads } = await supabaseServer
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    monthLeads: totalLeads || 0,
    monthPaid: paidLeads || 0,
    monthConvs: totalConvs || 0,
    conversionRate: totalConvs ? ((totalLeads || 0) / totalConvs * 100).toFixed(1) : 0,
    recentLeads: recentLeads || []
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--white-color)]">
      {/* Sidebar / Nav */}
      <nav className="border-b border-[var(--primary-color)]/10 bg-[var(--card-bg-color)]/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-[var(--primary-color)]" size={24} />
              <span className="font-bold text-xl tracking-tight">Omar Admin</span>
            </div>
            <div className="flex gap-4">
              <Link href="/admin/leads" className="text-sm font-medium hover:text-[var(--primary-color)] transition-colors">Leads</Link>
              <Link href="/admin/conversations" className="text-sm font-medium hover:text-[var(--primary-color)] transition-colors">Conversaciones</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-[var(--muted-color)] mt-2">Resumen de actividad del chatbot</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard 
            title="Leads (Mes)" 
            value={stats.monthLeads.toString()} 
            icon={<Users size={20} />} 
            trend="+12%" 
            color="text-blue-400"
          />
          <StatCard 
            title="Conversaciones" 
            value={stats.monthConvs.toString()} 
            icon={<MessageSquare size={20} />} 
            trend="+5%" 
            color="text-purple-400"
          />
          <StatCard 
            title="Tasa Conversión" 
            value={`${stats.conversionRate}%`} 
            icon={<TrendingUp size={20} />} 
            trend="Ideal: >10%" 
            color="text-emerald-400"
          />
          <StatCard 
            title="Pagos Confirmados" 
            value={stats.monthPaid.toString()} 
            icon={<DollarSign size={20} />} 
            trend="Goal: 5" 
            color="text-amber-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Leads Table */}
          <div className="lg:col-span-2 bg-[var(--card-bg-color)] rounded-2xl border border-[var(--primary-color)]/10 overflow-hidden">
            <div className="p-6 border-b border-[var(--primary-color)]/10 flex justify-between items-center">
              <h2 className="text-xl font-bold">Últimos Leads</h2>
              <Link href="/admin/leads" className="text-sm text-[var(--primary-color)] hover:underline flex items-center gap-1">
                Ver todos <ChevronRight size={16} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs uppercase text-[var(--muted-color)] bg-[var(--background-color)]/50">
                  <tr>
                    <th className="px-6 py-3">Nombre</th>
                    <th className="px-6 py-3">Servicio</th>
                    <th className="px-6 py-3">Estado</th>
                    <th className="px-6 py-3">Fecha</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--primary-color)]/5">
                  {stats.recentLeads.length > 0 ? stats.recentLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-[var(--primary-color)]/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium">{lead.name || 'Sin nombre'}</div>
                        <div className="text-xs text-[var(--muted-color)]">{lead.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">{lead.service_requested || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          lead.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                          lead.status === 'cold' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--muted-color)]">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/leads/${lead.id}`} className="text-[var(--primary-color)]">
                          <ChevronRight size={20} />
                        </Link>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-[var(--muted-color)]">
                        No hay leads registrados aún.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Info / Tips */}
          <div className="space-y-6">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-amber-400 mb-4">
                <AlertTriangle size={20} />
                <h3 className="font-bold">Recordatorio diario</h3>
              </div>
              <ul className="text-sm space-y-3 text-amber-100/80">
                <li>• Revisa Telegram por mensajes bloqueados.</li>
                <li>• Responde a los leads en menos de 30 min.</li>
                <li>• Ajusta el prompt si el bot falla mucho.</li>
              </ul>
            </div>

            <div className="bg-[var(--card-bg-color)] border border-[var(--primary-color)]/10 rounded-2xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Clock size={18} className="text-[var(--primary-color)]" />
                Estado del Sistema
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--muted-color)]">Groq API</span>
                  <span className="text-emerald-400 font-medium">Online</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--muted-color)]">Supabase DB</span>
                  <span className="text-emerald-400 font-medium">Online</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--muted-color)]">Telegram Bot</span>
                  <span className="text-emerald-400 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color: string;
}

function StatCard({ title, value, icon, trend, color }: StatCardProps) {
  return (
    <div className="bg-[var(--card-bg-color)] p-6 rounded-2xl border border-[var(--primary-color)]/10 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg bg-[var(--background-color)] ${color}`}>
          {icon}
        </div>
        <span className="text-[10px] font-bold text-[var(--muted-color)] uppercase tracking-wider">
          {trend}
        </span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-[var(--muted-color)] mt-1">{title}</div>
    </div>
  );
}
