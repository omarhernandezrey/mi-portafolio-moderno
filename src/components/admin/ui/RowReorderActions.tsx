import React from 'react';
import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react';

/**
 * T-30: subir/bajar/editar/eliminar de una fila reordenable — markup
 * idéntico copiado carácter a carácter entre `contenido/page.tsx` y
 * `educacion/page.tsx` (cada uno con su propia función local del mismo
 * tamaño). Un solo primitivo para los dos.
 */
interface RowReorderActionsProps {
  disableUp: boolean;
  disableDown: boolean;
  busy: boolean;
  label: string;
  onUp: () => void;
  onDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function RowReorderActions({
  disableUp,
  disableDown,
  busy,
  label,
  onUp,
  onDown,
  onEdit,
  onDelete,
}: RowReorderActionsProps) {
  return (
    <>
      <button
        type="button"
        onClick={onUp}
        disabled={disableUp || busy}
        aria-label={`Subir ${label}`}
        className="flex h-11 w-11 items-center justify-center rounded-field border border-admin-line text-admin-muted transition-colors hover:border-primary/30 hover:text-admin-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ArrowUp size={15} />
      </button>
      <button
        type="button"
        onClick={onDown}
        disabled={disableDown || busy}
        aria-label={`Bajar ${label}`}
        className="flex h-11 w-11 items-center justify-center rounded-field border border-admin-line text-admin-muted transition-colors hover:border-primary/30 hover:text-admin-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ArrowDown size={15} />
      </button>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Editar ${label}`}
        className="flex h-11 w-11 items-center justify-center rounded-field border border-admin-line text-admin-muted transition-colors hover:border-primary/30 hover:text-admin-ink"
      >
        <Pencil size={15} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Eliminar ${label}`}
        className="flex h-11 w-11 items-center justify-center rounded-field border border-admin-danger/20 bg-admin-danger/10 text-admin-danger transition-colors hover:bg-admin-danger/15"
      >
        <Trash2 size={15} />
      </button>
    </>
  );
}
