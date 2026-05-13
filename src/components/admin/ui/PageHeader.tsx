import React from 'react';

interface PageHeaderProps {
  overline?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ overline, title, description, actions, className = '' }: PageHeaderProps) {
  return (
    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 ${className}`}>
      <div>
        {overline && (
          <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-3">
            <span className="w-8 h-px bg-primary/30" />
            {overline}
          </div>
        )}
        <h1 className="text-4xl font-black text-white-custom tracking-tight mb-2 italic">{title}</h1>
        {description && (
          <p className="text-text-muted text-sm font-medium">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}
