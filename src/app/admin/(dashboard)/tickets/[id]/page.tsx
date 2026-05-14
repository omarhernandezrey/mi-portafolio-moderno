"use client";

import React, { useState, useEffect, use } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Loader2, 
  User, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Paperclip
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';

interface TicketMessage {
  id: string;
  sender: 'admin' | 'client';
  content: string;
  created_at: string;
}

interface TicketDetail {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  lead?: {
    id: string;
    name: string;
    email: string;
    company?: string;
    service_requested?: string;
  };
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function TicketDetailPage({ params }: Props) {
  const { id } = use(params);
  const { showToast } = useToast();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ticketRes, msgsRes] = await Promise.all([
          fetch(`/api/tickets/${id}`),
          fetch(`/api/tickets/${id}/messages`)
        ]);

        if (!ticketRes.ok || !msgsRes.ok) throw new Error('Error al cargar datos');

        const ticketData = await ticketRes.json();
        const msgsData = await msgsRes.json();

        setTicket(ticketData);
        setMessages(msgsData);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        showToast('❌ Error al cargar el ticket', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, showToast]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/tickets/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'admin',
          content: newMessage,
        }),
      });

      if (!res.ok) throw new Error('Error al enviar mensaje');

      const msg = await res.json();
      setMessages([...messages, msg]);
      setNewMessage('');
      
      if (ticket) setTicket({ ...ticket, status: 'waiting_client' });
      showToast('✅ Mensaje enviado correctamente', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al enviar mensaje';
      showToast(`❌ ${message}`, 'error');
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Error al actualizar estado');
      if (ticket) setTicket({ ...ticket, status });
      
      const statusText = status === 'closed' ? 'cerrado' : 'reabierto';
      showToast(`✅ Ticket ${statusText} correctamente`, 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar estado';
      showToast(`❌ ${message}`, 'error');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="animate-spin text-primary" size={48} />
    </div>
  );

  if (error || !ticket) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
      <p className="text-text-muted mb-8">{error || 'Ticket no encontrado'}</p>
      <Link href="/admin/tickets" className="px-6 py-2 bg-primary text-background rounded-full font-bold">Volver a tickets</Link>
    </div>
  );

  const statusColors: Record<string, string> = {
    open: 'bg-blue-500/20 text-blue-400',
    in_progress: 'bg-amber-500/20 text-amber-400',
    waiting_client: 'bg-purple-500/20 text-purple-400',
    closed: 'bg-emerald-500/20 text-emerald-400',
  };

  const priorityColors: Record<string, string> = {
    urgent: 'text-red-500 font-bold',
    high: 'text-orange-400',
    medium: 'text-amber-300',
    low: 'text-emerald-400',
  };

  return (
    <div className="space-y-10">
      {/* Top nav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card-bg/40 p-6 rounded-[32px] border border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Link href="/admin/tickets" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-bold text-xl text-white-custom leading-none">{ticket.title}</h1>
            <span className="text-[10px] text-text-muted uppercase tracking-widest font-mono">ID: {ticket.id}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {ticket.status !== 'closed' ? (
            <button 
              onClick={() => handleUpdateStatus('closed')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
            >
              <CheckCircle2 size={14} /> Cerrar Ticket
            </button>
          ) : (
            <button 
              onClick={() => handleUpdateStatus('open')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-500/20 transition-all border border-blue-500/20"
            >
              Reabrir Ticket
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col h-[70vh] bg-card-bg rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-[2rem] p-5 shadow-lg ${
                  msg.sender === 'admin' 
                    ? 'bg-primary text-background rounded-tr-none' 
                    : 'bg-background border border-white/10 rounded-tl-none'
                }`}>
                  <div className="flex items-center gap-2 mb-2 opacity-60 text-[10px] uppercase font-bold tracking-widest">
                    {msg.sender === 'admin' ? <ShieldCheck size={12} /> : <User size={12} />}
                    {msg.sender === 'admin' ? 'Omar Hernández' : ticket.lead?.name || 'Cliente'}
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <div className="mt-2 text-[9px] opacity-40 text-right">
                    {new Date(msg.created_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {ticket.status !== 'closed' && (
            <div className="p-4 border-t border-white/5 bg-background/50">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe tu respuesta..."
                    className="w-full bg-card-bg border border-white/10 rounded-2xl p-4 pr-12 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none min-h-[60px] max-h-[200px] text-sm resize-none text-white-custom"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <button type="button" className="absolute right-4 bottom-4 text-text-muted hover:text-primary transition-colors">
                    <Paperclip size={18} />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="p-4 bg-primary text-background rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 font-bold"
                >
                  {sending ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-card-bg p-8 rounded-[32px] border border-white/5 shadow-xl">
            <h3 className="font-bold mb-6 flex items-center gap-2 text-white-custom">
              <AlertCircle size={18} className="text-primary" />
              Detalles del Ticket
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Estado</span>
                <span className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-md ${statusColors[ticket.status] || 'bg-white/5 text-text-muted'}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Prioridad</span>
                <span className={`font-bold uppercase text-[10px] ${priorityColors[ticket.priority] || 'text-text-muted'}`}>{ticket.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Creado</span>
                <span className="text-white-custom">{new Date(ticket.created_at).toLocaleDateString('es-CO', { timeZone: 'America/Bogota' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Última act.</span>
                <span className="text-white-custom">{new Date(ticket.updated_at).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' })}</span>
              </div>
            </div>
          </div>

          {ticket.lead && (
            <div className="bg-card-bg p-8 rounded-[32px] border border-white/5 shadow-xl">
              <h3 className="font-bold mb-6 flex items-center gap-2 text-white-custom">
                <User size={18} className="text-primary" />
                Información del Cliente
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="font-bold text-white-custom">{ticket.lead.name}</div>
                  <div className="text-xs text-text-muted">{ticket.lead.email}</div>
                </div>
                {ticket.lead.company && (
                  <div>
                    <span className="text-text-muted block text-xs">Empresa</span>
                    <span className="text-white-custom">{ticket.lead.company}</span>
                  </div>
                )}
                {ticket.lead.service_requested && (
                  <div>
                    <span className="text-text-muted block text-xs">Servicio contratado</span>
                    <span className="text-primary font-medium">{ticket.lead.service_requested}</span>
                  </div>
                )}
                <Link 
                  href={`/admin/leads/${ticket.lead.id}`}
                  className="block text-center py-3 bg-white/5 rounded-xl text-xs font-bold hover:bg-primary/10 transition-all border border-white/10 text-white-custom hover:text-primary mt-4"
                >
                  Ver Perfil Completo
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
