'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, AdminButton, Input, Textarea, Tabs, TabPanel } from '@/components/admin/ui';
import { AdminApiError } from '@/lib/admin/client-fetch';

export interface ServiceFormValues {
  slug: string;
  title: { es: string; en: string };
  description: { es: string; en: string };
  icon: string;
  badge: string;
  featuresEs: string;
  featuresEn: string;
  gradient: string;
  price_min: string;
  price_max: string;
  price_currency: string;
}

export interface ServiceFormInitial {
  slug: string;
  title: { es?: string; en?: string };
  description: { es?: string; en?: string } | null;
  icon: string | null;
  badge: string | null;
  features: { es?: string[]; en?: string[] } | null;
  gradient: string | null;
  price_min: number | null;
  price_max: number | null;
  price_currency: string | null;
}

function vacio(): ServiceFormValues {
  return {
    slug: '',
    title: { es: '', en: '' },
    description: { es: '', en: '' },
    icon: '',
    badge: '',
    featuresEs: '',
    featuresEn: '',
    gradient: '',
    price_min: '',
    price_max: '',
    price_currency: '',
  };
}

function desdeInicial(inicial: ServiceFormInitial): ServiceFormValues {
  return {
    slug: inicial.slug,
    title: { es: inicial.title.es ?? '', en: inicial.title.en ?? '' },
    description: { es: inicial.description?.es ?? '', en: inicial.description?.en ?? '' },
    icon: inicial.icon ?? '',
    badge: inicial.badge ?? '',
    featuresEs: (inicial.features?.es ?? []).join('\n'),
    featuresEn: (inicial.features?.en ?? []).join('\n'),
    gradient: inicial.gradient ?? '',
    price_min: inicial.price_min != null ? String(inicial.price_min) : '',
    price_max: inicial.price_max != null ? String(inicial.price_max) : '',
    price_currency: inicial.price_currency ?? '',
  };
}

function lineasNoVacias(texto: string): string[] {
  return texto
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Convierte el estado del formulario al cuerpo que espera la API. */
export function aCuerpoDeApi(values: ServiceFormValues) {
  const featuresEs = lineasNoVacias(values.featuresEs);
  const featuresEn = lineasNoVacias(values.featuresEn);
  return {
    slug: values.slug,
    title: values.title,
    description: values.description,
    icon: values.icon,
    badge: values.badge,
    features: featuresEs.length > 0 || featuresEn.length > 0 ? { es: featuresEs, en: featuresEn } : null,
    gradient: values.gradient,
    price_min: values.price_min.trim() === '' ? null : Number(values.price_min),
    price_max: values.price_max.trim() === '' ? null : Number(values.price_max),
    price_currency: values.price_currency.trim() === '' ? null : values.price_currency.trim(),
  };
}

export interface ServiceFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (body: ReturnType<typeof aCuerpoDeApi>) => Promise<void>;
  initial?: ServiceFormInitial | null;
}

