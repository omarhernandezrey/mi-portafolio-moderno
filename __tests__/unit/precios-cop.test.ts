/**
 * Guardarraíl de la escala de precios en COP.
 *
 * Los precios vivían repetidos como texto en ocho archivos y se desalineaban
 * al cambiarlos. Ahora salen de `src/data/precios.ts`; esta prueba vigila
 * tres cosas:
 *
 *   1. Coherencia: el catálogo de la calculadora, las páginas de servicios,
 *      el formulario de contacto y sus etiquetas dicen la MISMA cifra.
 *   2. Posicionamiento: cada «desde» queda por debajo del «desde» más bajo
 *      publicado por la competencia registrada en `pricing-sources.ts`.
 *   3. Formato: no vuelve a colarse la notación abreviada antigua
 *      ("$1.8M", "$250k") en los textos en español.
 */
import fs from 'node:fs';
import path from 'node:path';

import {
  PRECIOS_COP,
  PRECIO_DESDE_PROYECTO_COP,
  TRAMOS_PRESUPUESTO_COP,
  desdeCop,
  etiquetasPresupuestoCop,
  formatoCop,
  rangoCop,
  valoresPresupuestoCop,
} from '@/data/precios';
import { COMPETIDORES_CO, PRICING_LAST_REVIEWED } from '@/data/pricing-sources';
import { serviciosProgramaticos } from '@/data/servicios';
import { SERVICES_CATALOG } from '@/lib/services/catalog';

const RAIZ = path.resolve(__dirname, '../..');
const leer = (relativa: string): string => fs.readFileSync(path.join(RAIZ, relativa), 'utf8');

describe('formato de precios en COP', () => {
  it('usa punto como separador de miles, sin abreviar', () => {
    expect(formatoCop(79_000)).toBe('$79.000');
    expect(formatoCop(299_000)).toBe('$299.000');
    expect(formatoCop(1_190_000)).toBe('$1.190.000');
    expect(formatoCop(15_000_000)).toBe('$15.000.000');
  });

  it('arma «desde» y rangos con la moneda explícita', () => {
    const banda = { min: 299_000, max: 690_000 };
    expect(desdeCop(banda)).toBe('$299.000 COP');
    expect(rangoCop(banda)).toBe('$299.000 - $690.000 COP');
    expect(rangoCop(banda, '/mes')).toBe('$299.000 - $690.000 COP/mes');
  });

  it('rechaza valores que no son pesos enteros positivos', () => {
    expect(() => formatoCop(-1)).toThrow();
    expect(() => formatoCop(1.5)).toThrow();
    expect(() => formatoCop(Number.NaN)).toThrow();
  });
});

describe('bandas de PRECIOS_COP', () => {
  it.each(Object.entries(PRECIOS_COP))('%s: mínimo < máximo, en miles cerrados', (_clave, banda) => {
    expect(banda.min).toBeGreaterThan(0);
    expect(banda.max).toBeGreaterThan(banda.min);
    expect(banda.min % 1000).toBe(0);
    expect(banda.max % 1000).toBe(0);
  });

  it('el precio de entrada del sitio es el de la landing', () => {
    expect(PRECIO_DESDE_PROYECTO_COP).toBe(desdeCop(PRECIOS_COP.landing));
  });
});

