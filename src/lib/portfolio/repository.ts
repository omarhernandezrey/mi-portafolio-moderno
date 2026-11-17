/**
 * Capa de lectura del contenido del portafolio (T-06).
 *
 * Objetivo: que el sitio público lea de Supabase sin dejar de funcionar si la
 * base no responde o está vacía. Cada función devuelve EXACTAMENTE la misma
 * forma que hoy exportan los módulos de `src/lib/*Data.ts` y
 * `src/lib/portfolio/source/*`, para que ningún componente tenga que cambiar
 * al cambiar la fuente.
 *
 * Patrón: cada contenido tiene una función `leerX(cliente)` — pura en sus
 * efectos (recibe el cliente, no lo crea), testeable con un cliente simulado
 * — y una función pública `getX()` sin argumentos que la envuelve en
 * `unstable_cache` con la clave `portfolio:x`, para que el panel pueda
 * invalidarla con `revalidateTag` al guardar (T-09 en adelante).
 *
 * Nunca se usa `service_role` aquí: es contenido público, y RLS con la clave
 * `anon` ya limita a `is_published = true` (ver la migración de T-04).
 */
import { unstable_cache } from 'next/cache';

import { projectsData, type Project } from '@/lib/projectsData';
import { skillsData, type Skill } from '@/lib/skillsData';
import { educationData, type EducationCategory } from '@/lib/educationData';
import { servicesData, type Service } from '@/lib/servicesData';
import { highlightedCoursesData, type HighlightedCourse } from '@/lib/portfolio/source/badges';
import { marqueeTechnologies, type MarqueeTechnology } from '@/lib/portfolio/source/technologies';
import { timelineEs, timelineEn, type TimelineMilestone } from '@/lib/portfolio/source/timeline';
import type { PortfolioIconKey } from '@/lib/portfolio/source/icon-registry';
import { crearClientePublico } from '@/lib/supabase/public';
import {
  BADGE_COLUMNS,
  EDUCATION_CATEGORY_COLUMNS,
  EDUCATION_ITEM_COLUMNS,
  PROFILE_COLUMNS,
  PROJECT_COLUMNS,
  SERVICE_COLUMNS,
  SKILL_COLUMNS,
  TECHNOLOGY_COLUMNS,
  TIMELINE_COLUMNS,
  type Localized,
  type PortfolioBadgeRow,
  type PortfolioEducationCategoryRow,
  type PortfolioEducationItemRow,
  type PortfolioProfileRow,
  type PortfolioProjectRow,
  type PortfolioServiceRow,
  type PortfolioSkillRow,
  type PortfolioTableName,
  type PortfolioTechnologyRow,
  type PortfolioTimelineRow,
} from '@/lib/portfolio/types';

/** El único tipo de cliente que necesitamos: `crearClientePublico()` o un simulado en los tests. */
export type ClientePortafolio = Pick<ReturnType<typeof crearClientePublico>, 'from'>;

interface ResultadoConsulta<Fila> {
  data: Fila[] | null;
  error: { message: string } | null;
}

/** `{es,en}` siempre con los dos campos presentes, aunque la fila venga nula o incompleta. */
function comoLocalizado(valor: Localized | null | undefined): { es: string; en: string } {
  const es = valor?.es ?? '';
  const en = valor?.en ?? es;
  return { es, en };
}

/**
 * Lee todas las filas publicadas de una tabla, ordenadas por `position`.
 * `null` significa "la consulta falló"; `[]` significa "la base respondió
 * pero no hay filas". Las dos cosas activan el respaldo, pero solo la
 * primera es un error real.
 */
async function leerPublicadas<Fila>(
  cliente: ClientePortafolio,
  tabla: Exclude<PortfolioTableName, 'portfolio_profile'>,
  columnas: readonly string[],
): Promise<Fila[] | null> {
  const { data, error } = (await cliente
    .from(tabla)
    .select(columnas.join(','))
    .eq('is_published', true)
    .order('position', { ascending: true })) as unknown as ResultadoConsulta<Fila>;
  if (error) {
    console.error(`[portfolio/repository] ${tabla}: ${error.message}`);
    return null;
  }
  return data ?? [];
}

