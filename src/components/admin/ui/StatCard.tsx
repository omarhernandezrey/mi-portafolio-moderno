import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

type StatTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

interface StatTrend {
  value: string;
  direction?: 'up' | 'down' | 'neutral';
  label?: string;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string | StatTrend;
  color?: StatTone;
  description?: string;
  sparkline?: number[];
}

const TONE_CLASSES: Record<
  StatTone,
  { icon: string; line: string; text: string; glow: string }
> = {
  primary: {
    icon: 'border-primary/20 bg-primary/10 text-primary',
    line: 'via-primary/50',
    text: 'text-primary',
    glow: 'bg-primary',
  },
  accent: {
    icon: 'border-accent/20 bg-accent/10 text-accent',
    line: 'via-accent/50',
    text: 'text-accent',
    glow: 'bg-accent',
  },
  success: {
    icon: 'border-admin-success/20 bg-admin-success/10 text-admin-success',
    line: 'via-admin-success/50',
    text: 'text-admin-success',
    glow: 'bg-admin-success',
  },
  warning: {
    icon: 'border-admin-warning/20 bg-admin-warning/10 text-admin-warning',
    line: 'via-admin-warning/50',
    text: 'text-admin-warning',
    glow: 'bg-admin-warning',
  },
  danger: {
    icon: 'border-admin-danger/20 bg-admin-danger/10 text-admin-danger',
    line: 'via-admin-danger/50',
    text: 'text-admin-danger',
    glow: 'bg-admin-danger',
  },
  info: {
    icon: 'border-admin-info/20 bg-admin-info/10 text-admin-info',
    line: 'via-admin-info/50',
    text: 'text-admin-info',
    glow: 'bg-admin-info',
  },
};

function Sparkline({ data, tone }: { data: number[]; tone: StatTone }) {
  if (data.length < 2) return null;

  const width = 112;
  const height = 36;
  const padding = 3;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  const gradientId = `stat-gradient-${tone}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`h-9 w-28 shrink-0 ${TONE_CLASSES[tone].text}`}
      role="img"
      aria-label="Tendencia del indicador"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.24" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradientId})`} />
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'primary',
  description,
  sparkline,
}: StatCardProps) {
  const tone = TONE_CLASSES[color];
  const trendData: StatTrend | undefined =
    typeof trend === 'string' ? { value: trend, direction: 'neutral' } : trend;
  const TrendIcon =
    trendData?.direction === 'up'
      ? ArrowUpRight
      : trendData?.direction === 'down'
        ? ArrowDownRight
        : Minus;
  const trendClass =
    trendData?.direction === 'up'
      ? 'text-admin-success bg-admin-success/10 border-admin-success/20'
      : trendData?.direction === 'down'
        ? 'text-admin-danger bg-admin-danger/10 border-admin-danger/20'
        : 'text-text-muted bg-white/[0.04] border-admin-line';

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-admin-line bg-card-bg p-5 shadow-[0_18px_45px_-32px_rgba(0,0,0,0.95)]">
      <div
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent ${tone.line}`}
      />
      <div
        className={`pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full blur-[55px] opacity-0 transition-opacity duration-500 group-hover:opacity-20 ${tone.glow}`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${tone.icon}`}
          >
            {icon}
          </div>
          <p className="min-w-0 font-mono-label text-[10px] leading-tight text-text-muted/70">
            {title}
          </p>
        </div>
        {trendData && (
          <span
            className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2 py-1 text-[10px] font-bold ${trendClass}`}
            title={trendData.label}
          >
            <TrendIcon size={11} />
            {trendData.value}
          </span>
        )}
      </div>

      <div className="relative mt-5 flex items-end justify-between gap-4">
        <p className="text-3xl font-black tracking-tight text-admin-ink sm:text-4xl">
          {value}
        </p>
        {sparkline && <Sparkline data={sparkline} tone={color} />}
      </div>

      {description && (
        <p className="relative mt-2 text-xs font-medium leading-relaxed text-text-muted">
          {description}
        </p>
      )}
    </article>
  );
}
