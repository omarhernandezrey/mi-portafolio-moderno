import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const configs: Record<string, { label: string; color: string }> = {
  // Lead statuses
  paid: { label: 'Completado', color: 'text-primary bg-primary/10 border-primary/20 shadow-[0_0_15px_rgba(var(--primary-color-rgb),0.1)]' },
  cold: { label: 'Sin Acción', color: 'text-text-muted bg-white/5 border-white/10 opacity-60' },
  new: { label: 'Pendiente', color: 'text-accent bg-accent/10 border-accent/20 animate-pulse' },
  contacted: { label: 'En Curso', color: 'text-white-custom bg-white/10 border-white/20' },
  lost: { label: 'Perdido', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  archived: { label: 'Archivado', color: 'text-text-muted bg-white/5 border-white/10 opacity-60' },
  // Ticket statuses
  open: { label: 'Abierto', color: 'text-blue-400 bg-blue-500/20 border-blue-500/20' },
  in_progress: { label: 'En Proceso', color: 'text-amber-400 bg-amber-500/20 border-amber-500/20' },
  waiting_client: { label: 'Esperando', color: 'text-purple-400 bg-purple-500/20 border-purple-500/20' },
  closed: { label: 'Cerrado', color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/20' },
  // Invoice statuses
  sent: { label: 'Enviada', color: 'text-blue-400 bg-blue-500/20 border-blue-500/20' },
  cancelled: { label: 'Cancelada', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  // Generic fallback
  default: { label: 'Desconocido', color: 'text-text-muted bg-white/5 border-white/10' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = configs[status] || configs.default;
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-[8px] rounded-md' 
    : 'px-3 py-1 text-[9px] rounded-lg';

  return (
    <span className={`inline-block font-black uppercase tracking-widest border transition-all ${sizeClasses} ${config.color}`}>
      {config.label}
    </span>
  );
}
