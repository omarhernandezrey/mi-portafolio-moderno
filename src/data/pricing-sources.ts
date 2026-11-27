/**
 * Fuente de verdad de las escalas de precio del sitio.
 *
 * El sitio maneja DOS escalas de precio independientes, cada una con su
 * propia fuente de mercado — no una es la conversión de la otra:
 *
 *   - COP (mercado colombiano): alimenta las páginas en español. Las cifras
 *     viven en src/data/precios.ts → PRECIOS_COP, y de ahí las toman
 *     src/data/servicios.ts → priceRange y src/lib/services/catalog.ts →
 *     priceRange.cop.
 *   - USD (mercado estadounidense): alimenta las páginas en inglés. Las
 *     cifras viven en src/data/precios.ts → PRECIOS_USD, y de ahí las toman
 *     src/data/servicios.ts → priceRangeUsd y src/lib/services/catalog.ts →
 *     priceRange.usd.
 *
 * Ninguna escala se obtiene convirtiendo la otra: cada una se fija contra
 * los precios que publican los competidores de su propio mercado.
 *
 * Revisión de noviembre de 2026, por decisión de Omar:
 *
 *   - COP: la escala anterior partía de $1.8M por una landing, la banda de
 *     las agencias. La oferta económica colombiana publica «desde» entre
 *     $350.000 y $760.000, así que el sitio quedaba fuera del rango que
 *     compara un negocio pequeño. Cada «desde» pasa a estar por debajo del
 *     más bajo publicado en COMPETIDORES_CO.
 *   - USD: la escala anterior (landing desde $1,200) era la banda baja de
 *     freelancer estadounidense. La oferta económica que se anuncia a
 *     negocios de EE. UU. publica «from» entre $150 y $499. Cada «from»
 *     pasa a estar por debajo del más bajo publicado en COMPETIDORES_US.
 *
 * Riesgo conocido y aceptado de la escala en USD: parte del público de
 * EE. UU. lee un precio muy bajo como señal de baja calidad. Omar eligió
 * priorizar volumen y visibilidad; si las consultas en inglés no suben,
 * este es el primer supuesto que hay que revisar.
 */
import type { ServicioConPrecio } from './precios';

/** Mes de la última revisión de precios, en formato AAAA-MM. */
export const PRICING_LAST_REVIEWED = '2026-11';

export interface PricingSource {
  market: 'CO' | 'US' | 'LATAM';
  label: string;
  url: string;
  note: string;
}

export const PRICING_SOURCES: readonly PricingSource[] = [
  {
    market: 'CO',
    label: 'Marketing CPE — ¿Cuánto cuesta una página web en Colombia? Precios de octubre 2026',
    url: 'https://marketingcpe.com.co/blog/disenoweb/cuanto-cuesta-hacer-una-pagina-web-en-colombia/',
    note: 'Comparativa de precios «desde» de cinco agencias colombianas y rango de mercado por tipo de sitio. Base de la revisión de noviembre de 2026.',
  },
  {
    market: 'CO',
    label: 'Cangrejo Digital — Cuánto cuesta una página web en Colombia',
    url: 'https://cangrejodigital.com/diseno-web/cuanto-cuesta-pagina-web-colombia/',
    note: 'Rangos de precio en COP por tipo de sitio, banda de agencia, mercado colombiano 2026.',
  },
  {
    market: 'CO',
    label: 'Stiven Ramírez — Cuánto cobra un diseñador web en Colombia',
    url: 'https://stivenramirez.com/blog/cuanto-cobra-disenador-web-colombia/',
    note: 'Segunda fuente independiente para verificar los rangos en COP, mercado colombiano 2026.',
  },
  {
    market: 'US',
    label: 'Digital Applied — Website Development Cost 2026: Complete Pricing Data',
    url: 'https://digitalapplied.com/blog/website-development-cost-2026-complete-pricing-data',
    note: 'Rangos de precio en USD, mercado estadounidense 2026. Se usa la banda baja de freelancer (posicionamiento nearshore, carrera temprana).',
  },
  {
    market: 'LATAM',
    label: 'Curotec — LATAM Developer Hourly Rates in 2025',
    url: 'https://curotec.com/insights/latam-developer-hourly-rates-in-2025/',
    note: 'Referencia de tarifas por hora de desarrolladores LATAM, usada como contraste para consultoría/retainers.',
  },
] as const;

