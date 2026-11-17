/**
 * Agregación de Web Vitals para el panel (T-15).
 *
 * Google y el propio `web-vitals` reportan Core Web Vitals como **p75**: el
 * valor bajo el que cae el 75% de las visitas, no el promedio (un promedio
 * se deja arrastrar por unos pocos valores altísimos; p75 es lo que la
 * mayoría de verdad experimenta). Todo aquí es puro — sin red ni Supabase —
 * para poder probarlo sin mocks, igual que `github-summary.ts` de T-14.
 */
export type Metrica = 'LCP' | 'INP' | 'CLS';
export type Dispositivo = 'mobile' | 'desktop';

/** Una fila de `analytics_vitals`, tal como la devuelve Supabase. */
export interface FilaVital {
  metric: Metrica;
  device: Dispositivo;
  value: number;
}

export interface ResumenVital {
  metric: Metrica;
  device: Dispositivo;
  /** Percentil 75: lo que de verdad experimenta la mayoría de las visitas. */
  p75: number;
  muestras: number;
}

/**
 * Percentil por interpolación lineal (método R-7, el mismo que usa
 * `numpy.percentile` por defecto). `valores` no necesita venir ordenado.
 */
export function percentil(valores: readonly number[], p: number): number {
  if (valores.length === 0) return 0;
  const ordenados = [...valores].sort((a, b) => a - b);
  if (ordenados.length === 1) return ordenados[0];

  const rango = (p / 100) * (ordenados.length - 1);
  const indiceInferior = Math.floor(rango);
  const indiceSuperior = Math.ceil(rango);
  if (indiceInferior === indiceSuperior) return ordenados[indiceInferior];

  const peso = rango - indiceInferior;
  return ordenados[indiceInferior] * (1 - peso) + ordenados[indiceSuperior] * peso;
}

/**
 * Agrupa por (métrica, dispositivo) y calcula el p75 de cada combinación.
 * Solo incluye combinaciones con al menos una muestra — nunca un p75 de
 * cero inventado para una métrica sin datos todavía.
 */
export function agregarVitales(filas: readonly FilaVital[]): ResumenVital[] {
  const grupos = new Map<string, number[]>();
  for (const fila of filas) {
    const clave = `${fila.metric}:${fila.device}`;
    const valores = grupos.get(clave);
    if (valores) valores.push(fila.value);
    else grupos.set(clave, [fila.value]);
  }

  const resultado: ResumenVital[] = [];
  for (const [clave, valores] of grupos) {
    const [metric, device] = clave.split(':') as [Metrica, Dispositivo];
    resultado.push({ metric, device, p75: percentil(valores, 75), muestras: valores.length });
  }

  // Orden estable y predecible: por métrica (LCP, INP, CLS) y luego dispositivo.
  const ORDEN_METRICA: Metrica[] = ['LCP', 'INP', 'CLS'];
  const ORDEN_DISPOSITIVO: Dispositivo[] = ['mobile', 'desktop'];
  resultado.sort(
    (a, b) =>
      ORDEN_METRICA.indexOf(a.metric) - ORDEN_METRICA.indexOf(b.metric) ||
      ORDEN_DISPOSITIVO.indexOf(a.device) - ORDEN_DISPOSITIVO.indexOf(b.device),
  );
  return resultado;
}
