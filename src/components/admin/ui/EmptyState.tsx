import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-admin-line bg-admin-raised/30 px-6 py-10 text-center ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-admin-line bg-white/[0.03] text-text-muted/60">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold text-admin-ink">{title}</p>
        {description && (
          <p className="mx-auto max-w-sm text-xs font-medium leading-relaxed text-text-muted">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