/**
 * Precio «desde» que publica un competidor colombiano para un servicio
 * comparable. Solo entran cifras leídas en la página enlazada el día de
 * `consultado`; nada estimado.
 */
export interface CompetidorCo {
  nombre: string;
  /** Banda de PRECIOS_COP contra la que se compara. */
  servicio: ServicioConPrecio;
  /** Precio «desde» publicado, en COP. */
  desdeCop: number;
  url: string;
  /** Qué incluye o cómo se lee la cifra: evita comparar peras con manzanas. */
  nota: string;
  /** Fecha de consulta, AAAA-MM-DD. */
  consultado: string;
}

const FUENTE_COMPARATIVA_CPE =
  'https://marketingcpe.com.co/blog/disenoweb/cuanto-cuesta-hacer-una-pagina-web-en-colombia/';

export const COMPETIDORES_CO: readonly CompetidorCo[] = [
  // ── Landing o sitio de una página ──────────────────────────────────────
  {
    nombre: 'Tres Company',
    servicio: 'landing',
    desdeCop: 350_000,
    url: 'https://trescompany.com.co/paginas-web-economicas/',
    nota: 'Páginas web económicas «desde $350.000». Incluye dominio y hosting el primer año.',
    consultado: '2026-11-27',
  },
  {
    nombre: 'Muselab',
    servicio: 'landing',
    desdeCop: 590_000,
    url: 'https://muselab.com.co/diseno-paginas-web-economicas/',
    nota: 'Landing en WordPress, hasta 5 secciones. Incluye dominio .com, hosting y SSL por un año.',
    consultado: '2026-11-27',
  },
  {
    nombre: 'Marketing CPE',
    servicio: 'landing',
    desdeCop: 680_000,
    url: FUENTE_COMPARATIVA_CPE,
    nota: 'Plan Platinum, precio propio publicado en su comparativa de octubre de 2026.',
    consultado: '2026-11-27',
  },
  {
    nombre: 'Pacoweb',
    servicio: 'landing',
    desdeCop: 699_000,
    url: FUENTE_COMPARATIVA_CPE,
    nota: 'Cifra tomada de la comparativa de Marketing CPE (octubre de 2026).',
    consultado: '2026-11-27',
  },
  {
    nombre: 'Tu Negocio WB',
    servicio: 'landing',
    desdeCop: 760_000,
    url: FUENTE_COMPARATIVA_CPE,
    nota: 'Cifra tomada de la comparativa de Marketing CPE (octubre de 2026).',
    consultado: '2026-11-27',
  },
  // ── Sitio corporativo ──────────────────────────────────────────────────
  {
    nombre: 'Muselab',
    servicio: 'corporativo',
    desdeCop: 950_000,
    url: 'https://muselab.com.co/diseno-paginas-web-economicas/',
    nota: 'Plan «Web Completa», hasta 5 páginas. Incluye dominio, hosting y SSL por un año.',
    consultado: '2026-11-27',
  },
  {
    nombre: 'Marketing CPE',
    servicio: 'corporativo',
    desdeCop: 950_000,
    url: FUENTE_COMPARATIVA_CPE,
    nota: 'Web informativa o corporativa, precio propio publicado.',
    consultado: '2026-11-27',
  },
  {
    nombre: 'Pacoweb',
    servicio: 'corporativo',
    desdeCop: 999_000,
    url: FUENTE_COMPARATIVA_CPE,
    nota: 'Cifra tomada de la comparativa de Marketing CPE (octubre de 2026).',
    consultado: '2026-11-27',
  },
  // ── Tienda online ──────────────────────────────────────────────────────
  {
    nombre: 'Muselab',
    servicio: 'ecommerce',
    desdeCop: 1_590_000,
    url: 'https://muselab.com.co/diseno-paginas-web-economicas/',
    nota: 'Tienda WooCommerce, hasta 15 productos, pagos con Wompi o MercadoPago.',
    consultado: '2026-11-27',
  },
  {
    nombre: 'Marketing CPE',
    servicio: 'ecommerce',
    desdeCop: 1_800_000,
    url: FUENTE_COMPARATIVA_CPE,
    nota: 'Tienda online, precio propio publicado.',
    consultado: '2026-11-27',
  },
  {
    nombre: 'Pacoweb',
    servicio: 'ecommerce',
    desdeCop: 2_499_000,
    url: FUENTE_COMPARATIVA_CPE,
    nota: 'Cifra tomada de la comparativa de Marketing CPE (octubre de 2026).',
    consultado: '2026-11-27',
  },
  // ── Mantenimiento mensual ──────────────────────────────────────────────
  {
    nombre: 'Macgráficas',
    servicio: 'mantenimiento',
    desdeCop: 180_000,
    url: 'https://macgraficas.com/mantenimiento-de-paginas-web/',
    nota: 'Plan Esencial mensual: actualizaciones, copia semanal, monitoreo y 1 hora de soporte.',
    consultado: '2026-11-27',
  },
  {
    nombre: 'Marketing CPE (rango de agencias)',
    servicio: 'mantenimiento',
    desdeCop: 200_000,
    url: FUENTE_COMPARATIVA_CPE,
    nota: 'No es un plan propio: es el piso mensual que el artículo atribuye a las agencias.',
    consultado: '2026-11-27',
  },
  // ── Auditoría SEO técnica ──────────────────────────────────────────────
  {
    nombre: 'ClikRank',
    servicio: 'seoTecnico',
    desdeCop: 350_000,
    url: 'https://clikrank.com/servicio/auditoria-seo',
    nota: 'Auditoría SEO «desde $350.000», pago único.',
    consultado: '2026-11-27',
  },
  {
    nombre: 'WebHexUp',
    servicio: 'seoTecnico',
    desdeCop: 600_000,
    url: 'https://www.webhexup.com/seo-tecnico/',
    nota: 'Plan Técnico Básico: auditoría única, pago único.',
    consultado: '2026-11-27',
  },
] as const;

