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
import { useNotyf } from '@/components/ui/NotyfProvider';

export default function NewInvoicePage() {
  const router = useRouter();
  const notyf = useNotyf();
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
      
      notyf.success('Factura generada correctamente');
      router.push('/admin/invoices');
    } catch (err: unknown) {
      notyf.error(err instanceof Error ? err.message : 'Error al generar factura');
    } finally {
      setSubmitting(false);
    }
  };

  const subtotal = formData.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);

  return (
    <div className="max-w-4xl mx-auto">
      <Link 
        href="/admin/invoices" 
        className="inline-flex items-center gap-2 text-xs sm:text-sm text-text-muted hover:text-primary mb-4 sm:mb-8 transition-colors"
      >
        <ArrowLeft size={18} /> Volver a Facturación
      </Link>

      <div className="bg-card-bg p-4 sm:p-6 lg:p-8 rounded-[24px] sm:rounded-[40px] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="p-2 sm:p-3 bg-primary/10 rounded-xl sm:rounded-2xl text-primary">
            <FileText size={28} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white-custom">Generar Factura</h1>
            <p className="text-xs sm:text-sm text-text-muted">Crea un documento de cobro profesional para tu cliente.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-bold mb-2 text-white-custom">Cliente / Proyecto</label>
              <select 
                required
                className="w-full bg-background border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 outline-none focus:ring-2 focus:ring-primary/50 text-white-custom text-sm"
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
              <label className="block text-xs sm:text-sm font-bold mb-2 text-white-custom">Fecha Vencimiento</label>
              <input 
                type="date"
                required
                className="w-full bg-background border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 outline-none focus:ring-2 focus:ring-primary/50 text-white-custom text-sm"
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base sm:text-lg text-white-custom">Ítems / Servicios</h3>
              <button 
                type="button" 
                onClick={addItem}
                className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-primary hover:underline"
              >
                <Plus size={14} /> Añadir Ítem
              </button>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {formData.items.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-2 sm:gap-3 p-3 sm:p-4 bg-background/50 rounded-xl sm:rounded-2xl border border-white/5">
                  <div className="flex-1">
                    <input 
                      type="text"
                      placeholder="Descripción del servicio"
                      required
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-xs sm:text-sm font-medium text-white-custom placeholder:text-text-muted/50"
                      value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 sm:gap-3 items-center flex-wrap">
                    <input 
                      type="number"
                      placeholder="Cant"
                      className="w-14 sm:w-16 bg-transparent border-none focus:ring-0 p-0 text-xs sm:text-sm text-center text-white-custom"
                      value={item.quantity}
                      min="1"
                      onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] sm:text-xs text-text-muted">$</span>
                      <input 
                        type="number"
                        placeholder="Precio"
                        className="w-20 sm:w-24 bg-transparent border-none focus:ring-0 p-0 text-xs sm:text-sm text-right font-mono text-white-custom"
                        value={item.price}
                        step="0.01"
                        onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="w-20 sm:w-24 text-right text-xs sm:text-sm font-black text-primary font-mono">
                      ${(item.quantity * item.price).toFixed(2)}
                    </div>
                    {formData.items.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeItem(idx)}
                        className="text-red-400 hover:text-red-500 transition-colors ml-auto"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-4 sm:gap-8 pt-6 sm:pt-8 border-t border-white/5">
            <div className="flex-1 w-full">
              <label className="block text-xs sm:text-sm font-bold mb-2 text-white-custom">Notas / Instrucciones de pago</label>
              <textarea 
                className="w-full bg-background border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px] sm:min-h-[100px] text-xs sm:text-sm text-white-custom placeholder:text-text-muted/50 resize-none"
                placeholder="Ej: Favor consignar a la cuenta Nequi..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
            <div className="w-full lg:w-64 space-y-2 sm:space-y-3">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-text-muted">Subtotal</span>
                <span className="font-mono text-white-custom">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-text-muted">Impuestos (0%)</span>
                <span className="font-mono text-white-custom">$0.00</span>
              </div>
              <div className="flex justify-between text-lg sm:text-xl font-black pt-2 sm:pt-3 border-t border-white/5">
                <span className="text-white-custom">TOTAL</span>
                <span className="text-primary font-mono">${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || subtotal <= 0 || !formData.lead_id}
            className="w-full py-3 sm:py-4 bg-primary text-background rounded-xl sm:rounded-2xl font-black flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-primary/20 text-sm"
          >
            {submitting ? <Loader2 className="animate-spin" size={20} /> : <>Generar y Enviar Factura <Send size={19} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
