import React from 'react';

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'normal' | 'large';
  radius?: '2xl' | '3xl' | '4xl';
  glow?: boolean;
}

export default function AdminCard({ children, className = '', padding = 'normal', radius = '3xl', glow = true }: AdminCardProps) {
  const paddingClass = padding === 'none' ? '' : padding === 'large' ? 'p-8 md:p-10' : 'p-6 md:p-8';
  const radiusClass = radius === '2xl' ? 'rounded-2xl' : radius === '4xl' ? 'rounded-[40px]' : 'rounded-[32px]';

  return (
    <div className={`bg-card-bg border border-white/5 shadow-2xl overflow-hidden backdrop-blur-sm relative ${paddingClass} ${radiusClass} ${className}`}>
      {glow && (
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 blur-[80px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      )}
      {children}
    </div>
  );
}
