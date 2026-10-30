import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const configs: Record<
  string,
  { label: string; color: string; dot: string; pulse?: boolean }
> = {
  // Leads
  new: {
    label: 'Nuevo',
    color: 'text-accent border-accent/20 bg-accent/10',
    dot: 'bg-accent',
    pulse: true,
  },
  contacted: {
    label: 'Contactado',
    color: 'text-admin-info border-admin-info/20 bg-admin-info/10',
    dot: 'bg-admin-info',
  },
  followed_up: {
    label: 'En seguimiento',
    color: 'text-primary border-primary/20 bg-primary/10',
    dot: 'bg-primary',
  },
  in_progress: {
    label: 'En proceso',
    color: 'text-admin-warning border-admin-warning/20 bg-admin-warning/10',
    dot: 'bg-admin-warning',
    pulse: true,
  },
  paid: {
    label: 'Pagado',
    color: 'text-admin-success border-admin-success/20 bg-admin-success/10',
    dot: 'bg-admin-success',
  },
  cold: {
    label: 'Frío',
    color: 'text-text-muted border-admin-line bg-white/[0.04]',
    dot: 'bg-text-muted',
  },
  lost: {
    label: 'Perdido',
    color: 'text-admin-danger border-admin-danger/20 bg-admin-danger/10',
    dot: 'bg-admin-danger',
  },
  archived: {
    label: 'Archivado',
    color: 'text-text-muted border-admin-line bg-white/[0.04]',
    dot: 'bg-text-muted',
  },
  // Tickets
  open: {
    label: 'Abierto',
    color: 'text-admin-info border-admin-info/20 bg-admin-info/10',
    dot: 'bg-admin-info',
  },
  waiting_client: {
    label: 'Esperando cliente',
    color: 'text-accent border-accent/20 bg-accent/10',
    dot: 'bg-accent',
  },
  closed: {
    label: 'Cerrado',
    color: 'text-admin-success border-admin-success/20 bg-admin-success/10',
    dot: 'bg-admin-success',
  },
  // Invoices
  draft: {
    label: 'Borrador',
    color: 'text-text-muted border-admin-line bg-white/[0.04]',
    dot: 'bg-text-muted',
  },
  sent: {
    label: 'Enviada',
    color: 'text-admin-info border-admin-info/20 bg-admin-info/10',
    dot: 'bg-admin-info',
  },
  cancelled: {
    label: 'Cancelada',
    color: 'text-admin-danger border-admin-danger/20 bg-admin-danger/10',
    dot: 'bg-admin-danger',
  },
  default: {
    label: 'Desconocido',
    color: 'text-text-muted border-admin-line bg-white/[0.04]',
    dot: 'bg-text-muted',
  },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const fallbackLabel = status
    ? status
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase())
    : 'Desconocido';
  const config = configs[status] || {
    ...configs.default,
    label: fallbackLabel,
  };
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px]'
      : 'px-2.5 py-1 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-bold ${sizeClasses} ${config.color}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dot} ${config.pulse ? 'animate-pulse' : ''}`}
      />
      {config.label}
    </span>
  );
}
