'use client';

import React, { useId, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, Input, AdminButton } from '@/components/admin/ui';
import technologyIcons from '@/config/technologyIcons';

export interface TechnologyPickerProps {
  value: readonly string[];
  onChange: (next: string[]) => void;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
}

const CLAVES_CONOCIDAS = Object.keys(technologyIcons).sort((a, b) => a.localeCompare(b));

/**
 * Selector de `technologies` (T-09). Los nombres coinciden LITERALMENTE con
 * las claves de `technologyIcons.tsx`: por eso la lista desplegable ofrece
 * esas claves exactas en vez de dejar escribir libremente como primera
 * opción. La ficha permite añadir una tecnología sin icono —se muestra solo
 * como texto en el visor—, así que el campo de texto libre queda como
 * segunda vía, con el aviso correspondiente.
 */
export function TechnologyPicker({ value, onChange, label, hint, className }: TechnologyPickerProps) {
  const [seleccion, setSeleccion] = useState('');
  const [libre, setLibre] = useState('');
  const selectId = useId();
  const libreId = useId();

  const disponibles = useMemo(
    () => CLAVES_CONOCIDAS.filter((clave) => !value.includes(clave)),
    [value],
  );

  function agregar(nombre: string) {
    const limpio = nombre.trim();
    if (!limpio || value.includes(limpio)) return;
    onChange([...value, limpio]);
  }

  function quitar(nombre: string) {
    onChange(value.filter((v) => v !== nombre));
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {label && (
        <span className="text-label font-semibold text-admin-ink" id={`${selectId}-label`}>
          {label}
        </span>
      )}

      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Tecnologías elegidas">
          {value.map((nombre) => (
            <li key={nombre}>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-admin-line bg-admin-raised/70 py-1 pl-3 pr-1.5 text-xs font-semibold text-admin-ink">
                {nombre}
                {!CLAVES_CONOCIDAS.includes(nombre) && (
                  <span className="font-mono-label text-kicker text-admin-warning" title="Sin icono: saldrá como texto en el visor">
                    sin icono
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => quitar(nombre)}
                  aria-label={`Quitar ${nombre}`}
                  className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-admin-muted transition-colors before:absolute before:-inset-3 before:content-[''] hover:bg-white/10 hover:text-admin-ink"
                >
                  <X size={12} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-end gap-2">
        <Select
          id={selectId}
          label="De la lista de iconos"
          value={seleccion}
          onChange={(e) => {
            const elegido = e.target.value;
            setSeleccion('');
            agregar(elegido);
          }}
          placeholder="Elegir…"
          options={disponibles.map((clave) => ({ value: clave, label: clave }))}
          containerClassName="min-w-[12rem] flex-1"
        />

        <div className="flex flex-1 items-end gap-2">
          <Input
            id={libreId}
            type="text"
            label="O escribir una nueva"
            value={libre}
            onChange={(e) => setLibre(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                agregar(libre);
                setLibre('');
              }
            }}
            placeholder="p. ej. Supabase"
            containerClassName="flex-1"
          />
          <AdminButton
            type="button"
            size="sm"
            onClick={() => {
              agregar(libre);
              setLibre('');
            }}
            disabled={!libre.trim()}
          >
            Añadir
          </AdminButton>
        </div>
      </div>

      {hint && <p className="text-xs text-admin-muted">{hint}</p>}
    </div>
  );
}
