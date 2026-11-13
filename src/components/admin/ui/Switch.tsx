'use client';

import React, { useId } from 'react';
import { Switch as HeadlessSwitch } from '@headlessui/react';
import { cn } from '@/lib/utils';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  hint?: React.ReactNode;
  disabled?: boolean;
  /** Oculta la etiqueta visualmente pero la mantiene para lectores. */
  hideLabel?: boolean;
  className?: string;
}

/**
 * Interruptor para ajustes que se aplican al instante (publicado/borrador,
 * notificación activa). Si la acción necesita un botón «Guardar», es un
 * checkbox, no un switch: el switch promete efecto inmediato.
 *
 * Sobre Headless UI para no reimplementar el rol `switch`, `aria-checked` ni
 * el manejo de teclado.
 */
export function Switch({
  checked,
  onChange,
  label,
  hint,
  disabled = false,
  hideLabel = false,
  className,
}: SwitchProps) {
  const id = useId();
  const hintId = `${id}-hint`;

  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className={cn('flex flex-col gap-0.5', hideLabel && 'sr-only')}>
        <label htmlFor={id} className="text-label font-semibold text-admin-ink">
          {label}
        </label>
        {hint && (
          <span id={hintId} className="text-xs text-admin-muted">
            {hint}
          </span>
        )}
      </div>

      <HeadlessSwitch
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-describedby={hint ? hintId : undefined}
        aria-label={hideLabel && typeof label === 'string' ? label : undefined}
        className={cn(
          // 44px de alto total con el padding del contenedor: la pista mide
          // 24px pero el objetivo táctil llega al mínimo cómodo.
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border',
          'transition-colors duration-base ease-in-out-soft',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-admin-bg',
          'disabled:cursor-not-allowed disabled:opacity-50',
          checked
            ? 'border-primary bg-primary'
            : 'border-admin-line bg-admin-raised',
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none inline-block h-4 w-4 rounded-full shadow-e1',
            'transition-transform duration-base ease-out-expo',
            checked
              ? 'translate-x-[1.375rem] bg-background'
              : 'translate-x-1 bg-admin-muted',
          )}
        />
      </HeadlessSwitch>
    </div>
  );
}
