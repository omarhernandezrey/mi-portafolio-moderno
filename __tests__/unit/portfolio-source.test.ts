/**
 * Guardarraíl de la extracción de los arrays que estaban INLINE en componentes
 * a módulos de datos puros bajo `src/lib/portfolio/source/`.
 *
 * Qué protege, y por qué:
 *
 * 1. LOS CONTEOS. La extracción se hizo a mano sobre archivos de cientos de
 *    líneas; perder una entrada al cortar y pegar no rompe el build ni se nota
 *    en pantalla (el marquee con 41 iconos se ve igual que con 42). Estos
 *    `toHaveLength` son el único sitio donde eso salta.
 *
 * 2. QUE TODA `iconKey` RESUELVA. Al dejar de ser JSX, el icono pasó a ser una
 *    cadena, y una cadena mal escrita compila y deja el hueco vacío. El test
 *    recorre cada dato y exige componente no nulo.
 *
 * 3. QUE LOS NOMBRES NO SE NORMALICEN. "Swagger / OpenAPI", "Vue.js",
 *    "React Native (Expo)": los iconos de `src/config/technologyIcons.tsx` se
 *    resuelven por coincidencia LITERAL de cadena, así que pasarlos a
 *    minúsculas o a slug los borraría.
 *
 * Nota sobre el 15 de `CONTENIDO_ORIGINAL.insignias_destacadas`: ese número no
 * describía el array inline, que tenía 7 entradas. Aquí se afirma lo que de
 * verdad había (7), y la discrepancia se deja documentada abajo en su propio
 * `it` para que no se "corrija" inventando insignias.
 */
import {
  highlightedCoursesData,
  HIGHLIGHTED_COURSES_COUNT,
} from '@/lib/portfolio/source/badges';
import {
  marqueeTechnologies,
  MARQUEE_TECHNOLOGIES_COUNT,
} from '@/lib/portfolio/source/technologies';
import {
  timelineEs,
  timelineEn,
  TIMELINE_ES_COUNT,
  TIMELINE_EN_COUNT,
} from '@/lib/portfolio/source/timeline';
import {
  interestsData,
  personalData,
  INTERESTS_COUNT,
  PERSONAL_DATA_COUNT,
} from '@/lib/portfolio/source/about';
import {
  portfolioIconRegistry,
  resolveIcon,
  PORTFOLIO_ICON_REGISTRY_COUNT,
} from '@/lib/portfolio/source/icon-registry';
import { CONTENIDO_ORIGINAL } from '@/lib/portfolio/types';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaReact, FaUser } from 'react-icons/fa';
import { Sparkles, Globe } from 'lucide-react';

describe('conteos: no se perdió ningún registro al extraer', () => {
  it('tecnologías del marquee: las 42 del array inline', () => {
    expect(marqueeTechnologies).toHaveLength(42);
    expect(MARQUEE_TECHNOLOGIES_COUNT).toBe(42);
    // Y coincide con lo que el seed va a verificar.
    expect(MARQUEE_TECHNOLOGIES_COUNT).toBe(CONTENIDO_ORIGINAL.tecnologias);
  });

  it('timeline: 4 hitos en cada idioma', () => {
    expect(timelineEs).toHaveLength(4);
    expect(timelineEn).toHaveLength(4);
    expect(TIMELINE_ES_COUNT).toBe(4);
    expect(TIMELINE_EN_COUNT).toBe(4);
    expect(TIMELINE_ES_COUNT).toBe(CONTENIDO_ORIGINAL.timeline);
  });

  it('insignias destacadas: las 7 que había inline', () => {
    expect(highlightedCoursesData).toHaveLength(7);
    expect(HIGHLIGHTED_COURSES_COUNT).toBe(7);
  });

  it('intereses y datos personales de AboutSection', () => {
    expect(interestsData).toHaveLength(4);
    expect(personalData).toHaveLength(3);
    expect(INTERESTS_COUNT).toBe(4);
    expect(PERSONAL_DATA_COUNT).toBe(3);
  });

  it('DISCREPANCIA RESUELTA: eran 7 insignias, no 15', () => {
    // Este test nació fijando una discrepancia: `CONTENIDO_ORIGINAL` y el plan
    // maestro decían 15 insignias, pero el array inline de EducationSection
    // tenía 7. No se inventó ninguna para cuadrar el número.
    //
    // Resuelto a favor del dato real: el 15 venía de un recuento sobre el texto
    // del archivo y era erróneo, igual que el 24 de proyectos (22), el 173 de
    // educación (172) y el 10 de skills (8). `CONTENIDO_ORIGINAL` ya está
    // corregido y __tests__/unit/portfolio-content-counts.test.ts mide los
    // conteos en vivo contra los módulos para que no vuelva a pasar.
    //
    // Sigue siendo cierto que el carrusel muestra 8 tarjetas: el componente
    // antepone en runtime una entrada calculada (`latest-course`, el curso más
    // reciente de educationData). Se migran las 7 de datos; la 8ª se deriva.
    expect(CONTENIDO_ORIGINAL.insignias_destacadas).toBe(7);
    expect(HIGHLIGHTED_COURSES_COUNT).toBe(7);
    expect(HIGHLIGHTED_COURSES_COUNT + 1).toBe(8); // lo que ve el visitante
  });
});

