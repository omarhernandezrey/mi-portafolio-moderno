/**
 * Precios del sitio — ÚNICA fuente de cada cifra, en sus dos escalas:
 *
 *   - PRECIOS_COP: mercado colombiano, páginas en español.
 *   - PRECIOS_USD: mercado de Estados Unidos, páginas en inglés.
 *
 * Todo lo que el sitio muestra con precio sale de aquí: las páginas de
 * servicios (`src/data/servicios.ts`), el catálogo de la calculadora
 * (`src/lib/services/catalog.ts`), los metadatos, las preguntas frecuentes y
 * los tramos del formulario de contacto. Cambiar un precio es cambiar UNA
 * línea de este archivo.
 *
 * Regla de posicionamiento (decisión de Omar, 2026-11-27): cada «desde» va
 * por debajo del más bajo que publica la competencia de SU mercado,
 * registrada en `src/data/pricing-sources.ts` (`COMPETIDORES_CO` y
 * `COMPETIDORES_US`). `__tests__/unit/precios-cop.test.ts` y
 * `precios-usd.test.ts` fallan si un precio deja de cumplirlo o si algún
 * texto queda desalineado.
 *
 * Las dos escalas son independientes: ninguna es la conversión de la otra.
 * Cada una se fija contra los competidores de su propio mercado.
 */

export interface BandaPrecio {
  readonly min: number;
  readonly max: number;
}

export const PRECIOS_COP = {
  /** Landing o sitio de una sola página. */
  landing: { min: 299_000, max: 690_000 },
  /** Landing con copy de venta, analítica y pruebas A/B. */
  landingPremium: { min: 590_000, max: 1_200_000 },
  /** Sitio corporativo de varias páginas. */
  corporativo: { min: 790_000, max: 1_900_000 },
  /** Tienda online estándar con pasarela de pagos. */
  ecommerce: { min: 1_190_000, max: 3_500_000 },
  /** Tienda online con desarrollo a medida. */
  ecommerceMedida: { min: 3_900_000, max: 9_000_000 },
  /** Aplicación web a medida (MVP). */
  webAppMvp: { min: 3_900_000, max: 15_000_000 },
  /** MVP completo: autenticación, CRUD, panel y CI/CD. */
  mvpStartup: { min: 4_900_000, max: 18_000_000 },
  /** Dashboard o panel administrativo. */
  dashboard: { min: 1_500_000, max: 5_000_000 },
  /** Aplicación web progresiva (PWA). */
  pwa: { min: 1_500_000, max: 5_000_000 },
  /** Automatización de procesos. */
  automatizacion: { min: 490_000, max: 2_900_000 },
  /** Integración de APIs y sistemas. */
  integracionApis: { min: 690_000, max: 4_500_000 },
  /** Auditoría y optimización SEO técnica. */
  seoTecnico: { min: 290_000, max: 1_200_000 },
  /** Optimización de rendimiento. */
  performance: { min: 250_000, max: 900_000 },
  /** Auditoría técnica de consultoría. */
  auditoriaTecnica: { min: 450_000, max: 2_500_000 },
  /** Sesión de consultoría, por hora. */
  consultoriaHora: { min: 60_000, max: 120_000 },
  /** Mantenimiento mensual de un sitio pequeño. */
  mantenimiento: { min: 79_000, max: 390_000 },
  /** Mantenimiento mensual de un sitio complejo o una tienda. */
  mantenimientoTienda: { min: 290_000, max: 390_000 },
  /** Bolsa mensual de 10 horas de desarrollo. */
  retainer: { min: 450_000, max: 1_500_000 },
} as const satisfies Record<string, BandaPrecio>;

export type ServicioConPrecio = keyof typeof PRECIOS_COP;

/**
 * Mismos servicios, escala del mercado de Estados Unidos. El `satisfies`
 * obliga a que tenga exactamente las claves de PRECIOS_COP: un servicio
 * nuevo no compila hasta tener precio en las dos monedas.
 */
export const PRECIOS_USD = {
  landing: { min: 149, max: 490 },
  landingPremium: { min: 290, max: 790 },
  corporativo: { min: 249, max: 900 },
  ecommerce: { min: 590, max: 2_400 },
  ecommerceMedida: { min: 1_190, max: 6_000 },
  webAppMvp: { min: 1_190, max: 9_000 },
  mvpStartup: { min: 1_490, max: 12_000 },
  dashboard: { min: 790, max: 3_500 },
  pwa: { min: 790, max: 3_500 },
  automatizacion: { min: 290, max: 1_900 },
  integracionApis: { min: 390, max: 2_900 },
  seoTecnico: { min: 149, max: 690 },
  performance: { min: 149, max: 690 },
  auditoriaTecnica: { min: 290, max: 1_500 },
  consultoriaHora: { min: 29, max: 60 },
  mantenimiento: { min: 29, max: 149 },
  mantenimientoTienda: { min: 99, max: 149 },
  retainer: { min: 290, max: 900 },
} as const satisfies Record<ServicioConPrecio, BandaPrecio>;