function avisoRespaldo(tabla: string, filas: unknown[] | null): void {
  if (filas !== null && filas.length === 0) {
    console.error(`[portfolio/repository] ${tabla}: 0 filas publicadas, usando el contenido de origen`);
  }
}

/**
 * Red de seguridad de las `getX()` públicas: ni siquiera poder construir el
 * cliente (p. ej. sin variables de Supabase) tira la página abajo. `leerX()`
 * ya atrapa el error que Supabase devuelve en su respuesta; esto atrapa
 * cualquier otra cosa que explote antes de eso (incluida la creación del
 * cliente, que lanza de forma síncrona si falta la URL).
 */
async function conProteccion<T>(tabla: string, respaldo: T, tarea: () => Promise<T>): Promise<T> {
  try {
    return await tarea();
  } catch (e) {
    console.error(`[portfolio/repository] ${tabla}: ${e instanceof Error ? e.message : String(e)}`);
    return respaldo;
  }
}

// ── Proyectos ────────────────────────────────────────────────────────────────

/** Exportada para `src/lib/portfolio/preview.ts` (T-18): la vista previa de
 * borradores reutiliza este mapeo, pero lee con `service_role` fuera de este
 * archivo — el guardarraíl de más abajo exige que ESTE módulo nunca lo haga. */
export function filaAProyecto(fila: PortfolioProjectRow): Project {
  return {
    title: comoLocalizado(fila.title),
    description: comoLocalizado(fila.description),
    // Nombres tal cual: los iconos de `technologyIcons.tsx` resuelven por
    // coincidencia literal de cadena.
    technologies: [...fila.technologies],
    repository: fila.repository,
    demo: fila.demo,
    category: comoLocalizado(fila.category),
    features: fila.features ? (fila.features as unknown as Project['features']) : undefined,
    highlights: fila.highlights ? (fila.highlights as unknown as Project['highlights']) : undefined,
    architecture: fila.architecture ? (fila.architecture as unknown as Project['architecture']) : undefined,
  };
}

export async function leerProyectos(cliente: ClientePortafolio): Promise<Project[]> {
  const filas = await leerPublicadas<PortfolioProjectRow>(cliente, 'portfolio_projects', PROJECT_COLUMNS);
  avisoRespaldo('portfolio_projects', filas);
  if (!filas || filas.length === 0) return projectsData;
  return filas.map(filaAProyecto);
}

export async function getProjects(): Promise<Project[]> {
  return conProteccion('portfolio_projects', projectsData, () =>
    unstable_cache(() => leerProyectos(crearClientePublico()), ['portfolio:projects'], {
      tags: ['portfolio:projects'],
    })(),
  );
}

// ── Skills ───────────────────────────────────────────────────────────────────

function filaASkill(fila: PortfolioSkillRow): Skill {
  return {
    name: comoLocalizado(fila.name),
    // La columna es un entero 0..100; el "%" es presentación, igual que en origen.
    percentage: `${fila.percentage}%`,
    colorHex: fila.color_hex ?? '',
    icon: fila.icon ?? '',
    description: comoLocalizado(fila.description),
    category: comoLocalizado(fila.category),
  };
}

export async function leerSkills(cliente: ClientePortafolio): Promise<Skill[]> {
  const filas = await leerPublicadas<PortfolioSkillRow>(cliente, 'portfolio_skills', SKILL_COLUMNS);
  avisoRespaldo('portfolio_skills', filas);
  if (!filas || filas.length === 0) return skillsData;
  return filas.map(filaASkill);
}

export async function getSkills(): Promise<Skill[]> {
  return conProteccion('portfolio_skills', skillsData, () =>
    unstable_cache(() => leerSkills(crearClientePublico()), ['portfolio:skills'], {
      tags: ['portfolio:skills'],
    })(),
  );
}

// ── Educación ────────────────────────────────────────────────────────────────

