/**
 * Auditoría de variables de entorno. Todo es puro y trabaja con texto:
 * el script `scripts/check-env.ts` hace la E/S.
 *
 * Regla que no se rompe: de un archivo `.env` solo salen NOMBRES y veredictos.
 * Ningún valor llega a un informe, a un log ni a un mensaje de error.
 */

/** Proyecto de Supabase que gobierna el portafolio (ver PLAN_MAESTRO_DASHBOARD.md §1.6). */
export const PROYECTO_SUPABASE_ESPERADO = 'ozftxfwkhomnbvicjtae';

/**
 * Variables que pone la plataforma, no el `.env`.
 *
 * El bloque `GITHUB_(...)` es la lista exacta que GitHub Actions inyecta
 * solo: https://docs.github.com/actions/learn-github-actions/variables.
 * Un `GITHUB_.+` genérico se probó en T-05c y se corrigió en T-13: atrapaba
 * también `GITHUB_TOKEN` (una variable de la app, no del runner), así que
 * `env:check` nunca lo veía como leído y lo marcaba como huérfano.
 */
const DE_PLATAFORMA =
  /^(NODE_ENV|CI|PORT|TZ|NEXT_RUNTIME|NEXT_PHASE|VERCEL(_.+)?|RUNNER_.+|GITHUB_(ACTION|ACTIONS|ACTOR|API_URL|BASE_REF|ENV|EVENT_NAME|EVENT_PATH|GRAPHQL_URL|HEAD_REF|JOB|OUTPUT|PATH|REF|REF_NAME|REF_PROTECTED|REF_TYPE|REPOSITORY|REPOSITORY_OWNER|RETENTION_DAYS|RUN_ATTEMPT|RUN_ID|RUN_NUMBER|SERVER_URL|SHA|STEP_SUMMARY|WORKFLOW|WORKSPACE))$/;

/** El código acepta cualquiera de las dos formas (`src/config/env.ts`). */
const ALIAS: Readonly<Record<string, string>> = {
  SUPABASE_URL: 'NEXT_PUBLIC_SUPABASE_URL',
  NEXT_PUBLIC_SUPABASE_URL: 'SUPABASE_URL',
  SUPABASE_ANON_KEY: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'SUPABASE_ANON_KEY',
};

/** Las lee una CLI por convención, sin que aparezcan en un `run:`. */
const DE_HERRAMIENTAS = /^(CLOUDFLARE_(ACCOUNT_ID|API_TOKEN)|AWS_.+|GH_TOKEN|NPM_TOKEN|NODE_OPTIONS|CYPRESS_.+)$/;

const MARCADOR = /^(your[-_ ]|tu[-_ ]|xxx+|changeme|change[-_ ]me|todo$|placeholder|<.*>$|\.\.\.$)/i;

export interface VariableLocal {
  archivo: string;
  nombre: string;
  /** Presente pero sin valor. */
  vacia: boolean;
  /** El valor parece un texto de relleno de una plantilla. */
  marcador: boolean;
}

export interface VariableConValor extends VariableLocal {
  valor: string;
}

const unicos = (nombres: Iterable<string>): string[] => [...new Set(nombres)].sort();

