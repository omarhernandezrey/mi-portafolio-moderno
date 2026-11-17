'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, AdminButton, Input, Select } from '@/components/admin/ui';
import { AdminApiError } from '@/lib/admin/client-fetch';
import { portfolioIconRegistry } from '@/lib/portfolio/source/icon-registry';

export interface TechnologyFormValues {
  name: string;
  icon_key: string;
  color: string;
  category: string;
}

export interface TechnologyFormInitial {
  name: string;
  icon_key: string | null;
  color: string | null;
  category: string | null;
}

const CLAVES_DE_ICONO = Object.keys(portfolioIconRegistry).sort((a, b) => a.localeCompare(b));

function vacio(): TechnologyFormValues {
  return { name: '', icon_key: '', color: '#00cba9', category: '' };
}

function desdeInicial(inicial: TechnologyFormInitial): TechnologyFormValues {
  return {
    name: inicial.name,
    icon_key: inicial.icon_key ?? '',
    color: inicial.color || '#00cba9',
    category: inicial.category ?? '',
  };
}

export interface TechnologyFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TechnologyFormValues) => Promise<void>;
  initial?: TechnologyFormInitial | null;
}

/** Diálogo de alta/edición de tecnología del marquee (T-12, patrón de T-09). Sin pestañas es/en: `name` no es bilingüe. */
export function TechnologyFormDialog({ open, onClose, onSubmit, initial }: TechnologyFormDialogProps) {
  const esEdicion = Boolean(initial);
  const [values, setValues] = useState<TechnologyFormValues>(() => (initial ? desdeInicial(initial) : vacio()));
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (open) {
      setValues(initial ? desdeInicial(initial) : vacio());
      setFieldErrors({});
      setFormError('');
    }
  }, [open, initial]);

  function set<K extends keyof TechnologyFormValues>(key: K, value: TechnologyFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
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
      title={esEdicion ? 'Editar tecnología' : 'Nueva tecnología'}
      description="El nombre es la identidad: se muestra literal en el tooltip de la cintilla."
      size="md"
      footer={
        <>
          <AdminButton type="button" variant="ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </AdminButton>
          <AdminButton type="submit" form="technology-form" variant="primary" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar'}
          </AdminButton>
        </>
      }
    >
      <form id="technology-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
        {formError && (
          <p role="alert" className="rounded-field border border-admin-danger/30 bg-admin-danger/10 px-3.5 py-2.5 text-sm font-medium text-admin-danger">
            {formError}
          </p>
        )}

        <Input label="Nombre" hint="p. ej. «Next.js», «Vue.js»." value={values.name} onChange={(e) => set('name', e.target.value)} error={fieldErrors.name} required />

        <Select
          label="Clave de icono"
          placeholder="Elegir…"
          value={values.icon_key}
          onChange={(e) => set('icon_key', e.target.value)}
          options={CLAVES_DE_ICONO.map((clave) => ({ value: clave, label: clave }))}
          error={fieldErrors.icon_key}
        />

        <Input label="Categoría" hint="p. ej. «Frontend», «Backend», «Base de datos»." value={values.category} onChange={(e) => set('category', e.target.value)} />

        <div className="flex items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tech-color-picker" className="text-label font-semibold text-admin-ink">
              Elegir
            </label>
            <input
              id="tech-color-picker"
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(values.color) ? values.color : '#00cba9'}
              onChange={(e) => set('color', e.target.value)}
              className="h-11 w-14 shrink-0 cursor-pointer rounded-field border border-admin-line bg-transparent p-1"
            />
          </div>
          <Input
            label="Color (hex)"
            hint="Dato del contenido (el color de marca de esa tecnología), no un token de la interfaz."
            value={values.color}
            onChange={(e) => set('color', e.target.value)}
            error={fieldErrors.color}
            placeholder="#00cba9"
            containerClassName="flex-1"
          />
        </div>
      </form>
    </Dialog>
  );
}