/** Diálogo de alta/edición de servicio (T-12, patrón de T-09). `features` se edita como una línea por elemento. */
export function ServiceFormDialog({ open, onClose, onSubmit, initial }: ServiceFormDialogProps) {
  const esEdicion = Boolean(initial);
  const [values, setValues] = useState<ServiceFormValues>(() => (initial ? desdeInicial(initial) : vacio()));
  const [idioma, setIdioma] = useState<'es' | 'en'>('es');
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (open) {
      setValues(initial ? desdeInicial(initial) : vacio());
      setIdioma('es');
      setFieldErrors({});
      setFormError('');
    }
  }, [open, initial]);

  function set<K extends keyof ServiceFormValues>(key: K, value: ServiceFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function setLocalizado(campo: 'title' | 'description', idiomaCampo: 'es' | 'en', texto: string) {
    setValues((prev) => ({ ...prev, [campo]: { ...prev[campo], [idiomaCampo]: texto } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFormError('');
    setFieldErrors({});

    try {
      await onSubmit(aCuerpoDeApi(values));
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 400 && err.body && typeof err.body === 'object') {
        const body = err.body as { error?: Record<string, string[]> | string };
        if (typeof body.error === 'object') {
          const plano: Record<string, string> = {};
          for (const [campo, mensajes] of Object.entries(body.error)) plano[campo] = mensajes[0] ?? 'Valor inválido';
          setFieldErrors(plano);
          setFormError('Revisa los campos marcados.');
        } else {
          setFormError(body.error || 'No se pudo guardar.');
        }
      } else {
        setFormError(err instanceof Error ? err.message : 'No se pudo guardar.');
      }
      return;
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={busy ? () => {} : onClose}
      title={esEdicion ? 'Editar servicio' : 'Nuevo servicio'}
      description="El título en español es obligatorio; si el inglés queda vacío, el sitio muestra el texto en español."
      size="lg"
      footer={
        <>
          <AdminButton type="button" variant="ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </AdminButton>
          <AdminButton type="submit" form="service-form" variant="primary" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar'}
          </AdminButton>
        </>
      }
    >
      <form id="service-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
        {formError && (
          <p role="alert" className="rounded-field border border-admin-danger/30 bg-admin-danger/10 px-3.5 py-2.5 text-sm font-medium text-admin-danger">
            {formError}
          </p>
        )}

        <Input label="Slug" hint="Minúsculas, números y guiones." value={values.slug} onChange={(e) => set('slug', e.target.value)} error={fieldErrors.slug} required />
        <Input label="Insignia" hint="p. ej. «WEB», «APP». Opcional." value={values.badge} onChange={(e) => set('badge', e.target.value)} />

        <Tabs
          items={[
            { id: 'es', label: 'Español' },
            { id: 'en', label: 'English' },
          ]}
          activeId={idioma}
          onChange={(id) => setIdioma(id as 'es' | 'en')}
          ariaLabel="Idioma de los campos bilingües"
        />

        <TabPanel tabId="es" activeId={idioma} className="flex flex-col gap-4">
          <Input label="Título (es)" value={values.title.es} onChange={(e) => setLocalizado('title', 'es', e.target.value)} error={fieldErrors.title} required />
          <Textarea label="Descripción (es)" value={values.description.es} onChange={(e) => setLocalizado('description', 'es', e.target.value)} rows={3} />
          <Textarea
            label="Características (es)"
            hint="Una por línea."
            value={values.featuresEs}
            onChange={(e) => set('featuresEs', e.target.value)}
            rows={4}
          />
        </TabPanel>

        <TabPanel tabId="en" activeId={idioma} className="flex flex-col gap-4">
          <Input label="Title (en)" hint="Si queda vacío, se usa el texto en español." value={values.title.en} onChange={(e) => setLocalizado('title', 'en', e.target.value)} />
          <Textarea label="Description (en)" value={values.description.en} onChange={(e) => setLocalizado('description', 'en', e.target.value)} rows={3} />
          <Textarea label="Features (en)" hint="Una por línea." value={values.featuresEn} onChange={(e) => set('featuresEn', e.target.value)} rows={4} />
        </TabPanel>

        <Input label="Icono" hint="Ruta en public/images/services/. Opcional." list="iconos-de-servicios" value={values.icon} onChange={(e) => set('icon', e.target.value)} />
        <datalist id="iconos-de-servicios">
          {['frontend', 'backend', 'devops', 'design'].map((n) => (
            <option key={n} value={`/images/services/${n}.svg`} />
          ))}
        </datalist>

        <Input
          label="Degradado"
          hint="Dato del contenido (no un token de interfaz), p. ej. «from-blue-500 to-cyan-500»."
          value={values.gradient}
          onChange={(e) => set('gradient', e.target.value)}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Precio mínimo" type="number" min={0} value={values.price_min} onChange={(e) => set('price_min', e.target.value)} error={fieldErrors.price_min} />
          <Input label="Precio máximo" type="number" min={0} value={values.price_max} onChange={(e) => set('price_max', e.target.value)} error={fieldErrors.price_max} />
          <Input label="Moneda" hint="p. ej. USD." value={values.price_currency} onChange={(e) => set('price_currency', e.target.value)} />
        </div>
      </form>
    </Dialog>
  );
}
