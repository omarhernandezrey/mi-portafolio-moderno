'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, AdminButton, Input, Textarea, Tabs, TabPanel } from '@/components/admin/ui';
import { TechnologyPicker } from './TechnologyPicker';
import { AdminApiError } from '@/lib/admin/client-fetch';

export interface ProjectFormValues {
  slug: string;
  title: { es: string; en: string };
  description: { es: string; en: string };
  category: { es: string; en: string };
  technologies: string[];
  repository: string;
  demo: string;
  image_url: string;
}

export interface ProjectFormInitial {
  slug: string;
  title: { es?: string; en?: string };
  description: { es?: string; en?: string };
  category: { es?: string; en?: string } | null;
  technologies: readonly string[];
  repository: string;
  demo: string;
  image_url: string | null;
}

function vacio(): ProjectFormValues {
  return {
    slug: '',
    title: { es: '', en: '' },
    description: { es: '', en: '' },
    category: { es: '', en: '' },
    technologies: [],
    repository: '',
    demo: '',
    image_url: '',
  };
}

function desdeInicial(inicial: ProjectFormInitial): ProjectFormValues {
  return {
    slug: inicial.slug,
    title: { es: inicial.title.es ?? '', en: inicial.title.en ?? '' },
    description: { es: inicial.description.es ?? '', en: inicial.description.en ?? '' },
    category: { es: inicial.category?.es ?? '', en: inicial.category?.en ?? '' },
    technologies: [...inicial.technologies],
    repository: inicial.repository,
    demo: inicial.demo,
    image_url: inicial.image_url ?? '',
  };
}

export interface ProjectFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ProjectFormValues) => Promise<void>;
  /** `null`/`undefined` = crear; un proyecto existente = editar. */
  initial?: ProjectFormInitial | null;
}

/**
 * Diálogo de alta/edición de proyecto (T-09, establece el patrón para T-10
 * a T-12). `Tabs` alterna español/inglés en los campos bilingües — es el
 * uso correcto de ese primitivo: paneles de la misma página, no navegación
 * entre rutas (eso es `AreaSwitch`, en `AdminNav.tsx`).
 */
export function ProjectFormDialog({ open, onClose, onSubmit, initial }: ProjectFormDialogProps) {
  const esEdicion = Boolean(initial);
  const [values, setValues] = useState<ProjectFormValues>(() => (initial ? desdeInicial(initial) : vacio()));
  const [idioma, setIdioma] = useState<'es' | 'en'>('es');
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  // El diálogo se reutiliza entre proyectos distintos (una sola instancia en
  // la página): sin este reset, abrir "editar" sobre otra fila mostraría
  // todavía los valores del proyecto anterior hasta que React los sincronice.
  useEffect(() => {
    if (open) {
      setValues(initial ? desdeInicial(initial) : vacio());
      setIdioma('es');
      setFieldErrors({});
      setFormError('');
    }
  }, [open, initial]);

  function set<K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function setLocalizado(campo: 'title' | 'description' | 'category', idiomaCampo: 'es' | 'en', texto: string) {
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
      title={esEdicion ? 'Editar proyecto' : 'Nuevo proyecto'}
      description="El campo en español es obligatorio; si el inglés queda vacío, el sitio muestra el texto en español."
      size="lg"
      footer={
        <>
          <AdminButton type="button" variant="ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </AdminButton>
          <AdminButton type="submit" form="project-form" variant="primary" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar'}
          </AdminButton>
        </>
      }
    >
      <form id="project-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
        {formError && (
          <p role="alert" className="rounded-field border border-admin-danger/30 bg-admin-danger/10 px-3.5 py-2.5 text-sm font-medium text-admin-danger">
            {formError}
          </p>
        )}

        <Input
          label="Slug"
          hint="Minúsculas, números y guiones. Identifica al proyecto en la base de datos."
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
            label="Título (es)"
            value={values.title.es}
            onChange={(e) => setLocalizado('title', 'es', e.target.value)}
            error={fieldErrors.title}
            required
          />
          <Textarea
            label="Descripción (es)"
            value={values.description.es}
            onChange={(e) => setLocalizado('description', 'es', e.target.value)}
            error={fieldErrors.description}
            rows={3}
            required
          />
          <Input
            label="Categoría (es)"
            hint="Opcional."
            value={values.category.es}
            onChange={(e) => setLocalizado('category', 'es', e.target.value)}
          />
        </TabPanel>

        <TabPanel tabId="en" activeId={idioma} className="flex flex-col gap-4">
          <Input
            label="Title (en)"
            hint="Si queda vacío, se usa el texto en español."
            value={values.title.en}
            onChange={(e) => setLocalizado('title', 'en', e.target.value)}
          />
          <Textarea
            label="Description (en)"
            hint="Si queda vacío, se usa el texto en español."
            value={values.description.en}
            onChange={(e) => setLocalizado('description', 'en', e.target.value)}
            rows={3}
          />
          <Input
            label="Category (en)"
            hint="Optional."
            value={values.category.en}
            onChange={(e) => setLocalizado('category', 'en', e.target.value)}
          />
        </TabPanel>

        <TechnologyPicker
          label="Tecnologías"
          value={values.technologies}
          onChange={(next) => set('technologies', next)}
          hint="Los nombres coinciden con los iconos del visor; una tecnología nueva sale como texto."
        />

        <Input
          label="Repositorio"
          hint="URL de GitHub. Opcional."
          value={values.repository}
          onChange={(e) => set('repository', e.target.value)}
          error={fieldErrors.repository}
          type="url"
        />

        <Input
          label="Demo"
          hint="URL en vivo que el visor embebe en un iframe. Se comprueba al guardar si el sitio lo permite."
          value={values.demo}
          onChange={(e) => set('demo', e.target.value)}
          error={fieldErrors.demo}
          type="url"
        />

        <Input
          label="Imagen"
          hint="URL de una captura. Opcional."
          value={values.image_url}
          onChange={(e) => set('image_url', e.target.value)}
          type="url"
        />
      </form>
    </Dialog>
  );
}
