'use client';

import React, { useMemo, useState } from 'react';
import { assignSeriesColors } from '@/lib/charts/palette';
import type { RepoConCommits } from '@/lib/metrics/github-summary';

export interface RepoCommitsBarChartProps {
  data: readonly RepoConCommits[];
}

const ALTO_BARRA = 22;
const GAP = 10;

/**
 * Commits por repositorio (T-14): aquí sí hay identidad categórica real —
 * cada barra es un repo distinto que el lector necesita poder nombrar, no
 * solo rankear — así que usa `assignSeriesColors` (8 slots fijos + «Otros»
 * desde el 9º) con una leyenda, a diferencia de las barras de lenguajes.
 */
export function RepoCommitsBarChart({ data }: RepoCommitsBarChartProps) {
  const [indiceHover, setIndiceHover] = useState<number | null>(null);
  const [verTabla, setVerTabla] = useState(false);

  const asignadas = useMemo(
    () =>
      assignSeriesColors(
        data.filter((d) => d.commits > 0),
        (d) => d.repo,
      ),
    [data],
  );

  const filas = useMemo(
    () =>
      asignadas.map((serie) => ({
        nombre: serie.isOther ? serie.key : serie.items[0]?.repo ?? serie.key,
        commits: serie.items.reduce((s, it) => s + it.commits, 0),
        color: serie.color,
      })),
    [asignadas],
  );

  const max = Math.max(1, ...filas.map((f) => f.commits));
  const alto = filas.length * (ALTO_BARRA + GAP);

  if (filas.length === 0) {
    return (
      <p className="rounded-field border border-dashed border-admin-line bg-admin-raised/30 px-4 py-6 text-center text-xs font-medium text-text-muted">
        Sin commits en ningún repositorio en los últimos 30 días.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-admin-ink">Commits por repositorio (30 días)</h3>
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
                <th className="px-3 py-2 font-mono-label text-kicker text-text-muted">Repositorio</th>
                <th className="px-3 py-2 text-right font-mono-label text-kicker text-text-muted">Commits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-line">
              {filas.map((f) => (
                <tr key={f.nombre}>
                  <td className="px-3 py-1.5 text-admin-ink">{f.nombre}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-admin-ink">{f.commits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <svg viewBox={`0 0 100 ${alto}`} width="100%" height={alto} preserveAspectRatio="none" role="img" aria-label="Commits por repositorio, últimos 30 días">
            {filas.map((f, i) => {
              const anchoBarra = Math.max(1.5, (f.commits / max) * 70);
              const y = i * (ALTO_BARRA + GAP);
              const hover = indiceHover === i;
              return (
                <rect
                  key={f.nombre}
                  x={28}
                  y={y}
                  width={anchoBarra}
                  height={ALTO_BARRA}
                  rx={3}
                  fill={f.color}
                  opacity={hover ? 1 : 0.85}
                  onPointerEnter={() => setIndiceHover(i)}
                  onPointerLeave={() => setIndiceHover(null)}
                  onFocus={() => setIndiceHover(i)}
                  onBlur={() => setIndiceHover(null)}
                  tabIndex={0}
                  role="img"
                  aria-label={`${f.nombre}: ${f.commits} commits`}
                />
              );
            })}
          </svg>

          <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
            {filas.map((f, i) => (
              <li key={f.nombre} className="flex items-center gap-1.5 text-xs">
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: f.color }} />
                <span className={`truncate font-medium ${indiceHover === i ? 'text-admin-ink' : 'text-text-muted'}`}>{f.nombre}</span>
                <span className="shrink-0 tabular-nums text-admin-ink">{f.commits}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
