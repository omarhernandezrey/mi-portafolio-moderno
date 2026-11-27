/**
 * Guardarraíl de la escala de precios en USD (páginas en inglés, mercado de
 * Estados Unidos). Es el espejo de `precios-cop.test.ts`:
 *
 *   1. Coherencia: catálogo de la calculadora, páginas de servicio,
 *      formulario de contacto y sus etiquetas dicen la MISMA cifra.
 *   2. Posicionamiento: cada «from» queda por debajo del más bajo publicado
 *      por la competencia registrada en `COMPETIDORES_US`.
 *   3. Las dos escalas cubren exactamente los mismos servicios.
 */
import fs from 'node:fs';
import path from 'node:path';

import {
  PRECIOS_COP,
  PRECIOS_USD,
  PRECIO_DESDE_PROYECTO_USD,
  TRAMOS_PRESUPUESTO_USD,
  desdeUsd,
  etiquetasPresupuestoUsd,
  formatoUsd,
  rangoUsd,
  valoresPresupuestoUsd,
} from '@/data/precios';
import { COMPETIDORES_US, PRICING_LAST_REVIEWED } from '@/data/pricing-sources';
import { serviciosProgramaticos } from '@/data/servicios';
import { SERVICES_CATALOG } from '@/lib/services/catalog';

const RAIZ = path.resolve(__dirname, '../..');
const leer = (relativa: string): string => fs.readFileSync(path.join(RAIZ, relativa), 'utf8');

describe('formato de precios en USD', () => {
  it('usa coma como separador de miles', () => {
    expect(formatoUsd(29)).toBe('$29');
    expect(formatoUsd(149)).toBe('$149');
    expect(formatoUsd(1_190)).toBe('$1,190');
    expect(formatoUsd(12_000)).toBe('$12,000');
  });

  it('arma «from» y rangos con la moneda explícita', () => {
    const banda = { min: 149, max: 1_490 };
    expect(desdeUsd(banda)).toBe('$149 USD');
    expect(rangoUsd(banda)).toBe('$149 - $1,490 USD');
    expect(rangoUsd(banda, '/month')).toBe('$149 - $1,490 USD/month');
  });

  it('rechaza valores que no son dólares enteros positivos', () => {
    expect(() => formatoUsd(-1)).toThrow();
    expect(() => formatoUsd(1.5)).toThrow();
    expect(() => formatoUsd(Number.NaN)).toThrow();
  });
});

describe('bandas de PRECIOS_USD', () => {
  it('cubre exactamente los mismos servicios que la escala en COP', () => {
    expect(Object.keys(PRECIOS_USD).sort()).toEqual(Object.keys(PRECIOS_COP).sort());
  });

  it.each(Object.entries(PRECIOS_USD))('%s: mínimo < máximo, en dólares enteros', (_clave, banda) => {
    expect(Number.isInteger(banda.min)).toBe(true);
    expect(Number.isInteger(banda.max)).toBe(true);
    expect(banda.min).toBeGreaterThan(0);
    expect(banda.max).toBeGreaterThan(banda.min);
  });

  it('el precio de entrada del sitio en inglés es el de la landing', () => {
    expect(PRECIO_DESDE_PROYECTO_USD).toBe(desdeUsd(PRECIOS_USD.landing));
  });
});

