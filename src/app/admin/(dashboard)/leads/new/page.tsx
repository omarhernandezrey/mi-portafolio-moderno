'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User, Mail, Phone, Building2, DollarSign, Calendar,
  Briefcase, FileText, ArrowLeft, CheckCircle, Loader2, Tag
} from 'lucide-react';
import Link from 'next/link';

const SERVICE_OPTIONS = [
  'Desarrollo Web Full Stack',
  'Landing Page / Sitio Corporativo',
  'E-commerce / Tienda Online',
  'API REST / Backend',
  'Integración de IA / Chatbot',
  'Consultoría Técnica',
  'Mantenimiento / Soporte',
  'Otro',
];

const TIMELINE_OPTIONS = [
  'Inmediato (esta semana)',
  '1-2 semanas',
  '1 mes',
  '2-3 meses',
  '+3 meses',
  'Sin fecha definida',
];

const INDUSTRY_OPTIONS = [
  'Tecnología',
  'E-commerce',
  'Salud',
  'Educación',
  'Finanzas',
  'Inmobiliaria',
  'Restaurantes / Gastronomía',
  'Logística',
  'Legal',
  'Marketing / Publicidad',
  'Otro',
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  budget: string;
  timeline: string;
  service_requested: string;
  notes: string;
  type: 'client' | 'recruiter' | 'other';
  status: 'new' | 'contacted' | 'paid' | 'lost' | 'cold' | 'archived';
  industry: string;
}

const INITIAL: FormData = {
  name: '',
  email: '',
  phone: '',
  company: '',
  budget: '',
  timeline: '',
  service_requested: '',
  notes: '',
  type: 'client',
  status: 'new',
  industry: '',
};

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] uppercase tracking-widest font-black text-text-muted">
        {label}
        {required && <span className="text-primary ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass = "w-full bg-background/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white-custom placeholder:text-text-muted/30 outline-none focus:border-primary/40 transition-all";

export default function NewLeadPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      setError('Nombre y email son obligatorios.');
      return;
    }
    setError('');
    setLoading(true);

    const res = await fetch('/api/admin/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        phone: form.phone || undefined,
        company: form.company || undefined,
        budget: form.budget || undefined,
        timeline: form.timeline || undefined,
        service_requested: form.service_requested || undefined,
        notes: form.notes || undefined,
        industry: form.industry || undefined,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === 'string' ? data.error : 'Error al crear el lead.');
      return;
    }

    const lead = await res.json();
    setDone(true);
    setTimeout(() => router.push(`/admin/leads/${lead.id}`), 1200);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
          <CheckCircle size={40} className="text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white-custom">Lead creado</h2>
          <p className="text-text-muted text-sm mt-1">Redirigiendo al perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/leads"
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-white-custom transition-all"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/60">CRM Pipeline</p>
          <h1 className="text-3xl font-black text-white-custom tracking-tight">Nuevo Lead</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Identidad */}
        <div className="bg-card-bg rounded-[28px] border border-white/5 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <User size={18} />
            </div>
            <h2 className="font-bold text-white-custom">Identidad</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Nombre completo" required>
              <div className="relative">
                <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/40" />
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Juan García"
                  className={`${inputClass} pl-10`}
                  required
                />
              </div>
            </Field>
            <Field label="Email" required>
              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/40" />
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="juan@empresa.com"
                  className={`${inputClass} pl-10`}
                  required
                />
              </div>
            </Field>
            <Field label="Teléfono / WhatsApp">
              <div className="relative">
                <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/40" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="+57 300 123 4567"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </Field>
            <Field label="Empresa / Organización">
              <div className="relative">
                <Building2 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/40" />
                <input
                  type="text"
                  value={form.company}
                  onChange={set('company')}
                  placeholder="Startup SAS"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </Field>
          </div>

          {/* Tipo + Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Tipo de contacto">
              <div className="flex gap-2">
                {(['client', 'recruiter', 'other'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, type: t }))}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                      form.type === t
                        ? 'bg-primary/10 border-primary/40 text-primary'
                        : 'bg-background/50 border-white/10 text-text-muted hover:border-white/20'
                    }`}
                  >
                    {t === 'client' ? 'Cliente' : t === 'recruiter' ? 'Reclutador' : 'Otro'}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Estado inicial">
              <select value={form.status} onChange={set('status')} className={inputClass}>
                <option value="new">Nuevo</option>
                <option value="contacted">Contactado</option>
                <option value="cold">Sin Acción</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Proyecto */}
        <div className="bg-card-bg rounded-[28px] border border-white/5 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-accent/10 text-accent">
              <Briefcase size={18} />
            </div>
            <h2 className="font-bold text-white-custom">Proyecto</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Servicio solicitado">
              <select value={form.service_requested} onChange={set('service_requested')} className={inputClass}>
                <option value="">Seleccionar...</option>
                {SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Industria / Sector">
              <div className="relative">
                <Tag size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/40" />
                <select value={form.industry} onChange={set('industry')} className={`${inputClass} pl-10`}>
                  <option value="">Seleccionar...</option>
                  {INDUSTRY_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </Field>
            <Field label="Presupuesto estimado">
              <div className="relative">
                <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/40" />
                <input
                  type="text"
                  value={form.budget}
                  onChange={set('budget')}
                  placeholder="$1,000 - $3,000 USD"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </Field>
            <Field label="Timeline / Urgencia">
              <div className="relative">
                <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/40" />
                <select value={form.timeline} onChange={set('timeline')} className={`${inputClass} pl-10`}>
                  <option value="">Seleccionar...</option>
                  {TIMELINE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </Field>
          </div>
        </div>

        {/* Notas */}
        <div className="bg-card-bg rounded-[28px] border border-white/5 p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/5 text-text-muted">
              <FileText size={18} />
            </div>
            <h2 className="font-bold text-white-custom">Notas internas</h2>
          </div>
          <textarea
            value={form.notes}
            onChange={set('notes')}
            rows={4}
            placeholder="Contexto adicional, referencias, cómo llegó este contacto..."
            className={`${inputClass} resize-none`}
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pb-8">
          <Link
            href="/admin/leads"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-text-muted hover:text-white-custom transition-all text-center"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 sm:flex-none sm:min-w-[200px] flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl bg-primary text-background text-sm font-black hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
            {loading ? 'Guardando...' : 'Crear Lead'}
          </button>
        </div>
      </form>
    </div>
  );
}
