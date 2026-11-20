'use client';

import React from 'react';
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RowActionsMenuProps {
  /** Para el aria-label del disparador: «Más acciones para {label}». */
  label: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Menú «más acciones» (⋮) de una fila de tabla — Editar/Eliminar y similares,
 * cuando una fila tiene demasiadas columnas de datos para que todo quepa como
 * botones sueltos sin desbordarla (ver `RowReorderActions`, pensado para
 * filas con menos columnas).
 *
 * `MenuItems` usa `anchor`+`portal` de Headless UI: el panel se renderiza en
 * su propio portal y floating-ui lo posiciona relativo al botón. Eso importa
 * aquí porque `DataTable` envuelve la tabla de escritorio en un contenedor
 * con `overflow-hidden` (solo para las esquinas redondeadas) — un menú
 * `position: absolute` normal, anidado dentro de ese contenedor, se recorta
 * en la fila más cercana al borde. Con portal, no. Teclado, foco y Escape
 * vienen del propio Headless UI, sin reimplementarlos a mano por página.
 */
export function RowActionsMenu({ label, children, className }: RowActionsMenuProps) {
  return (
    <Menu as="div" className={cn('relative inline-block text-left', className)}>
      <MenuButton
        aria-label={`Más acciones para ${label}`}
        className="flex h-11 w-11 items-center justify-center rounded-field border border-admin-line text-admin-muted outline-none transition-colors data-[focus]:border-primary/30 data-[focus]:text-admin-ink data-[hover]:border-primary/30 data-[hover]:text-admin-ink data-[open]:border-primary/30 data-[open]:text-admin-ink"
      >
        <MoreVertical size={15} />
      </MenuButton>
      <MenuItems
        anchor="bottom end"
        transition
        className="z-100 w-44 origin-top-right overflow-hidden rounded-xl border border-admin-line bg-card-bg shadow-e4 outline-none [--anchor-gap:6px] transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
      >
        {children}
      </MenuItems>
    </Menu>
  );
}

export interface RowActionItemProps {
  icon: React.ReactNode;
  onClick: () => void;
  /** `danger` para eliminar: tiñe el ítem de rojo. */
  tone?: 'default' | 'danger';
  children: React.ReactNode;
}

export function RowActionItem({ icon, onClick, tone = 'default', children }: RowActionItemProps) {
  return (
    <MenuItem>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex w-full items-center gap-2 px-4 py-3 text-left text-xs font-bold outline-none transition-colors',
          tone === 'danger'
            ? 'text-admin-danger data-[focus]:bg-admin-danger/10'
            : 'text-admin-ink data-[focus]:bg-white/[0.04]',
        )}
      >
        {icon}
        {children}
      </button>
    </MenuItem>
  );
}
