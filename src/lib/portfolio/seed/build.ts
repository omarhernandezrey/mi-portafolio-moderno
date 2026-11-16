/**
 * Transformación de los módulos de contenido a filas de las tablas `portfolio_*`.
 *
 * Todo aquí es **puro**: sin E/S, sin red, sin base de datos. Eso es lo que
 * permite testearlo de verdad y lo que hace que `scripts/seed-portfolio.ts` sea
 * una cáscara fina encima.
 *
 * El contenido NO se transcribe: se importa de sus módulos. Un recuento o una
 * copia a mano sobre esos archivos ya produjo cifras falsas una vez (ver la
 * nota de `CONTENIDO_ORIGINAL` en `../types.ts`).
 */

import { projectsData, type Project } from '@/lib/projectsData';
import { skillsData, type Skill } from '@/lib/skillsData';
import { educationData } from '@/lib/educationData';
import { servicesData, type Service } from '@/lib/servicesData';
import { highlightedCoursesData } from '@/lib/portfolio/source/badges';
import { marqueeTechnologies } from '@/lib/portfolio/source/technologies';
import { timelineEn, timelineEs } from '@/lib/portfolio/source/timeline';
import { interestsData, personalData } from '@/lib/portfolio/source/about';
import { creadorDeSlugs, slugificar } from '@/lib/portfolio/slug';

// ── Utilidades ──────────────────────────────────────────────────────────────

/** Texto bilingüe, en la forma que guardan las columnas jsonb. */
export interface Localizado {
  es: string;
  en: string;
}

/**
 * Normaliza un campo que puede venir como `{es,en}` o como cadena plana.
 * `educationData` mezcla las dos formas, y el esquema espera siempre jsonb.
 */
export function bilingue(valor: unknown): Localizado {
  if (typeof valor === 'string') return { es: valor, en: valor };
  if (valor && typeof valor === 'object') {
    const v = valor as { es?: unknown; en?: unknown };
    const es = typeof v.es === 'string' ? v.es : '';
    const en = typeof v.en === 'string' ? v.en : es;
    return { es, en: en || es };
  }
  return { es: '', en: '' };
}

// `slugificar`/`creadorDeSlugs` viven en `../slug.ts` (sin dependencias: un
// componente de cliente las necesita para la `key` de React en T-07 sin
// arrastrar los 9 módulos de contenido que importa este archivo). Se
// reexportan aquí para no romper a quien ya las importaba de este módulo.
export { creadorDeSlugs, slugificar } from '../slug';

