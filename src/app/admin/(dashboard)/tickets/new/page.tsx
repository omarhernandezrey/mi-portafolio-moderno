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
import { useToast } from '@/components/ui/Toast';

export default function NewTicketPage() {
  const router = useRouter();
  const { showToast } = useToast();
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
        showToast('⚠️ Error al cargar la lista de leads', 'warning');
      }
    }
    fetchLeads();
  }, [showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // Validaciones
    if (!formData.title.trim()) {
      showToast('⚠️ El título es obligatorio', 'warning');
      return;
    }

    if (!formData.content.trim()) {
      showToast('⚠️ La descripción es obligatoria', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al crear ticket');
      }
      
      const ticket = await res.json();
      showToast('✅ Ticket creado correctamente', 'success');
      router.push(`/admin/tickets/${ticket.id}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear ticket';
      showToast(`❌ ${message}`, 'error');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link 
        href="/admin/tickets" 
        className="inline-flex items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft size={20} /> Volver a Tickets
      </Link>

      <div className="bg-card-bg p-8 rounded-[40px] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <Ticket size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white-custom">Nuevo Ticket</h1>
            <p className="text-text-muted">Registra un nuevo requerimiento de soporte.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2 text-white-custom">Cliente / Lead (Opcional)</label>
            <select 
              className="w-full bg-background border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary/50 text-white-custom"
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
            <label className="block text-sm font-bold mb-2 text-white-custom">Asunto / Título *</label>
            <input 
              type="text"
              required
              className="w-full bg-background border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary/50 text-white-custom placeholder:text-text-muted/50"
              placeholder="Ej: Error en pasarela de pagos"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-white-custom">Prioridad</label>
            <div className="grid grid-cols-4 gap-2">
              {['low', 'medium', 'high', 'urgent'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData({...formData, priority: p})}
                  className={`py-3 rounded-xl text-xs font-bold uppercase transition-all border ${
                    formData.priority === p 
                      ? 'bg-primary text-background border-primary' 
                      : 'bg-transparent text-text-muted border-white/10 hover:border-primary/50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-white-custom">Descripción del problema *</label>
            <textarea 
              required
              className="w-full bg-background border border-white/10 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary/50 min-h-[150px] text-white-custom placeholder:text-text-muted/50 resize-none"
              placeholder="Describe detalladamente el requerimiento..."
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-primary text-background rounded-2xl font-black flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            {submitting ? <Loader2 className="animate-spin" /> : <>Crear Ticket <Send size={20} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
