'use client';

import React, { useMemo, useState } from 'react';
import type { LenguajeAgregado } from '@/lib/metrics/github-summary';

export interface LanguagesBarChartProps {
  data: readonly LenguajeAgregado[];
}

const MAX_BARRAS = 8;
const ALTO_BARRA = 22;
const GAP = 10;

function formatearBytes(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)} KB`;
  return `${bytes} B`;
}

/**
 * Lenguajes por bytes (T-14): barras ordenadas, color UNIFORME (`--chart-1`)
 * para todas. Los lenguajes son categorías nominales (sin orden propio: el
 * orden lo da el dato) — una rampa secuencial por barra doble-codificaría el
 * largo como color, el antipatrón que `dataviz` marca como malo para
 * categorías sin orden. El nombre es la identidad, como etiqueta directa.
 */
export function LanguagesBarChart({ data }: LanguagesBarChartProps) {
  const [indiceHover, setIndiceHover] = useState<number | null>(null);
  const [verTabla, setVerTabla] = useState(false);

  const { principales, otros } = useMemo(() => {
    if (data.length <= MAX_BARRAS) return { principales: data, otros: null as LenguajeAgregado | null };
    const principales = data.slice(0, MAX_BARRAS - 1);
    const resto = data.slice(MAX_BARRAS - 1);
    const otros: LenguajeAgregado = {
      lenguaje: 'Otros',
      bytes: resto.reduce((s, r) => s + r.bytes, 0),
      porcentaje: resto.reduce((s, r) => s + r.porcentaje, 0),
    };
    return { principales, otros };
  }, [data]);

  const filas = otros ? [...principales, otros] : principales;
  const max = Math.max(1, ...filas.map((f) => f.bytes));
  const alto = filas.length * (ALTO_BARRA + GAP);

  if (data.length === 0) {
    return (
      <p className="rounded-field border border-dashed border-admin-line bg-admin-raised/30 px-4 py-6 text-center text-xs font-medium text-text-muted">
        Sin datos de lenguajes todavía: el cron de GitHub guarda bytes por lenguaje desde esta tarea, así que aparecerán en la próxima corrida.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono-label text-3xs text-text-muted/60">Código</p>
          <h3 className="text-sm font-bold text-admin-ink">Lenguajes (bytes agregados)</h3>
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
        <div className="overflow-hidden rounded-field border border-admin-line">
          <table className="w-full text-left text-xs">
            <thead className="bg-admin-raised">
              <tr>
                <th className="px-3 py-2 font-mono-label text-kicker text-text-muted">Lenguaje</th>
                <th className="px-3 py-2 text-right font-mono-label text-kicker text-text-muted">Bytes</th>
                <th className="px-3 py-2 text-right font-mono-label text-kicker text-text-muted">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-line">
              {filas.map((f) => (
                <tr key={f.lenguaje}>
                  <td className="px-3 py-1.5 text-admin-ink">{f.lenguaje}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-admin-ink">{formatearBytes(f.bytes)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-admin-ink">{f.porcentaje.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <svg viewBox={`0 0 100 ${alto}`} width="100%" height={alto} preserveAspectRatio="none" role="img" aria-label="Bytes por lenguaje, de mayor a menor">
          {filas.map((f, i) => {
            const y = i * (ALTO_BARRA + GAP);
            const anchoBarra = Math.max(1.5, (f.bytes / max) * 70);
            const hover = indiceHover === i;
            return (
              <g key={f.lenguaje}>
                <rect
                  x={28}
                  y={y}
                  width={anchoBarra}
                  height={ALTO_BARRA}
                  rx={3}
                  fill="var(--chart-1)"
                  opacity={hover ? 1 : 0.85}
                  onPointerEnter={() => setIndiceHover(i)}
                  onPointerLeave={() => setIndiceHover(null)}
                  onFocus={() => setIndiceHover(i)}
                  onBlur={() => setIndiceHover(null)}
                  tabIndex={0}
                  role="img"
                  aria-label={`${f.lenguaje}: ${formatearBytes(f.bytes)}, ${f.porcentaje.toFixed(1)} por ciento`}
                />
              </g>
            );
          })}
        </svg>
      )}

      {!verTabla && (
        <ul className="flex flex-col gap-1.5">
          {filas.map((f, i) => (
            <li key={f.lenguaje} className="flex items-center justify-between gap-3 text-xs">
              <span className={`truncate font-medium ${indiceHover === i ? 'text-admin-ink' : 'text-text-muted'}`}>{f.lenguaje}</span>
              <span className="shrink-0 tabular-nums text-admin-ink">{f.porcentaje.toFixed(1)}%</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
