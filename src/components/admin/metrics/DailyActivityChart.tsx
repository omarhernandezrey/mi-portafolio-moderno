'use client';

import React, { useId, useMemo, useState } from 'react';
import type { SerieDiaria } from '@/lib/metrics/github-summary';

export interface DailyActivityChartProps {
  data: readonly SerieDiaria[];
}

const ANCHO = 640;
const ALTO = 180;
const PADDING_IZQ = 36;
const PADDING_DER = 8;
const PADDING_SUP = 12;
const PADDING_INF = 28;

function fechaCorta(fecha: string): string {
  const [, mes, dia] = fecha.split('-');
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${Number(dia)} ${meses[Number(mes) - 1]}`;
}

/**
 * Línea de una sola serie (T-14): commits combinados por día, últimos 90
 * días. Una sola serie no lleva leyenda (el título ya dice qué se grafica);
 * sí lleva capa de hover con crosshair y una tabla alternativa.
 */
export function DailyActivityChart({ data }: DailyActivityChartProps) {
  const [indiceHover, setIndiceHover] = useState<number | null>(null);
  const [verTabla, setVerTabla] = useState(false);
  const idGradiente = useId();

  const max = Math.max(1, ...data.map((d) => d.commits));
  const anchoUtil = ANCHO - PADDING_IZQ - PADDING_DER;
  const altoUtil = ALTO - PADDING_SUP - PADDING_INF;

  const puntos = useMemo(
    () =>
      data.map((d, i) => {
        const x = PADDING_IZQ + (data.length <= 1 ? 0 : (i / (data.length - 1)) * anchoUtil);
        const y = PADDING_SUP + altoUtil - (d.commits / max) * altoUtil;
        return { x, y, ...d };
      }),
    [data, max, anchoUtil, altoUtil],
  );

  const lineaPath = puntos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = puntos.length > 0
    ? `${lineaPath} L ${puntos[puntos.length - 1].x.toFixed(1)} ${PADDING_SUP + altoUtil} L ${puntos[0].x.toFixed(1)} ${PADDING_SUP + altoUtil} Z`
    : '';

  const ticksY = [...new Set([0, Math.round(max / 2), max])];
  const activo = indiceHover !== null ? puntos[indiceHover] : null;

  function manejarMovimiento(e: React.PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const xRelativo = ((e.clientX - rect.left) / rect.width) * ANCHO;
    let masCercano = 0;
    let distanciaMinima = Infinity;
    puntos.forEach((p, i) => {
      const distancia = Math.abs(p.x - xRelativo);
      if (distancia < distanciaMinima) {
        distanciaMinima = distancia;
        masCercano = i;
      }
    });
    setIndiceHover(masCercano);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono-label text-3xs text-text-muted/60">Commits</p>
          <h3 className="text-sm font-bold text-admin-ink">Actividad diaria (últimos 90 días)</h3>
        </div>
        <button
          type="button"
          onClick={() => setVerTabla((v) => !v)}
          className="inline-flex min-h-11 items-center px-2 font-mono-label text-kicker text-primary transition-colors hover:text-primary/80"
        >
          {verTabla ? 'Ver gráfica' : 'Ver tabla'}
        </button>
      </div>

      {verTabla ? (
        <div className="max-h-64 overflow-y-auto rounded-field border border-admin-line">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-admin-raised">
              <tr>
                <th className="px-3 py-2 font-mono-label text-kicker text-text-muted">Fecha</th>
                <th className="px-3 py-2 text-right font-mono-label text-kicker text-text-muted">Commits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-line">
              {[...data].reverse().map((d) => (
                <tr key={d.fecha}>
                  <td className="px-3 py-1.5 text-admin-ink">{fechaCorta(d.fecha)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-admin-ink">{d.commits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="w-full" role="img" aria-label="Commits combinados por día, últimos 90 días">
            <defs>
              <linearGradient id={idGradiente} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.1" />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {ticksY.map((valor) => {
              const y = PADDING_SUP + altoUtil - (valor / max) * altoUtil;
              return (
                <g key={valor}>
                  <line x1={PADDING_IZQ} x2={ANCHO - PADDING_DER} y1={y} y2={y} stroke="var(--chart-grid)" strokeWidth={1} />
                  <text x={PADDING_IZQ - 8} y={y + 3} textAnchor="end" className="fill-text-muted" fontSize={9}>
                    {valor}
                  </text>
                </g>
              );
            })}

            {areaPath && <path d={areaPath} fill={`url(#${idGradiente})`} />}
            {lineaPath && <path d={lineaPath} fill="none" stroke="var(--chart-1)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />}

            {puntos.length > 0 && (
              <>
                <circle
                  cx={puntos[puntos.length - 1].x}
                  cy={puntos[puntos.length - 1].y}
                  r={4}
                  fill="var(--chart-1)"
                  stroke="var(--admin-surface)"
                  strokeWidth={2}
                />
                <text
                  x={puntos[puntos.length - 1].x - 4}
                  y={puntos[puntos.length - 1].y - 10}
                  textAnchor="end"
                  className="fill-admin-ink font-semibold"
                  fontSize={10}
                >
                  {puntos[puntos.length - 1].commits}
                </text>
              </>
            )}

            {activo && (
              <>
                <line x1={activo.x} x2={activo.x} y1={PADDING_SUP} y2={PADDING_SUP + altoUtil} stroke="var(--chart-axis)" strokeWidth={1} />
                <circle cx={activo.x} cy={activo.y} r={4} fill="var(--chart-1)" stroke="var(--admin-surface)" strokeWidth={2} />
              </>
            )}

            <rect
              x={PADDING_IZQ}
              y={0}
              width={anchoUtil}
              height={ALTO}
              fill="transparent"
              onPointerMove={manejarMovimiento}
              onPointerLeave={() => setIndiceHover(null)}
              onFocus={() => setIndiceHover(puntos.length - 1)}
              onBlur={() => setIndiceHover(null)}
              tabIndex={0}
              role="img"
              aria-label="Mover para ver el valor de cada día"
            />
          </svg>

          {activo && (
            <div
              className="pointer-events-none absolute top-1 rounded-field border border-admin-line bg-admin-raised px-2.5 py-1.5 text-xs shadow-e2"
              style={{ left: `${(activo.x / ANCHO) * 100}%`, transform: 'translateX(-50%)' }}
            >
              <p className="font-bold text-admin-ink">{activo.commits} commits</p>
              <p className="text-text-muted">{fechaCorta(activo.fecha)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
