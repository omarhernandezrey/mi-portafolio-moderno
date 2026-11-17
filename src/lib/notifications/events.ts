/**
 * Decisiones puras de los eventos nuevos de Telegram (T-17): "racha en
 * riesgo" y "caída sostenida de un Core Web Vital". Sin red ni Supabase,
 * igual que `github-summary.ts` (T-14) y `aggregate-vitals.ts` (T-15) — para
 * poder probar "se envía" / "no se envía" sin mocks.
 *
 * El evento "proyecto publicado" no vive aquí: su decisión es una
 * comparación de una sola línea (`is_published` anterior vs nuevo) dentro de
 * la propia ruta PATCH, no necesita su propio módulo. El de "lead real
 * entrante" ya existía antes de T-17 (`registerContactFormLead`); T-17 solo
 * le añadió los tests que le faltaban.
 */
import { LCPThresholds, INPThresholds, CLSThresholds } from 'web-vitals';
import type { Metrica, Dispositivo } from '@/lib/analytics/aggregate-vitals';

/**
 * Avisa solo cuando `is_published` pasa de `false`/ausente a `true` EN ESTA
 * edición. Dos `PATCH` seguidos con `is_published: true` solo avisan la
 * primera vez — la propia comparación contra el estado anterior es la
 * protección contra duplicados, sin necesitar `notification_log`.
 */
export function debeAvisarProyectoPublicado(params: { estabaPublicado: boolean; quedaPublicado: boolean }): boolean {
  return params.quedaPublicado && !params.estabaPublicado;
}

export function mensajeProyectoPublicado(titulo: string): string {
  return `🚀 *Proyecto publicado*\n"${titulo}" ya está visible en el portafolio.`;
}

/** Días consecutivos a partir de los cuales una racha merece protegerse con un aviso. */
export const UMBRAL_RACHA_EN_RIESGO = 3;

/** Avisa solo si hay una racha que proteger Y todavía no hay commit hoy. */
export function debeAvisarRachaEnRiesgo(params: { racha: number; huboCommitHoy: boolean }): boolean {
  return params.racha >= UMBRAL_RACHA_EN_RIESGO && !params.huboCommitHoy;
}

export function mensajeRachaEnRiesgo(racha: number): string {
  return `🔥 *Racha en riesgo*\nLlevas ${racha} días consecutivos con commits, pero todavía no hay ninguno hoy. Si el día termina sin un commit, la racha se corta.`;
}

/** Umbral "poor" oficial de cada métrica (el límite alto de web-vitals: por encima, mal). */
const UMBRAL_POOR: Record<Metrica, number> = {
  LCP: LCPThresholds[1],
  INP: INPThresholds[1],
  CLS: CLSThresholds[1],
};

/** Mínimo de visitas para que un p75 sea un dato, no ruido de una o dos cargas. */
const MUESTRAS_MINIMAS = 5;

/**
 * "Sostenida" la da la propia ventana de agregación de quien llama (T-15
 * agrega por p75 sobre varios días): esta función solo compara ese p75 ya
 * agregado contra el umbral oficial, no mira muestras sueltas.
 */
export function esCaidaSostenida(metric: Metrica, p75: number, muestras: number): boolean {
  return muestras >= MUESTRAS_MINIMAS && p75 > UMBRAL_POOR[metric];
}

const UNIDAD: Record<Metrica, string> = { LCP: 'ms', INP: 'ms', CLS: '' };
const NOMBRE_DISPOSITIVO: Record<Dispositivo, string> = { mobile: 'móvil', desktop: 'escritorio' };

export function mensajeVitalEnRiesgo(metric: Metrica, device: Dispositivo, p75: number): string {
  const valor = metric === 'CLS' ? p75.toFixed(2) : Math.round(p75).toString();
  return `📉 *${metric} en ${NOMBRE_DISPOSITIVO[device]} está por encima de lo saludable*\np75: ${valor}${UNIDAD[metric]} (umbral: ${UMBRAL_POOR[metric]}${UNIDAD[metric]}).`;
}