function filaAItemEducacion(fila: PortfolioEducationItemRow): EducationCategory['items'][number] {
  return {
    title: comoLocalizado(fila.title),
    institution: comoLocalizado(fila.institution),
    duration: comoLocalizado(fila.duration),
    description: comoLocalizado(fila.description),
    logo: fila.logo ?? '',
    certificate: fila.certificate ?? fila.certificate_url ?? null,
    isNew: fila.is_new,
  };
}

export async function leerEducacion(cliente: ClientePortafolio): Promise<EducationCategory[]> {
  const categorias = await leerPublicadas<PortfolioEducationCategoryRow>(
    cliente,
    'portfolio_education_categories',
    EDUCATION_CATEGORY_COLUMNS,
  );
  const items = await leerPublicadas<PortfolioEducationItemRow>(cliente, 'portfolio_education_items', EDUCATION_ITEM_COLUMNS);
  const vacio = !categorias || !items || categorias.length === 0 || items.length === 0;
  avisoRespaldo('portfolio_education_categories/items', vacio ? [] : categorias);
  if (!categorias || !items || vacio) return educationData;

  const itemsPorCategoria = new Map<string, PortfolioEducationItemRow[]>();
  for (const item of items) {
    const lista = itemsPorCategoria.get(item.category_id) ?? [];
    lista.push(item);
    itemsPorCategoria.set(item.category_id, lista);
  }
  return categorias.map((categoria) => ({
    category: comoLocalizado(categoria.name),
    items: (itemsPorCategoria.get(categoria.id) ?? []).map(filaAItemEducacion),
  }));
}

export async function getEducation(): Promise<EducationCategory[]> {
  return conProteccion('portfolio_education', educationData, () =>
    unstable_cache(() => leerEducacion(crearClientePublico()), ['portfolio:education'], {
      tags: ['portfolio:education'],
    })(),
  );
}

// ── Insignias destacadas ─────────────────────────────────────────────────────

function filaAInsignia(fila: PortfolioBadgeRow): HighlightedCourse {
  return {
    id: fila.slug,
    title: comoLocalizado(fila.title),
    institution: comoLocalizado(fila.institution),
    summary: comoLocalizado(fila.summary),
    logo: fila.logo ?? '',
    certificate: fila.certificate ?? fila.certificate_url ?? null,
  };
}

export async function leerInsignias(cliente: ClientePortafolio): Promise<HighlightedCourse[]> {
  const filas = await leerPublicadas<PortfolioBadgeRow>(cliente, 'portfolio_badges', BADGE_COLUMNS);
  avisoRespaldo('portfolio_badges', filas);
  if (!filas || filas.length === 0) return highlightedCoursesData;
  return filas.map(filaAInsignia);
}

export async function getBadges(): Promise<HighlightedCourse[]> {
  return conProteccion('portfolio_badges', highlightedCoursesData, () =>
    unstable_cache(() => leerInsignias(crearClientePublico()), ['portfolio:badges'], {
      tags: ['portfolio:badges'],
    })(),
  );
}

// ── Servicios ────────────────────────────────────────────────────────────────

function filaAServicio(fila: PortfolioServiceRow): Service {
  return {
    title: comoLocalizado(fila.title),
    description: comoLocalizado(fila.description),
    icon: fila.icon ?? '',
    badge: fila.badge ?? '',
    features: fila.features ? (fila.features as unknown as Service['features']) : { es: [], en: [] },
    gradient: fila.gradient ?? '',
    priceRange:
      fila.price_min != null && fila.price_max != null && fila.price_currency
        ? { min: fila.price_min, max: fila.price_max, currency: fila.price_currency }
        : undefined,
  };
}

export async function leerServicios(cliente: ClientePortafolio): Promise<Service[]> {
  const filas = await leerPublicadas<PortfolioServiceRow>(cliente, 'portfolio_services', SERVICE_COLUMNS);
  avisoRespaldo('portfolio_services', filas);
  if (!filas || filas.length === 0) return servicesData;
  return filas.map(filaAServicio);
}

export async function getServices(): Promise<Service[]> {
  return conProteccion('portfolio_services', servicesData, () =>
    unstable_cache(() => leerServicios(crearClientePublico()), ['portfolio:services'], {
      tags: ['portfolio:services'],
    })(),
  );
}