/** `"95%"` → `95`. El símbolo es presentación; la columna es un entero. */
export function porcentajeAEntero(valor: string | number): number {
  const n = Number.parseInt(String(valor).replace('%', '').trim(), 10);
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

// ── Filas ───────────────────────────────────────────────────────────────────

export interface FilaProyecto {
  slug: string;
  title: Localizado;
  description: Localizado;
  technologies: string[];
  repository: string;
  demo: string;
  category: Localizado | null;
  features: Project['features'] | null;
  highlights: Project['highlights'] | null;
  architecture: Project['architecture'] | null;
  position: number;
}

export interface FilaSkill {
  slug: string;
  name: Localizado;
  percentage: number;
  color_hex: string | null;
  icon: string | null;
  description: Localizado | null;
  category: Localizado | null;
  position: number;
}

export interface FilaCategoriaEducacion {
  slug: string;
  name: Localizado;
  position: number;
}

export interface FilaItemEducacion {
  /** Slug de la categoría a la que pertenece; el id se resuelve en SQL. */
  category_slug: string;
  slug: string;
  title: Localizado;
  institution: Localizado | null;
  duration: Localizado | null;
  description: Localizado | null;
  logo: string | null;
  certificate: string | null;
  is_new: boolean;
  position: number;
}

export interface FilaInsignia {
  slug: string;
  title: Localizado;
  institution: Localizado | null;
  summary: Localizado | null;
  logo: string | null;
  certificate: string | null;
  is_new: boolean;
  position: number;
}

export interface FilaServicio {
  slug: string;
  title: Localizado;
  description: Localizado | null;
  icon: string | null;
  badge: string | null;
  features: Service['features'] | null;
  gradient: string | null;
  price_min: number | null;
  price_max: number | null;
  price_currency: string | null;
  position: number;
}

export interface FilaTecnologia {
  name: string;
  icon_key: string | null;
  color: string | null;
  category: string | null;
  position: number;
}

export interface FilaHito {
  slug: string;
  year: Localizado;
  title: Localizado;
  description: Localizado | null;
  icon_key: string | null;
  position: number;
}

export interface FilaPerfil {
  section: string;
  content: unknown;
}

export interface FilasDelSeed {
  proyectos: FilaProyecto[];
  skills: FilaSkill[];
  categoriasEducacion: FilaCategoriaEducacion[];
  itemsEducacion: FilaItemEducacion[];
  insignias: FilaInsignia[];
  servicios: FilaServicio[];
  tecnologias: FilaTecnologia[];
  hitos: FilaHito[];
  perfil: FilaPerfil[];
}

// ── Constructores ───────────────────────────────────────────────────────────

export function construirProyectos(datos: readonly Project[] = projectsData): FilaProyecto[] {
  const slug = creadorDeSlugs();
  return datos.map((p, i) => ({
    slug: slug(p.title.es),
    title: bilingue(p.title),
    description: bilingue(p.description),
    // Nombres TAL CUAL: los ~105 iconos de technologyIcons.tsx se resuelven
    // por coincidencia literal de cadena. Normalizar aquí los borraría.
    technologies: [...p.technologies],
    repository: p.repository ?? '',
    demo: p.demo ?? '',
    category: p.category ? bilingue(p.category) : null,
    features: p.features ?? null,
    highlights: p.highlights ?? null,
    architecture: p.architecture ?? null,
    position: i,
  }));
}

export function construirSkills(datos: readonly Skill[] = skillsData): FilaSkill[] {
  const slug = creadorDeSlugs();
  return datos.map((s, i) => ({
    slug: slug(s.name.es),
    name: bilingue(s.name),
    percentage: porcentajeAEntero(s.percentage),
    color_hex: s.colorHex ?? null,
    icon: s.icon ?? null,
    description: s.description ? bilingue(s.description) : null,
    category: s.category ? bilingue(s.category) : null,
    position: i,
  }));
}

type CategoriaEducacionCruda = (typeof educationData)[number];

export function construirEducacion(
  datos: readonly CategoriaEducacionCruda[] = educationData,
): { categorias: FilaCategoriaEducacion[]; items: FilaItemEducacion[] } {
  const slugCategoria = creadorDeSlugs();
  // Un solo creador para TODOS los ítems: el esquema exige slug único en toda
  // la tabla, no solo dentro de su categoría.
  const slugItem = creadorDeSlugs();

  const categorias: FilaCategoriaEducacion[] = [];
  const items: FilaItemEducacion[] = [];

  datos.forEach((cat, iCat) => {
    const nombre = bilingue(cat.category);
    const catSlug = slugCategoria(nombre.es);
    categorias.push({ slug: catSlug, name: nombre, position: iCat });

    cat.items.forEach((item, iItem) => {
      const titulo = bilingue(item.title);
      const institucion = item.institution ? bilingue(item.institution) : null;
      // El slug incluye la institución porque hay títulos de curso repetidos
      // entre instituciones; el sufijo numérico queda como última defensa.
      const semilla = institucion?.es
        ? `${titulo.es} ${institucion.es}`
        : titulo.es;
      items.push({
        category_slug: catSlug,
        slug: slugItem(semilla),
        title: titulo,
        institution: institucion,
        duration: item.duration ? bilingue(item.duration) : null,
        description: item.description ? bilingue(item.description) : null,
        logo: item.logo ?? null,
        // Ruta relativa dentro de public/, tal cual. Reescribirlas rompería
        // las 171 imágenes de certificado.
        certificate: item.certificate ?? null,
        is_new: item.isNew === true,
        position: iItem,
      });
    });
  });

  return { categorias, items };
}

export function construirInsignias(
  datos: readonly (typeof highlightedCoursesData)[number][] = highlightedCoursesData,
): FilaInsignia[] {
  return datos.map((b, i) => ({
    // Ya traen `id` propio y estable: se usa como slug en vez de derivarlo.
    slug: slugificar(b.id),
    title: bilingue(b.title),
    institution: b.institution ? bilingue(b.institution) : null,
    summary: b.summary ? bilingue(b.summary) : null,
    logo: b.logo ?? null,
    certificate: b.certificate ?? null,
    is_new: (b as { isNew?: boolean }).isNew === true,
    position: i,
  }));
}

export function construirServicios(datos: readonly Service[] = servicesData): FilaServicio[] {
  const slug = creadorDeSlugs();
  return datos.map((s, i) => ({
    slug: slug(s.title.es),
    title: bilingue(s.title),
    description: s.description ? bilingue(s.description) : null,
    icon: s.icon ?? null,
    badge: s.badge ?? null,
    features: s.features ?? null,
    gradient: s.gradient ?? null,
    price_min: s.priceRange?.min ?? null,
    price_max: s.priceRange?.max ?? null,
    price_currency: s.priceRange?.currency ?? null,
    position: i,
  }));
}

export function construirTecnologias(
  datos: readonly (typeof marqueeTechnologies)[number][] = marqueeTechnologies,
): FilaTecnologia[] {
  return datos.map((t, i) => ({
    // El nombre es la clave única y debe coincidir literalmente con el
    // registro de iconos: no se slugifica.
    name: t.name,
    icon_key: t.iconKey ?? null,
    color: t.color ?? null,
    category: t.category ?? null,
    position: i,
  }));
}

export function construirHitos(
  es: readonly (typeof timelineEs)[number][] = timelineEs,
  en: readonly (typeof timelineEn)[number][] = timelineEn,
): FilaHito[] {
  if (es.length !== en.length) {
    throw new Error(
      `El timeline no está alineado: ${es.length} hitos en español y ${en.length} en inglés. ` +
        'Se funden por índice, así que longitudes distintas significarían perder o mezclar datos.',
    );
  }
  const slug = creadorDeSlugs();
  return es.map((hito, i) => ({
    slug: slug(hito.title),
    // Bilingüe porque el último hito traduce el año: «2025 - Presente» y
    // «2025 - Present». Por eso la columna es jsonb y no text.
    year: { es: hito.year, en: en[i].year },
    title: { es: hito.title, en: en[i].title },
    description: { es: hito.description, en: en[i].description },
    icon_key: hito.iconKey ?? null,
    position: i,
  }));
}

export function construirPerfil(): FilaPerfil[] {
  return [
    { section: 'interests', content: interestsData },
    // `personalData` guarda CLAVES de i18n, no texto. Se conservan como claves
    // para no desincronizar el contenido de locales/{es,en}/common.json.
    { section: 'personal_data', content: personalData },
  ];
}

/** Construye todas las filas del seed en el orden en que deben insertarse. */
export function construirFilasDelSeed(): FilasDelSeed {
  const educacion = construirEducacion();
  return {
    proyectos: construirProyectos(),
    skills: construirSkills(),
    categoriasEducacion: educacion.categorias,
    itemsEducacion: educacion.items,
    insignias: construirInsignias(),
    servicios: construirServicios(),
    tecnologias: construirTecnologias(),
    hitos: construirHitos(),
    perfil: construirPerfil(),
  };
}

/** Conteos de lo construido, para compararlos con `CONTENIDO_ORIGINAL`. */
export function conteosDelSeed(filas: FilasDelSeed = construirFilasDelSeed()) {
  return {
    proyectos: filas.proyectos.length,
    educacion_categorias: filas.categoriasEducacion.length,
    educacion_items: filas.itemsEducacion.length,
    educacion_certificados: filas.itemsEducacion.filter((i) => Boolean(i.certificate)).length,
    insignias_destacadas: filas.insignias.length,
    skills: filas.skills.length,
    servicios: filas.servicios.length,
    tecnologias: filas.tecnologias.length,
    timeline: filas.hitos.length,
  };
}
