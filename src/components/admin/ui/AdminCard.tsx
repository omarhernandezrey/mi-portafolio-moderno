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
  const radiusClass =
    radius === '2xl'
      ? 'rounded-2xl'
      : radius === '4xl'
        ? 'rounded-[32px]'
        : 'rounded-3xl';

  return (
    <div
      className={`relative overflow-hidden border border-admin-line bg-card-bg shadow-[0_18px_45px_-32px_rgba(0,0,0,0.95)] ${paddingClass} ${radiusClass} ${className}`}
    >
      {glow && (
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-[80px]" />
      )}
      {children}
    </div>
  );
}
