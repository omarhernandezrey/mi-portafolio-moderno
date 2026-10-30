"use client";

import React, { useCallback, useEffect, useState } from 'react';
import {
  Play,
  Square,
  Clock,
  Zap,
  Layout,
  ChevronRight,
  Activity,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import PageHeader from '@/components/admin/ui/PageHeader';
import EmptyState from '@/components/admin/ui/EmptyState';
import { AdminButton } from '@/components/admin/ui/AdminButton';
import { adminFetch } from '@/lib/admin/client-fetch';

interface TimerEntry {
  id: string;
  description: string;
  started_at: string;
  leads?: { name: string; company?: string };
}

interface LeadSummary {
  id: string;
  name: string;
  company?: string;
}

export default function TimerPage() {
  const [activeEntries, setActiveEntries] = useState<TimerEntry[]>([]);
  const [leads, setLeads] = useState<LeadSummary[]>([]);
  const [selectedLead, setSelectedLead] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchActive = useCallback(async () => {
    try {
      const data = await adminFetch<TimerEntry[]>('/api/admin/timer');
      setActiveEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar los timers activos.'
      );
    }
  }, []);

  const fetchLeads = useCallback(async () => {
    try {
      const data = await adminFetch<LeadSummary[]>('/api/admin/leads/list');
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar los clientes.'
      );
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchActive(), fetchLeads()]).finally(() => setLoading(false));
  }, [fetchActive, fetchLeads]);

  const handleStart = async () => {
    if (!selectedLead || busy) return;
    setBusy('start');
    setError('');

    try {
      await adminFetch('/api/admin/timer', {
        method: 'POST',
        body: JSON.stringify({
          action: 'start',
          projectId: selectedLead,
          description,
        }),
      });
      setDescription('');
      await fetchActive();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo iniciar el timer.'
      );
    } finally {
      setBusy(null);
    }
  };

  const handleStop = async (id: string) => {
    setBusy(id);
    setError('');

    try {
      await adminFetch('/api/admin/timer', {
        method: 'POST',
        body: JSON.stringify({ action: 'stop', entryId: id }),
      });
      await fetchActive();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo detener el timer.'
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        overline="Performance terminal"
        title="Timer"
        description="Seguimiento de productividad y gestión de billable hours."
        actions={
          <>
            <span className="inline-flex items-center gap-2 rounded-xl border border-admin-line bg-white/[0.03] px-3 py-2 font-mono-label text-[9px] text-text-muted">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Operational
            </span>
            <AdminButton
              onClick={fetchActive}
              size="sm"
              icon={<RefreshCw size={14} />}
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

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
        <section className="space-y-5 rounded-2xl border border-admin-line bg-card-bg p-4 shadow-[0_18px_45px_-32px_rgba(0,0,0,0.95)] sm:p-6 xl:col-span-5">
          <div>
            <h2 className="mb-5 flex items-center gap-2 font-mono-label text-[9px] text-primary">
              <Zap size={13} />
              Nueva sesión
            </h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="timer-lead"
                  className="ml-0.5 block text-[10px] font-bold uppercase tracking-wider text-text-muted"
                >
                  Cliente o proyecto
                </label>
                <div className="relative">
                  <select
                    id="timer-lead"
                    value={selectedLead}
                    onChange={(event) => setSelectedLead(event.target.value)}
                    className="w-full appearance-none rounded-xl border border-admin-line bg-admin-bg/60 px-4 py-3 text-sm font-medium text-admin-ink outline-none transition-colors focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                  >
                    <option value="">Seleccionar cliente...</option>
                    {leads.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.name}
                        {lead.company ? ` — ${lead.company}` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronRight
                    size={15}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-text-muted/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="timer-description"
                  className="ml-0.5 block text-[10px] font-bold uppercase tracking-wider text-text-muted"
                >
                  Objetivo de la actividad
                </label>
                <input
                  id="timer-description"
                  type="text"
                  placeholder="Ej: Optimización de performance React..."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="w-full rounded-xl border border-admin-line bg-admin-bg/60 px-4 py-3 text-sm font-medium text-admin-ink outline-none transition-colors placeholder:text-text-muted/40 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                />
              </div>

              <AdminButton
                onClick={handleStart}
                disabled={!selectedLead || busy !== null}
                variant="primary"
                size="md"
                className="w-full py-3.5"
                icon={
                  busy === 'start' ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Play size={15} className="fill-current" />
                  )
                }
              >
                Activar cronómetro
              </AdminButton>
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-admin-line bg-admin-raised/30 p-4">
            <div className="mb-2 flex items-center gap-2 font-mono-label text-[8px] text-text-muted/60">
              <Activity size={11} />
              Tip de productividad
            </div>
            <p className="text-[11px] font-medium leading-relaxed text-text-muted/70">
              &ldquo;El enfoque profundo de 90 minutos maximiza la calidad del
              código Next.js.&rdquo;
            </p>
          </div>
        </section>

        <section className="space-y-3 xl:col-span-7">
          <div className="flex items-center justify-between px-1">
            <h2 className="flex items-center gap-2 font-mono-label text-[9px] text-text-muted/60">
              <Layout size={13} />
              Operaciones en curso
            </h2>
            <span className="font-mono-label text-[9px] text-primary/70">
              {activeEntries.length} activas
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-admin-line bg-card-bg p-12 text-xs font-medium text-text-muted">
              <RefreshCw size={16} className="animate-spin text-primary" />
              Cargando timers...
            </div>
          ) : activeEntries.length === 0 ? (
            <EmptyState
              icon={<Clock size={24} />}
              title="Terminal en reposo"
              description="Inicia una sesión para comenzar el rastreo de tiempo."
              className="py-16"
            />
          ) : (
            <div className="space-y-3">
              {activeEntries.map((entry) => (
                <article
                  key={entry.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-card-bg p-4 shadow-[0_18px_45px_-32px_rgba(0,0,0,0.95)] sm:p-5"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                      <span className="absolute inset-0 animate-ping rounded-xl bg-primary/20 opacity-20" />
                      <Activity className="relative text-primary" size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-bold text-admin-ink">
                          {entry.leads?.name || 'Procesando...'}
                        </p>
                        <span className="rounded-md border border-admin-line bg-white/[0.04] px-2 py-0.5 font-mono-label text-[8px] text-text-muted">
                          {entry.leads?.company || 'Freelance'}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs font-medium text-text-muted">
                        {entry.description || 'Tarea sin descripción técnica'}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary/10 bg-primary/5 px-2.5 py-1 font-mono-label text-[9px] text-primary/70">
                        <Clock size={10} />
                        Inicio:{' '}
                        {new Date(entry.started_at).toLocaleTimeString('es-CO', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStop(entry.id)}
                    disabled={busy !== null}
                    aria-label={`Detener timer de ${entry.leads?.name || 'la tarea'}`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-admin-danger/30 bg-admin-danger/10 p-0 text-admin-danger transition-colors hover:bg-admin-danger hover:text-white disabled:pointer-events-none disabled:opacity-50 sm:h-12 sm:w-12"
                  >
                    {busy === entry.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Square size={16} className="fill-current" />
                    )}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
