/**
 * KPI de alcance real del portafolio (T-27): cuántos leads llegan de verdad
 * desde el sitio público. Deliberadamente excluye 'chatbot' (retirado, T-25)
 * y 'manual' (altas del propio panel, no alcance del sitio) — solo cuentan
 * el formulario de contacto y la calculadora de presupuesto.
 *
 * Puras y sin IO, igual que `metrics/github-summary.ts`: la fecha y los
 * conteos se piden en la página (server component); aquí solo se calculan.
 */
export const FUENTES_DEL_SITIO = ['contact_form', 'budget_calculator'] as const;

const BOGOTA_OFFSET_MS = -5 * 60 * 60 * 1000;

/** Medianoche del día 1 del mes en Bogotá, N meses atrás. `ahora` es inyectable para tests. */
export function bogotaStartOfMonth(monthsAgo = 0, ahora: Date = new Date()): Date {
  const nowBogota = new Date(ahora.getTime() + BOGOTA_OFFSET_MS);
  const fecha = new Date(nowBogota);
  fecha.setUTCDate(1);
  fecha.setUTCHours(0, 0, 0, 0);
  fecha.setUTCMonth(fecha.getUTCMonth() - monthsAgo);
  return new Date(fecha.getTime() - BOGOTA_OFFSET_MS);
}

/** % de cambio contra el mes anterior. Sin mes anterior con datos, no hay división por cero: `null`. */
export function calcularVariacionMensual(actual: number, anterior: number): number | null {
  return anterior > 0 ? ((actual - anterior) / anterior) * 100 : null;
}
