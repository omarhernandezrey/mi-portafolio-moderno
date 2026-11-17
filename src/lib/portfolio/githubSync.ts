/**
 * Sincronización GitHub → proyectos (T-21): cuando el cron de ingesta de
 * T-13 ve un repositorio que todavía no tiene fila en `portfolio_projects`,
 * se propone como borrador — nunca se publica solo, y nunca se inventa una
 * descripción: todo lo que lleva viene de datos reales del propio repo
 * (nombre, URL, lenguajes).
 *
 * Puro: sin red ni Supabase, para poder probarlo sin mocks. Quien llama
 * (el cron) hace las consultas y le pasa los datos ya traídos.
 */

export interface ProyectoPropuesto {
  slug: string;
  title: { es: string; en: string };
  description: { es: string; en: string };
  technologies: string[];
  repository: string;
  demo: string;
  category: null;
  is_published: false;
}

const MAX_LENGUAJES = 6;

/** "mi-portafolio-moderno" → "mi-portafolio-moderno" (slug ya válido: GitHub usa el mismo alfabeto que `slugSchema`, salvo mayúsculas/guion bajo). */
export function slugificarRepo(nombreRepo: string): string {
  return nombreRepo
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

/** El primer slug libre: `base`, o `base-2`, `base-3`... si ya existe. */
export function generarSlugUnico(base: string, existentes: ReadonlySet<string>): string {
  if (!existentes.has(base)) return base;
  let n = 2;
  while (existentes.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/** "mi-portafolio-moderno" → "Mi Portafolio Moderno". Transformación del nombre real, no un título inventado. */
export function tituloLegibleDeRepo(nombreRepo: string): string {
  return nombreRepo
    .split(/[-_]+/)
    .filter(Boolean)
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(' ');
}

/** Lenguajes reales del repo, de más a menos bytes. Nunca inventa un lenguaje que no esté en los datos. */
export function principalesLenguajes(languagesBytes: Readonly<Record<string, number>>, max = MAX_LENGUAJES): string[] {
  return Object.entries(languagesBytes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, max)
    .map(([lenguaje]) => lenguaje);
}

const DESCRIPCION_PENDIENTE = {
  es: 'Repositorio detectado automáticamente desde GitHub — todavía sin descripción. Edítala antes de publicarlo.',
  en: 'Repository detected automatically from GitHub — no description yet. Edit it before publishing.',
};

/**
 * Construye el borrador a insertar. `is_published` siempre `false`: la
 * ficha de T-21 es explícita ("nunca se publica solo"), así que esto no es
 * una opción configurable — es una constante de tipo, no solo un valor por
 * omisión que alguien pueda cambiar sin querer.
 */
export function construirProyectoPropuesto(
  repo: { repoFullName: string; languagesBytes: Readonly<Record<string, number>> },
  slugsExistentes: ReadonlySet<string>,
): ProyectoPropuesto {
  const nombreRepo = repo.repoFullName.split('/').pop() ?? repo.repoFullName;
  const slugBase = slugificarRepo(nombreRepo);
  const slug = generarSlugUnico(slugBase, slugsExistentes);
  const titulo = tituloLegibleDeRepo(nombreRepo);

  return {
    slug,
    title: { es: titulo, en: titulo },
    description: DESCRIPCION_PENDIENTE,
    technologies: principalesLenguajes(repo.languagesBytes),
    repository: `https://github.com/${repo.repoFullName}`,
    demo: '',
    category: null,
    is_published: false,
  };
}
