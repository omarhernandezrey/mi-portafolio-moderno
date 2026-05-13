import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  color?: 'primary' | 'accent';
  description?: string;
}

export default function StatCard({ title, value, icon, trend, color = 'primary', description }: StatCardProps) {
  const isPrimary = color === 'primary';

  return (
    <div className="bg-card-bg p-8 rounded-[32px] border border-white/5 shadow-xl relative overflow-hidden group hover:border-primary/20 transition-all duration-500">
      {/* Decorative Glow */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${isPrimary ? 'bg-primary' : 'bg-accent'}`} />

      <div className="flex items-start justify-between mb-8">
        <div className={`p-4 rounded-2xl border transition-all duration-500 ${
          isPrimary
            ? 'bg-primary/5 border-primary/10 text-primary group-hover:bg-primary group-hover:text-background'
            : 'bg-accent/5 border-accent/10 text-accent group-hover:bg-accent group-hover:text-background'
        }`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter ${isPrimary ? 'text-primary' : 'text-accent'}`}>
            {trend}
            <ArrowUpRight size={12} />
          </div>
        )}
      </div>

      <div className="relative z-10">
        <div className="text-4xl font-black text-white-custom tracking-tighter mb-2">{value}</div>
        <div className="text-[10px] uppercase font-black tracking-[0.2em] text-white-custom/60 group-hover:text-white-custom transition-colors">{title}</div>
        {description && (
          <div className="text-[10px] text-text-muted mt-3 font-medium italic opacity-60 line-clamp-1">{description}</div>
        )}
      </div>
    </div>
  );
}