/**
 * Pesos colombianos con punto de miles: 1190000 → "$1.190.000".
 *
 * Se formatea a mano y no con `Intl.NumberFormat('es-CO')` para que el
 * resultado no dependa de los datos ICU del runtime: el mismo texto sale en
 * el servidor, en el navegador y en las pruebas.
 */
export function formatoCop(valor: number): string {
  return `$${agruparMiles(valor, '.', 'COP')}`;
}

/** Dólares con coma de miles: 1190 → "$1,190". */
export function formatoUsd(valor: number): string {
  return `$${agruparMiles(valor, ',', 'USD')}`;
}

function agruparMiles(valor: number, separador: '.' | ',', moneda: 'COP' | 'USD'): string {
  if (!Number.isInteger(valor) || valor < 0) {
    throw new RangeError(`Precio en ${moneda} inválido: ${valor}`);
  }
  return String(valor).replace(/\B(?=(\d{3})+(?!\d))/g, separador);
}

/** "$299.000 COP" — precio de entrada de una banda. */
export function desdeCop(banda: BandaPrecio): string {
  return `${formatoCop(banda.min)} COP`;
}

/** "$299.000 - $690.000 COP" (+ sufijo opcional como "/mes"). */
export function rangoCop(banda: BandaPrecio, sufijo = ''): string {
  return `${formatoCop(banda.min)} - ${formatoCop(banda.max)} COP${sufijo}`;
}

/** El «desde» más bajo del sitio: lo que citan los metadatos y la portada. */
export const PRECIO_DESDE_PROYECTO_COP = desdeCop(PRECIOS_COP.landing);

/**
 * Cortes de los cuatro tramos de presupuesto del formulario de contacto:
 * menos de A, de A a B, de B a C, más de C.
 */
export const TRAMOS_PRESUPUESTO_COP = [500_000, 1_500_000, 5_000_000] as const;

/**
 * Valores que viajan con el lead. Llevan el prefijo "cop:" para que la
 * moneda nunca quede ambigua (los lee `parseBudget` en `src/lib/budget.ts`).
 */
export function valoresPresupuestoCop(): readonly [string, string, string, string] {
  const [a, b, c] = TRAMOS_PRESUPUESTO_COP;
  return [`cop:<${a}`, `cop:${a}-${b}`, `cop:${b}-${c}`, `cop:${c}+`];
}

/**
 * Etiquetas visibles de esos tramos. `src/locales/es/common.json` guarda el
 * mismo texto (los JSON de traducción no pueden importar código) y la prueba
 * de precios comprueba que coincidan.
 */
export function etiquetasPresupuestoCop(): readonly [string, string, string, string] {
  const [a, b, c] = TRAMOS_PRESUPUESTO_COP;
  return [
    `Menos de ${formatoCop(a)} COP`,
    `${formatoCop(a)} - ${formatoCop(b)} COP`,
    `${formatoCop(b)} - ${formatoCop(c)} COP`,
    `Más de ${formatoCop(c)} COP`,
  ];
}

// ── Escala en USD ───────────────────────────────────────────────────────────

/** "$149 USD" — precio de entrada de una banda. */
export function desdeUsd(banda: BandaPrecio): string {
  return `${formatoUsd(banda.min)} USD`;
}

/** "$149 - $490 USD" (+ sufijo opcional como "/month"). */
export function rangoUsd(banda: BandaPrecio, sufijo = ''): string {
  return `${formatoUsd(banda.min)} - ${formatoUsd(banda.max)} USD${sufijo}`;
}

/** El «from» más bajo del sitio en inglés. */
export const PRECIO_DESDE_PROYECTO_USD = desdeUsd(PRECIOS_USD.landing);

/** Cortes de los cuatro tramos de presupuesto del formulario en inglés. */
export const TRAMOS_PRESUPUESTO_USD = [500, 1_500, 5_000] as const;

/** Valores que viajan con el lead, con prefijo "usd:". */
export function valoresPresupuestoUsd(): readonly [string, string, string, string] {
  const [a, b, c] = TRAMOS_PRESUPUESTO_USD;
  return [`usd:<${a}`, `usd:${a}-${b}`, `usd:${b}-${c}`, `usd:${c}+`];
}

/** Etiquetas visibles; `src/locales/en/common.json` guarda el mismo texto. */
export function etiquetasPresupuestoUsd(): readonly [string, string, string, string] {
  const [a, b, c] = TRAMOS_PRESUPUESTO_USD;
  return [
    `Under ${formatoUsd(a)} USD`,
    `${formatoUsd(a)} - ${formatoUsd(b)} USD`,
    `${formatoUsd(b)} - ${formatoUsd(c)} USD`,
    `Over ${formatoUsd(c)} USD`,
  ];
}