describe('el registro de iconos resuelve toda clave usada por los datos', () => {
  const clavesUsadas = [
    ...marqueeTechnologies.map((t) => t.iconKey),
    ...timelineEs.map((h) => h.iconKey),
    ...timelineEn.map((h) => h.iconKey),
    ...interestsData.map((i) => i.iconKey),
    ...personalData.map((p) => p.iconKey),
  ];

  it('hay claves que comprobar (el test no pasa por vacío)', () => {
    // 42 + 4 + 4 + 4 + 3
    expect(clavesUsadas).toHaveLength(57);
  });

  it.each([...new Set(clavesUsadas)])('%s resuelve a un componente', (clave) => {
    const componente = resolveIcon(clave);
    expect(componente).not.toBeNull();
    expect(typeof componente === 'function' || typeof componente === 'object').toBe(true);
  });

  it('cada clave está en el registro y el registro no se ha quedado corto', () => {
    for (const clave of clavesUsadas) {
      expect(portfolioIconRegistry).toHaveProperty(clave);
    }
    // 52 = 42 iconos del marquee + 7 de lucide (timeline e intereses) + 3 de
    // los datos personales. Code2 lo comparten timeline e intereses.
    expect(PORTFOLIO_ICON_REGISTRY_COUNT).toBe(52);
    expect(new Set(clavesUsadas).size).toBe(52);
  });

  it('una clave desconocida devuelve null, no revienta', () => {
    expect(resolveIcon('NoExisteEsteIcono')).toBeNull();
    expect(resolveIcon('')).toBeNull();
    // Nada heredado de Object.prototype se cuela como icono.
    expect(resolveIcon('toString')).toBeNull();
    expect(resolveIcon('constructor')).toBeNull();
  });

  it('la clave pinta EXACTAMENTE el mismo icono que el JSX original', () => {
    // El contrato de la extracción: `<FaReact />` inline y
    // `resolveIcon('FaReact')` tienen que dar el mismo SVG, props incluidas.
    const igual = (
      clave: string,
      original: Parameters<typeof createElement>[0],
      props?: Record<string, unknown>,
    ) => {
      const componente = resolveIcon(clave);
      expect(componente).not.toBeNull();
      const desdeRegistro = renderToStaticMarkup(
        createElement(componente!, props),
      );
      expect(desdeRegistro).toBe(
        renderToStaticMarkup(createElement(original, props)),
      );
      expect(desdeRegistro.startsWith('<svg')).toBe(true);
    };

    igual('FaReact', FaReact); // marquee: sin props
    igual('Sparkles', Sparkles, { size: 20 }); // timeline
    igual('Globe', Globe, { size: 40, strokeWidth: 1.5 }); // intereses
    igual('FaUser', FaUser, { size: 16 }); // datos personales
  });

  it('todas las claves usadas producen un SVG', () => {
    for (const clave of new Set(clavesUsadas)) {
      const componente = resolveIcon(clave);
      expect(renderToStaticMarkup(createElement(componente!)).startsWith('<svg')).toBe(
        true,
      );
    }
  });

  it('la clave es el nombre del componente, sin normalizar', () => {
    // Si alguien pasa el registro a minúsculas o a slugs, estos iconos
    // desaparecen en silencio.
    expect(resolveIcon('FaReact')).not.toBeNull();
    expect(resolveIcon('fareact')).toBeNull();
    expect(resolveIcon('TbBrandThreejs')).not.toBeNull();
    expect(resolveIcon('tb-brand-threejs')).toBeNull();
  });
});

