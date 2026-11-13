'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps {
  className?: string;
  /** Forma del hueco. `text` redondea poco; `circle` es para avatares. */
  shape?: 'text' | 'block' | 'circle';
}

/**
 * Hueco de carga.
 *
 * Respeta `prefers-reduced-motion`: el pulso se apaga y queda el bloque
 * estático. Una animación infinita puede marear a quien pidió menos
 * movimiento, y el skeleton sigue comunicando igual sin ella.
 *
 * El contenedor que lo usa debe llevar `aria-busy` y anunciar el estado;
 * estos bloques son decorativos y van ocultos a los lectores.
 */
export function Skeleton({ className, shape = 'block' }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'block animate-pulse bg-white/[0.06] motion-reduce:animate-none',
        shape === 'text' && 'h-3 rounded-[4px]',
        shape === 'block' && 'rounded-field',
        shape === 'circle' && 'rounded-full',
        className,
      )}
    />
  );
}

export interface SkeletonTextProps {
  /** Número de líneas. La última sale más corta, como un párrafo real. */
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <span className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          shape="text"
          className={i === lines - 1 ? 'w-3/5' : 'w-full'}
        />
      ))}
    </span>
  );
}

export interface SkeletonCardProps {
  className?: string;
}

/** Hueco con la silueta de una StatCard, para la rejilla de métricas. */
export function SkeletonStatCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-card border border-admin-line bg-card-bg p-5 shadow-e3',
        className,
      )}
    >
      <Skeleton shape="text" className="w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton shape="text" className="w-16" />
    </div>
  );
}

export interface SkeletonRegionProps {
  /** Mientras es true muestra el skeleton; luego, los hijos. */
  loading: boolean;
  /** Qué se está cargando, para anunciarlo. */
  label: string;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Envoltorio que cose el estado de carga a la accesibilidad: `aria-busy`
 * mientras carga y un texto para lectores de pantalla, de modo que quien no
 * ve los bloques grises también sepa que hay algo en camino.
 */
export function SkeletonRegion({
  loading,
  label,
  skeleton,
  children,
  className,
}: SkeletonRegionProps) {
  return (
    <div aria-busy={loading} aria-live="polite" className={className}>
      {loading ? (
        <>
          <span className="sr-only">Cargando {label}…</span>
          {skeleton}
        </>
      ) : (
        children
      )}
    </div>
  );
}
