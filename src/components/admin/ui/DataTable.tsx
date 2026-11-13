'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './Skeleton';

export interface Column<T> {
  readonly id: string;
  readonly header: string;
  readonly cell: (row: T) => React.ReactNode;
  /** Alineación; los números van a la derecha para comparar de un vistazo. */
  readonly align?: 'left' | 'right';
  /**
   * En la tarjeta de móvil: `primary` es el título de la tarjeta, `meta` va en
   * la fila de apoyo bajo el título, y `hidden` no se muestra en móvil.
   * Sin valor, la columna aparece como par etiqueta/valor.
   */
  readonly mobile?: 'primary' | 'meta' | 'hidden';
  /** Ancho en la tabla de escritorio (clase Tailwind). */
  readonly width?: string;
}

export interface DataTableProps<T> {
  columns: readonly Column<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string;
  /** Etiqueta de la tabla para lectores de pantalla. */
  caption: string;
  loading?: boolean;
  /** Qué mostrar si no hay filas. */
  empty?: React.ReactNode;
  /** Acciones por fila (editar, borrar). Van al pie de la tarjeta en móvil. */
  actions?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
}

/**
 * Tabla de datos del panel, resuelta mobile-first.
 *
 * Una tabla de 6 columnas a 375 px solo tiene dos salidas: scroll horizontal
 * —que esconde datos y pelea con el scroll de la página— o celdas de 40 px
 * ilegibles. Así que aquí **no hay tabla en móvil**: cada fila se convierte en
 * una tarjeta con su título, su línea de apoyo y sus pares etiqueta/valor, que
 * es como se lee de verdad con el pulgar. La `<table>` aparece desde `lg`,
 * donde sí hay ancho para que las columnas comparen.
 *
 * Son dos marcados del mismo dato, no dos componentes: la definición de
 * columnas es única, y cada columna declara en `mobile` qué papel juega en la
 * tarjeta. Así nunca se desincronizan.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  loading = false,
  empty,
  actions,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const primary = columns.find((c) => c.mobile === 'primary') ?? columns[0];
  const meta = columns.filter((c) => c.mobile === 'meta');
  const pairs = columns.filter(
    (c) => c !== primary && !c.mobile,
  );

  if (loading) {
    return <DataTableSkeleton columns={columns.length} className={className} />;
  }

  if (rows.length === 0 && empty) {
    return <div className={className}>{empty}</div>;
  }

  const interactive = Boolean(onRowClick);

  return (
    <div className={className}>
      {/* ── Móvil: tarjetas ─────────────────────────────────────────────── */}
      <ul
        role="list"
        aria-label={caption}
        className="flex flex-col gap-3 lg:hidden"
      >
        {rows.map((row) => {
          const Wrapper = interactive ? 'button' : 'div';
          return (
            <li key={rowKey(row)}>
              <Wrapper
                {...(interactive
                  ? { type: 'button' as const, onClick: () => onRowClick?.(row) }
                  : {})}
                className={cn(
                  'flex w-full flex-col gap-3 rounded-card border border-admin-line bg-card-bg p-4 text-left shadow-e3',
                  interactive &&
                    'transition-colors duration-base ease-in-out-soft hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                )}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-label font-semibold text-admin-ink">
                    {primary.cell(row)}
                  </span>
                  {meta.length > 0 && (
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-admin-muted">
                      {meta.map((c) => (
                        <span key={c.id}>{c.cell(row)}</span>
                      ))}
                    </span>
                  )}
                </div>

                {pairs.length > 0 && (
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-admin-line pt-3">
                    {pairs.map((c) => (
                      <div key={c.id} className="flex flex-col gap-0.5">
                        <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-admin-muted/70">
                          {c.header}
                        </dt>
                        <dd className="text-sm text-admin-ink">{c.cell(row)}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {actions && (
                  <div className="flex flex-wrap gap-2 border-t border-admin-line pt-3">
                    {actions(row)}
                  </div>
                )}
              </Wrapper>
            </li>
          );
        })}
      </ul>

      {/* ── Escritorio: tabla ───────────────────────────────────────────── */}
      <div className="hidden overflow-hidden rounded-card border border-admin-line bg-card-bg shadow-e3 lg:block">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-admin-line">
              {columns.map((c) => (
                <th
                  key={c.id}
                  scope="col"
                  className={cn(
                    'px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-admin-muted',
                    c.align === 'right' ? 'text-right' : 'text-left',
                    c.width,
                  )}
                >
                  {c.header}
                </th>
              ))}
              {actions && (
                <th scope="col" className="w-px px-4 py-3">
                  <span className="sr-only">Acciones</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={interactive ? () => onRowClick?.(row) : undefined}
                className={cn(
                  'border-b border-admin-line/60 last:border-0',
                  interactive &&
                    'cursor-pointer transition-colors duration-fast hover:bg-white/[0.03]',
                )}
              >
                {columns.map((c) => (
                  <td
                    key={c.id}
                    className={cn(
                      'px-4 py-3.5 text-admin-ink',
                      c.align === 'right' && 'text-right tabular-nums',
                    )}
                  >
                    {c.cell(row)}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {actions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DataTableSkeleton({
  columns,
  className,
}: {
  columns: number;
  className?: string;
}) {
  return (
    <div aria-busy="true" aria-live="polite" className={className}>
      <span className="sr-only">Cargando datos…</span>

      <div className="flex flex-col gap-3 lg:hidden">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-card border border-admin-line bg-card-bg p-4"
          >
            <Skeleton shape="text" className="w-2/3" />
            <Skeleton shape="text" className="w-1/3" />
            <div className="grid grid-cols-2 gap-3 border-t border-admin-line pt-3">
              <Skeleton shape="text" className="w-full" />
              <Skeleton shape="text" className="w-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden flex-col gap-px overflow-hidden rounded-card border border-admin-line bg-card-bg lg:flex">
        {Array.from({ length: 5 }, (_, r) => (
          <div key={r} className="flex gap-4 px-4 py-4">
            {Array.from({ length: columns }, (_, c) => (
              <Skeleton key={c} shape="text" className="flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
