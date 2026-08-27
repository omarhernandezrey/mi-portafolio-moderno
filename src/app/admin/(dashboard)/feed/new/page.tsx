'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Loader2, FileText, Link2, Image as ImageIcon, Pin } from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'status', label: 'Actualización' },
  { value: 'curso', label: 'Curso' },
  { value: 'skill', label: 'Skill' },
  { value: 'proyecto', label: 'Proyecto' },
  { value: 'postulacion', label: 'Postulación laboral' },
];

interface FormData {
  lang: 'es' | 'en';
  category: string;
  title: string;
  body: string;
  link_url: string;
  image_urls: string;
  pinned: boolean;
}

const INITIAL: FormData = {
  lang: 'es',
  category: 'general',
  title: '',
  body: '',
  link_url: '',
  image_urls: '',
  pinned: false,
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

const inputClass =
  'w-full bg-background/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white-custom placeholder:text-text-muted/30 outline-none focus:border-primary/40 transition-all';

export default function NewFeedPostPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.body.trim()) {
      setError('El contenido de la publicación es obligatorio.');
      return;
    }
    setError('');
    setLoading(true);

    const image_urls = form.image_urls
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);

    const res = await fetch('/api/admin/feed/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lang: form.lang,
        category: form.category,
        title: form.title || undefined,
        body: form.body,
        link_url: form.link_url || undefined,
        image_urls,
        pinned: form.pinned,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === 'string' ? data.error : 'Error al crear la publicación.');
      return;
    }

    setDone(true);
    setTimeout(() => router.push('/admin/feed'), 1200);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
          <CheckCircle size={40} className="text-primary" />
        </div>
        <div>
          <h2 className="font-display italic text-2xl font-medium text-white-custom">Publicación creada</h2>
          <p className="text-text-muted text-sm mt-1">Redirigiendo a Comunidad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/feed"
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-white-custom transition-all"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="font-mono-label text-[0.6rem] text-primary/60">Feed Público</p>
          <h1 className="font-display italic text-3xl font-medium text-white-custom tracking-tight">Nueva publicación</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-card-bg rounded-[28px] border border-white/5 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <FileText size={18} />
            </div>
            <h2 className="font-bold text-white-custom">Contenido</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Field label="Idioma" required>
              <select value={form.lang} onChange={set('lang')} className={inputClass}>
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </Field>
            <Field label="Categoría" required>
              <select value={form.category} onChange={set('category')} className={inputClass}>
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Título (opcional)">
            <input
              type="text"
              value={form.title}
              onChange={set('title')}
              placeholder="Ej: Completé el curso de Agile Explorer"
              maxLength={120}
              className={inputClass}
            />
          </Field>

          <Field label="Cuerpo" required>
            <textarea
              value={form.body}
              onChange={set('body')}
              placeholder="Cuenta la novedad..."
              rows={5}
              required
              maxLength={5000}
              className={`${inputClass} resize-none`}
            />
          </Field>

          <Field label="Link (opcional)">
            <div className="relative">
              <Link2 size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/40" />
              <input
                type="url"
                value={form.link_url}
                onChange={set('link_url')}
                placeholder="https://..."
                className={`${inputClass} pl-10`}
              />
            </div>
          </Field>

          <Field label="Imágenes — una URL por línea (opcional, hasta 10)">
            <div className="relative">
              <ImageIcon size={14} className="absolute left-4 top-3.5 text-text-muted/40" />
              <textarea
                value={form.image_urls}
                onChange={set('image_urls')}
                placeholder={'https://...\n/images/...'}
                rows={3}
                className={`${inputClass} pl-10 resize-none`}
              />
            </div>
          </Field>

          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={form.pinned}
              onChange={(e) => setForm((prev) => ({ ...prev, pinned: e.target.checked }))}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-xs font-bold text-text-muted flex items-center gap-1.5">
              <Pin size={13} />
              Fijar al inicio del feed
            </span>
          </label>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-background text-sm font-black hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
          {loading ? 'Publicando...' : 'Publicar'}
        </button>
      </form>
    </div>
  );
}
