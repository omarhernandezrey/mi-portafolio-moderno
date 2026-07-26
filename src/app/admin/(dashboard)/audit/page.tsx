'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ScrollText,
  Search,
  RefreshCw,
  User,
  Clock,
  Filter,
  Shield,
} from 'lucide-react';
import PageHeader from '@/components/admin/ui/PageHeader';
import EmptyState from '@/components/admin/ui/EmptyState';

interface AuditLog {
  id: string;
  actor_email: string;
  actor_role: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
  'lead.create': 'Lead creado',
  'lead.status_update': 'Estado de lead',
  'lead.industry_update': 'Industria de lead',
  'ticket.create': 'Ticket creado',
  'ticket.update': 'Ticket actualizado',
  'ticket.message': 'Mensaje en ticket',
  'invoice.generate': 'Factura generada',
  'timer.start': 'Timer iniciado',
  'timer.stop': 'Timer detenido',
  'subscriber.update': 'Suscriptor actualizado',
  'subscriber.delete': 'Suscriptor eliminado',
  'webhook.create': 'Webhook creado',
  'webhook.update': 'Webhook actualizado',
  'webhook.delete': 'Webhook eliminado',
  'webhook.test': 'Webhook testeado',
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Bogota',
  });
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '200' });
    if (actionFilter) params.set('action', actionFilter);
    if (search.trim()) params.set('actor', search.trim());

    fetch(`/api/admin/audit?${params}`)
      .then(async (r) => {
        if (!r.ok) throw new Error('Error al cargar auditoría');
        return r.json();
      })
      .then((data) => {
        setLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setLogs([]);
        setLoading(false);
      });
  }, [actionFilter, search]);

  useEffect(() => {
    load();
  }, [load]);

  const actions = useMemo(() => {
    const set = new Set(logs.map((l) => l.action));
    return Array.from(set).sort();
  }, [logs]);

  return (
    <div className="space-y-6 sm:space-y-10">
      <PageHeader
        overline="Seguridad"
        title="Auditoría"
        description="Registro de acciones administrativas (quién, qué, cuándo)."
        actions={
          <button
            type="button"
            onClick={load}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-text-muted hover:text-white-custom hover:bg-white/10 transition-all"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar por email del actor..."
            className="w-full pl-12 pr-4 py-3.5 bg-card-bg border border-white/5 rounded-2xl text-white-custom outline-none focus:border-primary/30 text-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full sm:w-56 appearance-none pl-11 pr-8 py-3.5 bg-card-bg border border-white/5 rounded-2xl text-xs font-bold text-text-muted outline-none focus:border-primary/30"
          >
            <option value="">Todas las acciones</option>
            {Object.entries(ACTION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
            {actions.filter((a) => !ACTION_LABELS[a]).map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-card-bg rounded-[24px] sm:rounded-[32px] border border-white/5 shadow-2xl overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center">
            <RefreshCw className="animate-spin text-primary" size={28} />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={<ScrollText size={36} />}
              title="Sin eventos"
              description="Aún no hay acciones registradas. Aplica la migración admin_audit_logs si es la primera vez."
            />
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 sm:p-6 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6"
              >
                <div className="flex items-center gap-3 sm:w-56 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Shield size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white-custom truncate flex items-center gap-1.5">
                      <User size={12} className="text-text-muted shrink-0" />
                      {log.actor_email}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest font-black text-primary/70">
                      {log.actor_role}
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white-custom">
                    {ACTION_LABELS[log.action] || log.action}
                  </div>
                  <div className="text-xs text-text-muted mt-1 font-mono">
                    {log.resource_type}
                    {log.resource_id ? ` · ${log.resource_id.slice(0, 8)}…` : ''}
                  </div>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <pre className="mt-2 text-[10px] text-text-muted/70 bg-background/40 rounded-lg p-2 overflow-x-auto max-w-full">
                      {JSON.stringify(log.metadata, null, 0)}
                    </pre>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-text-muted/50 shrink-0">
                  <Clock size={12} />
                  {formatWhen(log.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
