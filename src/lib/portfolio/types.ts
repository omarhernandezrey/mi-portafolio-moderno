/**
 * Tipos del contenido del portafolio en base de datos.
 *
 * El repo no tiene tipos generados por `supabase gen types` (no hay CLI de
 * Supabase configurada; las migraciones se aplican a mano en el SQL Editor),
 * así que estos están escritos a mano, igual que los de `src/lib/admin/types.ts`.
 *
 * Escribir tipos a mano contra una base de datos remota se desincroniza sin
 * avisar. Para que no pase, cada tabla declara además su lista de columnas en
 * tiempo de ejecución (`*_COLUMNS`), y un test compara esas listas con el SQL
 * de `supabase/migrations/20261112_portfolio_content.sql`. Si alguien añade una
 * columna en la migración y se olvida del tipo —o al revés—, el test falla.
 *
 * El helper `satisfies` de abajo garantiza que la lista de columnas y las
 * claves del tipo son exactamente el mismo conjunto, en el propio typecheck.
 */

/** Texto bilingüe tal como ya lo guardaban los archivos del portafolio. */
export interface Localized {
  readonly es?: string;
  readonly en?: string;
}

/** Lista de cadenas por idioma (features, layers de arquitectura). */
export interface LocalizedList {
  readonly es?: readonly string[];
  readonly en?: readonly string[];
}

export interface LocalizedArchitecture {
  readonly es?: { readonly description?: string; readonly layers?: readonly string[] };
  readonly en?: { readonly description?: string; readonly layers?: readonly string[] };
}

