/**
 * Agregación del histórico de disponibilidad, por días.
 *
 * Todo aquí es puro —sin red ni Supabase— para poder probarlo sin mocks, igual
 * que `aggregate-vitals.ts` (T-15) y `github-summary.ts` (T-14).
 *
 * LA REGLA QUE GOBIERNA ESTE ARCHIVO: un día sin comprobaciones NO es un día
 * al 100%. Es un día sin datos, y sale como `porcentaje: null`. Esto existe
 * porque la gráfica que había antes en `/status` inventaba las alturas con
 * `Math.random()` y afirmaba «100% Stability» en cada barra; rellenar los
 * huecos con un valor optimista sería el mismo error con otra forma. Si el
 * registro se cayó, lo honesto es decir que no se sabe.
 *
 * Los días se agrupan por fecha UTC, no por la zona del visitante: así el
 * mismo histórico produce siempre los mismos tramos, sea quien sea el que
 * mire, y las pruebas son deterministas. La etiqueta que ve el usuario la
 * formatea la interfaz.
 */

export type EstadoDeComprobacion = 'operational' | 'degraded' | 'down';

/** Una fila de `uptime_checks`, tal como la devuelve Supabase. */
export interface FilaDeUptime {
  checked_at: string;
  status: EstadoDeComprobacion;
  latency_ms: number;
}

export interface DiaDeUptime {
  /** `YYYY-MM-DD` en UTC. */
  fecha: string;
  /** 0 significa que ese día no se registró nada. */
  comprobaciones: number;
  operativas: number;
  /** `null` cuando no hay comprobaciones: sin datos, no 100%. */
  porcentaje: number | null;
  /** Latencia media del día, redondeada. `null` sin datos. */
  latenciaMedia: number | null;
}

export interface ResumenDeUptime {
  /** Exactamente `dias` tramos, del más antiguo al más reciente. */
  dias: DiaDeUptime[];
  /** Solo sobre los días CON datos; `null` si no hay ninguno. */
  porcentajeGlobal: number | null;
  /** Cuántos de los tramos tienen al menos una comprobación. */
  diasConDatos: number;
  totalComprobaciones: number;
  /** Fecha de la comprobación más antigua del tramo, o `null`. */
  registrandoDesde: string | null;
}

function fechaUtc(iso: string): string {
  return iso.slice(0, 10);
}

function sumarDias(fecha: Date, dias: number): Date {
  const d = new Date(fecha);
  d.setUTCDate(d.getUTCDate() + dias);
  return d;
}

/**
 * @param filas    Comprobaciones en cualquier orden. Las que caen fuera de la
 *                 ventana se ignoran.
 * @param dias     Cuántos tramos devolver, terminando en `hasta`.
 * @param hasta    Momento final de la ventana (por defecto, ahora).
 */
export function agregarUptimePorDia(
  filas: readonly FilaDeUptime[],
  dias: number,
  hasta: Date = new Date(),
): ResumenDeUptime {
  const tramos = Math.max(0, Math.floor(dias));

  // Esqueleto de la ventana: se construye SIEMPRE completo, haya datos o no.
  // Si se construyera solo con los días presentes en `filas`, un corte del
  // registro desaparecería de la gráfica en vez de verse como el hueco que es.
  const porFecha = new Map<string, DiaDeUptime>();
  const orden: string[] = [];
  for (let i = tramos - 1; i >= 0; i -= 1) {
    const fecha = fechaUtc(sumarDias(hasta, -i).toISOString());
    porFecha.set(fecha, {
      fecha,
      comprobaciones: 0,
      operativas: 0,
      porcentaje: null,
      latenciaMedia: null,
    });
    orden.push(fecha);
  }

  const latencias = new Map<string, number[]>();
  let totalComprobaciones = 0;
  let masAntigua: string | null = null;

  for (const fila of filas) {
    const fecha = fechaUtc(fila.checked_at);
    const dia = porFecha.get(fecha);
    if (!dia) continue; // fuera de la ventana

    dia.comprobaciones += 1;
    if (fila.status === 'operational') dia.operativas += 1;

    const acumuladas = latencias.get(fecha) ?? [];
    acumuladas.push(fila.latency_ms);
    latencias.set(fecha, acumuladas);

    totalComprobaciones += 1;
    if (masAntigua === null || fila.checked_at < masAntigua) {
      masAntigua = fila.checked_at;
    }
  }

  let operativasTotales = 0;
  let conDatos = 0;

  for (const fecha of orden) {
    const dia = porFecha.get(fecha)!;
    if (dia.comprobaciones === 0) continue;

    conDatos += 1;
    operativasTotales += dia.operativas;
    // Un decimal: «99.9%» informa; «99.86111%» finge una precisión que
    // 24 comprobaciones al día no dan.
    dia.porcentaje =
      Math.round((dia.operativas / dia.comprobaciones) * 1000) / 10;

    const suyas = latencias.get(fecha)!;
    dia.latenciaMedia = Math.round(
      suyas.reduce((a, b) => a + b, 0) / suyas.length,
    );
  }

  return {
    dias: orden.map((f) => porFecha.get(f)!),
    porcentajeGlobal:
      totalComprobaciones === 0
        ? null
        : Math.round((operativasTotales / totalComprobaciones) * 1000) / 10,
    diasConDatos: conDatos,
    totalComprobaciones,
    registrandoDesde: masAntigua,
  };
}
