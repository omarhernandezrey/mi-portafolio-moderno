import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

type StatTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatTrend {
  value: string;
  direction?: 'up' | 'down' | 'neutral';
  label?: string;
}

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  trend?: string | StatTrend;
  color?: StatTone;
  description?: string;
  sparkline?: number[];
  /** T-27: el KPI protagonista de una vista usa la voz Metric completa. */
  size?: 'default' | 'featured';
  className?: string;
}

// T-27: sin la caja de icono ni el halo de esquina (ambos eran decoración,
// no información — el craft-floor los marca como costume). `line` es la
// única seña de tono que queda: un filo de 1px, nunca un bloque de color.
// `neutral` es el tono de los KPI que no narran un estado — el color queda
// reservado al chip de variación, que decide por su propia dirección.
const TONE_CLASSES: Record<StatTone, { line: string; text: string }> = {
  primary: { line: 'via-primary/50', text: 'text-primary' },
  accent: { line: 'via-accent/50', text: 'text-accent' },
  success: { line: 'via-admin-success/50', text: 'text-admin-success' },
  warning: { line: 'via-admin-warning/50', text: 'text-admin-warning' },
  danger: { line: 'via-admin-danger/50', text: 'text-admin-danger' },
  info: { line: 'via-admin-info/50', text: 'text-admin-info' },
  neutral: { line: 'via-admin-line', text: 'text-text-muted' },
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
  size = 'default',
  className = '',
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
    <article className={`relative overflow-hidden rounded-card border border-admin-line bg-card-bg p-5 shadow-e3 ${className}`}>
      <div
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent ${tone.line}`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {icon && <span className="shrink-0 text-text-muted/50">{icon}</span>}
          <p className="min-w-0 font-mono-label text-3xs leading-tight text-text-muted/70">
            {title}
          </p>
        </div>
        {trendData && (
          <span
            className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2 py-1 text-3xs font-bold ${trendClass}`}
            title={trendData.label}
          >
            <TrendIcon size={11} />
            {trendData.value}
          </span>
        )}
      </div>

      <div className="relative mt-5 flex items-end justify-between gap-4">
        {/* La voz Metric del sistema (DESIGN.md): fluida, 700, tracking propio.
            tabular-nums evita el baile de dígitos cuando el dato cambia. */}
        <p className={`${size === 'featured' ? 'text-metric' : 'text-metric-sm'} tabular-nums text-admin-ink`}>
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
