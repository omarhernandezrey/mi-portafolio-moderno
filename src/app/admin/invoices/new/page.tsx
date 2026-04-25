"use client";

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Loader2, 
  FileText, 
  Plus, 
  Trash2, 
  Send
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NavbarLogic from '@/components/ui/NavbarLogic';
import Footer from '@/components/shared/Footer';

export default function NewInvoicePage() {
  const router = useRouter();
  const [leads, setLeads] = useState<{ id: string; name: string; company?: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    lead_id: '',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: 'USD',
    notes: '',
    items: [{ description: '', quantity: 1, price: 0 }]
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

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, price: 0 }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index: number, field: 'description' | 'quantity' | 'price', value: string | number) => {
    const newItems = [...formData.items];
    const item = { ...newItems[index] };
    
    if (field === 'description') {
      item.description = value as string;
    } else if (field === 'quantity') {
      item.quantity = value as number;
    } else if (field === 'price') {
      item.price = value as number;
    }
    
    newItems[index] = item;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Error al generar factura');
      
      router.push('/admin/invoices');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al generar factura');
    } finally {
      setSubmitting(false);
    }
  };

  const subtotal = formData.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);

  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)] flex flex-col">
      <NavbarLogic />
      
      <main className="flex-1 container mx-auto px-4 pt-32 pb-20 max-w-4xl">
        <Link 
          href="/admin/invoices" 
          className="inline-flex items-center gap-2 text-[var(--muted-color)] hover:text-[var(--primary-color)] mb-8 transition-colors"
        >
          <ArrowLeft size={20} /> Volver a Facturación
        </Link>

        <div className="bg-[var(--card-bg-color)] p-8 rounded-[2.5rem] border border-[var(--primary-color)]/10 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-[var(--primary-color)]/10 rounded-2xl text-[var(--primary-color)]">
              <FileText size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black">Generar Factura</h1>
              <p className="text-[var(--muted-color)]">Crea un documento de cobro profesional para tu cliente.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2">Cliente / Proyecto</label>
                <select 
                  required
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
                <label className="block text-sm font-bold mb-2">Fecha Vencimiento</label>
                <input 
                  type="date"
                  required
                  className="w-full bg-[var(--background-color)] border border-[var(--primary-color)]/20 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Ítems / Servicios</h3>
                <button 
                  type="button" 
                  onClick={addItem}
                  className="flex items-center gap-1 text-xs font-bold text-[var(--primary-color)] hover:underline"
                >
                  <Plus size={14} /> Añadir Ítem
                </button>
              </div>

              <div className="space-y-3">
                {formData.items.map((item, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-3 p-4 bg-[var(--background-color)]/50 rounded-2xl border border-[var(--primary-color)]/5">
                    <div className="flex-1">
                      <input 
                        type="text"
                        placeholder="Descripción del servicio"
                        required
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-medium"
                        value={item.description}
                        onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      />
                    </div>
                    <div className="flex gap-3">
                      <input 
                        type="number"
                        placeholder="Cant"
                        className="w-16 bg-transparent border-none focus:ring-0 p-0 text-sm text-center"
                        value={item.quantity}
                        min="1"
                        onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-[var(--muted-color)]">$</span>
                        <input 
                          type="number"
                          placeholder="Precio"
                          className="w-24 bg-transparent border-none focus:ring-0 p-0 text-sm text-right font-mono"
                          value={item.price}
                          step="0.01"
                          onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="w-24 text-right text-sm font-black text-[var(--primary-color)] font-mono">
                        ${(item.quantity * item.price).toFixed(2)}
                      </div>
                      {formData.items.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeItem(idx)}
                          className="text-red-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start gap-8 pt-8 border-t border-[var(--primary-color)]/10">
              <div className="flex-1 w-full">
                <label className="block text-sm font-bold mb-2">Notas / Instrucciones de pago</label>
                <textarea 
                  className="w-full bg-[var(--background-color)] border border-[var(--primary-color)]/20 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-[var(--primary-color)] min-h-[100px] text-sm"
                  placeholder="Ej: Favor consignar a la cuenta Nequi..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
              <div className="w-full md:w-64 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-color)]">Subtotal</span>
                  <span className="font-mono">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-color)]">Impuestos (0%)</span>
                  <span className="font-mono">$0.00</span>
                </div>
                <div className="flex justify-between text-xl font-black pt-3 border-t border-[var(--primary-color)]/10">
                  <span>TOTAL</span>
                  <span className="text-[var(--primary-color)] font-mono">${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || subtotal <= 0 || !formData.lead_id}
              className="w-full py-4 bg-[var(--primary-color)] text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-[var(--primary-color)]/20"
            >
              {submitting ? <Loader2 className="animate-spin" /> : <>Generar y Enviar Factura <Send size={20} /></>}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
