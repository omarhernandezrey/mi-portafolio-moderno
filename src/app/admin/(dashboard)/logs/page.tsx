'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity, Search, RefreshCw, X, Filter, AlertTriangle,
  CheckCircle, Clock, Zap, Hash, ChevronDown, ChevronUp
} from 'lucide-react';

interface ApiLog {
  id: string;
  created_at: string;
  provider: string;
  latency_ms: number | null;
  status: string | null;
  error_message: string | null;
  http_status: number | null;
  session_id: string | null;
}

const PROVIDER_COLORS: Record<string, string> = {
  groq: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  openrouter: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  cerebras: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  nvidia: 'bg-green-500/10 text-green-400 border-green-500/20',
  mistral: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  deepseek: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  openai: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  anthropic: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

function latencyColor(ms: number | null): string {
  if (!ms) return 'text-text-muted/40';
  if (ms < 500) return 'text-emerald-400';
  if (ms < 1500) return 'text-amber-400';
  return 'text-red-400';
}

function formatLatency(ms: number | null): string {
  if (!ms) return '—';
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms}ms`;
}

function isError(log: ApiLog): boolean {
  return !!(log.error_message || (log.http_status && log.http_status >= 400) || log.status === 'error');
}

function StatBox({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-card-bg rounded-[20px] border border-white/5 p-5 shadow-xl">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-[10px] uppercase tracking-widest font-black text-text-muted/60">{label}</span>
      </div>
      <div className="text-2xl font-black text-white-custom">{value}</div>
      {sub && <div className="text-xs text-text-muted/40 mt-1">{sub}</div>}
    </div>
  );
}

export default function ApiLogsPage() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ok' | 'error'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const load = () => {
    setLoading(true);
    fetch('/api/admin/logs?limit=500')
      .then(r => r.json())
      .then(data => { setLogs(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const providers = useMemo(() => [...new Set(logs.map(l => l.provider))].sort(), [logs]);

  const filtered = useMemo(() => {
    return logs.filter(l => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        l.provider.toLowerCase().includes(q) ||
        l.session_id?.toLowerCase().includes(q) ||
        l.error_message?.toLowerCase().includes(q);
      const matchProvider = !providerFilter || l.provider === providerFilter;
      const matchStatus =
        statusFilter === 'all' ? true :
        statusFilter === 'error' ? isError(l) :
        !isError(l);
      return matchSearch && matchProvider && matchStatus;
    });
  }, [logs, search, providerFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = logs.length;
    const errors = logs.filter(isError).length;
    const latencies = logs.filter(l => l.latency_ms).map(l => l.latency_ms!);
    const avgLatency = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;
    const errorRate = total ? ((errors / total) * 100).toFixed(1) : '0';

    const byProvider: Record<string, { total: number; errors: number; avgLatency: number }> = {};
    logs.forEach(l => {
      if (!byProvider[l.provider]) byProvider[l.provider] = { total: 0, errors: 0, avgLatency: 0 };
      byProvider[l.provider].total++;
      if (isError(l)) byProvider[l.provider].errors++;
    });
    Object.entries(byProvider).forEach(([p]) => {
      const pLogs = logs.filter(l => l.provider === p && l.latency_ms);
      byProvider[p].avgLatency = pLogs.length
        ? Math.round(pLogs.reduce((a, l) => a + l.latency_ms!, 0) / pLogs.length)
        : 0;
    });

    return { total, errors, avgLatency, errorRate, byProvider };
  }, [logs]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/60 mb-2">Observabilidad</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white-custom tracking-tight">Logs de API</h1>
          <p className="text-text-muted text-sm font-medium mt-2">
            Monitoreo de llamadas a proveedores de IA y latencia en tiempo real
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-text-muted hover:text-white-custom transition-all self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatBox
          icon={<Activity size={14} className="text-primary" />}
          label="Total Llamadas"
          value={stats.total}
          sub="Últimas 500"
        />
        <StatBox
          icon={<AlertTriangle size={14} className="text-red-400" />}
          label="Tasa de Error"
          value={`${stats.errorRate}%`}
          sub={`${stats.errors} errores`}
        />
        <StatBox
          icon={<Clock size={14} className="text-amber-400" />}
          label="Latencia Media"
          value={formatLatency(stats.avgLatency)}
          sub="Promedio global"
        />
        <StatBox
          icon={<Zap size={14} className="text-accent" />}
          label="Proveedores"
          value={providers.length}
          sub="Activos"
        />
      </div>

      {/* Provider breakdown */}
      {Object.keys(stats.byProvider).length > 0 && (
        <div className="bg-card-bg rounded-[24px] border border-white/5 p-6 shadow-xl">
          <h2 className="text-sm font-bold text-white-custom mb-5 flex items-center gap-2">
            <Zap size={14} className="text-primary" />
            Uso por Proveedor
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(stats.byProvider).sort((a, b) => b[1].total - a[1].total).map(([provider, data]) => {
              const color = PROVIDER_COLORS[provider.toLowerCase()] || 'bg-white/5 text-text-muted border-white/10';
              const errorRate = ((data.errors / data.total) * 100).toFixed(0);
              return (
                <div
                  key={provider}
                  className={`rounded-xl border px-4 py-3 cursor-pointer transition-all hover:scale-[1.02] ${color}`}
                  onClick={() => setProviderFilter(providerFilter === provider ? '' : provider)}
                >
                  <div className="font-black text-sm uppercase tracking-wider">{provider}</div>
                  <div className="text-lg font-black mt-1">{data.total}</div>
                  <div className="text-[10px] opacity-60 font-medium">
                    {errorRate}% err · {formatLatency(data.avgLatency)} avg
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={16} />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por proveedor, session ID o error..."
            className="w-full pl-11 pr-10 py-3 sm:py-4 bg-card-bg border border-white/5 rounded-[16px] sm:rounded-[20px] text-white-custom outline-none focus:border-primary/30 transition-all shadow-xl text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white-custom">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={providerFilter}
            onChange={e => { setProviderFilter(e.target.value); setPage(1); }}
            className="bg-card-bg border border-white/5 rounded-[16px] px-4 py-3 sm:py-4 text-xs font-bold text-text-muted outline-none focus:border-primary/30 transition-all shadow-xl appearance-none min-w-[130px]"
          >
            <option value="">Todos los proveedores</option>
            {providers.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          {(['all', 'ok', 'error'] as const).map(f => (
            <button
              key={f}
              onClick={() => { setStatusFilter(f); setPage(1); }}
              className={`px-4 py-3 sm:py-4 rounded-[16px] text-xs font-black uppercase tracking-wider transition-all border ${
                statusFilter === f
                  ? f === 'error'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : f === 'ok'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-card-bg border-white/5 text-text-muted hover:text-white-custom'
              }`}
            >
              {f === 'all' ? 'Todo' : f === 'ok' ? '✓ OK' : '⚠ Errores'}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <Hash size={12} className="text-primary" />
        <span className="font-bold">{filtered.length}</span>
        <span className="opacity-50">logs mostrados</span>
        {(search || providerFilter || statusFilter !== 'all') && (
          <button
            onClick={() => { setSearch(''); setProviderFilter(''); setStatusFilter('all'); }}
            className="ml-2 flex items-center gap-1 text-primary/60 hover:text-primary transition-colors"
          >
            <X size={11} />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Logs Table */}
      <div className="bg-card-bg rounded-[28px] border border-white/5 shadow-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center gap-3 text-text-muted">
            <RefreshCw size={18} className="animate-spin text-primary" />
            <span className="text-sm font-medium">Cargando logs...</span>
          </div>
        ) : paginated.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center gap-4 text-center">
            <Activity size={48} strokeWidth={1} className="text-text-muted/20" />
            <div>
              <p className="font-bold text-white-custom text-sm">Sin logs</p>
              <p className="text-text-muted text-xs mt-1">
                {search || providerFilter || statusFilter !== 'all' ? 'Prueba con otros filtros.' : 'No hay logs de API registrados todavía.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0 min-w-[600px]">
              <thead>
                <tr className="bg-background/40">
                  <th className="px-5 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Estado</th>
                  <th className="px-5 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Proveedor</th>
                  <th className="px-5 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">HTTP</th>
                  <th className="px-5 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Latencia</th>
                  <th className="px-5 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Timestamp</th>
                  <th className="px-5 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Session</th>
                  <th className="px-5 py-4 border-b border-white/5 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(log => {
                  const error = isError(log);
                  const pColor = PROVIDER_COLORS[log.provider?.toLowerCase()] || 'bg-white/5 text-text-muted border-white/10';
                  const isOpen = expanded === log.id;

                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        className={`group transition-colors cursor-pointer ${
                          error ? 'hover:bg-red-500/[0.03]' : 'hover:bg-white/[0.02]'
                        } ${isOpen ? 'bg-white/[0.02]' : ''}`}
                        onClick={() => setExpanded(isOpen ? null : log.id)}
                      >
                        <td className="px-5 py-4 border-b border-white/5">
                          {error ? (
                            <div className="flex items-center gap-1.5">
                              <AlertTriangle size={13} className="text-red-400" />
                              <span className="text-[10px] font-black text-red-400 uppercase">Error</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <CheckCircle size={13} className="text-emerald-400" />
                              <span className="text-[10px] font-black text-emerald-400 uppercase">OK</span>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 border-b border-white/5">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase border ${pColor}`}>
                            {log.provider}
                          </span>
                        </td>
                        <td className="px-5 py-4 border-b border-white/5">
                          {log.http_status ? (
                            <span className={`text-sm font-black ${
                              log.http_status >= 400 ? 'text-red-400' :
                              log.http_status >= 300 ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                              {log.http_status}
                            </span>
                          ) : (
                            <span className="text-text-muted/30 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 border-b border-white/5">
                          <span className={`text-sm font-bold font-mono ${latencyColor(log.latency_ms)}`}>
                            {formatLatency(log.latency_ms)}
                          </span>
                        </td>
                        <td className="px-5 py-4 border-b border-white/5">
                          <div className="text-xs font-medium text-text-muted">
                            {new Date(log.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                          </div>
                          <div className="text-[10px] text-text-muted/40">
                            {new Date(log.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-5 py-4 border-b border-white/5">
                          {log.session_id ? (
                            <span className="font-mono text-[10px] text-text-muted/50 truncate max-w-[80px] block">
                              {log.session_id.slice(0, 8)}…
                            </span>
                          ) : (
                            <span className="text-text-muted/20 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 border-b border-white/5">
                          {isOpen ? (
                            <ChevronUp size={14} className="text-primary" />
                          ) : (
                            <ChevronDown size={14} className="text-text-muted/30 group-hover:text-text-muted" />
                          )}
                        </td>
                      </tr>
                      {isOpen && log.error_message && (
                        <tr>
                          <td colSpan={7} className="px-5 pb-4 border-b border-white/5 bg-red-500/[0.03]">
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                              <div className="text-[10px] uppercase tracking-widest font-black text-red-400/60 mb-1">Error</div>
                              <p className="text-xs font-mono text-red-300 leading-relaxed break-all">
                                {log.error_message}
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted hover:text-white-custom hover:bg-white/10 transition-all"
          >
            Mostrar {Math.min(PAGE_SIZE, filtered.length - paginated.length)} más
          </button>
        </div>
      )}
    </div>
  );
}