/** Lee un `.env`. Devuelve también el valor: quien llama decide qué hace con él. */
export function parsearEnv(texto: string, archivo: string): VariableConValor[] {
  const variables: VariableConValor[] = [];
  for (const cruda of texto.split(/\r?\n/)) {
    const linea = cruda.trim();
    if (!linea || linea.startsWith('#')) continue;
    const coincidencia = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/.exec(linea);
    if (!coincidencia) continue;
    let valor = coincidencia[2].trim();
    const comillas = /^(["'])(.*)\1$/.exec(valor);
    if (comillas) valor = comillas[2];
    else valor = valor.replace(/\s+#.*$/, '').trim();
    variables.push({
      archivo,
      nombre: coincidencia[1],
      valor,
      vacia: valor === '',
      marcador: valor !== '' && MARCADOR.test(valor),
    });
  }
  return variables;
}

/** Lecturas de `process.env`, con punto o con corchetes. */
export function nombresLeidosPorElCodigo(texto: string): string[] {
  const nombres: string[] = [];
  for (const m of texto.matchAll(/process\.env\.([A-Z][A-Z0-9_]*)/g)) nombres.push(m[1]);
  for (const m of texto.matchAll(/process\.env\[\s*['"]([A-Z][A-Z0-9_]*)['"]\s*\]/g)) nombres.push(m[1]);
  return unicos(nombres).filter((n) => !DE_PLATAFORMA.test(n));
}

/** `$X` y `${X}` en scripts de shell y en pasos `run:` de los workflows. */
export function nombresExpandidosEnShell(texto: string): string[] {
  const nombres: string[] = [];
  for (const m of texto.matchAll(/\$\{?([A-Z][A-Z0-9_]{2,})\b/g)) nombres.push(m[1]);
  return unicos(nombres).filter((n) => !DE_PLATAFORMA.test(n));
}

/** Claves del `z.object({...})` de `src/config/env.ts`, separadas por obligatoriedad. */
export function nombresDelEsquema(texto: string): { obligatorias: string[]; opcionales: string[] } {
  const obligatorias: string[] = [];
  const opcionales: string[] = [];
  const bloque = /z\.object\(\{([\s\S]*?)\}\)/.exec(texto)?.[1] ?? '';
  for (const m of bloque.matchAll(/^\s*([A-Z][A-Z0-9_]*)\s*:\s*(z\..*)$/gm)) {
    (/\.optional\(\)/.test(m[2]) ? opcionales : obligatorias).push(m[1]);
  }
  return { obligatorias: unicos(obligatorias), opcionales: unicos(opcionales) };
}

export interface UsoEnCI {
  /** Nombres que los workflows definen o piden como secreto. */
  definidas: string[];
  /** De esas, las que un paso consume de verdad en shell o en línea. */
  consumidas: string[];
}

export function usoEnWorkflows(texto: string): UsoEnCI {
  const definidas: string[] = [];
  const consumidas: string[] = nombresExpandidosEnShell(texto);
  for (const linea of texto.split(/\r?\n/)) {
    const clave = /^\s*([A-Z][A-Z0-9_]*)\s*:\s/.exec(linea)?.[1];
    if (clave && !DE_PLATAFORMA.test(clave)) definidas.push(clave);
    for (const m of linea.matchAll(/secrets\.([A-Z][A-Z0-9_]*)/g)) {
      if (DE_PLATAFORMA.test(m[1])) continue;
      definidas.push(m[1]);
      // `X: ${{ secrets.X }}` solo traslada el secreto; fuera de eso, se está usando.
      if (!clave) consumidas.push(m[1]);
      else if (clave !== m[1]) consumidas.push(m[1]);
    }
  }
  return { definidas: unicos(definidas), consumidas: unicos(consumidas) };
}

export interface EntradaDeAuditoria {
  locales: VariableLocal[];
  ejemplo: string[];
  /** Lo que lee el código de la aplicación y los scripts de Node. */
  codigo: string[];
  /** Lo que expanden los scripts de shell. */
  shell: string[];
  obligatorias: string[];
  ci: UsoEnCI;
}

export interface InformeDeEntorno {
  /** Están en el `.env` local y nada las lee. */
  sobranEnLocal: string[];
  /** El código las lee y no están en el `.env` local. */
  faltanEnLocal: string[];
  /** Obligatorias según el esquema que faltan o están vacías. */
  obligatoriasSinValor: string[];
  vaciasEnLocal: string[];
  conMarcador: string[];
  /** Mismo nombre repetido dentro de un archivo: gana la última línea. */
  duplicadas: string[];
  /** El código las lee y `.env.example` no las documenta. */
  sinDocumentar: string[];
  /** `.env.example` las documenta y nada las lee. */
  documentadasSinUso: string[];
  /** Los workflows las definen y ni el código ni un paso las consume. */
  ciSinUso: string[];
}

export function auditarEntorno(entrada: EntradaDeAuditoria): InformeDeEntorno {
  const leidas = new Set([...entrada.codigo, ...entrada.shell]);
  const enLocal = new Set(entrada.locales.map((v) => v.nombre));
  const conValor = new Set(entrada.locales.filter((v) => !v.vacia).map((v) => v.nombre));
  const cubierta = (conjunto: Set<string>, nombre: string) =>
    conjunto.has(nombre) || (ALIAS[nombre] !== undefined && conjunto.has(ALIAS[nombre]));

  const vistas = new Map<string, number>();
  for (const v of entrada.locales) {
    const clave = `${v.archivo}\u0000${v.nombre}`;
    vistas.set(clave, (vistas.get(clave) ?? 0) + 1);
  }

  return {
    sobranEnLocal: unicos([...enLocal].filter((n) => !leidas.has(n) && !DE_PLATAFORMA.test(n))),
    faltanEnLocal: unicos(entrada.codigo.filter((n) => !cubierta(enLocal, n))),
    obligatoriasSinValor: unicos(entrada.obligatorias.filter((n) => !cubierta(conValor, n))),
    vaciasEnLocal: unicos(entrada.locales.filter((v) => v.vacia && !conValor.has(v.nombre)).map((v) => v.nombre)),
    conMarcador: unicos(entrada.locales.filter((v) => v.marcador).map((v) => v.nombre)),
    duplicadas: unicos([...vistas].filter(([, veces]) => veces > 1).map(([clave]) => clave.split('\u0000')[1])),
    sinDocumentar: unicos(entrada.codigo.filter((n) => !entrada.ejemplo.includes(n))),
    documentadasSinUso: unicos(entrada.ejemplo.filter((n) => !leidas.has(n))),
    ciSinUso: unicos(
      entrada.ci.definidas.filter(
        (n) => !leidas.has(n) && !entrada.ci.consumidas.includes(n) && !DE_HERRAMIENTAS.test(n),
      ),
    ),
  };
}

export type Veredicto = 'ok' | 'fallo' | 'no-aplica';

export interface Comprobacion {
  que: string;
  veredicto: Veredicto;
  /** Nunca contiene un valor del `.env`. */
  detalle: string;
}

function cargaDelJwt(token: string): Record<string, unknown> | null {
  const partes = token.split('.');
  if (partes.length !== 3) return null;
  try {
    const json = Buffer.from(partes[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    const carga: unknown = JSON.parse(json);
    return typeof carga === 'object' && carga !== null ? (carga as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function refDeLaUrl(url: string): string | null {
  return /^https:\/\/([a-z0-9]+)\.supabase\.co\/?$/.exec(url.trim())?.[1] ?? null;
}

/**
 * ¿Las claves de Supabase son del proyecto correcto y cada una es del tipo que dice su nombre?
 * Es el fallo típico de un `.env` que sobrevivió a varios proyectos.
 */
export function comprobarSupabase(
  valores: Readonly<Record<string, string | undefined>>,
  proyecto: string = PROYECTO_SUPABASE_ESPERADO,
): Comprobacion[] {
  const comprobaciones: Comprobacion[] = [];
  const pareja = (a: string, b: string) => {
    const [va, vb] = [valores[a], valores[b]];
    comprobaciones.push(
      !va || !vb
        ? { que: `${a} = ${b}`, veredicto: 'no-aplica', detalle: 'solo está definida una de las dos' }
        : va === vb
          ? { que: `${a} = ${b}`, veredicto: 'ok', detalle: 'coinciden' }
          : { que: `${a} = ${b}`, veredicto: 'fallo', detalle: 'tienen valores distintos' },
    );
  };

  for (const nombre of ['SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL']) {
    const valor = valores[nombre];
    if (!valor) continue;
    const ref = refDeLaUrl(valor);
    comprobaciones.push(
      ref === proyecto
        ? { que: `${nombre} apunta al proyecto del portafolio`, veredicto: 'ok', detalle: proyecto }
        : {
            que: `${nombre} apunta al proyecto del portafolio`,
            veredicto: 'fallo',
            detalle: ref ? 'apunta a otro proyecto de Supabase' : 'no tiene la forma https://<ref>.supabase.co',
          },
    );
  }
  pareja('SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL');
  pareja('SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY');

  const claves: ReadonlyArray<[string, string, string]> = [
    ['SUPABASE_ANON_KEY', 'anon', 'sb_publishable_'],
    ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon', 'sb_publishable_'],
    ['SUPABASE_SERVICE_ROLE_KEY', 'service_role', 'sb_secret_'],
  ];
  for (const [nombre, rol, prefijoNuevo] of claves) {
    const valor = valores[nombre];
    if (!valor) continue;
    const que = `${nombre} es una clave «${rol}» de este proyecto`;
    if (valor.startsWith('sb_')) {
      comprobaciones.push(
        valor.startsWith(prefijoNuevo)
          ? { que, veredicto: 'no-aplica', detalle: 'clave de formato nuevo: el tipo es correcto, el proyecto no se puede leer de ella' }
          : { que, veredicto: 'fallo', detalle: 'es una clave de formato nuevo del tipo contrario' },
      );
      continue;
    }
    const carga = cargaDelJwt(valor);
    if (!carga) {
      comprobaciones.push({ que, veredicto: 'fallo', detalle: 'no es un JWT ni una clave de formato nuevo' });
      continue;
    }
    const fallos: string[] = [];
    if (carga.role !== rol) fallos.push('el rol de la clave no es el que indica su nombre');
    if (carga.ref !== proyecto) fallos.push('pertenece a otro proyecto');
    if (typeof carga.exp === 'number' && carga.exp * 1000 < Date.now()) fallos.push('está caducada');
    comprobaciones.push(
      fallos.length ? { que, veredicto: 'fallo', detalle: fallos.join('; ') } : { que, veredicto: 'ok', detalle: 'rol y proyecto correctos' },
    );
  }
  return comprobaciones;
}

/** Quita los valores: lo único que puede salir de un `.env`. */
export function sinValores(variables: VariableConValor[]): VariableLocal[] {
  return variables.map(({ archivo, nombre, vacia, marcador }) => ({ archivo, nombre, vacia, marcador }));
}
