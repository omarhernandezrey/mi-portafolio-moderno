/**
 * Fuente de verdad de las escalas de precio del sitio.
 *
 * El sitio maneja DOS escalas de precio independientes, cada una con su
 * propia fuente de mercado — no una es la conversión de la otra:
 *
 *   - COP (mercado colombiano): alimenta las páginas en español
 *     (src/data/servicios.ts → priceRange, src/lib/services/catalog.ts →
 *     priceRange.cop).
 *   - USD (mercado estadounidense, banda baja de freelancer nearshore):
 *     alimenta las páginas en inglés (src/data/servicios.ts →
 *     priceRangeUsd, src/lib/services/catalog.ts → priceRange.usd).
 *
 * Mezclar las dos (mostrar un USD derivado de convertir el COP, o
 * viceversa) es exactamente el problema que esto corrige: un cliente de
 * EE.UU. viendo precios convertidos del mercado colombiano los lee como
 * sospechosamente baratos, no como una ventaja de nearshoring.
 */

export const PRICING_LAST_REVIEWED = '2026-09';

export interface PricingSource {
  market: 'CO' | 'US' | 'LATAM';
  label: string;
  url: string;
  note: string;
}

export const PRICING_SOURCES: readonly PricingSource[] = [
  {
    market: 'CO',
    label: 'Cangrejo Digital — Cuánto cuesta una página web en Colombia',
    url: 'https://cangrejodigital.com/diseno-web/cuanto-cuesta-pagina-web-colombia/',
    note: 'Rangos de precio en COP por tipo de sitio, mercado colombiano 2026.',
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
