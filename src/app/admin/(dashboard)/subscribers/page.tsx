'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Mail, Search, Trash2, CheckCircle, XCircle, Clock,
  Users, X, RefreshCw, Download, Hash, MoreVertical,
  Send, UserMinus, Filter, AlertCircle
} from 'lucide-react';
import { adminFetch } from '@/lib/admin/client-fetch';
import PageHeader from '@/components/admin/ui/PageHeader';
import StatCard from '@/components/admin/ui/StatCard';
import { AdminButton } from '@/components/admin/ui/AdminButton';

interface Subscriber {
  id: string;
  email: string;
  source: string;
  consent_at: string;
  followup_sent_at: string | null;
  created_at: string;
  confirmed: boolean;
  confirmation_token: string | null;
  unsubscribed_at: string | null;
}

const SOURCE_LABELS: Record<string, string> = {
  'checklist-pdf': 'Checklist PDF',
  'guia-precios-pdf': 'Guía de Precios',
  'newsletter': 'Newsletter',
  'lead-magnet': 'Lead Magnet',
};

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'unsubscribed'>('all');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminFetch<Subscriber[]>('/api/admin/subscribers');
      setSubscribers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar la lista de suscriptores.'
      );
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return subscribers.filter(s => {
      const q = search.toLowerCase();
      const matchSearch = !q || s.email.toLowerCase().includes(q) || s.source.toLowerCase().includes(q);
      const matchFilter =
        filter === 'all' ? true :
        filter === 'confirmed' ? s.confirmed && !s.unsubscribed_at :
        filter === 'pending' ? !s.confirmed && !s.unsubscribed_at :
        filter === 'unsubscribed' ? !!s.unsubscribed_at : true;
      return matchSearch && matchFilter;
    });
  }, [subscribers, search, filter]);

  const stats = useMemo(() => ({
    total: subscribers.length,
    confirmed: subscribers.filter(s => s.confirmed && !s.unsubscribed_at).length,
    pending: subscribers.filter(s => !s.confirmed && !s.unsubscribed_at).length,
    unsubscribed: subscribers.filter(s => !!s.unsubscribed_at).length,
  }), [subscribers]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este suscriptor definitivamente?')) return;
    setDeleting(id);
    setError('');
    try {
      await adminFetch(`/api/admin/subscribers/${id}`, { method: 'DELETE' });
      setSubscribers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo eliminar el suscriptor.'
      );
    } finally {
      setDeleting(null);
      setOpenMenu(null);
    }
  };

  const handleMarkConfirmed = async (id: string, confirmed: boolean) => {
    setError('');
    try {
      await adminFetch(`/api/admin/subscribers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ confirmed }),
      });
      setSubscribers(prev =>
        prev.map(s => (s.id === id ? { ...s, confirmed } : s))
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar el suscriptor.'
      );
    } finally {
      setOpenMenu(null);
    }
  };

  const exportCSV = () => {
    const rows = [
      ['Email', 'Fuente', 'Confirmado', 'Fecha Registro', 'Dado de baja'],
      ...filtered.map(s => [
        s.email,
        s.source,
        s.confirmed ? 'Sí' : 'No',
        new Date(s.created_at).toLocaleDateString('es-CO'),
        s.unsubscribed_at ? new Date(s.unsubscribed_at).toLocaleDateString('es-CO') : 'No',
      ]),
    ];
    const csv = rows
      .map(row =>
        row
          .map(value => `"${String(value).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');
    const blob = new Blob([`\uFEFF${csv}`], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suscriptores_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        overline="Newsletter"
        title="Suscriptores"
        description="Gestión de la lista de email marketing y lead magnets."
        actions={
          <>
            <AdminButton
              onClick={exportCSV}
              size="sm"
              icon={<Download size={14} />}
            >
              Exportar CSV
            </AdminButton>
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
          </>
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
        aria-label="Resumen de suscriptores"
        className="grid grid-cols-2 gap-3 xl:grid-cols-4"
      >
        <StatCard
          title="Total"
          value={stats.total.toString()}
          icon={<Users size={19} />}
          color="primary"
          description="Registros en la lista"
        />
        <StatCard
          title="Confirmados"
          value={stats.confirmed.toString()}
          icon={<CheckCircle size={19} />}
          color="success"
          description="Con consentimiento activo"
        />
        <StatCard
          title="Pendientes"
          value={stats.pending.toString()}
          icon={<Clock size={19} />}
          color="warning"
          description="Sin confirmar todavía"
        />
        <StatCard
          title="Bajas"
          value={stats.unsubscribed.toString()}
          icon={<UserMinus size={19} />}
          color="danger"
          description="Suscriptores dados de baja"
        />
      </section>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={16} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por email o fuente..."
            className="w-full pl-11 pr-10 py-3 sm:py-4 bg-card-bg border border-admin-line rounded-xl text-admin-ink outline-none focus:border-primary/30 transition-all shadow-xl text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-admin-ink transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          {(['all', 'confirmed', 'pending', 'unsubscribed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`w-full rounded-xl border px-4 py-3 text-xs font-black uppercase tracking-wider transition-all sm:w-auto sm:py-4 ${
                filter === f
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-card-bg border-admin-line text-text-muted hover:text-admin-ink'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'confirmed' ? 'Confirmados' : f === 'pending' ? 'Pendientes' : 'Bajas'}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <Hash size={12} className="text-primary" />
        <span className="font-bold">{filtered.length}</span>
        <span className="opacity-50">suscriptores mostrados</span>
      </div>

      {/* Table */}
      <div className="bg-card-bg rounded-2xl border border-admin-line shadow-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center gap-3 text-text-muted">
            <RefreshCw size={18} className="animate-spin text-primary" />
            <span className="text-sm font-medium">Cargando suscriptores...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center gap-4 text-center">
            <Mail size={48} strokeWidth={1} className="text-text-muted/20" />
            <div>
              <p className="font-bold text-admin-ink text-sm">Sin resultados</p>
              <p className="text-text-muted text-xs mt-1">
                {search || filter !== 'all' ? 'Prueba con otros filtros.' : 'Aún no hay suscriptores registrados.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="block sm:hidden divide-y divide-admin-line">
              {filtered.map(s => (
                <div key={s.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-admin-ink text-sm truncate">{s.email}</div>
                      <div className="text-[10px] text-text-muted/60 font-medium">{SOURCE_LABELS[s.source] || s.source}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {s.unsubscribed_at ? (
                        <span className="px-2 py-0.5 rounded-md bg-admin-danger/10 text-admin-danger text-[9px] font-black uppercase">Baja</span>
                      ) : s.confirmed ? (
                        <span className="px-2 py-0.5 rounded-md bg-admin-success/10 text-admin-success text-[9px] font-black uppercase">Confirmado</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[9px] font-black uppercase">Pendiente</span>
                      )}
                      <button
                        onClick={() => handleDelete(s.id)}
                        disabled={deleting === s.id}
                        aria-label={`Eliminar ${s.email}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-admin-line bg-white/[0.03] p-0 text-admin-danger/60 transition-colors hover:bg-admin-danger/10 hover:text-admin-danger disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="text-[10px] text-text-muted/40 font-medium">
                    Registrado: {new Date(s.created_at).toLocaleDateString('es-CO')}
                    {s.followup_sent_at && (
                      <span className="ml-3 text-primary/60">Follow-up enviado</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr className="bg-background/40">
                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-admin-line">Email</th>
                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-admin-line">Fuente</th>
                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-admin-line text-center">Estado</th>
                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-admin-line">Registro</th>
                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-admin-line text-center">Follow-up</th>
                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-admin-line text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-admin-line">
                  {filtered.map(s => (
                    <tr key={s.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/10 flex items-center justify-center">
                            <Mail size={14} className="text-primary/60" />
                          </div>
                          <div>
                            <div className="font-bold text-admin-ink text-sm group-hover:text-primary transition-colors">{s.email}</div>
                            {s.unsubscribed_at && (
                              <div className="text-[9px] text-admin-danger/70 font-medium">
                                Baja: {new Date(s.unsubscribed_at).toLocaleDateString('es-CO')}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-admin-line text-[10px] font-bold text-text-muted uppercase tracking-wider">
                          {SOURCE_LABELS[s.source] || s.source}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {s.unsubscribed_at ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <XCircle size={14} className="text-admin-danger" />
                            <span className="text-[10px] font-black text-admin-danger uppercase">Baja</span>
                          </div>
                        ) : s.confirmed ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <CheckCircle size={14} className="text-admin-success" />
                            <span className="text-[10px] font-black text-admin-success uppercase">Confirmado</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <Clock size={14} className="text-amber-400" />
                            <span className="text-[10px] font-black text-amber-400 uppercase">Pendiente</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-medium text-text-muted">
                          {new Date(s.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-[10px] text-text-muted/40">
                          {new Date(s.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {s.followup_sent_at ? (
                          <div className="flex items-center justify-center gap-1.5 text-primary/70">
                            <Send size={13} />
                            <span className="text-[10px] font-bold">Enviado</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-text-muted/30 italic">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 relative">
                          {!s.confirmed && !s.unsubscribed_at && (
                            <button
                              onClick={() => handleMarkConfirmed(s.id, true)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-admin-success/10 border border-admin-success/20 text-[10px] font-bold text-admin-success hover:bg-admin-success/20 transition-all"
                              title="Marcar como confirmado"
                            >
                              <CheckCircle size={12} />
                              Confirmar
                            </button>
                          )}
                          <button
                            onClick={() => setOpenMenu(openMenu === s.id ? null : s.id)}
                            aria-label={`Más acciones para ${s.email}`}
                            aria-expanded={openMenu === s.id}
                            className="flex h-9 w-9 items-center justify-center rounded-lg p-0 text-text-muted/50 transition-colors hover:bg-white/[0.04] hover:text-admin-ink"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {openMenu === s.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-card-bg border border-admin-line rounded-xl shadow-2xl z-10 overflow-hidden">
                              {s.confirmed ? (
                                <button
                                  onClick={() => handleMarkConfirmed(s.id, false)}
                                  className="flex items-center gap-2 w-full px-4 py-3 text-xs font-bold text-text-muted hover:bg-white/[0.04] hover:text-admin-ink transition-all text-left"
                                >
                                  <XCircle size={13} />
                                  Marcar pendiente
                                </button>
                              ) : null}
                              <button
                                onClick={() => handleDelete(s.id)}
                                disabled={deleting === s.id}
                                className="flex items-center gap-2 w-full px-4 py-3 text-xs font-bold text-admin-danger hover:bg-admin-danger/10 transition-all text-left disabled:opacity-50"
                              >
                                <Trash2 size={13} />
                                Eliminar suscriptor
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-text-muted/40 font-black uppercase tracking-widest">
            {filtered.length} de {subscribers.length} registros
          </p>
          <div className="flex items-center gap-2 text-[10px] text-text-muted/40 font-medium">
            <Filter size={10} />
            {filter !== 'all' && <span>Filtro activo: {filter}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
