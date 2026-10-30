'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Activity,
  Shield,
  Link as LinkIcon,
  Zap,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import PageHeader from '@/components/admin/ui/PageHeader';
import StatCard from '@/components/admin/ui/StatCard';
import EmptyState from '@/components/admin/ui/EmptyState';
import {
  AdminButton,
  AdminButtonLink,
} from '@/components/admin/ui/AdminButton';
import { adminFetch } from '@/lib/admin/client-fetch';

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
  const [error, setError] = useState('');
  const [testResults, setTestResults] = useState<
    Record<
      string,
      { success: boolean; status?: number | null; error?: string | null }
    >
  >({});

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [webhooksData, logsData] = await Promise.all([
        adminFetch<Webhook[]>('/api/admin/webhooks'),
        adminFetch<WebhookLog[]>('/api/admin/webhook-logs'),
      ]);
      setWebhooks(Array.isArray(webhooksData) ? webhooksData : []);
      setLogs(Array.isArray(logsData) ? logsData : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar los webhooks.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string, url: string) => {
    let host = url;
    try {
      host = new URL(url).host;
    } catch {
      // Conserva la URL completa si no es parseable.
    }

    if (!confirm(`¿Eliminar webhook para ${host}?`)) return;

    setDeleting(id);
    setError('');

    try {
      await adminFetch(`/api/admin/webhooks/${id}`, { method: 'DELETE' });
      setWebhooks((prev) => prev.filter((webhook) => webhook.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo eliminar el webhook.'
      );
    } finally {
      setDeleting(null);
    }
  };

  const handleToggle = async (webhook: Webhook) => {
    setToggling(webhook.id);
    setError('');

    try {
      await adminFetch(`/api/admin/webhooks/${webhook.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !webhook.active }),
      });
      setWebhooks((prev) =>
        prev.map((item) =>
          item.id === webhook.id ? { ...item, active: !item.active } : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo actualizar el webhook.'
      );
    } finally {
      setToggling(null);
    }
  };

  const handleTest = async (id: string) => {
    setTesting(id);
    setError('');

    try {
      const data = await adminFetch<{
        success: boolean;
        status?: number | null;
        error?: string | null;
      }>(`/api/admin/webhooks/${id}/test`, { method: 'POST' });
      setTestResults((prev) => ({ ...prev, [id]: data }));
      const logsData = await adminFetch<WebhookLog[]>(
        '/api/admin/webhook-logs'
      );
      setLogs(Array.isArray(logsData) ? logsData : []);
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [id]: {
          success: false,
          error: err instanceof Error ? err.message : 'Error al probar',
        },
      }));
    } finally {
      setTesting(null);
    }
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

  const activeCount = webhooks.filter((webhook) => webhook.active).length;
  const errorLogs = logs.filter(
    (log) =>
      Boolean(log.error) ||
      (log.response_status !== null && log.response_status >= 400)
  ).length;

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        overline="Integraciones"
        title="Webhooks"
        description="Envía eventos del CRM a herramientas externas en tiempo real."
        actions={
          <>
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
            <AdminButtonLink
              href="/admin/webhooks/new"
              variant="primary"
              size="sm"
              icon={<Plus size={15} />}
            >
              Nuevo webhook
            </AdminButtonLink>
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
        aria-label="Resumen de webhooks"
        className="grid grid-cols-2 gap-3 xl:grid-cols-4"
      >
        <StatCard
          title="Endpoints"
          value={webhooks.length.toString()}
          icon={<LinkIcon size={19} />}
          color="primary"
          description="Webhooks registrados"
        />
        <StatCard
          title="Activos"
          value={activeCount.toString()}
          icon={<CheckCircle size={19} />}
          color="success"
          description="Recibiendo eventos"
        />
        <StatCard
          title="Envíos"
          value={logs.length.toString()}
          icon={<Activity size={19} />}
          color="info"
          description="Intentos recientes"
        />
        <StatCard
          title="Errores"
          value={errorLogs.toString()}
          icon={<AlertTriangle size={19} />}
          color="danger"
          description="Fallos en los envíos"
        />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
        <div className="space-y-4 lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-admin-line bg-card-bg shadow-[0_18px_45px_-32px_rgba(0,0,0,0.95)]">
            <div className="flex items-center justify-between border-b border-admin-line p-4 sm:p-5">
              <h2 className="text-sm font-bold text-admin-ink">
                Endpoints registrados
              </h2>
              <span className="font-mono-label text-[9px] text-text-muted/60">
                {activeCount}/{webhooks.length} activos
              </span>
            </div>

            <div className="divide-y divide-admin-line">
              {loading ? (
                <div className="flex items-center justify-center gap-3 p-12 text-xs font-medium text-text-muted">
                  <RefreshCw size={16} className="animate-spin text-primary" />
                  Cargando webhooks...
                </div>
              ) : webhooks.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    icon={<Zap size={24} />}
                    title="Sin webhooks"
                    description="Conecta el CRM con tus herramientas favoritas."
                    action={
                      <AdminButtonLink
                        href="/admin/webhooks/new"
                        variant="primary"
                        size="sm"
                        icon={<Plus size={14} />}
                      >
                        Crear el primero
                      </AdminButtonLink>
                    }
                  />
                </div>
              ) : (
                webhooks.map((webhook) => {
                  const testResult = testResults[webhook.id];

                  return (
                    <article
                      key={webhook.id}
                      className="p-4 transition-colors hover:bg-white/[0.02] sm:p-5"
                    >
                      <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                              webhook.active
                                ? 'border-admin-success/20 bg-admin-success/10 text-admin-success'
                                : 'border-admin-danger/20 bg-admin-danger/10 text-admin-danger'
                            }`}
                          >
                            <LinkIcon size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-admin-ink">
                              {webhook.url}
                            </p>
                            <p className="mt-0.5 font-mono text-[10px] text-text-muted/50">
                              ID: {webhook.id.split('-')[0]}
                            </p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                              {webhook.active ? (
                                <span className="flex items-center gap-1 font-mono-label text-[8px] text-admin-success">
                                  <CheckCircle size={9} />
                                  Activo
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 font-mono-label text-[8px] text-admin-danger">
                                  <XCircle size={9} />
                                  Inactivo
                                </span>
                              )}
                              <span className="text-[9px] text-text-muted/30">
                                •
                              </span>
                              <span className="flex items-center gap-1 text-[9px] text-text-muted/50">
                                <Clock size={9} />
                                {getTimeAgo(webhook.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-auto">
                          <AdminButton
                            onClick={() => handleTest(webhook.id)}
                            disabled={testing === webhook.id || !webhook.active}
                            size="sm"
                            icon={
                              testing === webhook.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Zap size={12} />
                              )
                            }
                          >
                            Ping
                          </AdminButton>
                          <button
                            type="button"
                            onClick={() => handleToggle(webhook)}
                            disabled={toggling === webhook.id}
                            title={webhook.active ? 'Desactivar' : 'Activar'}
                            aria-label={
                              webhook.active
                                ? 'Desactivar webhook'
                                : 'Activar webhook'
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-admin-line bg-white/[0.03] p-0 text-text-muted/70 transition-colors hover:border-primary/30 hover:text-admin-ink disabled:opacity-40"
                          >
                            {toggling === webhook.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : webhook.active ? (
                              <ToggleRight
                                size={18}
                                className="text-admin-success"
                              />
                            ) : (
                              <ToggleLeft
                                size={18}
                                className="text-admin-danger/70"
                              />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(webhook.id, webhook.url)}
                            disabled={deleting === webhook.id}
                            title="Eliminar webhook"
                            aria-label="Eliminar webhook"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-admin-line bg-white/[0.03] p-0 text-admin-danger/60 transition-colors hover:border-admin-danger/30 hover:bg-admin-danger/10 hover:text-admin-danger disabled:opacity-40"
                          >
                            {deleting === webhook.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {webhook.events.map((event) => (
                          <span
                            key={event}
                            className="rounded-md border border-admin-line bg-admin-bg px-2 py-0.5 font-mono-label text-[8px] text-primary"
                          >
                            {event}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-text-muted/50">
                        <Shield size={11} />
                        <span>HMAC-SHA256 configurado</span>
                      </div>

                      {testResult && (
                        <div
                          className={`mt-3 flex items-center gap-2 rounded-xl border p-3 text-xs font-medium ${
                            testResult.success
                              ? 'border-admin-success/20 bg-admin-success/10 text-admin-success'
                              : 'border-admin-danger/20 bg-admin-danger/10 text-admin-danger'
                          }`}
                        >
                          {testResult.success ? (
                            <>
                              <CheckCircle size={13} />
                              Ping exitoso — HTTP {testResult.status}
                            </>
                          ) : (
                            <>
                              <AlertTriangle size={13} />
                              {testResult.error ||
                                `Error HTTP ${testResult.status}`}
                            </>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="overflow-hidden rounded-2xl border border-admin-line bg-card-bg shadow-[0_18px_45px_-32px_rgba(0,0,0,0.95)]">
            <div className="flex items-center gap-2 border-b border-admin-line p-4 sm:p-5">
              <Activity className="text-primary" size={16} />
              <h2 className="text-sm font-bold text-admin-ink">
                Últimos envíos
              </h2>
            </div>
            <div className="divide-y divide-admin-line">
              {logs.length === 0 ? (
                <div className="p-5">
                  <EmptyState
                    icon={<Activity size={20} />}
                    title="Sin actividad"
                    description="No hay envíos recientes."
                    className="border-0 bg-transparent px-2 py-6"
                  />
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 transition-colors hover:bg-white/[0.02]"
                  >
                    <div className="mb-1.5 flex items-start justify-between gap-2">
                      <span className="font-mono-label text-[8px] text-primary">
                        {log.event_type}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 font-mono-label text-[8px] ${
                          log.response_status && log.response_status < 300
                            ? 'bg-admin-success/15 text-admin-success'
                            : log.error
                              ? 'bg-admin-danger/15 text-admin-danger'
                              : 'bg-admin-warning/15 text-admin-warning'
                        }`}
                      >
                        {log.response_status || 'ERR'}
                      </span>
                    </div>
                    {log.error && (
                      <p
                        className="mb-1 truncate text-[9px] text-admin-danger/70"
                        title={log.error}
                      >
                        {log.error}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-[9px] text-text-muted/50">
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
