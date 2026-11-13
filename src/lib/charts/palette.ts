/**
 * Paleta de datos del dashboard.
 *
 * Los valores viven en `src/app/globals.css` como variables CSS; aquí se
 * exponen de dos formas porque los dos tipos de librería de gráficas
 * necesitan cosas distintas:
 *
 *  - `CHART_VARS` → `var(--chart-1)`. Para SVG/HTML (Recharts, Visx, D3 con
 *    elementos SVG). Es la forma preferida: si algún día se ajusta un tono,
 *    se ajusta en un solo sitio.
 *  - `CHART_HEX` → el hex literal. Solo para canvas/WebGL, que no resuelven
 *    `var()`, y para los tests.
 *
 * Reglas que este módulo hace cumplir (ver el bloque de documentación en
 * globals.css):
 *  - Los tonos se asignan en ORDEN FIJO, nunca en ciclo.
 *  - A partir de la 9ª serie no se inventa un tono: se agrupa en «Otros».
 *  - El color sigue a la entidad, no a su posición en el ranking: un filtro
 *    que cambia el número de series no puede repintar las supervivientes.
 *  - Los colores de estado (`--admin-success/warning/danger/info`) están
 *    reservados y no aparecen aquí.
 */

export const CHART_SLOTS = 8 as const;

/** Hex literal de cada slot. Calculado en OKLCH y verificado (ver globals.css). */
export const CHART_HEX = [
  '#059583', // 1 teal      — ancla de marca
  '#6559c3', // 2 violeta
  '#ac9008', // 3 oliva
  '#ab448e', // 4 magenta
  '#0897be', // 5 cian
  '#c64e31', // 6 terracota
  '#7f42a6', // 7 púrpura
  '#48ac51', // 8 verde
] as const;

/** Referencia a variable CSS de cada slot. Forma preferida en SVG/HTML. */
export const CHART_VARS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--chart-7)',
  'var(--chart-8)',
] as const;

/** Rampa secuencial: un solo tono, claro → oscuro. Para magnitud. */
export const CHART_SEQUENTIAL = [
  '#024e44',
  '#05675a',
  '#008171',
  '#0f9b89',
  '#3bb5a1',
  '#59ceba',
  '#76e9d4',
] as const;

/** Rampa divergente: teal ← gris neutro → magenta. Para polaridad. */
export const CHART_DIVERGING = [
  '#05675a',
  '#078e7d',
  '#08b7a1',
  '#6b7b8c', // punto medio neutro — nunca un tono
  '#d37db8',
  '#ac5892',
  '#85356e',
] as const;

/** Etiqueta del grupo que recoge todo lo que pasa del slot 8. */
export const OTHER_LABEL = 'Otros';

/** Color del grupo «Otros»: gris recesivo, deliberadamente sin identidad. */
export const OTHER_COLOR = 'var(--chart-axis)';

export type SeriesColorMode = 'css' | 'hex';

export interface AssignedSeries<T> {
  readonly key: string;
  readonly color: string;
  readonly items: readonly T[];
  readonly isOther: boolean;
}

/**
 * Reparte series en los 8 slots en orden fijo y agrupa el resto en «Otros».
 *
 * El orden lo decide `keyOf`, no el tamaño del dato: así una serie conserva
 * su color aunque un filtro elimine a otra. Si necesitas ordenar por
 * magnitud, ordena **antes** de llamar aquí y mantén ese orden estable entre
 * renders; nunca reordenes entre un filtro y el siguiente.
 */
export function assignSeriesColors<T>(
  items: readonly T[],
  keyOf: (item: T) => string,
  mode: SeriesColorMode = 'css',
): AssignedSeries<T>[] {
  const palette = mode === 'css' ? CHART_VARS : CHART_HEX;

  // Agrupar preservando el orden de primera aparición.
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const bucket = groups.get(key);
    if (bucket) bucket.push(item);
    else groups.set(key, [item]);
  }

  const keys = [...groups.keys()];
  const named = keys.slice(0, CHART_SLOTS);
  const overflow = keys.slice(CHART_SLOTS);

  const result: AssignedSeries<T>[] = named.map((key, i) => ({
    key,
    color: palette[i],
    items: groups.get(key) ?? [],
    isOther: false,
  }));

  if (overflow.length > 0) {
    result.push({
      key: OTHER_LABEL,
      color: OTHER_COLOR,
      items: overflow.flatMap((key) => groups.get(key) ?? []),
      isOther: true,
    });
  }

  return result;
}

/**
 * Devuelve el color de un slot concreto (0-indexado). Fuera de rango
 * devuelve el gris de «Otros» en vez de dar la vuelta al ciclo: ciclar
 * haría que dos series distintas compartieran color.
 */
export function slotColor(index: number, mode: SeriesColorMode = 'css'): string {
  if (!Number.isInteger(index) || index < 0 || index >= CHART_SLOTS) {
    return mode === 'css' ? OTHER_COLOR : '#6b7b8c';
  }
  return (mode === 'css' ? CHART_VARS : CHART_HEX)[index];
}

/**
 * Elige un paso de la rampa secuencial según un valor normalizado en [0,1].
 * Útil para mapas de calor (p. ej. el de contribuciones de GitHub).
 */
export function sequentialStep(t: number): string {
  if (!Number.isFinite(t)) return CHART_SEQUENTIAL[0];
  const clamped = Math.min(1, Math.max(0, t));
  const i = Math.round(clamped * (CHART_SEQUENTIAL.length - 1));
  return CHART_SEQUENTIAL[i];
}

/**
 * Elige un paso de la rampa divergente según un valor en [-1,1]. El 0 cae
 * exactamente en el punto medio neutro.
 */
export function divergingStep(t: number): string {
  if (!Number.isFinite(t)) return CHART_DIVERGING[3];
  const clamped = Math.min(1, Math.max(-1, t));
  const mid = (CHART_DIVERGING.length - 1) / 2; // 3
  const i = Math.round(mid + clamped * mid);
  return CHART_DIVERGING[i];
}