describe('le gana a la competencia registrada de EE. UU.', () => {
  it('hay competidores registrados para los servicios que más se cotizan', () => {
    const cubiertos = new Set(COMPETIDORES_US.map((c) => c.servicio));
    for (const servicio of ['landing', 'corporativo', 'ecommerce', 'webAppMvp', 'mantenimiento', 'seoTecnico'] as const) {
      expect(cubiertos.has(servicio)).toBe(true);
    }
  });

  it.each(COMPETIDORES_US.map((c) => [c.nombre, c.servicio, c] as const))(
    '%s (%s): nuestro «from» es menor',
    (_nombre, _servicio, competidor) => {
      expect(PRECIOS_USD[competidor.servicio].min).toBeLessThan(competidor.desdeUsd);
    },
  );

  it('cada competidor trae fuente verificable y fecha de consulta del mes de revisión', () => {
    for (const c of COMPETIDORES_US) {
      expect(c.url).toMatch(/^https:\/\//);
      expect(c.consultado.startsWith(PRICING_LAST_REVIEWED)).toBe(true);
    }
  });
});

describe('el catálogo de la calculadora usa las mismas bandas en USD', () => {
  const esperado: Record<string, { min: number; max: number }> = {
    'landing-page': PRECIOS_USD.landing,
    'corporate-web': PRECIOS_USD.corporativo,
    ecommerce: PRECIOS_USD.ecommerce,
    'web-app-mvp': PRECIOS_USD.webAppMvp,
    'dashboard-admin': PRECIOS_USD.dashboard,
    'seo-tecnico': PRECIOS_USD.seoTecnico,
    'optimizacion-performance': PRECIOS_USD.performance,
    'mantenimiento-mensual': PRECIOS_USD.mantenimiento,
    'landing-premium': PRECIOS_USD.landingPremium,
    'mvp-startup-pack': PRECIOS_USD.mvpStartup,
    'senior-retainer': PRECIOS_USD.retainer,
  };

  it.each(SERVICES_CATALOG.map((s) => [s.id, s] as const))('%s', (id, servicio) => {
    expect(servicio.priceRange.usd).toEqual(esperado[id]);
  });
});

describe('las páginas de servicios en inglés muestran las mismas cifras', () => {
  const porId = Object.fromEntries(serviciosProgramaticos.map((s) => [s.id, s]));

  it.each(serviciosProgramaticos.map((s) => [s.id, s] as const))(
    '%s: el rango empieza en su precio «from» y declara USD',
    (_id, servicio) => {
      expect(Number.isInteger(servicio.priceFromUsd)).toBe(true);
      expect(servicio.priceRangeUsd.startsWith(`${formatoUsd(servicio.priceFromUsd)} - `)).toBe(true);
      expect(servicio.priceRangeUsd).toMatch(/ USD(\/month)?$/);
    },
  );

  it('landing, e-commerce, SEO y mantenimiento parten de su banda', () => {
    expect(porId['landing-page'].priceFromUsd).toBe(PRECIOS_USD.landing.min);
    expect(porId['desarrollo-web'].priceFromUsd).toBe(PRECIOS_USD.landing.min);
    expect(porId['e-commerce'].priceFromUsd).toBe(PRECIOS_USD.ecommerce.min);
    expect(porId['seo-tecnico'].priceFromUsd).toBe(PRECIOS_USD.seoTecnico.min);
    expect(porId['mantenimiento-web'].priceFromUsd).toBe(PRECIOS_USD.mantenimiento.min);
  });

  it('las preguntas frecuentes de precio citan las cifras vigentes', () => {
    const respuesta = (id: string, fragmento: string): string => {
      const faq = porId[id].faqsEn?.find((f) => f.q.includes(fragmento));
      if (!faq) throw new Error(`No hay FAQ «${fragmento}» en ${id}`);
      return faq.a;
    };

    const web = respuesta('desarrollo-web', 'How much');
    expect(web).toContain(desdeUsd(PRECIOS_USD.landing));
    expect(web).toContain(desdeUsd(PRECIOS_USD.corporativo));
    expect(web).toContain(desdeUsd(PRECIOS_USD.ecommerce));

    expect(respuesta('landing-page', 'How much')).toContain(desdeUsd(PRECIOS_USD.landing));
    expect(respuesta('e-commerce', 'How much')).toContain(desdeUsd(PRECIOS_USD.ecommerce));
    expect(respuesta('consultoria-tech', 'How much')).toContain(`${desdeUsd(PRECIOS_USD.consultoriaHora)}/hour`);
    expect(respuesta('mantenimiento-web', 'How much')).toContain(
      `${desdeUsd(PRECIOS_USD.mantenimiento)}/month`,
    );
  });
});

describe('formulario de contacto en inglés', () => {
  it('los tramos de presupuesto son crecientes', () => {
    const [a, b, c] = TRAMOS_PRESUPUESTO_USD;
    expect(a).toBeLessThan(b);
    expect(b).toBeLessThan(c);
  });

  it('los valores llevan el prefijo de moneda que espera el lead', () => {
    const [a, b, c] = TRAMOS_PRESUPUESTO_USD;
    expect(valoresPresupuestoUsd()).toEqual([`usd:<${a}`, `usd:${a}-${b}`, `usd:${b}-${c}`, `usd:${c}+`]);
  });

  it('las etiquetas de en/common.json coinciden con los tramos', () => {
    const en = JSON.parse(leer('src/locales/en/common.json')) as {
      contact: { form: { budgetOptions: Record<'tier1' | 'tier2' | 'tier3' | 'tier4', string> } };
    };
    const { tier1, tier2, tier3, tier4 } = en.contact.form.budgetOptions;
    expect([tier1, tier2, tier3, tier4]).toEqual(etiquetasPresupuestoUsd());
  });
});

describe('no quedan precios en USD escritos a mano', () => {
  // Cualquier "$1,200 USD" literal en estos archivos es una cifra que no
  // sale de PRECIOS_USD y que se desalineará en la próxima revisión.
  const LITERAL_USD = /\$\d[\d,]*(?:\s?-\s?\$\d[\d,]*)?\s?USD/;

  it.each([
    'src/data/servicios.ts',
    'src/lib/services/catalog.ts',
    'src/app/[locale]/page.tsx',
    'src/app/[locale]/servicios/page.tsx',
    'src/app/[locale]/faq/page.tsx',
    'src/components/sections/ContactForm.tsx',
  ])('%s', (archivo) => {
    const coincidencia = leer(archivo).match(LITERAL_USD);
    expect(coincidencia?.[0]).toBeUndefined();
  });
});
