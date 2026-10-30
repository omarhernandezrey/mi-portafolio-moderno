"use client";

import React, { useState, useEffect, use } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Send,
  ShieldCheck,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminFetch } from '@/lib/admin/client-fetch';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import type { Ticket, TicketMessage } from '@/lib/admin/types';

type TicketDetail = Ticket;

interface Props {
  params: Promise<{ id: string }>;
}

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  low: {
    label: 'Baja',
    className: 'border-admin-success/20 bg-admin-success/10 text-admin-success',
  },
  medium: {
    label: 'Media',
    className: 'border-admin-warning/20 bg-admin-warning/10 text-admin-warning',
  },
  high: {
    label: 'Alta',
    className: 'border-accent/20 bg-accent/10 text-accent',
  },
  urgent: {
    label: 'Urgente',
    className: 'border-admin-danger/20 bg-admin-danger/10 text-admin-danger',
  },
};

export default function TicketDetailPage({ params }: Props) {
  const { id } = use(params);
  const toast = useAdminToast();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [canWrite, setCanWrite] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ticketData, msgsData, me] = await Promise.all([
          adminFetch<TicketDetail>(`/api/tickets/${id}`),
          adminFetch<TicketMessage[]>(`/api/tickets/${id}/messages`),
          adminFetch<{ role: string }>('/api/admin/me'),
        ]);
        setTicket(ticketData);
        setMessages(msgsData);
        setCanWrite(me.role === 'assistant' || me.role === 'owner');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        toast.error('Error al cargar el ticket');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast is stable enough; avoid refetch loops
  }, [id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const msg = await adminFetch<TicketMessage>(`/api/tickets/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          sender: 'admin',
          content: newMessage,
        }),
      });
      setMessages([...messages, msg]);
      setNewMessage('');
      if (ticket) setTicket({ ...ticket, status: 'waiting_client' });
      toast.success('Mensaje enviado correctamente');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      await adminFetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      if (ticket) setTicket({ ...ticket, status });
      const statusText = status === 'closed' ? 'cerrado' : 'reabierto';
      toast.success(`Ticket ${statusText} correctamente`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar estado');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-admin-line bg-card-bg px-6 py-5 text-sm text-text-muted">
          <Loader2 className="animate-spin text-primary" size={22} />
          Cargando ticket...
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center text-center">
        <div className="w-full rounded-2xl border border-admin-line bg-card-bg p-8 shadow-[0_18px_45px_-32px_rgba(0,0,0,0.95)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-admin-danger/20 bg-admin-danger/10 text-admin-danger">
            <AlertCircle size={26} />
          </div>
          <h1 className="mt-5 text-xl font-black text-admin-ink">No se pudo abrir el ticket</h1>
          <p className="mt-2 text-sm text-text-muted">{error || 'Ticket no encontrado'}</p>
          <Link
            href="/admin/tickets"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-black text-background transition-all hover:scale-[1.02]"
          >
            Volver a tickets
          </Link>
        </div>
      </div>
    );
  }

  const priority = PRIORITY_CONFIG[ticket.priority] || {
    label: ticket.priority,
    className: 'border-admin-line bg-white/[0.04] text-text-muted',
  };
  const createdLabel = new Date(ticket.created_at).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Bogota',
  });
  const updatedLabel = new Date(ticket.updated_at).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Bogota',
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="flex flex-col gap-5 rounded-2xl border border-admin-line bg-card-bg p-5 shadow-[0_18px_45px_-32px_rgba(0,0,0,0.95)] sm:p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <Link
            href="/admin/tickets"
            aria-label="Volver a tickets"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-admin-line bg-white/[0.04] p-0 text-text-muted transition-all hover:border-primary/30 hover:text-primary"
          >
            <ArrowLeft size={19} />
          </Link>
          <div className="min-w-0">
            <p className="font-mono-label text-[9px] text-text-muted/50">
              Soporte · #{ticket.id.slice(0, 8)}
            </p>
            <h1 className="mt-2 font-display text-2xl font-semibold italic leading-tight tracking-tight text-admin-ink sm:text-3xl">
              {ticket.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={ticket.status} size="sm" />
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${priority.className}`}
              >
                {priority.label}
              </span>
              <span className="text-[11px] font-medium text-text-muted/60">
                Actualizado {updatedLabel}
              </span>
            </div>
          </div>
        </div>

        {canWrite && (
          <button
            type="button"
            onClick={() => handleUpdateStatus(ticket.status === 'closed' ? 'open' : 'closed')}
            className={`inline-flex items-center justify-center gap-2 self-start rounded-xl border px-4 py-2.5 text-xs font-bold transition-all ${
              ticket.status === 'closed'
                ? 'border-admin-info/20 bg-admin-info/10 text-admin-info hover:bg-admin-info/20'
                : 'border-admin-success/20 bg-admin-success/10 text-admin-success hover:bg-admin-success/20'
            }`}
          >
            {ticket.status === 'closed' ? (
              <>
                <ArrowUpRight size={14} /> Reabrir ticket
              </>
            ) : (
              <>
                <CheckCircle2 size={14} /> Cerrar ticket
              </>
            )}
          </button>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="flex h-[68vh] min-h-[520px] max-h-[760px] flex-col overflow-hidden rounded-2xl border border-admin-line bg-card-bg shadow-[0_18px_45px_-32px_rgba(0,0,0,0.95)]">
          <div className="flex items-center justify-between border-b border-admin-line px-4 py-3.5 sm:px-5">
            <div className="flex items-center gap-2 text-sm font-bold text-admin-ink">
              <MessageSquare size={16} className="text-primary" />
              Conversación
              <span className="rounded-full border border-admin-line bg-white/[0.04] px-2 py-0.5 font-mono-label text-[9px] text-text-muted/60">
                {messages.length}
              </span>
            </div>
            <span className="hidden font-mono-label text-[9px] text-text-muted/50 sm:block">
              Hilo de soporte
            </span>
          </div>

          <div
            className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6"
            role="log"
            aria-live="polite"
            aria-label="Mensajes del ticket"
          >
            {messages.length === 0 ? (
              <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-3 text-center">
                <MessageSquare size={32} className="text-text-muted/25" />
                <p className="text-sm font-bold text-admin-ink">Sin mensajes todavía</p>
                <p className="max-w-xs text-xs font-medium leading-relaxed text-text-muted">
                  La conversación con el cliente aparecerá aquí.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isAdmin = msg.sender === 'admin';
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl border px-4 py-3 ${
                        isAdmin
                          ? 'rounded-br-md border-primary/20 bg-primary/10'
                          : 'rounded-bl-md border-admin-line bg-admin-bg'
                      }`}
                    >
                      <div
                        className={`mb-1.5 flex items-center gap-1.5 font-mono-label text-[9px] ${
                          isAdmin ? 'text-primary' : 'text-text-muted/60'
                        }`}
                      >
                        {isAdmin ? <ShieldCheck size={12} /> : <User size={12} />}
                        {isAdmin ? 'Omar Hernández' : ticket.lead?.name || 'Cliente'}
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-admin-ink">
                        {msg.content}
                      </p>
                      <div className="mt-2 text-right font-mono text-[9px] text-text-muted/40">
                        {new Date(msg.created_at).toLocaleTimeString('es-CO', {
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'America/Bogota',
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {ticket.status !== 'closed' && canWrite ? (
            <div className="border-t border-admin-line bg-admin-bg/40 p-3 sm:p-4">
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe una respuesta..."
                  aria-label="Escribe una respuesta"
                  className="min-h-[52px] max-h-[160px] flex-1 resize-none rounded-xl border border-admin-line bg-card-bg px-3.5 py-3 text-sm text-admin-ink outline-none transition-colors placeholder:text-text-muted/40 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  aria-label="Enviar respuesta"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary p-0 font-bold text-background transition-all hover:scale-[1.03] active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                >
                  {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                </button>
              </form>
            </div>
          ) : (
            <div className="border-t border-admin-line px-5 py-3 text-center text-[11px] font-medium text-text-muted/60">
              {ticket.status === 'closed'
                ? 'Este ticket está cerrado. Reábrelo para responder.'
                : 'No tienes permisos para responder en este ticket.'}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-admin-line bg-card-bg p-5 shadow-[0_18px_45px_-32px_rgba(0,0,0,0.95)]">
            <h2 className="flex items-center gap-2 text-sm font-bold text-admin-ink">
              <AlertCircle size={16} className="text-primary" />
              Detalles del ticket
            </h2>
            <dl className="mt-5 space-y-3 text-xs">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-text-muted">Estado</dt>
                <dd>
                  <StatusBadge status={ticket.status} size="sm" />
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-text-muted">Prioridad</dt>
                <dd>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${priority.className}`}
                  >
                    {priority.label}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-text-muted">Creado</dt>
                <dd className="text-right font-medium text-admin-ink">{createdLabel}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-text-muted">Actualizado</dt>
                <dd className="text-right font-medium text-admin-ink">{updatedLabel}</dd>
              </div>
            </dl>
          </section>

          {ticket.lead && (
            <section className="rounded-2xl border border-admin-line bg-card-bg p-5 shadow-[0_18px_45px_-32px_rgba(0,0,0,0.95)]">
              <h2 className="flex items-center gap-2 text-sm font-bold text-admin-ink">
                <User size={16} className="text-primary" />
                Cliente
              </h2>
              <div className="mt-5">
                <p className="font-bold text-admin-ink">{ticket.lead.name || 'Sin nombre'}</p>
                {ticket.lead.email && (
                  <p className="mt-1 break-all text-xs text-text-muted">{ticket.lead.email}</p>
                )}
              </div>
              <div className="mt-4 space-y-3 text-xs">
                {ticket.lead.company && (
                  <div>
                    <span className="block text-text-muted/60">Empresa</span>
                    <span className="mt-0.5 block font-medium text-admin-ink">{ticket.lead.company}</span>
                  </div>
                )}
                {ticket.lead.service_requested && (
                  <div>
                    <span className="block text-text-muted/60">Servicio contratado</span>
                    <span className="mt-0.5 block font-medium text-primary">{ticket.lead.service_requested}</span>
                  </div>
                )}
              </div>
              {ticket.lead.id && (
                <Link
                  href={`/admin/leads/${ticket.lead.id}`}
                  className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-admin-line bg-white/[0.04] py-2.5 text-xs font-bold text-admin-ink transition-all hover:border-primary/30 hover:text-primary"
                >
                  Ver perfil completo
                  <ArrowUpRight size={14} />
                </Link>
              )}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
