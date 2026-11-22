'use client';

import React, { useState } from 'react';
import { Dialog, AdminButton, Input } from '@/components/admin/ui';
import { AdminApiError } from '@/lib/admin/client-fetch';
import { claveDeFormulario } from './claveDeFormulario';

export interface CategoryFormValues {
  slug: string;
  name: { es: string; en: string };
}

export interface CategoryFormInitial {
  slug: string;
  name: { es?: string; en?: string };
}

function vacio(): CategoryFormValues {
  return { slug: '', name: { es: '', en: '' } };
}

function desdeInicial(inicial: CategoryFormInitial): CategoryFormValues {
  return { slug: inicial.slug, name: { es: inicial.name.es ?? '', en: inicial.name.en ?? '' } };
}

export interface EducationCategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  initial?: CategoryFormInitial | null;
}

/** Diálogo de alta/edición de categoría de educación (T-11, patrón de T-09). */
export function EducationCategoryFormDialog(props: EducationCategoryFormDialogProps) {
  // Remonta el formulario en cada apertura en vez de sincronizar
  // props -> estado en un efecto. Ver `claveDeFormulario`.
  return <CategoryForm key={claveDeFormulario(props.open, props.initial?.slug)} {...props} />;
}

function CategoryForm({ open, onClose, onSubmit, initial }: EducationCategoryFormDialogProps) {
  const esEdicion = Boolean(initial);
  const [values, setValues] = useState<CategoryFormValues>(() => (initial ? desdeInicial(initial) : vacio()));
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

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
      title={esEdicion ? 'Editar categoría' : 'Nueva categoría'}
      size="sm"
      footer={
        <>
          <AdminButton type="button" variant="ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </AdminButton>
          <AdminButton type="submit" form="education-category-form" variant="primary" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar'}
          </AdminButton>
        </>
      }
    >
      <form id="education-category-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
        {formError && (
          <p role="alert" className="rounded-field border border-admin-danger/30 bg-admin-danger/10 px-3.5 py-2.5 text-sm font-medium text-admin-danger">
            {formError}
          </p>
        )}

        <Input
          label="Slug"
          hint="Minúsculas, números y guiones."
          value={values.slug}
          onChange={(e) => setValues((v) => ({ ...v, slug: e.target.value }))}
          error={fieldErrors.slug}
          required
        />
        <Input
          label="Nombre (es)"
          value={values.name.es}
          onChange={(e) => setValues((v) => ({ ...v, name: { ...v.name, es: e.target.value } }))}
          error={fieldErrors.name}
          required
        />
        <Input
          label="Name (en)"
          hint="Si queda vacío, se usa el texto en español."
          value={values.name.en}
          onChange={(e) => setValues((v) => ({ ...v, name: { ...v.name, en: e.target.value } }))}
        />
      </form>
    </Dialog>
  );
}