// ── Tecnologías del marquee ──────────────────────────────────────────────────

function filaATecnologia(fila: PortfolioTechnologyRow): MarqueeTechnology {
  return {
    // Identidad: coincide literalmente con la clave de `technologyIcons.tsx`.
    name: fila.name,
    iconKey: (fila.icon_key ?? 'Code2') as PortfolioIconKey,
    color: fila.color ?? '#888888',
    category: fila.category ?? '',
  };
}

export async function leerTecnologias(cliente: ClientePortafolio): Promise<MarqueeTechnology[]> {
  const filas = await leerPublicadas<PortfolioTechnologyRow>(cliente, 'portfolio_technologies', TECHNOLOGY_COLUMNS);
  avisoRespaldo('portfolio_technologies', filas);
  if (!filas || filas.length === 0) return marqueeTechnologies;
  return filas.map(filaATecnologia);
}

export async function getTechnologies(): Promise<MarqueeTechnology[]> {
  return conProteccion('portfolio_technologies', marqueeTechnologies, () =>
    unstable_cache(() => leerTecnologias(crearClientePublico()), ['portfolio:technologies'], {
      tags: ['portfolio:technologies'],
    })(),
  );
}

// ── Timeline ─────────────────────────────────────────────────────────────────

/** El cuarto hito traduce el año ("2025 - Presente" / "2025 - Present"); por eso va por idioma. */
function filaAHito(fila: PortfolioTimelineRow, idioma: 'es' | 'en'): TimelineMilestone {
  return {
    year: fila.year[idioma] ?? fila.year.es ?? '',
    title: fila.title[idioma] ?? fila.title.es ?? '',
    description: fila.description ? fila.description[idioma] ?? fila.description.es ?? '' : '',
    iconKey: (fila.icon_key ?? 'GraduationCap') as PortfolioIconKey,
  };
}

export interface Timeline {
  es: TimelineMilestone[];
  en: TimelineMilestone[];
}

export async function leerTimeline(cliente: ClientePortafolio): Promise<Timeline> {
  const filas = await leerPublicadas<PortfolioTimelineRow>(cliente, 'portfolio_timeline', TIMELINE_COLUMNS);
  avisoRespaldo('portfolio_timeline', filas);
  if (!filas || filas.length === 0) return { es: timelineEs, en: timelineEn };
  return { es: filas.map((f) => filaAHito(f, 'es')), en: filas.map((f) => filaAHito(f, 'en')) };
}

export async function getTimeline(): Promise<Timeline> {
  return conProteccion('portfolio_timeline', { es: timelineEs, en: timelineEn }, () =>
    unstable_cache(() => leerTimeline(crearClientePublico()), ['portfolio:timeline'], {
      tags: ['portfolio:timeline'],
    })(),
  );
}

// ── Perfil (interests, personal_data) ───────────────────────────────────────

export async function leerSeccionPerfil<T>(
  cliente: ClientePortafolio,
  section: string,
  respaldo: T,
): Promise<T> {
  const resultado = (await cliente
    .from('portfolio_profile')
    .select(PROFILE_COLUMNS.join(','))
    .eq('section', section)
    .eq('is_published', true)
    .maybeSingle()) as unknown as { data: PortfolioProfileRow | null; error: { message: string } | null };
  if (resultado.error) {
    console.error(`[portfolio/repository] portfolio_profile/${section}: ${resultado.error.message}`);
    return respaldo;
  }
  if (!resultado.data || resultado.data.content == null) {
    console.error(`[portfolio/repository] portfolio_profile/${section}: sin fila publicada, usando el contenido de origen`);
    return respaldo;
  }
  return resultado.data.content as T;
}

export async function getProfileSection<T>(section: string, respaldo: T): Promise<T> {
  return conProteccion(`portfolio_profile/${section}`, respaldo, () =>
    unstable_cache(() => leerSeccionPerfil(crearClientePublico(), section, respaldo), ['portfolio:profile', section], {
      tags: ['portfolio:profile'],
    })(),
  );
}
