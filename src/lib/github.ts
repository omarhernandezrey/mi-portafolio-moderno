/**
 * Cliente de la API de GitHub para las métricas de ingeniería (T-13).
 *
 * El panel nunca llama a esto en vivo: lo hace únicamente el cron de
 * `src/app/api/cron/github-metrics/route.ts`, que escribe el resultado en
 * `github_metrics` con `supabaseServer`. El panel siempre lee de esa tabla.
 *
 * Tres trampas de la API, verificadas contra su documentación y con `gh api`
 * antes de escribir este archivo (ver la ficha T-13 del plan):
 * 1. `/stats/commit_activity`, `/stats/code_frequency` y `/stats/contributors`
 *    responden `202` con cuerpo vacío la primera vez que se piden — GitHub
 *    todavía está calculando. Eso NO es "cero": hay que reintentar.
 * 2. La paginación va por la cabecera `Link` (`rel="next"`), no por un campo
 *    del cuerpo.
 * 3. `x-ratelimit-remaining`/`x-ratelimit-reset` hay que vigilarlas y parar
 *    antes de agotar el cupo, con un error que diga cuándo se libera.
 */

const GITHUB_API = 'https://api.github.com';
const REINTENTOS_202 = 5;
const ESPERA_BASE_MS = 2000;
/** Por debajo de esto, se para: mejor una corrida incompleta que agotar el cupo de toda la cuenta. */
const CUPO_MINIMO = 50;

/** Lo mínimo de una `Response` que esta función necesita — fácil de simular en tests. */
export interface RespuestaGitHub {
  readonly status: number;
  readonly ok: boolean;
  headers: { get(name: string): string | null };
  json(): Promise<unknown>;
}

export type FetchGitHub = (url: string, init?: RequestInit) => Promise<RespuestaGitHub>;

export class CupoAgotadoError extends Error {}

/** Lanza si el cupo está casi agotado. Se llama tras cada respuesta, no solo al final. */
export function comprobarCupoDesdeCabeceras(headers: { get(name: string): string | null }): void {
  const crudo = headers.get('x-ratelimit-remaining');
  // Sin la cabecera (otra API, o un mock de test incompleto): nada que comprobar.
  // `Number(null)` da 0, que SÍ es finito — hay que distinguir "falta" de "es cero".
  if (crudo === null) return;
  const restante = Number(crudo);
  if (!Number.isFinite(restante) || restante >= CUPO_MINIMO) return;
  const reset = Number(headers.get('x-ratelimit-reset'));
  const cuando = Number.isFinite(reset) ? new Date(reset * 1000).toISOString() : 'hora desconocida';
  throw new CupoAgotadoError(
    `Cupo de la API de GitHub casi agotado (${restante} peticiones restantes). Se reinicia: ${cuando}.`
  );
}

/** `espera` es inyectable para que los tests no duerman de verdad. */
export async function obtenerConReintento202<T>(
  url: string,
  fetchImpl: FetchGitHub,
  headers: Record<string, string>,
  espera: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms))
): Promise<T> {
  for (let intento = 0; intento < REINTENTOS_202; intento++) {
    const res = await fetchImpl(url, { headers });
    comprobarCupoDesdeCabeceras(res.headers);
    if (res.status === 202) {
      await espera(ESPERA_BASE_MS * (intento + 1));
      continue;
    }
    if (!res.ok) {
      throw new Error(`GitHub API respondió ${res.status} en ${url}`);
    }
    return (await res.json()) as T;
  }
  throw new Error(
    `GitHub sigue calculando las estadísticas de ${url} tras ${REINTENTOS_202} intentos. No se reporta como cero: se reintentará en la próxima corrida.`
  );
}

/** La URL de `rel="next"` de una cabecera `Link`, o `null` si es la última página. */
export function siguienteUrlDeLink(linkHeader: string | null): string | null {
  if (!linkHeader) return null;
  for (const parte of linkHeader.split(',')) {
    const m = /<([^>]+)>\s*;\s*rel="next"/.exec(parte.trim());
    if (m) return m[1];
  }
  return null;
}

