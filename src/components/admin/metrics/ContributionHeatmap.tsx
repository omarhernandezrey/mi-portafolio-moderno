'use client';

import React, { useMemo, useState } from 'react';
import { sequentialStep } from '@/lib/charts/palette';
import type { SerieDiaria } from '@/lib/metrics/github-summary';

export interface ContributionHeatmapProps {
  data: readonly SerieDiaria[];
}

const CELDA = 11;
const HUECO = 3;
const PASO = CELDA + HUECO;

function fechaLarga(fecha: string): string {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${dia} de ${meses[mes - 1]} de ${anio}`;
}

/**
 * Mapa de calor de contribuciones (T-14): una celda por día, en columnas de
 * semana (igual que el calendario de GitHub). El color es `sequentialStep`
 * sobre los días CON actividad; un día sin commits es un hueco neutro, no el
 * paso más claro de la rampa — así "0" no se confunde con "poca actividad".
 */
export function ContributionHeatmap({ data }: ContributionHeatmapProps) {
  const [celdaHover, setCeldaHover] = useState<SerieDiaria | null>(null);
  const [verTabla, setVerTabla] = useState(false);

  const max = Math.max(1, ...data.map((d) => d.commits));

  const semanas = useMemo(() => {
    if (data.length === 0) return [];
    const porFecha = new Map(data.map((d) => [d.fecha, d.commits]));
    const primera = new Date(`${data[0].fecha}T00:00:00Z`);
    // Retrocede al domingo de esa semana para que todas las columnas empiecen en domingo.
    const inicio = new Date(primera);
    inicio.setUTCDate(inicio.getUTCDate() - inicio.getUTCDay());

    const ultima = new Date(`${data[data.length - 1].fecha}T00:00:00Z`);
    const filas: Array<Array<{ fecha: string; commits: number } | null>> = [];
    const cursor = new Date(inicio);
    let semanaActual: Array<{ fecha: string; commits: number } | null> = [];

    while (cursor <= ultima) {
      const fecha = cursor.toISOString().slice(0, 10);
      semanaActual.push(fecha >= data[0].fecha ? { fecha, commits: porFecha.get(fecha) ?? 0 } : null);
      if (semanaActual.length === 7) {
        filas.push(semanaActual);
        semanaActual = [];
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    if (semanaActual.length > 0) {
      while (semanaActual.length < 7) semanaActual.push(null);
      filas.push(semanaActual);
    }
    return filas;
  }, [data]);

  const ancho = semanas.length * PASO;
  const alto = 7 * PASO;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono-label text-3xs text-text-muted/60">Historial</p>
          <h3 className="text-sm font-bold text-admin-ink">Mapa de contribuciones</h3>
        </div>
        <button
          type="button"
          onClick={() => setVerTabla((v) => !v)}
          className="inline-flex min-h-11 items-center px-2 font-mono-label text-kicker text-primary transition-colors hover:text-primary/80"
        >
          {verTabla ? 'Ver mapa' : 'Ver tabla'}
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
              {[...data].filter((d) => d.commits > 0).reverse().map((d) => (
                <tr key={d.fecha}>
                  <td className="px-3 py-1.5 text-admin-ink">{fechaLarga(d.fecha)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-admin-ink">{d.commits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative overflow-x-auto">
          <svg
            viewBox={`0 0 ${ancho} ${alto}`}
            width={ancho}
            height={alto}
            role="img"
            aria-label="Un cuadro por día; más oscuro significa más commits ese día"
          >
            {semanas.map((semana, col) =>
              semana.map((dia, fila) => {
                if (!dia) return null;
                const color = dia.commits > 0 ? sequentialStep(dia.commits / max) : 'var(--chart-grid)';
                return (
                  <rect
                    key={dia.fecha}
                    x={col * PASO}
                    y={fila * PASO}
                    width={CELDA}
                    height={CELDA}
                    rx={2}
                    fill={color}
                    tabIndex={0}
                    role="img"
                    aria-label={`${fechaLarga(dia.fecha)}: ${dia.commits} commits`}
                    onPointerEnter={() => setCeldaHover(dia)}
                    onPointerLeave={() => setCeldaHover(null)}
                    onFocus={() => setCeldaHover(dia)}
                    onBlur={() => setCeldaHover(null)}
                  />
                );
              }),
            )}
          </svg>

          {celdaHover && (
            <div className="pointer-events-none absolute left-2 top-full mt-2 rounded-field border border-admin-line bg-admin-raised px-2.5 py-1.5 text-xs shadow-e2">
              <p className="font-bold text-admin-ink">{celdaHover.commits} commits</p>
              <p className="text-text-muted">{fechaLarga(celdaHover.fecha)}</p>
            </div>
          )}

          <div className="mt-2 flex items-center gap-1.5 font-mono-label text-kicker text-text-muted">
            Menos
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: 'var(--chart-grid)' }} />
            {[0.15, 0.4, 0.65, 1].map((t) => (
              <span key={t} className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: sequentialStep(t) }} />
            ))}
            Más
          </div>
        </div>
      )}
    </div>
  );
}
