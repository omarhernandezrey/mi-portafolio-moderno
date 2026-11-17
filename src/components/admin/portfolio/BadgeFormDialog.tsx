'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, AdminButton, Input, Checkbox, Tabs, TabPanel } from '@/components/admin/ui';
import { ImageField } from './ImageField';
import { AdminApiError } from '@/lib/admin/client-fetch';

export interface BadgeFormValues {
  slug: string;
  title: { es: string; en: string };
  institution: { es: string; en: string };
  summary: { es: string; en: string };
  logo: string;
  logo_data_url: string;
  certificate_url: string;
  certificate_data_url: string;
  is_new: boolean;
}

export interface BadgeFormInitial {
  slug: string;
  title: { es?: string; en?: string };
  institution: { es?: string; en?: string } | null;
  summary: { es?: string; en?: string } | null;
  logo: string | null;
  certificate_url: string | null;
  is_new: boolean;
}

function vacio(): BadgeFormValues {
  return {
    slug: '',
    title: { es: '', en: '' },
    institution: { es: '', en: '' },
    summary: { es: '', en: '' },
    logo: '',
    logo_data_url: '',
    certificate_url: '',
    certificate_data_url: '',
    is_new: false,
  };
}

function desdeInicial(inicial: BadgeFormInitial): BadgeFormValues {
  return {
    slug: inicial.slug,
    title: { es: inicial.title.es ?? '', en: inicial.title.en ?? '' },
    institution: { es: inicial.institution?.es ?? '', en: inicial.institution?.en ?? '' },
    summary: { es: inicial.summary?.es ?? '', en: inicial.summary?.en ?? '' },
    logo: inicial.logo ?? '',
    logo_data_url: '',
    certificate_url: inicial.certificate_url ?? '',
    certificate_data_url: '',
    is_new: inicial.is_new,
  };
}

export interface BadgeFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: BadgeFormValues) => Promise<void>;
  initial?: BadgeFormInitial | null;
}

/** Diálogo de alta/edición de insignia destacada (T-11, patrón de T-09). */
export function BadgeFormDialog({ open, onClose, onSubmit, initial }: BadgeFormDialogProps) {
  const esEdicion = Boolean(initial);
  const [values, setValues] = useState<BadgeFormValues>(() => (initial ? desdeInicial(initial) : vacio()));
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

  function set<K extends keyof BadgeFormValues>(key: K, value: BadgeFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function setLocalizado(campo: 'title' | 'institution' | 'summary', idiomaCampo: 'es' | 'en', texto: string) {
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
      title={esEdicion ? 'Editar insignia' : 'Nueva insignia'}
      description="El título en español es obligatorio; si el inglés queda vacío, el sitio muestra el texto en español."
      size="lg"
      footer={
        <>
          <AdminButton type="button" variant="ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </AdminButton>
          <AdminButton type="submit" form="badge-form" variant="primary" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar'}
          </AdminButton>
        </>
      }
    >
      <form id="badge-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
        {formError && (
          <p role="alert" className="rounded-field border border-admin-danger/30 bg-admin-danger/10 px-3.5 py-2.5 text-sm font-medium text-admin-danger">
            {formError}
          </p>
        )}

        <Input
          label="Slug"
          hint="Minúsculas, números y guiones."
          value={values.slug}
          onChange={(e) => set('slug', e.target.value)}
          error={fieldErrors.slug}
          required
        />

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
          <Input label="Institución (es)" value={values.institution.es} onChange={(e) => setLocalizado('institution', 'es', e.target.value)} />
          <Input label="Resumen (es)" value={values.summary.es} onChange={(e) => setLocalizado('summary', 'es', e.target.value)} />
        </TabPanel>

        <TabPanel tabId="en" activeId={idioma} className="flex flex-col gap-4">
          <Input label="Title (en)" hint="Si queda vacío, se usa el texto en español." value={values.title.en} onChange={(e) => setLocalizado('title', 'en', e.target.value)} />
          <Input label="Institution (en)" value={values.institution.en} onChange={(e) => setLocalizado('institution', 'en', e.target.value)} />
          <Input label="Summary (en)" value={values.summary.en} onChange={(e) => setLocalizado('summary', 'en', e.target.value)} />
        </TabPanel>

        <ImageField
          label="Logo"
          hint="Subido a Storage, o pegado de un dominio permitido."
          urlValue={values.logo}
          onUrlChange={(v) => set('logo', v)}
          pendingDataUrl={values.logo_data_url}
          onFileChange={(v) => set('logo_data_url', v)}
          error={fieldErrors.logo}
        />

        <ImageField
          label="Certificado"
          hint="Subido a Storage, o pegado de un dominio permitido."
          urlValue={values.certificate_url}
          onUrlChange={(v) => set('certificate_url', v)}
          pendingDataUrl={values.certificate_data_url}
          onFileChange={(v) => set('certificate_data_url', v)}
          error={fieldErrors.certificate_url}
        />

        <Checkbox label="Marcar como nueva" checked={values.is_new} onChange={(e) => set('is_new', e.target.checked)} />
      </form>
    </Dialog>
  );
}