export async function obtenerTodasLasPaginas<T>(
  urlInicial: string,
  fetchImpl: FetchGitHub,
  headers: Record<string, string>
): Promise<T[]> {
  const resultado: T[] = [];
  let url: string | null = urlInicial;
  while (url) {
    const res = await fetchImpl(url, { headers });
    comprobarCupoDesdeCabeceras(res.headers);
    if (!res.ok) throw new Error(`GitHub API respondió ${res.status} en ${url}`);
    const pagina = (await res.json()) as T[];
    resultado.push(...pagina);
    url = siguienteUrlDeLink(res.headers.get('link'));
  }
  return resultado;
}

/**
 * Bytes por lenguaje → porcentajes que suman exactamente 100 (ajustando el
 * redondeo en el lenguaje con más bytes, donde un décimo de diferencia es
 * imperceptible). Sin lenguajes, objeto vacío — no `NaN`.
 */
export function calcularPorcentajesDeLenguajes(bytesPorLenguaje: Readonly<Record<string, number>>): Record<string, number> {
  const entradas = Object.entries(bytesPorLenguaje);
  const total = entradas.reduce((suma, [, bytes]) => suma + bytes, 0);
  if (total <= 0) return {};

  const redondeados: [string, number][] = entradas.map(([lenguaje, bytes]) => [
    lenguaje,
    Math.round((bytes / total) * 1000) / 10,
  ]);
  const sumaRedondeada = redondeados.reduce((suma, [, pct]) => suma + pct, 0);
  const diferencia = Math.round((100 - sumaRedondeada) * 10) / 10;

  if (diferencia !== 0) {
    let idxMayor = 0;
    for (let i = 1; i < entradas.length; i++) {
      if (entradas[i][1] > entradas[idxMayor][1]) idxMayor = i;
    }
    redondeados[idxMayor][1] = Math.round((redondeados[idxMayor][1] + diferencia) * 10) / 10;
  }

  return Object.fromEntries(redondeados);
}

