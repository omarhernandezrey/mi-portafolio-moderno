/**
 * Lógica pura del resumen diario de Telegram (T-16), separada de
 * `src/app/api/cron/daily-summary/route.ts` porque Next.js valida en el
 * `build` que un `route.ts` solo exporte manejadores HTTP (`GET`, `POST`…) y
 * config (`dynamic`, `maxDuration`…) — cualquier otra exportación rompe el
 * typecheck de rutas (`.next/types/app/.../route.ts`).
 */
import { parseBudget, type BudgetCurrency } from '@/lib/budget';

/**
 * A partir de cuántas horas sin respuesta un pendiente deja de ser "el
 * backlog normal de todos los días" y pasa a merecer que se le avise a Omar.
 * Antes el resumen mandaba el conteo total de pendientes cada mañana, igual
 * tuviera 1 o 20: un número que no cambiaba casi nunca y que se dejó de leer.
 */
export const HORAS_PENDIENTE_VIEJO = 48;

/** Ventana de "ayer" en hora de Bogotá (UTC-5), independiente de la TZ del servidor. */
export function bogotaDayRange(offsetDays = 1): { start: string; end: string } {
  const BOGOTA_OFFSET_MS = -5 * 60 * 60 * 1000;
  const nowBogota = new Date(Date.now() + BOGOTA_OFFSET_MS);
  const startBogota = new Date(nowBogota);
  startBogota.setUTCDate(startBogota.getUTCDate() - offsetDays);
  startBogota.setUTCHours(0, 0, 0, 0);
  const endBogota = new Date(startBogota);
  endBogota.setUTCDate(endBogota.getUTCDate() + 1);
  return {
    start: new Date(startBogota.getTime() - BOGOTA_OFFSET_MS).toISOString(),
    end: new Date(endBogota.getTime() - BOGOTA_OFFSET_MS).toISOString(),
  };
}

export interface ResumenPendientes {
  total: number;
  /** De esos, cuántos llevan más de `HORAS_PENDIENTE_VIEJO` horas sin respuesta. */
  viejos: number;
}

/** `ahora` se recibe para que el test pueda fijar la hora en vez de depender del reloj real. */
export function resumirPendientes(leads: readonly { created_at: string }[], ahora: Date): ResumenPendientes {
  const limite = ahora.getTime() - HORAS_PENDIENTE_VIEJO * 60 * 60 * 1000;
  const viejos = leads.filter((l) => new Date(l.created_at).getTime() < limite).length;
  return { total: leads.length, viejos };
}

/** `null` si no hubo ningún pago (en vez del texto fijo de la plantilla vieja). */
export function formatearPagos(paidLeads: readonly { budget: string | null }[]): string | null {
  const totales = paidLeads.reduce<Record<string, number>>((acc, lead) => {
    const { amount, currency } = parseBudget(lead.budget);
    const key = currency ?? 'USD';
    acc[key] = (acc[key] || 0) + amount;
    return acc;
  }, {});
  const etiquetas = Object.entries(totales)
    .filter(([, total]) => total > 0)
    .map(([currency, total]) =>
      new Intl.NumberFormat(currency === 'COP' ? 'es-CO' : 'en-US', {
        style: 'currency',
        currency: currency as BudgetCurrency,
        maximumFractionDigits: 0,
      }).format(total)
    );
  return etiquetas.length ? etiquetas.join(' · ') : null;
}

/** `null` si no hubo ningún lead de ayer (en vez del texto fijo de la plantilla vieja). */
export function topServicio(leads: readonly { service_requested: string | null }[]): string | null {
  const conteo: Record<string, number> = {};
  for (const l of leads) {
    const s = l.service_requested || 'Otros';
    conteo[s] = (conteo[s] || 0) + 1;
  }
  const [nombre] = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0] ?? [];
  return nombre ?? null;
}

export interface DatosResumenDiario {
  leadsCount: number;
  pendientes: ResumenPendientes;
  pagosLabel: string | null;
  servicioTop: string | null;
}

export type ResumenDiario = { skip: true; reason: string } | { skip: false; mensaje: string };

/**
 * Decide si hay algo que avisar y arma el mensaje por secciones condicionales.
 * Sin leads, sin pagos y sin pendientes "viejos" → no se envía nada: no hay
 * nada que decir que no se haya dicho ya ayer.
 */
export function construirResumenDiario(datos: DatosResumenDiario): ResumenDiario {
  const haySenal = datos.leadsCount > 0 || datos.pagosLabel !== null || datos.pendientes.viejos > 0;
  if (!haySenal) {
    return {
      skip: true,
      reason: `sin leads nuevos, sin pagos y sin pendientes con más de ${HORAS_PENDIENTE_VIEJO}h`,
    };
  }

  const secciones = ['☀️ *Buenos días Omar*', 'Ayer:'];

  if (datos.leadsCount > 0) {
    secciones.push(`- 🎯 ${datos.leadsCount} lead${datos.leadsCount === 1 ? '' : 's'} nuevo${datos.leadsCount === 1 ? '' : 's'}`);
    if (datos.servicioTop) secciones.push(`  Top servicio consultado: ${datos.servicioTop}`);
  }

  if (datos.pendientes.viejos > 0) {
    secciones.push(
      `- ⏳ ${datos.pendientes.viejos} de ${datos.pendientes.total} pendiente${datos.pendientes.total === 1 ? '' : 's'} ` +
        `lleva${datos.pendientes.viejos === 1 ? '' : 'n'} más de ${HORAS_PENDIENTE_VIEJO}h sin respuesta`
    );
  }

  if (datos.pagosLabel) {
    secciones.push(`- 💰 ${datos.pagosLabel} en pagos confirmados`);
  }

  return { skip: false, mensaje: secciones.join('\n') };
}
