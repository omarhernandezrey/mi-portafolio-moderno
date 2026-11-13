'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Field, controlClasses, useFieldIds } from './Field';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  /** Muestra «usados / máximo». Requiere maxLength y value controlado. */
  showCount?: boolean;
  containerClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      hint,
      error,
      showCount = false,
      required,
      className,
      containerClassName,
      id,
      maxLength,
      value,
      defaultValue,
      rows = 4,
      ...props
    },
    ref,
  ) {
    const ids = useFieldIds({ id, hint, error });

    const used =
      typeof value === 'string'
        ? value.length
        : typeof defaultValue === 'string'
          ? defaultValue.length
          : 0;
    const countVisible = showCount && typeof maxLength === 'number';
    const nearLimit = countVisible && used / maxLength > 0.9;

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
          <textarea
            ref={ref}
            id={ids.id}
            rows={rows}
            required={required}
            maxLength={maxLength}
            value={value}
            defaultValue={defaultValue}
            aria-invalid={error ? true : undefined}
            aria-describedby={ids.describedBy}
            className={cn(
              controlClasses({ error }),
              'resize-y leading-relaxed',
              countVisible && 'pb-7',
              className,
            )}
            {...props}
          />
          {countVisible && (
            <span
              className={cn(
                'pointer-events-none absolute bottom-2 right-3 font-mono text-[11px] tabular-nums',
                nearLimit ? 'text-admin-warning' : 'text-admin-muted/70',
              )}
            >
              {used}/{maxLength}
            </span>
          )}
        </div>
      </Field>
    );
  },
);
