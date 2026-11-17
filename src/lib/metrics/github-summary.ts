/**
 * Agregación del resumen de GitHub para el panel (T-14).
 *
 * `github_metrics` guarda UNA fila por (repo, día de captura): cada fila es
 * la foto de ese repo en ese momento (actividad diaria de las últimas 52
 * semanas, lenguajes, etc. — ver `src/lib/github.ts`). Aquí se combinan las
 * fotos más recientes de TODOS los repos en un solo resumen de portafolio:
 * la racha, por ejemplo, no es la de un repo suelto, es "¿hubo commit en
 * CUALQUIER repo ese día?".
 *
 * Todo en este archivo es puro (sin red ni base de datos) para poder
 * probarlo sin mocks de Supabase; quien lo llama (la página del panel) hace
 * la consulta y le pasa las filas ya traídas.
 */
import { calcularPorcentajesDeLenguajes, calcularRachas, type DiaDeActividad } from '@/lib/github';

/** Una fila de `github_metrics`, tal como la devuelve Supabase (snake_case). */
export interface FilaMetricasRepo {
  repo: string;
  daily_activity: DiaDeActividad[];
  languages_bytes: Record<string, number>;
}

export interface SerieDiaria {
  fecha: string;
  commits: number;
}

export interface LenguajeAgregado {
  lenguaje: string;
  bytes: number;
  porcentaje: number;
}

export interface RepoConCommits {
  repo: string;
  commits: number;
}

export interface ResumenDePortafolio {
  /** Repos con al menos una fila (lo que T-13 capturó ese día), nunca vacío si hay datos. */
  totalRepos: number;
  /** Repos con >=1 commit en la ventana de `commitsUltimosNDias`. */
  reposActivos: number;
  commitsUltimos30Dias: number;
  /** % de cambio contra los 30 días anteriores a esos 30. `null` sin base de comparación (todo cero). */
  variacionCommits30Dias: number | null;
  rachaActual: number;
  rachaMaxima: number;
  /** `null` si ningún repo tiene `languages_bytes` todavía (cron no ha corrido desde T-14). */
  lenguajePrincipal: LenguajeAgregado | null;
  /** Lenguajes agregados, de mayor a menor bytes. Vacío si no hay datos. */
  lenguajesOrdenados: LenguajeAgregado[];
  /** Actividad diaria combinada, últimos 90 días, en orden cronológico. */
  actividadReciente: SerieDiaria[];
  /** Actividad diaria combinada, toda la ventana disponible (~365 días), para el mapa de calor. */
  actividadAnual: SerieDiaria[];
  /** Commits por repo en la ventana de 30 días, de mayor a menor. */
  commitsPorRepositorio: RepoConCommits[];
}

const VENTANA_COMMITS_DIAS = 30;
const VENTANA_ACTIVIDAD_RECIENTE_DIAS = 90;

function sumarDiasEnMapa(mapa: Map<string, number>, dias: readonly DiaDeActividad[]): void {
  for (const dia of dias) {
    mapa.set(dia.fecha, (mapa.get(dia.fecha) ?? 0) + dia.commits);
  }
}

