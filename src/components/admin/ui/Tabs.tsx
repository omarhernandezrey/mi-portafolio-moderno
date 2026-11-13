'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  readonly id: string;
  readonly label: string;
  /** Contador opcional a la derecha de la etiqueta (p. ej. nº de proyectos). */
  readonly count?: number;
  readonly disabled?: boolean;
}

export interface TabsProps {
  items: readonly TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  /** Etiqueta del grupo para lectores de pantalla. */
  ariaLabel: string;
  className?: string;
}

/**
 * Pestañas del panel. Patrón ARIA completo, implementado a mano porque lo que
 * decide el diseño aquí es el comportamiento en móvil, no el markup:
 *
 *  - A 375 px la fila **scrollea horizontalmente** en vez de romperse en dos
 *    líneas o encogerse hasta ser ilegible. Con `scrollbar-hide` y
 *    `snap-x` para que cada pestaña quede alineada al parar el gesto.
 *  - La pestaña activa se autodesplaza a la vista, así que al llegar por
 *    teclado o al volver a la página nunca queda escondida fuera del borde.
 *  - El subrayado es un hairline teñido, el separador dominante del sistema.
 *
 * Teclado: flechas para moverse (activación manual, no automática, para no
 * disparar cargas al pasar de largo), Home y End a los extremos.
 */
export function Tabs({
  items,
  activeId,
  onChange,
  ariaLabel,
  className,
}: TabsProps) {
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const tabRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});

  // Mantiene la pestaña activa dentro del área visible del scroll.
  React.useEffect(() => {
    const node = tabRefs.current[activeId];
    if (!node || !listRef.current) return;
    // Autodesplazar es una mejora, no un requisito: si el entorno no lo
    // soporta (webviews antiguos, jsdom), las pestañas siguen funcionando.
    if (typeof node.scrollIntoView !== 'function') return;
    node.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [activeId]);

  const enabled = items.filter((i) => !i.disabled);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    e.preventDefault();

    const current = enabled.findIndex((i) => i.id === activeId);
    let next = current;
    if (e.key === 'ArrowRight') next = (current + 1) % enabled.length;
    if (e.key === 'ArrowLeft') next = (current - 1 + enabled.length) % enabled.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = enabled.length - 1;

    const target = enabled[next];
    if (target) {
      onChange(target.id);
      tabRefs.current[target.id]?.focus();
    }
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cn(
        'scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-1 overflow-x-auto border-b border-admin-line px-1',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            ref={(node) => {
              tabRefs.current[item.id] = node;
            }}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={active}
            aria-controls={`panel-${item.id}`}
            tabIndex={active ? 0 : -1}
            disabled={item.disabled}
            onClick={() => onChange(item.id)}
            className={cn(
              'relative flex min-h-11 shrink-0 snap-start items-center gap-2 whitespace-nowrap px-3.5 pb-3 pt-2.5',
              'text-label font-semibold transition-colors duration-base ease-in-out-soft',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              'disabled:cursor-not-allowed disabled:opacity-40',
              active
                ? 'text-admin-ink'
                : 'text-admin-muted hover:text-admin-ink',
            )}
          >
            {item.label}
            {typeof item.count === 'number' && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 font-mono text-[11px] tabular-nums',
                  active
                    ? 'bg-primary/15 text-primary'
                    : 'bg-white/[0.06] text-admin-muted',
                )}
              >
                {item.count}
              </span>
            )}
            {/* Subrayado sobre el borde del contenedor, no dentro del botón:
                así no empuja el texto al activarse. */}
            {active && (
              <span
                aria-hidden="true"
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

export interface TabPanelProps {
  tabId: string;
  activeId: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ tabId, activeId, children, className }: TabPanelProps) {
  if (tabId !== activeId) return null;
  return (
    <div
      role="tabpanel"
      id={`panel-${tabId}`}
      aria-labelledby={`tab-${tabId}`}
      tabIndex={0}
      className={cn('focus-visible:outline-none', className)}
    >
      {children}
    </div>
  );
}
