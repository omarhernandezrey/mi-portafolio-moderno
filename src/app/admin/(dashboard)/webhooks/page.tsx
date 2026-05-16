'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus, Trash2, CheckCircle, XCircle, Activity,
  Shield, Link as LinkIcon, Zap, RefreshCw, ToggleLeft, ToggleRight,
  AlertTriangle, Clock
} from 'lucide-react';

interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface WebhookLog {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  response_status: number | null;
  response_body: string | null;
  error: string | null;
  attempt: number;
  created_at: string;
  webhook?: { url: string } | null;
}

export default function AdminWebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; status?: number | null; error?: string | null }>>({});

  const load = async () => {
    setLoading(true);
    const [wRes, lRes] = await Promise.all([
      fetch('/api/admin/webhooks'),
      fetch('/api/admin/webhooks').then(() =>
        fetch('/api/admin/conversations').then(() =>
          // Fetch webhook logs from main webhooks endpoint (logs are in Supabase)
          // We'll fetch them separately
          fetch('/api/admin/logs?limit=20').then(r => r.json()).catch(() => [])
        )
      ),
    ]);

    const [wData] = await Promise.all([wRes.json()]);
    setWebhooks(wData || []);

    // Fetch webhook logs via direct Supabase API
    const logsRes = await fetch('/api/admin/webhook-logs');
    if (logsRes.ok) {
      const logsData = await logsRes.json();
      setLogs(logsData || []);
    }

    setLoading(false);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id: string, url: string) => {
    if (!confirm(`¿Eliminar webhook para ${new URL(url).host}?`)) return;
    setDeleting(id);
    await fetch(`/api/admin/webhooks/${id}`, { method: 'DELETE' });
    setWebhooks(prev => prev.filter(w => w.id !== id));
    setDeleting(null);
  };

  const handleToggle = async (wh: Webhook) => {
    setToggling(wh.id);
    await fetch(`/api/admin/webhooks/${wh.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !wh.active }),
    });
    setWebhooks(prev => prev.map(w => w.id === wh.id ? { ...w, active: !w.active } : w));
    setToggling(null);
  };

  const handleTest = async (id: string) => {
    setTesting(id);
    const res = await fetch(`/api/admin/webhooks/${id}/test`, { method: 'POST' });
    const data = await res.json();
    setTestResults(prev => ({ ...prev, [id]: data }));
    setTesting(null);

    // Reload logs
    const logsRes = await fetch('/api/admin/webhook-logs');
    if (logsRes.ok) setLogs(await logsRes.json());
  };

  const getTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `Hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `Hace ${hrs}h`;
    return `Hace ${Math.floor(hrs / 24)}d`;
  };

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/60 mb-2">Integraciones</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white-custom tracking-tight">Webhooks</h1>
          <p className="text-text-muted text-sm font-medium mt-2">
            Envía eventos del CRM a herramientas externas en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-text-muted hover:text-white-custom transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link
            href="/admin/webhooks/new"
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-primary text-background text-sm font-black hover:scale-105 transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={17} />
            <span className="hidden sm:inline">Nuevo Webhook</span>
            <span className="sm:hidden">Nuevo</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Webhook List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card-bg rounded-[28px] border border-white/5 shadow-2xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-white-custom">Endpoints Registrados</h2>
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted/40">
                {webhooks.filter(w => w.active).length}/{webhooks.length} activos
              </span>
            </div>

            <div className="divide-y divide-white/5">
              {loading ? (
                <div className="p-10 flex items-center justify-center gap-3 text-text-muted">
                  <RefreshCw size={16} className="animate-spin text-primary" />
                  <span className="text-sm">Cargando...</span>
                </div>
              ) : webhooks.length === 0 ? (
                <div className="p-10 text-center space-y-4">
                  <Zap size={40} strokeWidth={1} className="text-text-muted/20 mx-auto" />
                  <p className="text-sm text-text-muted/40">No hay webhooks configurados.</p>
                  <Link
                    href="/admin/webhooks/new"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-background text-sm font-black hover:scale-105 transition-all"
                  >
                    <Plus size={16} />
                    Crear el primero
                  </Link>
                </div>
              ) : (
                webhooks.map(wh => {
                  const testResult = testResults[wh.id];
                  return (
                    <div key={wh.id} className="p-4 sm:p-6 hover:bg-white/[0.02] transition-all group">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className={`p-2.5 rounded-xl shrink-0 ${wh.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            <LinkIcon size={17} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-white-custom text-sm truncate">{wh.url}</div>
                            <div className="text-[10px] text-text-muted/40 font-mono mt-0.5">
                              ID: {wh.id.split('-')[0]}
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              {wh.active ? (
                                <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 uppercase tracking-wider">
                                  <CheckCircle size={10} />
                                  Activo
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[9px] font-black text-red-400 uppercase tracking-wider">
                                  <XCircle size={10} />
                                  Inactivo
                                </span>
                              )}
                              <span className="text-text-muted/20 text-[9px]">•</span>
                              <span className="flex items-center gap-1 text-[9px] text-text-muted/40">
                                <Clock size={9} />
                                {getTimeAgo(wh.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleTest(wh.id)}
                            disabled={testing === wh.id || !wh.active}
                            title="Enviar ping de prueba"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-text-muted hover:text-primary hover:border-primary/30 transition-all disabled:opacity-40 disabled:pointer-events-none"
                          >
                            {testing === wh.id ? (
                              <RefreshCw size={12} className="animate-spin" />
                            ) : (
                              <Zap size={12} />
                            )}
                            Ping
                          </button>
                          <button
                            onClick={() => handleToggle(wh)}
                            disabled={toggling === wh.id}
                            title={wh.active ? 'Desactivar' : 'Activar'}
                            className="p-2 rounded-lg hover:bg-white/5 text-text-muted/50 hover:text-white-custom transition-all disabled:opacity-40"
                          >
                            {wh.active ? (
                              <ToggleRight size={18} className="text-emerald-400" />
                            ) : (
                              <ToggleLeft size={18} className="text-red-400/60" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(wh.id, wh.url)}
                            disabled={deleting === wh.id}
                            title="Eliminar webhook"
                            className="p-2 rounded-lg hover:bg-red-500/10 text-red-400/50 hover:text-red-400 transition-all disabled:opacity-40"
                          >
                            {deleting === wh.id ? (
                              <RefreshCw size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Events */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {wh.events.map(event => (
                          <span key={event} className="px-2 py-0.5 bg-background border border-white/10 rounded-md text-[9px] font-bold text-primary uppercase tracking-wider">
                            {event}
                          </span>
                        ))}
                      </div>

                      {/* Secret indicator */}
                      <div className="flex items-center gap-2 text-[10px] text-text-muted/40">
                        <Shield size={11} />
                        <span>HMAC-SHA256 configurado</span>
                      </div>

                      {/* Test result */}
                      {testResult && (
                        <div className={`mt-3 p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                          testResult.success
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/10 border border-red-500/20 text-red-400'
                        }`}>
                          {testResult.success ? (
                            <>
                              <CheckCircle size={13} />
                              Ping exitoso — HTTP {testResult.status}
                            </>
                          ) : (
                            <>
                              <AlertTriangle size={13} />
                              {testResult.error || `Error HTTP ${testResult.status}`}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div>
          <div className="bg-card-bg rounded-[28px] border border-white/5 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center gap-2">
              <Activity className="text-primary" size={17} />
              <h2 className="text-base font-bold text-white-custom">Últimos Envíos</h2>
            </div>
            <div className="divide-y divide-white/5">
              {logs.length === 0 ? (
                <div className="p-8 text-center">
                  <Activity size={32} strokeWidth={1} className="text-text-muted/20 mx-auto mb-3" />
                  <p className="text-xs text-text-muted/40">Sin actividad reciente.</p>
                </div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-[9px] font-bold uppercase text-primary tracking-wider">{log.event_type}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        log.response_status && log.response_status < 300
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : log.error
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {log.response_status || 'ERR'}
                      </span>
                    </div>
                    {log.error && (
                      <div className="text-[9px] text-red-400/70 mb-1 truncate" title={log.error}>
                        {log.error}
                      </div>
                    )}
                    <div className="text-[9px] text-text-muted/40 flex items-center gap-1">
                      <Clock size={9} />
                      {getTimeAgo(log.created_at)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
