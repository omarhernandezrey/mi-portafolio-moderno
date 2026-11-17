import React from 'react';

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'normal' | 'large';
  radius?: '2xl' | '3xl' | '4xl';
  glow?: boolean;
}

export default function AdminCard({
  children,
  className = '',
  padding = 'normal',
  radius = '2xl',
  glow = false,
}: AdminCardProps) {
  const paddingClass =
    padding === 'none' ? '' : padding === 'large' ? 'p-8 md:p-10' : 'p-5 md:p-7';
  // T-26: los valores del prop se conservan por compatibilidad, pero mapean a
  // la escala de roles de T-01 (card=20px, panel=28px, canvas=32px) — la deuda
  // que DESIGN.md §Shapes dejó anotada en T-24 y la auditoría mandó saldar.
  const radiusClass =
    radius === '2xl'
      ? 'rounded-card'
      : radius === '4xl'
        ? 'rounded-canvas'
        : 'rounded-panel';

  return (
    <div
      className={`relative overflow-hidden border border-admin-line bg-card-bg shadow-e3 ${paddingClass} ${radiusClass} ${className}`}
    >
      {glow && (
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-[80px]" />
      )}
      {children}
    </div>
  );
}
