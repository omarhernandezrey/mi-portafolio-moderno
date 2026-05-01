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
import Footer from '@/components/shared/Footer';

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
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

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
      
      // Actualizar status del ticket localmente
      if (ticket) setTicket({ ...ticket, status: 'waiting_client' });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al enviar mensaje');
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
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al actualizar estado');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background-color)]">
      <Loader2 className="animate-spin text-[var(--primary-color)]" size={48} />
    </div>
  );

  if (error || !ticket) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background-color)]">
      <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
      <p className="text-[var(--muted-color)] mb-8">{error || 'Ticket no encontrado'}</p>
      <Link href="/admin/tickets" className="px-6 py-2 bg-[var(--primary-color)] text-white rounded-full">Volver a tickets</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)] flex flex-col">
      <nav className="border-b border-[var(--primary-color)]/10 bg-[var(--card-bg-color)]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/tickets" className="text-[var(--muted-color)] hover:text-[var(--primary-color)]">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="font-bold text-lg leading-none">{ticket.title}</h1>
              <span className="text-[10px] text-[var(--muted-color)] uppercase tracking-widest font-mono">ID: {ticket.id}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {ticket.status !== 'closed' ? (
              <button 
                onClick={() => handleUpdateStatus('closed')}
                className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition-all flex items-center gap-2"
              >
                <CheckCircle2 size={14} /> Cerrar Ticket
              </button>
            ) : (
              <button 
                onClick={() => handleUpdateStatus('open')}
                className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl text-xs font-bold hover:bg-blue-500/20 transition-all flex items-center gap-2"
              >
                Reabrir Ticket
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col h-[70vh] bg-[var(--card-bg-color)] rounded-[2.5rem] border border-[var(--primary-color)]/10 overflow-hidden shadow-2xl">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-[2rem] p-5 shadow-lg ${
                  msg.sender === 'admin' 
                    ? 'bg-[var(--primary-color)] text-white rounded-tr-none' 
                    : 'bg-[var(--secondary-background-color)] border border-[var(--primary-color)]/10 rounded-tl-none'
                }`}>
                  <div className="flex items-center gap-2 mb-2 opacity-60 text-[10px] uppercase font-bold tracking-widest">
                    {msg.sender === 'admin' ? <ShieldCheck size={12} /> : <User size={12} />}
                    {msg.sender === 'admin' ? 'Omar Hernández' : ticket.lead?.name || 'Cliente'}
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <div className="mt-2 text-[9px] opacity-40 text-right">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {ticket.status !== 'closed' && (
            <div className="p-4 border-t border-[var(--primary-color)]/10 bg-[var(--background-color)]/50">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe tu respuesta..."
                    className="w-full bg-[var(--card-bg-color)] border border-[var(--primary-color)]/20 rounded-2xl p-4 pr-12 focus:ring-2 focus:ring-[var(--primary-color)] outline-none min-h-[60px] max-h-[200px] text-sm resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <button type="button" className="absolute right-4 bottom-4 text-[var(--muted-color)] hover:text-[var(--primary-color)]">
                    <Paperclip size={18} />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="p-4 bg-[var(--primary-color)] text-white rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {sending ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-[var(--card-bg-color)] p-6 rounded-[2rem] border border-[var(--primary-color)]/10 shadow-xl">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-[var(--primary-color)]" />
              Detalles del Ticket
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted-color)]">Estado</span>
                <span className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded-md ${
                  ticket.status === 'open' ? 'bg-blue-500/20 text-blue-400' :
                  ticket.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400' :
                  ticket.status === 'closed' ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-color)]">Prioridad</span>
                <span className="font-bold uppercase text-[10px] text-orange-400">{ticket.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-color)]">Creado</span>
                <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted-color)]">Última act.</span>
                <span>{new Date(ticket.updated_at).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {ticket.lead && (
            <div className="bg-[var(--card-bg-color)] p-6 rounded-[2rem] border border-[var(--primary-color)]/10 shadow-xl">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <User size={18} className="text-[var(--primary-color)]" />
                Información del Cliente
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="font-bold">{ticket.lead.name}</div>
                  <div className="text-xs text-[var(--muted-color)]">{ticket.lead.email}</div>
                </div>
                {ticket.lead.company && (
                  <div>
                    <span className="text-[var(--muted-color)] block text-xs">Empresa</span>
                    <span>{ticket.lead.company}</span>
                  </div>
                )}
                {ticket.lead.service_requested && (
                  <div>
                    <span className="text-[var(--muted-color)] block text-xs">Servicio contratado</span>
                    <span className="text-[var(--primary-color)] font-medium">{ticket.lead.service_requested}</span>
                  </div>
                )}
                <Link 
                  href={`/admin/leads/${ticket.lead.id}`}
                  className="block text-center py-3 bg-[var(--secondary-background-color)] rounded-xl text-xs font-bold hover:bg-[var(--primary-color)]/10 transition-all border border-[var(--primary-color)]/10"
                >
                  Ver Perfil Completo
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
