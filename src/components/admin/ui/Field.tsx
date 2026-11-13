'use client';

import React, { useId } from 'react';
import { cn } from '@/lib/utils';

/**
 * Andamio compartido por todos los controles de formulario del panel.
 *
 * Centraliza lo que siempre se olvida cuando cada input se escribe suelto:
 * el `htmlFor`, el `aria-describedby` que cose la pista y el error al control,
 * `aria-invalid`, y el marcador de obligatorio. Los controles no replican
 * nada de esto: piden los ids a `useFieldIds` y los aplican.
 */

export interface FieldIds {
  readonly id: string;
  readonly hintId: string;
  readonly errorId: string;
  /** Lo que va en aria-describedby del control, ya resuelto. */
  readonly describedBy: string | undefined;
}

export function useFieldIds({
  id,
  hint,
  error,
}: {
  id?: string;
  hint?: React.ReactNode;
  error?: string;
}): FieldIds {
  const auto = useId();
  const base = id ?? auto;
  const hintId = `${base}-hint`;
  const errorId = `${base}-error`;

  // El error SUSTITUYE a la pista en el render, así que aquí tampoco se
  // referencia: un `aria-describedby` que apunta a un id inexistente deja al
  // lector de pantalla sin nada que leer. Si hay error, solo el error.
  const parts = error ? [errorId] : hint ? [hintId] : [];

  return {
    id: base,
    hintId,
    errorId,
    describedBy: parts.length > 0 ? parts.join(' ') : undefined,
  };
}

export interface FieldProps {
  label?: React.ReactNode;
  /** Texto de ayuda permanente. Se oculta cuando hay error. */
  hint?: React.ReactNode;
  error?: string;
  required?: boolean;
  /** Para controles que no llevan label encima (checkbox, switch). */
  hideLabel?: boolean;
  className?: string;
  children: React.ReactNode;
  ids: FieldIds;
}

export function Field({
  label,
  hint,
  error,
  required = false,
  hideLabel = false,
  className,
  children,
  ids,
}: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label
          htmlFor={ids.id}
          className={cn(
            'text-label font-semibold text-admin-ink',
            hideLabel && 'sr-only',
          )}
        >
          {label}
          {required && (
            <span className="ml-1 text-admin-danger" aria-hidden="true">
              *
            </span>
          )}
          {required && <span className="sr-only"> (obligatorio)</span>}
        </label>
      )}

      {children}

      {/* El error sustituye a la pista en vez de apilarse: dos mensajes a la
          vez compiten por la atención y en móvil empujan el formulario. */}
      {error ? (
        <p
          id={ids.errorId}
          role="alert"
          className="flex items-start gap-1.5 text-xs text-admin-danger"
        >
          <span aria-hidden="true" className="leading-5">
            ⚠
          </span>
          <span>{error}</span>
        </p>
      ) : (
        hint && (
          <p id={ids.hintId} className="text-xs text-admin-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/**
 * Clases base de los controles con caja (input, textarea, select).
 *
 * `text-base sm:text-sm` no es un descuido: por debajo de 16px, Safari en iOS
 * hace zoom al enfocar el campo y descoloca el formulario entero. En móvil el
 * control va a 16px y solo baja a 14px desde `sm`.
 * `min-h-11` (44px) es el objetivo táctil mínimo cómodo.
 */
export function controlClasses({
  error,
  className,
}: { error?: string; className?: string } = {}) {
  return cn(
    'w-full min-h-11 rounded-field border bg-admin-bg/60 px-3.5 py-2.5',
    'text-base sm:text-sm text-admin-ink placeholder:text-admin-muted/70',
    'transition-colors duration-base ease-in-out-soft',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
    'disabled:cursor-not-allowed disabled:opacity-50',
    error
      ? 'border-admin-danger/50 focus-visible:border-admin-danger'
      : 'border-admin-line hover:border-primary/30 focus-visible:border-primary/50',
    className,
  );
}
