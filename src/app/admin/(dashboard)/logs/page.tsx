'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity, Search, RefreshCw, X, AlertTriangle,
  CheckCircle, Clock, Zap, Hash, ChevronDown, ChevronUp,
  AlertCircle,
} from 'lucide-react';
import PageHeader from '@/components/admin/ui/PageHeader';
import StatCard from '@/components/admin/ui/StatCard';
import EmptyState from '@/components/admin/ui/EmptyState';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { adminFetch } from '@/lib/admin/client-fetch';

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
  cerebras: 'bg-admin-info/10 text-admin-info border-admin-info/20',
  nvidia: 'bg-green-500/10 text-green-400 border-green-500/20',
  mistral: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  deepseek: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  openai: 'bg-admin-success/10 text-admin-success border-admin-success/20',
  anthropic: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

function latencyColor(ms: number | null): string {
  if (!ms) return 'text-text-muted/40';
  if (ms < 500) return 'text-admin-success';
  if (ms < 1500) return 'text-amber-400';
  return 'text-admin-danger';
}

function formatLatency(ms: number | null): string {
  if (!ms) return '—';
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms}ms`;
}

function isError(log: ApiLog): boolean {
  return !!(log.error_message || (log.http_status && log.http_status >= 400) || log.status === 'error');
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

  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await adminFetch<ApiLog[]>('/api/admin/logs?limit=500');
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudieron cargar los logs.'
      );
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        overline="Observabilidad"
        title="Logs de API"
        description="Monitoreo de llamadas a proveedores de IA y latencia en tiempo real."
        actions={
          <AdminButton
            onClick={load}
            disabled={loading}
            size="sm"
            icon={
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            }
          >
            Actualizar
          </AdminButton>
        }
      />

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-admin-danger/20 bg-admin-danger/10 p-3.5 text-xs font-medium text-admin-danger"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <section
        aria-label="Resumen de logs"
        className="grid grid-cols-2 gap-3 xl:grid-cols-4"
      >
        <StatCard
          title="Total llamadas"
          value={stats.total.toString()}
          icon={<Activity size={19} />}
          color="primary"
          description="Últimas 500 llamadas"
        />
        <StatCard
          title="Tasa de error"
          value={`${stats.errorRate}%`}
          icon={<AlertTriangle size={19} />}
          color="danger"
          description={`${stats.errors} errores`}
        />
        <StatCard
          title="Latencia media"
          value={formatLatency(stats.avgLatency)}
          icon={<Clock size={19} />}
          color="warning"
          description="Promedio global"
        />
        <StatCard
          title="Proveedores"
          value={providers.length.toString()}
          icon={<Zap size={19} />}
          color="info"
          description="Activos"
        />
      </section>

      {/* Provider breakdown */}
      {Object.keys(stats.byProvider).length > 0 && (
        <div className="rounded-2xl border border-admin-line bg-card-bg p-5 shadow-[0_18px_45px_-32px_rgba(0,0,0,0.95)]">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-admin-ink">
            <Zap size={14} className="text-primary" />
            Uso por proveedor
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Object.entries(stats.byProvider).sort((a, b) => b[1].total - a[1].total).map(([provider, data]) => {
              const color = PROVIDER_COLORS[provider.toLowerCase()] || 'bg-white/[0.03] text-text-muted border-admin-line';
              const errorRate = ((data.errors / data.total) * 100).toFixed(0);
              return (
                <button
                  key={provider}
                  type="button"
                  aria-pressed={providerFilter === provider}
                  className={`rounded-xl border px-4 py-3 text-left transition-colors hover:border-primary/30 ${color}`}
                  onClick={() => setProviderFilter(providerFilter === provider ? '' : provider)}
                >
                  <div className="font-mono-label text-[9px] uppercase">{provider}</div>
                  <div className="mt-1 text-lg font-black">{data.total}</div>
                  <div className="text-[10px] font-medium opacity-60">
                    {errorRate}% err · {formatLatency(data.avgLatency)} avg
                  </div>
                </button>
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
            className="w-full pl-11 pr-10 py-3 sm:py-4 bg-card-bg border border-admin-line rounded-xl sm:rounded-[20px] text-admin-ink outline-none focus:border-primary/30 transition-all shadow-xl text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-admin-ink">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={providerFilter}
            onChange={e => { setProviderFilter(e.target.value); setPage(1); }}
            className="w-full rounded-xl border border-admin-line bg-card-bg px-4 py-3 text-xs font-bold text-text-muted outline-none transition-all focus:border-primary/30 sm:w-auto sm:py-4"
          >
            <option value="">Todos los proveedores</option>
            {providers.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <div className="grid grid-cols-3 gap-2 sm:flex">
            {(['all', 'ok', 'error'] as const).map(f => (
              <button
                key={f}
                onClick={() => { setStatusFilter(f); setPage(1); }}
                className={`rounded-xl border px-2 py-3 text-[10px] font-black uppercase tracking-wider transition-all sm:px-4 sm:py-4 sm:text-xs ${
                  statusFilter === f
                    ? f === 'error'
                      ? 'bg-admin-danger/10 border-admin-danger/30 text-admin-danger'
                      : f === 'ok'
                      ? 'bg-admin-success/10 border-admin-success/30 text-admin-success'
                      : 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-card-bg border-admin-line text-text-muted hover:text-admin-ink'
                }`}
              >
                {f === 'all' ? 'Todo' : f === 'ok' ? '✓ OK' : '⚠ Errores'}
              </button>
            ))}
          </div>
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
      <div className="bg-card-bg rounded-2xl border border-admin-line shadow-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center gap-3 text-text-muted">
            <RefreshCw size={18} className="animate-spin text-primary" />
            <span className="text-sm font-medium">Cargando logs...</span>
          </div>
        ) : paginated.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<Activity size={24} />}
              title="Sin logs"
              description={
                search || providerFilter || statusFilter !== 'all'
                  ? 'Prueba con otros filtros.'
                  : 'No hay logs de API registrados todavía.'
              }
            />
          </div>
        ) : (
          <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left border-separate border-spacing-0 min-w-[600px]">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="px-5 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-admin-line">Estado</th>
                  <th className="px-5 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-admin-line">Proveedor</th>
                  <th className="px-5 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-admin-line">HTTP</th>
                  <th className="px-5 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-admin-line">Latencia</th>
                  <th className="px-5 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-admin-line">Timestamp</th>
                  <th className="px-5 py-4 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-admin-line">Session</th>
                  <th className="px-5 py-4 border-b border-admin-line w-8"></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(log => {
                  const error = isError(log);
                  const pColor = PROVIDER_COLORS[log.provider?.toLowerCase()] || 'bg-white/[0.04] text-text-muted border-admin-line';
                  const isOpen = expanded === log.id;

                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        tabIndex={0}
                        role="button"
                        aria-expanded={isOpen}
                        className={`group cursor-pointer transition-colors focus-visible:bg-white/[0.03] focus-visible:outline-none ${
                          error ? 'hover:bg-admin-danger/[0.03]' : 'hover:bg-white/[0.02]'
                        } ${isOpen ? 'bg-white/[0.02]' : ''}`}
                        onClick={() => setExpanded(isOpen ? null : log.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setExpanded(isOpen ? null : log.id);
                          }
                        }}
                      >
                        <td className="px-5 py-4 border-b border-admin-line">
                          {error ? (
                            <div className="flex items-center gap-1.5">
                              <AlertTriangle size={13} className="text-admin-danger" />
                              <span className="text-[10px] font-black text-admin-danger uppercase">Error</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <CheckCircle size={13} className="text-admin-success" />
                              <span className="text-[10px] font-black text-admin-success uppercase">OK</span>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 border-b border-admin-line">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase border ${pColor}`}>
                            {log.provider}
                          </span>
                        </td>
                        <td className="px-5 py-4 border-b border-admin-line">
                          {log.http_status ? (
                            <span className={`text-sm font-black ${
                              log.http_status >= 400 ? 'text-admin-danger' :
                              log.http_status >= 300 ? 'text-amber-400' : 'text-admin-success'
                            }`}>
                              {log.http_status}
                            </span>
                          ) : (
                            <span className="text-text-muted/30 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 border-b border-admin-line">
                          <span className={`text-sm font-bold font-mono ${latencyColor(log.latency_ms)}`}>
                            {formatLatency(log.latency_ms)}
                          </span>
                        </td>
                        <td className="px-5 py-4 border-b border-admin-line">
                          <div className="text-xs font-medium text-text-muted">
                            {new Date(log.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                          </div>
                          <div className="text-[10px] text-text-muted/40">
                            {new Date(log.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                        </td>
                        <td className="px-5 py-4 border-b border-admin-line">
                          {log.session_id ? (
                            <span className="font-mono text-[10px] text-text-muted/50 truncate max-w-[80px] block">
                              {log.session_id.slice(0, 8)}…
                            </span>
                          ) : (
                            <span className="text-text-muted/20 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 border-b border-admin-line">
                          {isOpen ? (
                            <ChevronUp size={14} className="text-primary" />
                          ) : (
                            <ChevronDown size={14} className="text-text-muted/30 group-hover:text-text-muted" />
                          )}
                        </td>
                      </tr>
                      {isOpen && log.error_message && (
                        <tr>
                          <td colSpan={7} className="px-5 pb-4 border-b border-admin-line bg-admin-danger/[0.03]">
                            <div className="p-4 rounded-xl bg-admin-danger/10 border border-admin-danger/20">
                              <div className="text-[10px] uppercase tracking-widest font-black text-admin-danger/60 mb-1">Error</div>
                              <p className="text-xs font-mono text-admin-danger leading-relaxed break-all">
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

          <div className="divide-y divide-admin-line md:hidden">
            {paginated.map((log) => {
              const error = isError(log);
              const pColor =
                PROVIDER_COLORS[log.provider?.toLowerCase()] ||
                'bg-white/[0.04] text-text-muted border-admin-line';
              const isOpen = expanded === log.id;
              const timestamp = new Date(log.created_at);

              return (
                <div key={log.id}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setExpanded(isOpen ? null : log.id)}
                    className="flex w-full items-start justify-between gap-3 p-4 text-left transition-colors hover:bg-white/[0.02]"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase ${
                            error ? 'text-admin-danger' : 'text-admin-success'
                          }`}
                        >
                          {error ? <AlertTriangle size={13} /> : <CheckCircle size={13} />}
                          {error ? 'Error' : 'OK'}
                        </span>
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-black uppercase ${pColor}`}>
                          {log.provider}
                        </span>
                        {log.http_status && (
                          <span
                            className={`font-mono text-xs font-black ${
                              log.http_status >= 400
                                ? 'text-admin-danger'
                                : log.http_status >= 300
                                  ? 'text-amber-400'
                                  : 'text-admin-success'
                            }`}
                          >
                            HTTP {log.http_status}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-text-muted">
                        <span className={latencyColor(log.latency_ms)}>
                          {formatLatency(log.latency_ms)}
                        </span>
                        <span>
                          {timestamp.toLocaleDateString('es-CO', {
                            day: '2-digit',
                            month: 'short',
                          })}{' '}
                          {timestamp.toLocaleTimeString('es-CO', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {log.session_id && (
                          <span className="font-mono text-[10px] text-text-muted/40">
                            {log.session_id.slice(0, 8)}…
                          </span>
                        )}
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp size={15} className="mt-0.5 shrink-0 text-primary" />
                    ) : (
                      <ChevronDown size={15} className="mt-0.5 shrink-0 text-text-muted/30" />
                    )}
                  </button>
                  {isOpen && log.error_message && (
                    <div className="px-4 pb-4">
                      <div className="rounded-xl border border-admin-danger/20 bg-admin-danger/10 p-3.5">
                        <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-admin-danger/60">
                          Error
                        </div>
                        <p className="break-all font-mono text-xs leading-relaxed text-admin-danger">
                          {log.error_message}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          </>
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-8 py-3 rounded-2xl bg-white/[0.04] border border-admin-line text-[10px] font-black uppercase tracking-[0.3em] text-text-muted hover:text-admin-ink hover:bg-white/[0.07] transition-all"
          >
            Mostrar {Math.min(PAGE_SIZE, filtered.length - paginated.length)} más
          </button>
        </div>
      )}
    </div>
  );
}
