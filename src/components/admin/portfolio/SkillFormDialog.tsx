'use client';

import React, { useEffect, useId, useState } from 'react';
import { Dialog, AdminButton, Input, Tabs, TabPanel } from '@/components/admin/ui';
import { AdminApiError } from '@/lib/admin/client-fetch';
import { claveDeFormulario } from './claveDeFormulario';

export interface SkillFormValues {
  slug: string;
  name: { es: string; en: string };
  percentage: number;
  color_hex: string;
  icon: string;
  description: { es: string; en: string };
  category: { es: string; en: string };
}

export interface SkillFormInitial {
  slug: string;
  name: { es?: string; en?: string };
  percentage: number;
  color_hex: string | null;
  icon: string | null;
  description: { es?: string; en?: string } | null;
  category: { es?: string; en?: string } | null;
}

/**
 * Rutas conocidas en `public/images/logos/`. Lista cerrada a mano (no hay
 * forma de leer el disco desde el navegador): si se añade un logo nuevo al
 * repositorio, se añade aquí también.
 */
const LOGOS_CONOCIDOS = [
  'angular', 'aws', 'css', 'django', 'docker', 'express-js', 'figma', 'firebase',
  'git', 'github', 'html', 'javascript', 'jenkins', 'mongodb', 'mysql', 'next-js',
  'nodejs', 'postgresql', 'react-js', 'react', 'sqlite', 'svelte', 'tailwind-css',
  'typescript', 'vite', 'vue-js',
].map((nombre) => `/images/logos/${nombre}.svg`);

function vacio(): SkillFormValues {
  return {
    slug: '',
    name: { es: '', en: '' },
    percentage: 50,
    color_hex: '#00cba9',
    icon: '',
    description: { es: '', en: '' },
    category: { es: '', en: '' },
  };
}

function desdeInicial(inicial: SkillFormInitial): SkillFormValues {
  return {
    slug: inicial.slug,
    name: { es: inicial.name.es ?? '', en: inicial.name.en ?? '' },
    percentage: inicial.percentage,
    color_hex: inicial.color_hex || '#00cba9',
    icon: inicial.icon ?? '',
    description: { es: inicial.description?.es ?? '', en: inicial.description?.en ?? '' },
    category: { es: inicial.category?.es ?? '', en: inicial.category?.en ?? '' },
  };
}

export interface SkillFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: SkillFormValues) => Promise<void>;
  initial?: SkillFormInitial | null;
}

/** Diálogo de alta/edición de skill (T-10, copia el patrón de `ProjectFormDialog` de T-09). */
export function SkillFormDialog(props: SkillFormDialogProps) {
  // Remonta el formulario en cada apertura en vez de sincronizar
  // props -> estado en un efecto. Ver `claveDeFormulario`.
  return <SkillForm key={claveDeFormulario(props.open, props.initial?.slug)} {...props} />;
}

function SkillForm({ open, onClose, onSubmit, initial }: SkillFormDialogProps) {
  const esEdicion = Boolean(initial);
  const [values, setValues] = useState<SkillFormValues>(() => (initial ? desdeInicial(initial) : vacio()));
  const [idioma, setIdioma] = useState<'es' | 'en'>('es');
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const datalistId = useId();

  function set<K extends keyof SkillFormValues>(key: K, value: SkillFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function setLocalizado(campo: 'name' | 'description' | 'category', idiomaCampo: 'es' | 'en', texto: string) {
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
          for (const [campo, mensajes] of Object.entries(body.error)) {
            plano[campo] = mensajes[0] ?? 'Valor inválido';
          }
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
      title={esEdicion ? 'Editar skill' : 'Nueva skill'}
      description="El nombre en español es obligatorio; si el inglés queda vacío, el sitio muestra el texto en español."
      size="lg"
      footer={
        <>
          <AdminButton type="button" variant="ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </AdminButton>
          <AdminButton type="submit" form="skill-form" variant="primary" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar'}
          </AdminButton>
        </>
      }
    >
      <form id="skill-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
        {formError && (
          <p role="alert" className="rounded-field border border-admin-danger/30 bg-admin-danger/10 px-3.5 py-2.5 text-sm font-medium text-admin-danger">
            {formError}
          </p>
        )}

        <Input
          label="Slug"
          hint="Minúsculas, números y guiones. Identifica a la skill en la base de datos."
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
          <Input
            label="Nombre (es)"
            value={values.name.es}
            onChange={(e) => setLocalizado('name', 'es', e.target.value)}
            error={fieldErrors.name}
            required
          />
          <Input
            label="Descripción (es)"
            hint="Opcional."
            value={values.description.es}
            onChange={(e) => setLocalizado('description', 'es', e.target.value)}
          />
          <Input
            label="Categoría (es)"
            hint="Opcional, p. ej. «Frontend»."
            value={values.category.es}
            onChange={(e) => setLocalizado('category', 'es', e.target.value)}
          />
        </TabPanel>

        <TabPanel tabId="en" activeId={idioma} className="flex flex-col gap-4">
          <Input
            label="Name (en)"
            hint="Si queda vacío, se usa el texto en español."
            value={values.name.en}
            onChange={(e) => setLocalizado('name', 'en', e.target.value)}
          />
          <Input
            label="Description (en)"
            hint="Si queda vacío, se usa el texto en español."
            value={values.description.en}
            onChange={(e) => setLocalizado('description', 'en', e.target.value)}
          />
          <Input
            label="Category (en)"
            hint="Optional."
            value={values.category.en}
            onChange={(e) => setLocalizado('category', 'en', e.target.value)}
          />
        </TabPanel>

        <Input
          label="Nivel"
          hint="Entero de 0 a 100."
          type="number"
          min={0}
          max={100}
          value={values.percentage}
          onChange={(e) => set('percentage', Number(e.target.value))}
          error={fieldErrors.percentage}
          endAdornment="%"
          required
        />

        <div className="flex items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="skill-color-picker" className="text-label font-semibold text-admin-ink">
              Elegir
            </label>
            <input
              id="skill-color-picker"
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(values.color_hex) ? values.color_hex : '#00cba9'}
              onChange={(e) => set('color_hex', e.target.value)}
              className="h-11 w-14 shrink-0 cursor-pointer rounded-field border border-admin-line bg-transparent p-1"
            />
          </div>
          <Input
            label="Color (hex)"
            hint="Dato del contenido (el color de esa tecnología), no un color de la interfaz: admite cualquier hex."
            value={values.color_hex}
            onChange={(e) => set('color_hex', e.target.value)}
            error={fieldErrors.color_hex}
            placeholder="#00cba9"
            containerClassName="flex-1"
          />
        </div>

        <Input
          label="Icono"
          hint="Ruta en public/, p. ej. /images/logos/react.svg. Vacío si no tiene logo."
          list={datalistId}
          value={values.icon}
          onChange={(e) => set('icon', e.target.value)}
          error={fieldErrors.icon}
        />
        <datalist id={datalistId}>
          {LOGOS_CONOCIDOS.map((ruta) => (
            <option key={ruta} value={ruta} />
          ))}
        </datalist>
      </form>
    </Dialog>
  );
}