/** Campos que comparten todas las tablas de contenido. */
interface BaseRow {
  readonly id: string;
  readonly position: number;
  readonly is_published: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface PortfolioProjectRow extends BaseRow {
  readonly slug: string;
  readonly title: Localized;
  readonly description: Localized;
  /** Nombres TAL CUAL: coinciden literalmente con las claves de technologyIcons. */
  readonly technologies: readonly string[];
  readonly repository: string;
  readonly demo: string;
  readonly category: Localized | null;
  readonly features: LocalizedList | null;
  readonly highlights: LocalizedList | null;
  readonly architecture: LocalizedArchitecture | null;
  readonly image_url: string | null;
  /** false si el sitio del demo bloquea el embebido en iframe. */
  readonly demo_embeddable: boolean;
  readonly demo_checked_at: string | null;
}

export interface PortfolioSkillRow extends BaseRow {
  readonly slug: string;
  readonly name: Localized;
  /** Entero 0..100. El "%" lo añade la vista. */
  readonly percentage: number;
  readonly color_hex: string | null;
  readonly icon: string | null;
  readonly description: Localized | null;
  readonly category: Localized | null;
}

export interface PortfolioEducationCategoryRow extends BaseRow {
  readonly slug: string;
  readonly name: Localized;
}

export interface PortfolioEducationItemRow extends BaseRow {
  readonly category_id: string;
  readonly slug: string;
  readonly title: Localized;
  readonly institution: Localized | null;
  readonly duration: Localized | null;
  readonly description: Localized | null;
  /** Ruta relativa dentro de public/. */
  readonly logo: string | null;
  /** Ruta relativa dentro de public/ (las 163 rutas actuales). */
  readonly certificate: string | null;
  /** Alternativa externa: Supabase Storage o URL. Lo que permite añadir desde el panel. */
  readonly certificate_url: string | null;
  readonly is_new: boolean;
}

export interface PortfolioBadgeRow extends BaseRow {
  readonly slug: string;
  readonly title: Localized;
  readonly institution: Localized | null;
  readonly summary: Localized | null;
  readonly logo: string | null;
  readonly certificate: string | null;
  readonly certificate_url: string | null;
  readonly is_new: boolean;
}

export interface PortfolioServiceRow extends BaseRow {
  readonly slug: string;
  readonly title: Localized;
  readonly description: Localized | null;
  readonly icon: string | null;
  readonly badge: string | null;
  readonly features: LocalizedList | null;
  readonly gradient: string | null;
  readonly price_min: number | null;
  readonly price_max: number | null;
  readonly price_currency: string | null;
}

export interface PortfolioTechnologyRow extends BaseRow {
  /** El nombre es la identidad (unique) y la clave del icono. */
  readonly name: string;
  readonly icon_key: string | null;
  readonly color: string | null;
  readonly category: string | null;
}

export interface PortfolioTimelineRow extends BaseRow {
  readonly slug: string;
  readonly year: string;
  readonly title: Localized;
  readonly description: Localized | null;
  readonly icon_key: string | null;
}

/**
 * El perfil se lee por `section`, de uno en uno, nunca como lista ordenada:
 * por eso es la única tabla de contenido SIN `position`.
 */
export interface PortfolioProfileRow {
  readonly id: string;
  readonly section: string;
  readonly content: unknown;
  readonly is_published: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

// ── Listas de columnas en runtime ───────────────────────────────────────────
// `satisfies readonly (keyof T)[]` obliga a que cada entrada sea una columna
// real del tipo. El test se encarga del otro lado (que no falte ninguna) y de
// compararlas con el SQL.

const BASE = ['id', 'position', 'is_published', 'created_at', 'updated_at'] as const;

export const PROJECT_COLUMNS = [
  ...BASE,
  'slug',
  'title',
  'description',
  'technologies',
  'repository',
  'demo',
  'category',
  'features',
  'highlights',
  'architecture',
  'image_url',
  'demo_embeddable',
  'demo_checked_at',
] as const satisfies readonly (keyof PortfolioProjectRow)[];

export const SKILL_COLUMNS = [
  ...BASE,
  'slug',
  'name',
  'percentage',
  'color_hex',
  'icon',
  'description',
  'category',
] as const satisfies readonly (keyof PortfolioSkillRow)[];

export const EDUCATION_CATEGORY_COLUMNS = [
  ...BASE,
  'slug',
  'name',
] as const satisfies readonly (keyof PortfolioEducationCategoryRow)[];

export const EDUCATION_ITEM_COLUMNS = [
  ...BASE,
  'category_id',
  'slug',
  'title',
  'institution',
  'duration',
  'description',
  'logo',
  'certificate',
  'certificate_url',
  'is_new',
] as const satisfies readonly (keyof PortfolioEducationItemRow)[];

export const BADGE_COLUMNS = [
  ...BASE,
  'slug',
  'title',
  'institution',
  'summary',
  'logo',
  'certificate',
  'certificate_url',
  'is_new',
] as const satisfies readonly (keyof PortfolioBadgeRow)[];

export const SERVICE_COLUMNS = [
  ...BASE,
  'slug',
  'title',
  'description',
  'icon',
  'badge',
  'features',
  'gradient',
  'price_min',
  'price_max',
  'price_currency',
] as const satisfies readonly (keyof PortfolioServiceRow)[];

export const TECHNOLOGY_COLUMNS = [
  ...BASE,
  'name',
  'icon_key',
  'color',
  'category',
] as const satisfies readonly (keyof PortfolioTechnologyRow)[];

export const TIMELINE_COLUMNS = [
  ...BASE,
  'slug',
  'year',
  'title',
  'description',
  'icon_key',
] as const satisfies readonly (keyof PortfolioTimelineRow)[];

export const PROFILE_COLUMNS = [
  'id',
  'is_published',
  'created_at',
  'updated_at',
  'section',
  'content',
] as const satisfies readonly (keyof PortfolioProfileRow)[];

/** Mapa tabla → columnas. Lo consume el test que compara con el SQL. */
export const PORTFOLIO_TABLES = {
  portfolio_projects: PROJECT_COLUMNS,
  portfolio_skills: SKILL_COLUMNS,
  portfolio_education_categories: EDUCATION_CATEGORY_COLUMNS,
  portfolio_education_items: EDUCATION_ITEM_COLUMNS,
  portfolio_badges: BADGE_COLUMNS,
  portfolio_services: SERVICE_COLUMNS,
  portfolio_technologies: TECHNOLOGY_COLUMNS,
  portfolio_timeline: TIMELINE_COLUMNS,
  portfolio_profile: PROFILE_COLUMNS,
} as const;

export type PortfolioTableName = keyof typeof PORTFOLIO_TABLES;

/**
 * Conteos del contenido que había hardcodeado antes de la migración.
 * El seed (T-05) verifica contra estos números que no se perdió nada.
 */
export const CONTENIDO_ORIGINAL = {
  proyectos: 24,
  educacion_items: 173,
  educacion_certificados: 163,
  insignias_destacadas: 15,
  skills: 10,
  servicios: 6,
  tecnologias: 42,
  timeline: 4,
} as const;
