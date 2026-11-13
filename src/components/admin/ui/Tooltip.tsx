'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  /** Contenido de la burbuja. Texto corto: no es un contenedor de párrafos. */
  content: React.ReactNode;
  children: React.ReactElement;
  side?: 'top' | 'bottom';
  className?: string;
}

/**
 * Tooltip que también funciona con el dedo.
 *
 * El `title` nativo y los tooltips que solo escuchan `mouseenter` no existen
 * en táctil: en un panel que se usa desde el móvil eso deja la explicación
 * inalcanzable. Aquí abre con hover, con foco de teclado **y** con toque, y
 * cierra con Escape, al salir o al tocar fuera.
 *
 * No sustituye a una etiqueta: lo que el usuario necesita para decidir va
 * visible. Esto es para el dato de apoyo (qué mide una métrica, de dónde sale).
 */
export function Tooltip({
  content,
  children,
  side = 'top',
  className,
}: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();
  const wrapperRef = React.useRef<HTMLSpanElement | null>(null);

  React.useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function onPointerDown(e: PointerEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  const trigger = React.cloneElement(
    children as React.ReactElement<Record<string, unknown>>,
    {
      'aria-describedby': open ? id : undefined,
      onFocus: () => setOpen(true),
      onBlur: () => setOpen(false),
      onMouseEnter: () => setOpen(true),
      onMouseLeave: () => setOpen(false),
      // En táctil no hay hover: el toque alterna la burbuja.
      onClick: (e: React.MouseEvent) => {
        const original = (children.props as { onClick?: (e: React.MouseEvent) => void })
          .onClick;
        original?.(e);
        setOpen((v) => !v);
      },
    },
  );

  return (
    <span ref={wrapperRef} className={cn('relative inline-flex', className)}>
      {trigger}
      {open && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            'pointer-events-none absolute left-1/2 z-80 w-max max-w-[min(16rem,80vw)] -translate-x-1/2',
            'rounded-chip border border-admin-line bg-admin-raised px-2.5 py-1.5',
            'text-xs leading-snug text-admin-ink shadow-e2',
            side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