describe('le gana a la competencia registrada', () => {
  it('hay competidores registrados para los servicios que más se cotizan', () => {
    const cubiertos = new Set(COMPETIDORES_CO.map((c) => c.servicio));
    for (const servicio of ['landing', 'corporativo', 'ecommerce', 'mantenimiento', 'seoTecnico'] as const) {
      expect(cubiertos.has(servicio)).toBe(true);
    }
  });

  it.each(COMPETIDORES_CO.map((c) => [c.nombre, c.servicio, c] as const))(
    '%s (%s): nuestro «desde» es menor',
    (_nombre, _servicio, competidor) => {
      expect(PRECIOS_COP[competidor.servicio].min).toBeLessThan(competidor.desdeCop);
    },
  );

  it('cada competidor trae fuente verificable y fecha de consulta del mes de revisión', () => {
    expect(PRICING_LAST_REVIEWED).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
    for (const c of COMPETIDORES_CO) {
      expect(c.url).toMatch(/^https:\/\//);
      expect(c.consultado.startsWith(PRICING_LAST_REVIEWED)).toBe(true);
    }
  });
});

describe('el catálogo de la calculadora usa las mismas bandas', () => {
  const esperado: Record<string, { min: number; max: number }> = {
    'landing-page': PRECIOS_COP.landing,
    'corporate-web': PRECIOS_COP.corporativo,
    ecommerce: PRECIOS_COP.ecommerce,
    'web-app-mvp': PRECIOS_COP.webAppMvp,
    'dashboard-admin': PRECIOS_COP.dashboard,
    'seo-tecnico': PRECIOS_COP.seoTecnico,
    'optimizacion-performance': PRECIOS_COP.performance,
    'mantenimiento-mensual': PRECIOS_COP.mantenimiento,
    'landing-premium': PRECIOS_COP.landingPremium,
    'mvp-startup-pack': PRECIOS_COP.mvpStartup,
    'senior-retainer': PRECIOS_COP.retainer,
  };

  it('ningún servicio del catálogo queda sin banda asignada', () => {
    expect(SERVICES_CATALOG.map((s) => s.id).sort()).toEqual(Object.keys(esperado).sort());
  });

  it.each(SERVICES_CATALOG.map((s) => [s.id, s] as const))('%s', (id, servicio) => {
    expect(servicio.priceRange.cop).toEqual(esperado[id]);
  });
});

describe('las páginas de servicios muestran las mismas cifras', () => {
  const porId = Object.fromEntries(serviciosProgramaticos.map((s) => [s.id, s]));

  it.each(serviciosProgramaticos.map((s) => [s.id, s] as const))(
    '%s: el rango empieza en su precio «desde» y declara COP',
    (_id, servicio) => {
      expect(servicio.priceFromCop % 1000).toBe(0);
      expect(servicio.priceRange.startsWith(`${formatoCop(servicio.priceFromCop)} - `)).toBe(true);
      expect(servicio.priceRange).toMatch(/ COP(\/mes)?$/);
    },
  );

  it('landing, e-commerce, SEO y mantenimiento parten de su banda', () => {
    expect(porId['landing-page'].priceFromCop).toBe(PRECIOS_COP.landing.min);
    expect(porId['desarrollo-web'].priceFromCop).toBe(PRECIOS_COP.landing.min);
    expect(porId['e-commerce'].priceFromCop).toBe(PRECIOS_COP.ecommerce.min);
    expect(porId['seo-tecnico'].priceFromCop).toBe(PRECIOS_COP.seoTecnico.min);
    expect(porId['mantenimiento-web'].priceFromCop).toBe(PRECIOS_COP.mantenimiento.min);
  });

  it('las preguntas frecuentes de precio citan las cifras vigentes', () => {
    const respuesta = (id: string, fragmento: string): string => {
      const faq = porId[id].faqs.find((f) => f.q.includes(fragmento));
      if (!faq) throw new Error(`No hay FAQ «${fragmento}» en ${id}`);
      return faq.a;
    };

    const web = respuesta('desarrollo-web', 'Cuánto cuesta');
    expect(web).toContain(desdeCop(PRECIOS_COP.landing));
    expect(web).toContain(desdeCop(PRECIOS_COP.corporativo));
    expect(web).toContain(desdeCop(PRECIOS_COP.ecommerce));

    expect(respuesta('landing-page', 'Cuánto cuesta')).toContain(desdeCop(PRECIOS_COP.landing));
    expect(respuesta('e-commerce', 'Cuánto cuesta')).toContain(desdeCop(PRECIOS_COP.ecommerce));
    expect(respuesta('mantenimiento-web', 'Cuánto cuesta')).toContain(
      `${desdeCop(PRECIOS_COP.mantenimiento)}/mes`,
    );
  });
});

describe('formulario de contacto', () => {
  it('los tramos de presupuesto son crecientes', () => {
    const [a, b, c] = TRAMOS_PRESUPUESTO_COP;
    expect(a).toBeLessThan(b);
    expect(b).toBeLessThan(c);
  });

  it('los valores llevan el prefijo de moneda que espera el lead', () => {
    const [a, b, c] = TRAMOS_PRESUPUESTO_COP;
    expect(valoresPresupuestoCop()).toEqual([`cop:<${a}`, `cop:${a}-${b}`, `cop:${b}-${c}`, `cop:${c}+`]);
  });

  it('las etiquetas de es/common.json coinciden con los tramos', () => {
    const es = JSON.parse(leer('src/locales/es/common.json')) as {
      contact: { form: { budgetOptions: Record<'tier1' | 'tier2' | 'tier3' | 'tier4', string> } };
    };
    const { tier1, tier2, tier3, tier4 } = es.contact.form.budgetOptions;
    expect([tier1, tier2, tier3, tier4]).toEqual(etiquetasPresupuestoCop());
  });
});

describe('no queda la notación abreviada antigua en textos en español', () => {
  // "$1.8M", "$250k"… La escala en USD nunca usó sufijos, así que cualquier
  // coincidencia es un precio en COP que se quedó sin migrar.
  const ABREVIADO = /\$\d+(?:[.,]\d+)?\s?(?:M|k)\b/;

  it.each([
    'src/data/servicios.ts',
    'src/lib/services/catalog.ts',
    'src/app/layout.tsx',
    'src/app/[locale]/page.tsx',
    'src/app/[locale]/servicios/page.tsx',
    'src/app/[locale]/faq/page.tsx',
    'src/components/sections/ContactForm.tsx',
    'src/locales/es/common.json',
  ])('%s', (archivo) => {
    const coincidencia = leer(archivo).match(ABREVIADO);
    expect(coincidencia?.[0]).toBeUndefined();
  });
});
