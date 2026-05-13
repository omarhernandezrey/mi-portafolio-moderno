import React from 'react';

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLink?: boolean;
  href?: string;
}

export default function InfoItem({ icon, label, value, isLink, href }: InfoItemProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl border border-transparent hover:border-white/5 hover:bg-white/[0.01] transition-all group/item">
      <div className="mt-1 text-primary opacity-40 group-hover/item:opacity-100 transition-opacity">{icon}</div>
      <div className="overflow-hidden min-w-0">
        <p className="text-[9px] font-black uppercase text-text-muted/40 tracking-[0.15em] mb-1 italic">{label}</p>
        {isLink && href ? (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-bold text-white-custom hover:text-primary transition-colors flex items-center gap-1 group/link truncate"
          >
            {value}
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover/link:opacity-100 transition-opacity">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        ) : (
          <p className="text-sm font-bold text-white-custom truncate">{value}</p>
        )}
      </div>
    </div>
  );
}