/**
 * Precio «from» que publica un competidor para negocios de Estados Unidos.
 * Mismo criterio que COMPETIDORES_CO: solo cifras leídas el día de
 * `consultado`, cada una con la página donde aparece.
 */
export interface CompetidorUs {
  nombre: string;
  /** Banda de PRECIOS_USD contra la que se compara. */
  servicio: ServicioConPrecio;
  /** Precio «from» publicado, en USD. */
  desdeUsd: number;
  url: string;
  /** Qué incluye o cómo se lee la cifra. */
  nota: string;
  /** Fecha de consulta, AAAA-MM-DD. */
  consultado: string;
}

const FUENTE_WDS = 'https://www.webdesignservice.org/pricing';
const FUENTE_WEB_VILLAGE =
  'https://webvillage.marketing/affordable-web-design-services-for-small-business/';
const FUENTE_PLANES_MANTENIMIENTO =
  'https://snazzysolutions.com/blog/wordpress/website-maintenance-cost';

export const COMPETIDORES_US: readonly CompetidorUs[] = [
  // ── Landing o sitio de una página ──────────────────────────────────────
  {
    nombre: 'Solman Digital',
    servicio: 'landing',
    desdeUsd: 150,
    url: 'https://solmandigital.com/guides/small-business-website-design',
    nota: 'Sitio de alcance fijo «from $150». Estudio con sede en Estambul que vende en USD.',
    consultado: '2026-11-27',
  },
  {
    nombre: 'WebDesignService.org',
    servicio: 'landing',
    desdeUsd: 299,
    url: FUENTE_WDS,
    nota: 'Starter Website «starting at $299»: landing pages y sitios muy pequeños.',
    consultado: '2026-11-27',
  },
  {
    nombre: 'Web Village',
    servicio: 'landing',
    desdeUsd: 399,
    url: FUENTE_WEB_VILLAGE,
    nota: 'Starter Express: una página con varias secciones; el cliente aporta el contenido. Empresa de EE. UU.',
    consultado: '2026-11-27',
  },
  // ── Sitio de varias páginas ────────────────────────────────────────────
  {
    nombre: 'DevSoul Solutions',
    servicio: 'corporativo',
    desdeUsd: 250,
    url: 'https://devsoulsolutions.com/blog/website-design-services-cost-small-business/',
    nota: 'Starter de hasta 5 páginas en 3 a 5 días. No incluye dominio, hosting ni textos. Oficina en Lahore.',
    consultado: '2026-11-27',
  },
  {
    nombre: 'WebDesignService.org',
    servicio: 'corporativo',
    desdeUsd: 499,
    url: FUENTE_WDS,
    nota: 'Business Website «starting at $499», sitio multipágina para negocio pequeño.',
    consultado: '2026-11-27',
  },
  {
    nombre: 'Web Village',
    servicio: 'corporativo',
    desdeUsd: 695,
    url: FUENTE_WEB_VILLAGE,
    nota: 'Paquete «Small Business / E-Commerce»: hasta 7 páginas más blog.',
    consultado: '2026-11-27',
  },
  // ── Tienda online ──────────────────────────────────────────────────────
  {
    nombre: 'Web Village',
    servicio: 'ecommerce',
    desdeUsd: 695,
    url: FUENTE_WEB_VILLAGE,
    nota: 'El mismo paquete «Small Business / E-Commerce» es su entrada para tiendas.',
    consultado: '2026-11-27',
  },
  {
    nombre: 'Quix Sites',
    servicio: 'ecommerce',
    desdeUsd: 1_000,
    url: 'https://www.quixsites.com/post/ecommerce-website-packages',
    nota: 'Paquetes a medida «start at $1,000», entrega en 3 a 10 días hábiles. Las Vegas, Nevada.',
    consultado: '2026-11-27',
  },
  {
    nombre: 'GA Web Dev',
    servicio: 'ecommerce',
    desdeUsd: 2_495,
    url: 'https://gawebdev.com/ecommerce-website-design-packages-pricing/',
    nota: 'eCommerce Website Starter Package «starting at $2,495».',
    consultado: '2026-11-27',
  },
  // ── Aplicación web a medida ────────────────────────────────────────────
  {
    nombre: 'WebDesignService.org',
    servicio: 'webAppMvp',
    desdeUsd: 1_299,
    url: FUENTE_WDS,
    nota: 'Web App Development «starting at $1,299»: dashboards, SaaS y aplicaciones con autenticación.',
    consultado: '2026-11-27',
  },
  // ── Mantenimiento mensual ──────────────────────────────────────────────
  {
    nombre: 'GoWP',
    servicio: 'mantenimiento',
    desdeUsd: 39,
    url: FUENTE_PLANES_MANTENIMIENTO,
    nota: 'Mantenimiento por sitio al mes. Cifra tal como la recoge Snazzy Solutions de la página de precios de GoWP.',
    consultado: '2026-11-27',
  },
  {
    nombre: 'WP SitePlan',
    servicio: 'mantenimiento',
    desdeUsd: 59,
    url: FUENTE_PLANES_MANTENIMIENTO,
    nota: 'Plan de entrada. Cifra tal como la recoge Snazzy Solutions de la página de precios del proveedor.',
    consultado: '2026-11-27',
  },
  {
    nombre: 'WP Buffs',
    servicio: 'mantenimiento',
    desdeUsd: 89,
    url: FUENTE_PLANES_MANTENIMIENTO,
    nota: 'Plan de entrada con soporte de emergencia 24/7. Cifra tal como la recoge Snazzy Solutions.',
    consultado: '2026-11-27',
  },
  // ── Auditoría SEO técnica ──────────────────────────────────────────────
  {
    nombre: 'ClickTechs',
    servicio: 'seoTecnico',
    desdeUsd: 199,
    url: 'https://clicktechs.com/pages/seo-audit-services',
    nota: 'Starter Audit para sitios de 1 a 15 páginas, pago único.',
    consultado: '2026-11-27',
  },
  {
    nombre: 'Second Opinion SEO',
    servicio: 'seoTecnico',
    desdeUsd: 249,
    url: 'https://secondopinionseo.com/audits/',
    nota: 'Website Assessment a precio de lanzamiento (precio de lista $395).',
    consultado: '2026-11-27',
  },
  {
    nombre: 'Fast Google SEO',
    servicio: 'seoTecnico',
    desdeUsd: 299,
    url: 'https://fastgoogleseo.com/technical-seo-audit',
    nota: 'Auditoría técnica estándar, pago único, informe en 5 a 7 días.',
    consultado: '2026-11-27',
  },
] as const;
