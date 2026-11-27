/**
 * Precios en COP (mercado colombiano) — ÚNICA fuente de cada cifra.
 *
 * Todo lo que el sitio muestra en pesos sale de aquí: las páginas de
 * servicios (`src/data/servicios.ts`), el catálogo de la calculadora
 * (`src/lib/services/catalog.ts`), los metadatos, las preguntas frecuentes y
 * los tramos del formulario de contacto. Cambiar un precio es cambiar UNA
 * línea de este archivo.
 *
 * Regla de posicionamiento (decisión de Omar, 2026-11-27): cada «desde» va
 * por debajo del «desde» más bajo que publica la competencia colombiana
 * registrada en `src/data/pricing-sources.ts` → `COMPETIDORES_CO`.
 * `__tests__/unit/precios-cop.test.ts` falla si un precio deja de cumplirlo
 * o si algún texto queda desalineado.
 *
 * La escala en USD de las páginas en inglés es un mercado aparte y NO se
 * deriva de esta — ver `pricing-sources.ts`.
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
 * Pesos colombianos con punto de miles: 1190000 → "$1.190.000".
 *
 * Se formatea a mano y no con `Intl.NumberFormat('es-CO')` para que el
 * resultado no dependa de los datos ICU del runtime: el mismo texto sale en
 * el servidor, en el navegador y en las pruebas.
 */
export function formatoCop(valor: number): string {
  if (!Number.isInteger(valor) || valor < 0) {
    throw new RangeError(`Precio en COP inválido: ${valor}`);
  }
  return `$${String(valor).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
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
