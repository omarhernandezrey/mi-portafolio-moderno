'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, AdminButton, Input, Select } from '@/components/admin/ui';
import { portfolioIconRegistry } from '@/lib/portfolio/source/icon-registry';

export interface InterestFormValues {
  title: string;
  href: string;
  iconKey: string;
}

const CLAVES_DE_ICONO = Object.keys(portfolioIconRegistry).sort((a, b) => a.localeCompare(b));

function vacio(): InterestFormValues {
  return { title: '', href: '', iconKey: '' };
}

export interface InterestFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: InterestFormValues) => void;
  initial?: InterestFormValues | null;
}

/**
 * Un interés dentro de la sección `interests` del perfil (T-12). No habla
 * con la API directamente: solo devuelve el valor al llamador, que lo
 * añade/reemplaza en el array completo y manda ESE al guardar (ver
 * `interestsContentSchema` — no hay id por elemento).
 */
export function InterestFormDialog({ open, onClose, onSubmit, initial }: InterestFormDialogProps) {
  const esEdicion = Boolean(initial);
  const [values, setValues] = useState<InterestFormValues>(() => initial ?? vacio());
  const [errores, setErrores] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setValues(initial ?? vacio());
      setErrores({});
    }
  }, [open, initial]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nuevosErrores: Record<string, string> = {};
    if (!values.title.trim()) nuevosErrores.title = 'Falta el título';
    if (!/^https?:\/\//i.test(values.href.trim())) nuevosErrores.href = 'Debe ser una URL http(s)';
    if (!values.iconKey) nuevosErrores.iconKey = 'Elige un icono';
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }
    onSubmit(values);
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={esEdicion ? 'Editar interés' : 'Nuevo interés'}
      size="sm"
      footer={
        <>
          <AdminButton type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </AdminButton>
          <AdminButton type="submit" form="interest-form" variant="primary">
            Guardar
          </AdminButton>
        </>
      }
    >
      <form id="interest-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Título"
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          error={errores.title}
          required
        />
        <Input
          label="Enlace"
          hint="URL http(s) a la que lleva la tarjeta."
          value={values.href}
          onChange={(e) => setValues((v) => ({ ...v, href: e.target.value }))}
          error={errores.href}
          required
        />
        <Select
          label="Icono"
          placeholder="Elegir…"
          value={values.iconKey}
          onChange={(e) => setValues((v) => ({ ...v, iconKey: e.target.value }))}
          options={CLAVES_DE_ICONO.map((clave) => ({ value: clave, label: clave }))}
          error={errores.iconKey}
        />
      </form>
    </Dialog>
  );
}
