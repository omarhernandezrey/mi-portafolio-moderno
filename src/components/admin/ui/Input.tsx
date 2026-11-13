'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Field, controlClasses, useFieldIds } from './Field';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  /** Adorno a la izquierda (icono, símbolo de moneda). Decorativo.
   *  No se llama `prefix` porque ese es un atributo HTML real y chocaría
   *  con los tipos de InputHTMLAttributes. */
  startAdornment?: React.ReactNode;
  /** Adorno a la derecha (unidad, contador). Decorativo. */
  endAdornment?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      label,
      hint,
      error,
      startAdornment,
      endAdornment,
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
        <div className="relative flex items-center">
          {startAdornment && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 text-admin-muted"
            >
              {startAdornment}
            </span>
          )}
          <input
            ref={ref}
            id={ids.id}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={ids.describedBy}
            className={cn(
              controlClasses({ error }),
              startAdornment && "pl-10",
              endAdornment && "pr-12",
              className,
            )}
            {...props}
          />
          {endAdornment && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-3.5 text-xs text-admin-muted"
            >
              {endAdornment}
            </span>
          )}
        </div>
      </Field>
    );
  },
);
