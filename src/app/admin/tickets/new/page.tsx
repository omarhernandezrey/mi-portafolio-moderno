"use client";

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Loader2, 
  Ticket, 
  Send
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NavbarLogic from '@/components/ui/NavbarLogic';
import Footer from '@/components/shared/Footer';

export default function NewTicketPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<{ id: string; name: string; company?: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    lead_id: '',
    title: '',
    priority: 'medium',
    content: ''
  });

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch('/api/admin/leads/list');
        const data = await res.json();
        setLeads(data);
      } catch (err) {
        console.error('Error fetching leads:', err);
      }
    }
    fetchLeads();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Error al crear ticket');
      
      const ticket = await res.json();
      router.push(`/admin/tickets/${ticket.id}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al crear ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)] flex flex-col">
      <NavbarLogic />
      
      <main className="flex-1 container mx-auto px-4 pt-32 pb-20 max-w-2xl">
        <Link 
          href="/admin/tickets" 
          className="inline-flex items-center gap-2 text-[var(--muted-color)] hover:text-[var(--primary-color)] mb-8 transition-colors"
        >
          <ArrowLeft size={20} /> Volver a Tickets
        </Link>

        <div className="bg-[var(--card-bg-color)] p-8 rounded-[2.5rem] border border-[var(--primary-color)]/10 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-[var(--primary-color)]/10 rounded-2xl text-[var(--primary-color)]">
              <Ticket size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black">Nuevo Ticket</h1>
              <p className="text-[var(--muted-color)]">Registra un nuevo requerimiento de soporte.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">Cliente / Lead (Opcional)</label>
              <select 
                className="w-full bg-[var(--background-color)] border border-[var(--primary-color)]/20 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                value={formData.lead_id}
                onChange={(e) => setFormData({...formData, lead_id: e.target.value})}
              >
                <option value="">Selecciona un cliente...</option>
                {leads.map(lead => (
                  <option key={lead.id} value={lead.id}>{lead.name} {lead.company ? `(${lead.company})` : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Asunto / Título</label>
              <input 
                type="text"
                required
                className="w-full bg-[var(--background-color)] border border-[var(--primary-color)]/20 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                placeholder="Ej: Error en pasarela de pagos"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Prioridad</label>
              <div className="grid grid-cols-4 gap-2">
                {['low', 'medium', 'high', 'urgent'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({...formData, priority: p})}
                    className={`py-2 rounded-xl text-xs font-bold uppercase transition-all border ${
                      formData.priority === p 
                        ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)]' 
                        : 'bg-transparent text-[var(--muted-color)] border-[var(--primary-color)]/20 hover:border-[var(--primary-color)]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Descripción del problema</label>
              <textarea 
                required
                className="w-full bg-[var(--background-color)] border border-[var(--primary-color)]/20 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-[var(--primary-color)] min-h-[150px]"
                placeholder="Describe detalladamente el requerimiento..."
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[var(--primary-color)] text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" /> : <>Crear Ticket <Send size={20} /></>}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