describe('integridad del contenido extraído', () => {
  it('los nombres de tecnología se conservan literales', () => {
    const nombres = marqueeTechnologies.map((t) => t.name);
    // Muestras con los casos que una normalización habría estropeado.
    expect(nombres).toContain('Swagger / OpenAPI');
    expect(nombres).toContain('React Native (Expo)');
    expect(nombres).toContain('Vue.js');
    expect(nombres).toContain('Next.js');
    expect(nombres).toContain('Three.js');
    expect(nombres).toContain('Jetpack Compose');
    expect(nombres).toContain('GitLab CI');
  });

  it('los nombres son únicos: `name` es la identidad en la tabla', () => {
    const nombres = marqueeTechnologies.map((t) => t.name);
    expect(new Set(nombres).size).toBe(nombres.length);
  });

  it('cada tecnología trae color hex y categoría no vacíos', () => {
    for (const tech of marqueeTechnologies) {
      expect(tech.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(tech.category.length).toBeGreaterThan(0);
    }
  });

  it('las categorías del marquee son las 12 originales, en el mismo orden', () => {
    expect([...new Set(marqueeTechnologies.map((t) => t.category))]).toEqual([
      'Frontend',
      'Backend',
      'Base de datos',
      'DevOps',
      'CI/CD',
      'Cloud',
      'Servidor',
      'Mobile',
      '3D',
      'Testing',
      'Herramientas',
      'Diseño',
    ]);
  });

  it('las insignias traen id único, logo y los dos idiomas', () => {
    const ids = highlightedCoursesData.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const curso of highlightedCoursesData) {
      expect(curso.logo).toMatch(/^\/images\/education\//);
      for (const campo of [curso.title, curso.institution, curso.summary]) {
        expect(campo.es.length).toBeGreaterThan(0);
        expect(campo.en.length).toBeGreaterThan(0);
      }
    }
  });

  it('solo la insignia universitaria va sin certificado', () => {
    // El resto apunta a una imagen real dentro de public/.
    const sinCertificado = highlightedCoursesData.filter((c) => !c.certificate);
    expect(sinCertificado.map((c) => c.id)).toEqual([
      'universidad-ingenieria-software',
    ]);
  });

  it('los dos timelines van emparejados por posición e icono', () => {
    // El seed los unirá en el jsonb {"es": …, "en": …} por índice.
    expect(timelineEs.map((h) => h.iconKey)).toEqual(
      timelineEn.map((h) => h.iconKey),
    );
  });

  it('OJO: el `year` del cuarto hito está traducido y la tabla no es bilingüe', () => {
    // Los tres primeros años coinciden; el cuarto no: 'Presente' vs 'Present'.
    // `portfolio_timeline.year` es `text`, una sola columna sin idioma, así que
    // el seed tendrá que decidir cuál guarda (o mover el año a jsonb). Se deja
    // fijado aquí para que la decisión sea consciente.
    expect(timelineEs.slice(0, 3).map((h) => h.year)).toEqual(
      timelineEn.slice(0, 3).map((h) => h.year),
    );
    expect(timelineEs[3].year).toBe('2025 - Presente');
    expect(timelineEn[3].year).toBe('2025 - Present');
  });

  it('los textos del timeline conservan tildes y redacción original', () => {
    expect(timelineEs[0].title).toBe('Fundamentos y Formación Técnica');
    expect(timelineEs[3].year).toBe('2025 - Presente');
    expect(timelineEn[3].year).toBe('2025 - Present');
    expect(timelineEs[2].description).toContain('159 horas, Ministerio TIC');
  });

  it('los datos personales guardan claves de i18n, no texto traducido', () => {
    // Si alguien copia aquí el texto, se desincroniza de locales/*/common.json.
    for (const campo of personalData) {
      expect(campo.labelKey).toMatch(/^about\./);
      expect(campo.valueKey).toMatch(/^about\./);
    }
    expect(personalData.map((c) => c.labelKey)).toEqual([
      'about.personalData.name',
      'about.personalData.address',
      'about.personalData.phone',
    ]);
  });

  it('los intereses conservan título y enlace externo', () => {
    expect(interestsData.map((i) => i.title)).toEqual([
      'Open Source',
      'AI & ML',
      'Clean Code',
      'Tech Coffee',
    ]);
    for (const interes of interestsData) {
      expect(interes.href).toMatch(/^https:\/\//);
    }
  });
});
