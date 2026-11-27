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
 *   - USD (mercado estadounidense, banda baja de freelancer nearshore):
 *     alimenta las páginas en inglés (src/data/servicios.ts →
 *     priceRangeUsd, src/lib/services/catalog.ts → priceRange.usd).
 *
 * Mezclar las dos (mostrar un USD derivado de convertir el COP, o
 * viceversa) es exactamente el problema que esto corrige: un cliente de
 * EE.UU. viendo precios convertidos del mercado colombiano los lee como
 * sospechosamente baratos, no como una ventaja de nearshoring.
 *
 * Revisión de noviembre de 2026 (solo COP): la escala anterior partía de
 * $1.8M por una landing, la banda de las agencias. La oferta económica
 * colombiana publica «desde» entre $350.000 y $760.000, así que el sitio
 * quedaba fuera del rango que compara un negocio pequeño. Por decisión de
 * Omar, cada «desde» en COP se fija por debajo del más bajo publicado por
 * los competidores de COMPETIDORES_CO. La escala en USD no se tocó.
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
