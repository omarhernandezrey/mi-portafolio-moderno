'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Field, controlClasses, useFieldIds } from './Field';

export interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  options: readonly SelectOption[];
  /** Opción vacía inicial. Sin ella, el primer valor queda elegido de facto. */
  placeholder?: string;
  containerClassName?: string;
}

/**
 * Select nativo a propósito.
 *
 * En móvil el `<select>` del sistema abre la rueda nativa: es más rápido,
 * accesible y familiar que cualquier menú reimplementado, y no se pelea con
 * el teclado virtual. Lo único que se personaliza es la flecha.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      label,
      hint,
      error,
      options,
      placeholder,
      required,
      className,
      containerClassName,
      id,
      ...props
    },
    ref,
  ) {
    const ids = useFieldIds({ id, hint, error });

    return (
      <Field
        label={label}
        hint={hint}
        error={error}
        required={required}
        ids={ids}
        className={containerClassName}
      >
        <div className="relative">
          <select
            ref={ref}
            id={ids.id}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={ids.describedBy}
            className={cn(
              controlClasses({ error }),
              'appearance-none pr-10',
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((o) => (
              <option key={o.value} value={o.value} disabled={o.disabled}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted"
          />
        </div>
      </Field>
    );
  },
);
