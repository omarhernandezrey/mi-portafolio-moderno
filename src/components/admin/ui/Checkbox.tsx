'use client';

import React from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFieldIds } from './Field';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  /** Estado mixto para «seleccionar todo» parcial. */
  indeterminate?: boolean;
}

/**
 * Checkbox con el input real debajo de la marca dibujada.
 *
 * El `<input>` nativo se mantiene (opacidad 0, encima de la caja) en vez de
 * simularlo con un div: así conservamos foco de teclado, barra espaciadora,
 * autofill y el comportamiento de los formularios sin reimplementar nada.
 * Toda la fila es el objetivo táctil, no solo el cuadrito de 20px.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    { label, hint, error, indeterminate = false, className, id, ...props },
    ref,
  ) {
    const ids = useFieldIds({ id, hint, error });
    const innerRef = React.useRef<HTMLInputElement | null>(null);

    // `indeterminate` solo existe como propiedad del DOM, no como atributo.
    React.useEffect(() => {
      if (innerRef.current) innerRef.current.indeterminate = indeterminate;
    }, [indeterminate]);

    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        <label
          htmlFor={ids.id}
          className="group flex min-h-11 cursor-pointer items-start gap-3 py-1.5"
        >
          <span className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
            <input
              ref={(node) => {
                innerRef.current = node;
                if (typeof ref === 'function') ref(node);
                else if (ref) ref.current = node;
              }}
              id={ids.id}
              type="checkbox"
              aria-invalid={error ? true : undefined}
              aria-describedby={ids.describedBy}
              className="peer absolute inset-0 z-10 cursor-pointer opacity-0 disabled:cursor-not-allowed"
              {...props}
            />
            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none flex h-5 w-5 items-center justify-center rounded-[6px] border',
                'transition-colors duration-fast ease-in-out-soft',
                'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-admin-bg',
                'peer-checked:border-primary peer-checked:bg-primary peer-checked:text-background',
                'peer-indeterminate:border-primary peer-indeterminate:bg-primary peer-indeterminate:text-background',
                // `peer-checked:` genera `.peer:checked ~ .esto`, así que no
                // alcanza a un hijo anidado: hay que apuntar al svg desde aquí.
                'peer-checked:[&>svg]:opacity-100',
                'peer-disabled:opacity-50',
                error
                  ? 'border-admin-danger/50'
                  : 'border-admin-line group-hover:border-primary/40',
              )}
            >
              {indeterminate ? (
                <Minus className="h-3.5 w-3.5" strokeWidth={3} />
              ) : (
                <Check className="h-3.5 w-3.5 opacity-0" strokeWidth={3} />
              )}
            </span>
          </span>

          <span className="flex flex-col gap-0.5">
            <span className="text-label text-admin-ink">{label}</span>
            {!error && hint && (
              <span id={ids.hintId} className="text-xs text-admin-muted">
                {hint}
              </span>
            )}
          </span>
        </label>

        {error && (
          <p id={ids.errorId} role="alert" className="text-xs text-admin-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
);
