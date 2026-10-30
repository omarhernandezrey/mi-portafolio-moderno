import React from 'react';

interface PageHeaderProps {
  overline?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  overline,
  title,
  description,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <header
      className={`flex flex-col gap-5 border-b border-admin-line pb-6 md:flex-row md:items-end md:justify-between md:gap-8 ${className}`}
    >
      <div className="min-w-0">
        {overline && (
          <div className="mb-2.5 flex items-center gap-2.5 font-mono-label text-[10px] text-primary">
            <span className="h-px w-6 bg-primary/40" />
            {overline}
          </div>
        )}
        <h1 className="font-display text-3xl font-semibold italic leading-[1.05] tracking-tight text-admin-ink sm:text-4xl">
          {title}
        </h1>
        {description && (
          <div className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-text-muted">
            {description}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          {actions}
        </div>
      )}
    </header>
  );
}
