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
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminFetch } from '@/lib/admin/client-fetch';

export default function NewInvoicePage() {
  const router = useRouter();
  const toast = useAdminToast();
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
        const data = await adminFetch<{ id: string; name: string; company?: string }[]>(
          '/api/admin/leads/list'
        );
        setLeads(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching leads:', err);
        toast.warning('Error al cargar leads');
      }
    }
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      await adminFetch('/api/admin/invoices/generate', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      toast.success('Factura generada correctamente');
      router.push('/admin/invoices');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al generar factura');
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

      <div className="rounded-2xl border border-admin-line bg-card-bg p-4 shadow-[0_18px_45px_-32px_rgba(0,0,0,0.95)] sm:p-6 lg:p-8">
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="p-2 sm:p-3 bg-primary/10 rounded-xl sm:rounded-2xl text-primary">
            <FileText size={28} />
          </div>
          <div>
            <h1 className="font-display italic text-xl sm:text-2xl lg:text-3xl font-medium text-admin-ink">Generar Factura</h1>
            <p className="text-xs sm:text-sm text-text-muted">Crea un documento de cobro profesional para tu cliente.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-bold mb-2 text-admin-ink">Cliente / Proyecto</label>
              <select 
                required
                className="w-full bg-admin-bg border border-admin-line rounded-xl sm:rounded-2xl p-3 sm:p-4 outline-none focus:ring-2 focus:ring-primary/50 text-admin-ink text-sm"
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
              <label className="block text-xs sm:text-sm font-bold mb-2 text-admin-ink">Fecha Vencimiento</label>
              <input 
                type="date"
                required
                className="w-full bg-admin-bg border border-admin-line rounded-xl sm:rounded-2xl p-3 sm:p-4 outline-none focus:ring-2 focus:ring-primary/50 text-admin-ink text-sm"
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base sm:text-lg text-admin-ink">Ítems / Servicios</h3>
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
                <div key={idx} className="grid grid-cols-2 items-center gap-3 rounded-xl border border-admin-line bg-admin-bg/50 p-3 sm:grid-cols-[minmax(0,1fr)_72px_116px_96px_28px] sm:rounded-2xl sm:p-4">
                  <input
                    type="text"
                    placeholder="Descripción del servicio"
                    required
                    aria-label="Descripción del servicio"
                    className="col-span-2 w-full border-b border-admin-line/60 bg-transparent p-0 pb-2 text-sm font-medium text-admin-ink outline-none placeholder:text-text-muted/50 focus:border-primary/50 sm:col-span-1 sm:border-b-0 sm:pb-0"
                    value={item.description}
                    onChange={(e) => updateItem(idx, 'description', e.target.value)}
                  />
                  <label className="flex items-center gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted/60">Cant.</span>
                    <input
                      type="number"
                      className="w-11 bg-transparent p-0 text-center text-sm text-admin-ink outline-none"
                      value={item.quantity}
                      min="1"
                      aria-label="Cantidad"
                      onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </label>
                  <label className="flex items-center gap-1.5">
                    <span className="text-xs text-text-muted">$</span>
                    <input
                      type="number"
                      placeholder="Precio"
                      className="w-20 bg-transparent p-0 text-right font-mono text-sm text-admin-ink outline-none placeholder:text-text-muted/40"
                      value={item.price}
                      step="0.01"
                      aria-label="Precio unitario"
                      onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                    />
                  </label>
                  <div className="col-span-2 text-right font-mono text-sm font-black text-primary sm:col-span-1">
                    ${(item.quantity * item.price).toFixed(2)}
                  </div>
                  {formData.items.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      aria-label="Eliminar ítem"
                      className="justify-self-end p-0 text-admin-danger transition-colors hover:text-admin-danger/70"
                    >
                      <Trash2 size={15} />
                    </button>
                  ) : (
                    <span aria-hidden className="hidden sm:block" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-4 sm:gap-8 pt-6 sm:pt-8 border-t border-admin-line">
            <div className="flex-1 w-full">
              <label className="block text-xs sm:text-sm font-bold mb-2 text-admin-ink">Notas / Instrucciones de pago</label>
              <textarea 
                className="w-full bg-admin-bg border border-admin-line rounded-xl sm:rounded-2xl p-3 sm:p-4 outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px] sm:min-h-[100px] text-xs sm:text-sm text-admin-ink placeholder:text-text-muted/50 resize-none"
                placeholder="Ej: Favor consignar a la cuenta Nequi..."
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
            <div className="w-full lg:w-64 space-y-2 sm:space-y-3">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-text-muted">Subtotal</span>
                <span className="font-mono text-admin-ink">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-text-muted">Impuestos (0%)</span>
                <span className="font-mono text-admin-ink">$0.00</span>
              </div>
              <div className="flex justify-between text-lg sm:text-xl font-black pt-2 sm:pt-3 border-t border-admin-line">
                <span className="text-admin-ink">TOTAL</span>
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
