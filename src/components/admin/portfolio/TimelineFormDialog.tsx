'use client';

import React, { useState } from 'react';
import { Dialog, AdminButton, Input, Select, Tabs, TabPanel } from '@/components/admin/ui';
import { AdminApiError } from '@/lib/admin/client-fetch';
import { portfolioIconRegistry } from '@/lib/portfolio/source/icon-registry';
import { claveDeFormulario } from './claveDeFormulario';

export interface TimelineFormValues {
  slug: string;
  year: { es: string; en: string };
  title: { es: string; en: string };
  description: { es: string; en: string };
  icon_key: string;
}

export interface TimelineFormInitial {
  slug: string;
  year: { es?: string; en?: string };
  title: { es?: string; en?: string };
  description: { es?: string; en?: string } | null;
  icon_key: string | null;
}

const CLAVES_DE_ICONO = Object.keys(portfolioIconRegistry).sort((a, b) => a.localeCompare(b));

function vacio(): TimelineFormValues {
  return { slug: '', year: { es: '', en: '' }, title: { es: '', en: '' }, description: { es: '', en: '' }, icon_key: '' };
}

function desdeInicial(inicial: TimelineFormInitial): TimelineFormValues {
  return {
    slug: inicial.slug,
    year: { es: inicial.year.es ?? '', en: inicial.year.en ?? '' },
    title: { es: inicial.title.es ?? '', en: inicial.title.en ?? '' },
    description: { es: inicial.description?.es ?? '', en: inicial.description?.en ?? '' },
    icon_key: inicial.icon_key ?? '',
  };
}

export interface TimelineFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TimelineFormValues) => Promise<void>;
  initial?: TimelineFormInitial | null;
}

/** Diálogo de alta/edición de hito del timeline (T-12, patrón de T-09). `year` es bilingüe: el hito "Presente" traduce el año. */
export function TimelineFormDialog(props: TimelineFormDialogProps) {
  // Remonta el formulario en cada apertura en vez de sincronizar
  // props -> estado en un efecto. Ver `claveDeFormulario`.
  return <TimelineForm key={claveDeFormulario(props.open, props.initial?.slug)} {...props} />;
}

function TimelineForm({ open, onClose, onSubmit, initial }: TimelineFormDialogProps) {
  const esEdicion = Boolean(initial);
  const [values, setValues] = useState<TimelineFormValues>(() => (initial ? desdeInicial(initial) : vacio()));
  const [idioma, setIdioma] = useState<'es' | 'en'>('es');
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  function set<K extends keyof TimelineFormValues>(key: K, value: TimelineFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function setLocalizado(campo: 'year' | 'title' | 'description', idiomaCampo: 'es' | 'en', texto: string) {
    setValues((prev) => ({ ...prev, [campo]: { ...prev[campo], [idiomaCampo]: texto } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFormError('');
    setFieldErrors({});

    try {
      await onSubmit(values);
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
      title={esEdicion ? 'Editar hito' : 'Nuevo hito'}
      description="El año y el título en español son obligatorios; si el inglés queda vacío, el sitio muestra el texto en español."
      size="lg"
      footer={
        <>
          <AdminButton type="button" variant="ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </AdminButton>
          <AdminButton type="submit" form="timeline-form" variant="primary" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar'}
          </AdminButton>
        </>
      }
    >
      <form id="timeline-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
        {formError && (
          <p role="alert" className="rounded-field border border-admin-danger/30 bg-admin-danger/10 px-3.5 py-2.5 text-sm font-medium text-admin-danger">
            {formError}
          </p>
        )}

        <Input label="Slug" hint="Minúsculas, números y guiones." value={values.slug} onChange={(e) => set('slug', e.target.value)} error={fieldErrors.slug} required />

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
          <Input label="Año (es)" hint="p. ej. «2024» o «2025 - Presente»." value={values.year.es} onChange={(e) => setLocalizado('year', 'es', e.target.value)} error={fieldErrors.year} required />
          <Input label="Título (es)" value={values.title.es} onChange={(e) => setLocalizado('title', 'es', e.target.value)} error={fieldErrors.title} required />
          <Input label="Descripción (es)" value={values.description.es} onChange={(e) => setLocalizado('description', 'es', e.target.value)} />
        </TabPanel>

        <TabPanel tabId="en" activeId={idioma} className="flex flex-col gap-4">
          <Input label="Year (en)" hint="Si queda vacío, se usa el texto en español." value={values.year.en} onChange={(e) => setLocalizado('year', 'en', e.target.value)} />
          <Input label="Title (en)" value={values.title.en} onChange={(e) => setLocalizado('title', 'en', e.target.value)} />
          <Input label="Description (en)" value={values.description.en} onChange={(e) => setLocalizado('description', 'en', e.target.value)} />
        </TabPanel>

        <Select
          label="Clave de icono"
          placeholder="Elegir…"
          value={values.icon_key}
          onChange={(e) => set('icon_key', e.target.value)}
          options={CLAVES_DE_ICONO.map((clave) => ({ value: clave, label: clave }))}
          error={fieldErrors.icon_key}
        />
      </form>
    </Dialog>
  );
}
