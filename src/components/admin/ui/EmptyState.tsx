import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export default function EmptyState({ icon, title, description, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-text-muted/20">
        {icon}
      </div>
      <div className="space-y-1 text-center">
        <p className="text-white-custom font-bold text-lg tracking-tight">{title}</p>
        {description && (
          <p className="text-text-muted text-sm font-medium italic opacity-60">{description}</p>
        )}
      </div>
    </div>
  );
}
