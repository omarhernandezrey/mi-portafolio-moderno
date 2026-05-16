'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Link as LinkIcon, CheckCircle, Loader2, Eye, EyeOff, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const ALL_EVENTS = [
  { value: 'lead.created', label: 'Lead creado', desc: 'Cuando un nuevo lead se registra' },
  { value: 'lead.updated', label: 'Lead actualizado', desc: 'Cambio de estado o datos del lead' },
  { value: 'lead.paid', label: 'Lead pagado', desc: 'Cuando un lead marca pago completado' },
  { value: 'conversation.started', label: 'Conversación iniciada', desc: 'Nuevo chat con el bot' },
  { value: 'ticket.created', label: 'Ticket creado', desc: 'Nuevo ticket de soporte' },
  { value: 'ticket.closed', label: 'Ticket cerrado', desc: 'Cuando se cierra un ticket' },
  { value: 'invoice.created', label: 'Factura generada', desc: 'Nueva factura emitida' },
  { value: 'subscriber.confirmed', label: 'Suscriptor confirmado', desc: 'Confirmación de email del newsletter' },
  { value: 'ping', label: 'Ping (test)', desc: 'Solo para verificar conectividad' },
];

function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 48 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function NewWebhookPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['ping']);
  const [secret, setSecret] = useState(generateSecret());
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const toggleEvent = (event: string) => {
    setSelectedEvents(prev =>
      prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
    );
  };

  const selectAll = () => setSelectedEvents(ALL_EVENTS.map(e => e.value));
  const clearAll = () => setSelectedEvents([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) { setError('La URL es obligatoria.'); return; }
    if (selectedEvents.length === 0) { setError('Selecciona al menos un evento.'); return; }
    setError('');
    setLoading(true);

    const res = await fetch('/api/admin/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, events: selectedEvents, secret }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === 'string' ? data.error : 'Error al crear el webhook.');
      return;
    }

    setDone(true);
    setTimeout(() => router.push('/admin/webhooks'), 1200);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
          <CheckCircle size={40} className="text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white-custom">Webhook creado</h2>
          <p className="text-text-muted text-sm mt-1">Redirigiendo a webhooks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/webhooks"
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-white-custom transition-all"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/60">Integraciones</p>
          <h1 className="text-3xl font-black text-white-custom tracking-tight">Nuevo Webhook</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* URL */}
        <div className="bg-card-bg rounded-[28px] border border-white/5 p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <LinkIcon size={18} />
            </div>
            <h2 className="font-bold text-white-custom">Endpoint</h2>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-black text-text-muted">
              URL de destino <span className="text-primary">*</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              className="w-full bg-background/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white-custom placeholder:text-text-muted/30 outline-none focus:border-primary/40 transition-all font-mono"
              required
            />
            <p className="text-[10px] text-text-muted/40">
              Debe ser una URL HTTPS accesible públicamente
            </p>
          </div>

          {/* Secret */}
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest font-black text-text-muted">
              Secreto HMAC-SHA256
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={secret}
                  onChange={e => setSecret(e.target.value)}
                  className="w-full bg-background/60 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-white-custom font-mono outline-none focus:border-primary/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted/40 hover:text-text-muted transition-colors"
                >
                  {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setSecret(generateSecret())}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-text-muted hover:text-white-custom transition-all"
              >
                <RefreshCw size={13} />
                Regenerar
              </button>
            </div>
            <p className="text-[10px] text-text-muted/40">
              Úsalo en tu endpoint para verificar la firma del header <code className="text-primary/70">X-Webhook-Signature</code>
            </p>
          </div>
        </div>

        {/* Events */}
        <div className="bg-card-bg rounded-[28px] border border-white/5 p-6 sm:p-8 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white-custom">Eventos</h2>
            <div className="flex gap-2">
              <button type="button" onClick={selectAll} className="text-[10px] uppercase tracking-widest font-black text-primary/60 hover:text-primary transition-colors">
                Todos
              </button>
              <span className="text-text-muted/20">|</span>
              <button type="button" onClick={clearAll} className="text-[10px] uppercase tracking-widest font-black text-text-muted/40 hover:text-text-muted transition-colors">
                Ninguno
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {ALL_EVENTS.map(event => {
              const checked = selectedEvents.includes(event.value);
              return (
                <label
                  key={event.value}
                  className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    checked ? 'bg-primary/5 border-primary/20' : 'bg-background/40 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                    checked ? 'bg-primary border-primary' : 'border-white/20'
                  }`}>
                    {checked && <CheckCircle size={12} className="text-background" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleEvent(event.value)}
                    className="sr-only"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-white-custom">{event.label}</div>
                    <div className="text-[10px] text-text-muted/60 font-medium mt-0.5">{event.desc}</div>
                    <code className="text-[9px] text-primary/50 font-mono mt-1 block">{event.value}</code>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="text-[10px] text-text-muted/40">
            {selectedEvents.length} evento{selectedEvents.length !== 1 ? 's' : ''} seleccionado{selectedEvents.length !== 1 ? 's' : ''}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pb-8">
          <Link
            href="/admin/webhooks"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-text-muted hover:text-white-custom transition-all"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 sm:flex-none sm:min-w-[200px] flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl bg-primary text-background text-sm font-black hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
            {loading ? 'Guardando...' : 'Crear Webhook'}
          </button>
        </div>
      </form>
    </div>
  );
}
