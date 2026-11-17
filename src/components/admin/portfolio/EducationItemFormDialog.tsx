'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, AdminButton, Input, Select, Checkbox, Tabs, TabPanel } from '@/components/admin/ui';
import { ImageField } from './ImageField';
import { AdminApiError } from '@/lib/admin/client-fetch';

export interface ItemFormValues {
  category_id: string;
  slug: string;
  title: { es: string; en: string };
  institution: { es: string; en: string };
  duration: { es: string; en: string };
  description: { es: string; en: string };
  logo: string;
  logo_data_url: string;
  certificate_url: string;
  certificate_data_url: string;
  is_new: boolean;
}

export interface ItemFormInitial {
  category_id: string;
  slug: string;
  title: { es?: string; en?: string };
  institution: { es?: string; en?: string } | null;
  duration: { es?: string; en?: string } | null;
  description: { es?: string; en?: string } | null;
  logo: string | null;
  certificate_url: string | null;
  is_new: boolean;
}

function vacio(categoriaPorDefecto: string): ItemFormValues {
  return {
    category_id: categoriaPorDefecto,
    slug: '',
    title: { es: '', en: '' },
    institution: { es: '', en: '' },
    duration: { es: '', en: '' },
    description: { es: '', en: '' },
    logo: '',
    logo_data_url: '',
    certificate_url: '',
    certificate_data_url: '',
    is_new: false,
  };
}

function desdeInicial(inicial: ItemFormInitial): ItemFormValues {
  return {
    category_id: inicial.category_id,
    slug: inicial.slug,
    title: { es: inicial.title.es ?? '', en: inicial.title.en ?? '' },
    institution: { es: inicial.institution?.es ?? '', en: inicial.institution?.en ?? '' },
    duration: { es: inicial.duration?.es ?? '', en: inicial.duration?.en ?? '' },
    description: { es: inicial.description?.es ?? '', en: inicial.description?.en ?? '' },
    logo: inicial.logo ?? '',
    logo_data_url: '',
    certificate_url: inicial.certificate_url ?? '',
    certificate_data_url: '',
    is_new: inicial.is_new,
  };
}

export interface EducationItemFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ItemFormValues) => Promise<void>;
  initial?: ItemFormInitial | null;
  categorias: ReadonlyArray<{ id: string; label: string }>;
}

/** Diálogo de alta/edición de un curso de educación (T-11, patrón de T-09). */
export function EducationItemFormDialog({ open, onClose, onSubmit, initial, categorias }: EducationItemFormDialogProps) {
  const esEdicion = Boolean(initial);
  const [values, setValues] = useState<ItemFormValues>(() =>
    initial ? desdeInicial(initial) : vacio(categorias[0]?.id ?? ''),
  );
  const [idioma, setIdioma] = useState<'es' | 'en'>('es');
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (open) {
      setValues(initial ? desdeInicial(initial) : vacio(categorias[0]?.id ?? ''));
      setIdioma('es');
      setFieldErrors({});
      setFormError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  function set<K extends keyof ItemFormValues>(key: K, value: ItemFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function setLocalizado(campo: 'title' | 'institution' | 'duration' | 'description', idiomaCampo: 'es' | 'en', texto: string) {
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
      title={esEdicion ? 'Editar curso' : 'Nuevo curso'}
      description="El título en español es obligatorio; si el inglés queda vacío, el sitio muestra el texto en español."
      size="lg"
      footer={
        <>
          <AdminButton type="button" variant="ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </AdminButton>
          <AdminButton type="submit" form="education-item-form" variant="primary" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar'}
          </AdminButton>
        </>
      }
    >
      <form id="education-item-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
        {formError && (
          <p role="alert" className="rounded-field border border-admin-danger/30 bg-admin-danger/10 px-3.5 py-2.5 text-sm font-medium text-admin-danger">
            {formError}
          </p>
        )}

        <Select
          label="Categoría"
          value={values.category_id}
          onChange={(e) => set('category_id', e.target.value)}
          options={categorias.map((c) => ({ value: c.id, label: c.label }))}
          error={fieldErrors.category_id}
          required
        />

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
          <Input label="Duración (es)" hint="p. ej. «2023 - 2024»." value={values.duration.es} onChange={(e) => setLocalizado('duration', 'es', e.target.value)} />
          <Input label="Descripción (es)" value={values.description.es} onChange={(e) => setLocalizado('description', 'es', e.target.value)} />
        </TabPanel>

        <TabPanel tabId="en" activeId={idioma} className="flex flex-col gap-4">
          <Input label="Title (en)" hint="Si queda vacío, se usa el texto en español." value={values.title.en} onChange={(e) => setLocalizado('title', 'en', e.target.value)} />
          <Input label="Institution (en)" value={values.institution.en} onChange={(e) => setLocalizado('institution', 'en', e.target.value)} />
          <Input label="Duration (en)" value={values.duration.en} onChange={(e) => setLocalizado('duration', 'en', e.target.value)} />
          <Input label="Description (en)" value={values.description.en} onChange={(e) => setLocalizado('description', 'en', e.target.value)} />
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

        <Checkbox
          label="Marcar como nuevo"
          checked={values.is_new}
          onChange={(e) => set('is_new', e.target.checked)}
        />
      </form>
    </Dialog>
  );
}
