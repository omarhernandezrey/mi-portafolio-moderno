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
          <div className="font-mono-label flex items-center gap-2 text-primary text-[0.65rem] mb-3">
            <span className="w-8 h-px bg-primary/30" />
            {overline}
          </div>
        )}
        <h1 className="font-display italic text-4xl font-medium text-white-custom tracking-tight mb-2">{title}</h1>
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