function fechaMenosNDias(hoy: string, n: number): string {
  const fecha = new Date(`${hoy}T00:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() - n);
  return fecha.toISOString().slice(0, 10);
}

function commitsEnVentana(mapa: Map<string, number>, desde: string, hastaInclusive: string): number {
  let total = 0;
  for (const [fecha, commits] of mapa) {
    if (fecha >= desde && fecha <= hastaInclusive) total += commits;
  }
  return total;
}

/** Combina `daily_activity` de todos los repos en un solo mapa fecha → commits. */
export function combinarActividadDiaria(filas: readonly FilaMetricasRepo[]): Map<string, number> {
  const combinada = new Map<string, number>();
  for (const fila of filas) {
    sumarDiasEnMapa(combinada, fila.daily_activity ?? []);
  }
  return combinada;
}

/** Agrega bytes por lenguaje de todos los repos y calcula el % de cada uno sobre el total. */
export function agregarLenguajes(filas: readonly FilaMetricasRepo[]): LenguajeAgregado[] {
  const bytesPorLenguaje: Record<string, number> = {};
  for (const fila of filas) {
    for (const [lenguaje, bytes] of Object.entries(fila.languages_bytes ?? {})) {
      bytesPorLenguaje[lenguaje] = (bytesPorLenguaje[lenguaje] ?? 0) + bytes;
    }
  }

  const porcentajes = calcularPorcentajesDeLenguajes(bytesPorLenguaje);

  return Object.entries(bytesPorLenguaje)
    .map(([lenguaje, bytes]) => ({ lenguaje, bytes, porcentaje: porcentajes[lenguaje] ?? 0 }))
    .sort((a, b) => b.bytes - a.bytes);
}

/** Días consecutivos con >=1 commit en CUALQUIER repo. No es la racha de un repo suelto. */
export function calcularRachaDePortafolio(actividadCombinada: Map<string, number>, hoy: string): { actual: number; maxima: number } {
  const diasConActividad = [...actividadCombinada.entries()].filter(([, commits]) => commits > 0).map(([fecha]) => fecha);
  return calcularRachas(diasConActividad, hoy);
}

function serieOrdenada(actividadCombinada: Map<string, number>, desde: string, hoy: string): SerieDiaria[] {
  return [...actividadCombinada.entries()]
    .filter(([fecha]) => fecha >= desde && fecha <= hoy)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([fecha, commits]) => ({ fecha, commits }));
}

/**
 * Arma el resumen completo. `hoy` se recibe (no `new Date()` aquí dentro)
 * para que los tests fijen el día, igual que `calcularRachas`.
 */
export function calcularResumenDePortafolio(filas: readonly FilaMetricasRepo[], hoy: string): ResumenDePortafolio {
  const actividadCombinada = combinarActividadDiaria(filas);

  const inicio30 = fechaMenosNDias(hoy, VENTANA_COMMITS_DIAS - 1);
  const finPeriodoAnterior = fechaMenosNDias(hoy, VENTANA_COMMITS_DIAS);
  const inicioPeriodoAnterior = fechaMenosNDias(hoy, VENTANA_COMMITS_DIAS * 2 - 1);

  const commitsUltimos30Dias = commitsEnVentana(actividadCombinada, inicio30, hoy);
  const commitsPeriodoAnterior = commitsEnVentana(actividadCombinada, inicioPeriodoAnterior, finPeriodoAnterior);
  const variacionCommits30Dias =
    commitsPeriodoAnterior > 0 ? ((commitsUltimos30Dias - commitsPeriodoAnterior) / commitsPeriodoAnterior) * 100 : null;

  const rachas = calcularRachaDePortafolio(actividadCombinada, hoy);

  const lenguajesOrdenados = agregarLenguajes(filas);
  const lenguajePrincipal = lenguajesOrdenados[0] ?? null;

  const inicioReciente = fechaMenosNDias(hoy, VENTANA_ACTIVIDAD_RECIENTE_DIAS - 1);
  const actividadReciente = serieOrdenada(actividadCombinada, inicioReciente, hoy);
  const primeraFecha = [...actividadCombinada.keys()].sort()[0] ?? hoy;
  const actividadAnual = serieOrdenada(actividadCombinada, primeraFecha, hoy);

  const commitsPorRepositorio = filas
    .map((fila) => ({
      repo: fila.repo,
      commits: (fila.daily_activity ?? [])
        .filter((d) => d.fecha >= inicio30 && d.fecha <= hoy)
        .reduce((suma, d) => suma + d.commits, 0),
    }))
    .sort((a, b) => b.commits - a.commits);

  const reposActivos = commitsPorRepositorio.filter((r) => r.commits > 0).length;

  return {
    totalRepos: filas.length,
    reposActivos,
    commitsUltimos30Dias,
    variacionCommits30Dias,
    rachaActual: rachas.actual,
    rachaMaxima: rachas.maxima,
    lenguajePrincipal,
    lenguajesOrdenados,
    actividadReciente,
    actividadAnual,
    commitsPorRepositorio,
  };
}
