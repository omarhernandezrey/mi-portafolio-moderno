import React from 'react';

/**
 * T-30: `PRIORITY_META` y su markup vivían clonados entre `tickets/page.tsx`
 * (dos veces: tarjeta móvil y fila de tabla) y `negocio/page.tsx` — 24
 * líneas idénticas por copia. Un solo primitivo, una sola fuente de verdad.
 */
const PRIORITY_META: Record<string, { label: string; className: string; dot: string }> = {
  urgent: {
    label: 'Urgente',
    className: 'text-admin-danger bg-admin-danger/10 border-admin-danger/20',
    dot: 'bg-admin-danger',
  },
  high: {
    label: 'Alta',
    className: 'text-admin-warning bg-admin-warning/10 border-admin-warning/20',
    dot: 'bg-admin-warning',
  },
  medium: {
    label: 'Media',
    className: 'text-admin-info bg-admin-info/10 border-admin-info/20',
    dot: 'bg-admin-info',
  },
  low: {
    label: 'Baja',
    className: 'text-text-muted bg-white/[0.04] border-admin-line',
    dot: 'bg-text-muted',
  },
};

interface PriorityBadgeProps {
  priority: string;
  /** Espaciado más ceñido (negocio/page.tsx: tablas con menos aire). */
  compact?: boolean;
  className?: string;
}

export default function PriorityBadge({ priority, compact = false, className = '' }: PriorityBadgeProps) {
  const meta = PRIORITY_META[priority] || PRIORITY_META.low;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border text-4xs font-bold ${compact ? 'shrink-0 px-1.5 py-0.5' : 'px-2 py-0.5'} ${meta.className} ${className}`}
    >
      <span className={`h-1 w-1 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}