function diaSiguiente(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function diaAnterior(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export interface Rachas {
  /** Días consecutivos con actividad terminando hoy (o ayer, si hoy aún no tiene commits). 0 si se cortó. */
  actual: number;
  /** La racha más larga de todo el historial recibido. */
  maxima: number;
}

/**
 * `diasConActividad` son fechas `YYYY-MM-DD` ya en hora de Bogotá (la
 * conversión de las semanas UTC de GitHub a días de Bogotá la hace quien
 * llama, `aplanarActividadDiaria`). `hoy` también, para que el test fije el
 * día en vez de depender del reloj real.
 */
export function calcularRachas(diasConActividad: readonly string[], hoy: string): Rachas {
  const activos = new Set(diasConActividad);

  const ordenados = [...activos].sort();
  let maxima = 0;
  let tramo = 0;
  let anterior: string | null = null;
  for (const dia of ordenados) {
    tramo = anterior !== null && diaSiguiente(anterior) === dia ? tramo + 1 : 1;
    maxima = Math.max(maxima, tramo);
    anterior = dia;
  }

  let cursor = activos.has(hoy) ? hoy : diaAnterior(hoy);
  let actual = 0;
  while (activos.has(cursor)) {
    actual += 1;
    cursor = diaAnterior(cursor);
  }

  return { actual, maxima };
}

/** `days[0..6]` = domingo..sábado de esa semana, en UTC (así los da GitHub). */
export interface SemanaDeActividad {
  week: number;
  days: readonly number[];
}

export interface DiaDeActividad {
  fecha: string;
  commits: number;
}

/**
 * Convierte las semanas UTC de `/stats/commit_activity` a días calendario de
 * Bogotá (UTC-5, sin horario de verano). GitHub agrega por día UTC, no por
 * commit individual, así que esto es una aproximación: se toma el mediodía
 * UTC de cada día (para no caer nunca en el día equivocado por un borde) y
 * se le restan 5 horas para saber en qué día de Bogotá cae.
 */
export function aplanarActividadDiaria(semanas: readonly SemanaDeActividad[]): DiaDeActividad[] {
  const dias: DiaDeActividad[] = [];
  for (const semana of semanas) {
    for (let i = 0; i < semana.days.length; i++) {
      const mediodiaUtcSegundos = semana.week + i * 86400 + 12 * 3600;
      const instanteBogota = (mediodiaUtcSegundos - 5 * 3600) * 1000;
      const fecha = new Date(instanteBogota).toISOString().slice(0, 10);
      dias.push({ fecha, commits: semana.days[i] });
    }
  }
  return dias;
}

// ── Orquestación real contra la API ─────────────────────────────────────────

interface RepoGitHub {
  full_name: string;
  stargazers_count: number;
  forks_count: number;
}

interface PullRequestGitHub {
  state: 'open' | 'closed';
}

export interface MetricasRepositorio {
  repo: string;
  commits: number;
  additions: number;
  deletions: number;
  languages: Record<string, number>;
  stars: number;
  forks: number;
  openPrs: number;
  closedPrs: number;
  dailyActivity: DiaDeActividad[];
  currentStreak: number;
  longestStreak: number;
}

function cabecerasAuth(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

/** Repos públicos del usuario (no forks: no son trabajo propio). Paginado. */
export async function obtenerReposDelUsuario(
  usuario: string,
  token: string,
  fetchImpl: FetchGitHub = fetch as unknown as FetchGitHub
): Promise<string[]> {
  const repos = await obtenerTodasLasPaginas<RepoGitHub & { fork: boolean }>(
    `${GITHUB_API}/users/${usuario}/repos?per_page=100&type=owner`,
    fetchImpl,
    cabecerasAuth(token)
  );
  return repos.filter((r) => !r.fork).map((r) => r.full_name);
}

/** `hoy` en formato `YYYY-MM-DD` de Bogotá, para que calcularRachas no dependa del reloj del proceso. */
function hoyEnBogota(): string {
  return new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 10);
}

export async function obtenerMetricasDeRepositorio(
  repoCompleto: string,
  token: string,
  fetchImpl: FetchGitHub = fetch as unknown as FetchGitHub
): Promise<MetricasRepositorio> {
  const headers = cabecerasAuth(token);
  const base = `${GITHUB_API}/repos/${repoCompleto}`;

  const [repoInfo, lenguajesBytes, semanasActividad, semanasCodigo, prsAbiertas, prsCerradas] = await Promise.all([
    obtenerConReintento202<RepoGitHub>(base, fetchImpl, headers),
    obtenerConReintento202<Record<string, number>>(`${base}/languages`, fetchImpl, headers),
    obtenerConReintento202<SemanaDeActividad[]>(`${base}/stats/commit_activity`, fetchImpl, headers),
    obtenerConReintento202<Array<[number, number, number]>>(`${base}/stats/code_frequency`, fetchImpl, headers),
    obtenerTodasLasPaginas<PullRequestGitHub>(`${base}/pulls?state=open&per_page=100`, fetchImpl, headers),
    obtenerTodasLasPaginas<PullRequestGitHub>(`${base}/pulls?state=closed&per_page=100`, fetchImpl, headers),
  ]);

  const dailyActivity = aplanarActividadDiaria(semanasActividad);
  const commits = semanasActividad.reduce((suma, s) => suma + s.days.reduce((a, b) => a + b, 0), 0);
  // GitHub da las eliminaciones como números NEGATIVOS; restar un negativo
  // las acumula como la magnitud positiva que se quiere guardar.
  const { additions, deletions } = semanasCodigo.reduce(
    (acc, [, add, del]) => ({ additions: acc.additions + add, deletions: acc.deletions - del }),
    { additions: 0, deletions: 0 }
  );
  const diasConActividad = dailyActivity.filter((d) => d.commits > 0).map((d) => d.fecha);
  const rachas = calcularRachas(diasConActividad, hoyEnBogota());

  return {
    repo: repoInfo.full_name,
    commits,
    additions,
    deletions,
    languages: calcularPorcentajesDeLenguajes(lenguajesBytes),
    stars: repoInfo.stargazers_count,
    forks: repoInfo.forks_count,
    openPrs: prsAbiertas.length,
    closedPrs: prsCerradas.length,
    dailyActivity,
    currentStreak: rachas.actual,
    longestStreak: rachas.maxima,
  };
}
