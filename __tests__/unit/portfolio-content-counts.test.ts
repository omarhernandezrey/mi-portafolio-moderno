/**
 * Ancla entre el contenido real y la cifra que dice cuánto contenido hay.
 *
 * `CONTENIDO_ORIGINAL` es la base contra la que el seed (T-05) verifica que la
 * migración a base de datos no pierde nada. Si esa cifra se escribe a mano y
 * nadie la comprueba, no garantiza nada: durante T-05 el plan maestro decía 24
 * proyectos, 173 ítems de educación y 15 insignias, y al importar los módulos y
 * medir `.length` resultaron 22, 172 y 7. Las cifras venían de un recuento
 * sobre el texto del archivo, donde el `interface` de cabecera y los objetos
 * anidados inflan cualquier `grep`.
 *
 * Este test importa los módulos de verdad y compara. Si alguien añade un
 * proyecto o una skill, falla y obliga a actualizar la base de forma
 * consciente, que es exactamente lo que se quiere.
 */
import { CONTENIDO_ORIGINAL } from '@/lib/portfolio/types';
import { projectsData } from '@/lib/projectsData';
import { skillsData } from '@/lib/skillsData';
import { educationData } from '@/lib/educationData';
import { servicesData } from '@/lib/servicesData';
import { highlightedCoursesData } from '@/lib/portfolio/source/badges';
import { marqueeTechnologies } from '@/lib/portfolio/source/technologies';
import { timelineEn, timelineEs } from '@/lib/portfolio/source/timeline';

describe('los conteos declarados coinciden con el contenido real', () => {
  it('proyectos', () => {
    expect(projectsData).toHaveLength(CONTENIDO_ORIGINAL.proyectos);
  });

  it('skills', () => {
    expect(skillsData).toHaveLength(CONTENIDO_ORIGINAL.skills);
  });

  it('servicios', () => {
    expect(servicesData).toHaveLength(CONTENIDO_ORIGINAL.servicios);
  });

  it('categorías de educación', () => {
    expect(educationData).toHaveLength(CONTENIDO_ORIGINAL.educacion_categorias);
  });

  it('ítems de educación', () => {
    const items = educationData.flatMap((c) => c.items);
    expect(items).toHaveLength(CONTENIDO_ORIGINAL.educacion_items);
  });

  it('ítems de educación con certificado', () => {
    const conCertificado = educationData
      .flatMap((c) => c.items)
      .filter((i) => Boolean(i.certificate));
    expect(conCertificado).toHaveLength(CONTENIDO_ORIGINAL.educacion_certificados);
  });

  it('insignias destacadas (las 7 de datos; la 8ª del carrusel se calcula)', () => {
    expect(highlightedCoursesData).toHaveLength(
      CONTENIDO_ORIGINAL.insignias_destacadas,
    );
  });

  it('tecnologías del marquee', () => {
    expect(marqueeTechnologies).toHaveLength(CONTENIDO_ORIGINAL.tecnologias);
  });

  it('timeline en ambos idiomas', () => {
    expect(timelineEs).toHaveLength(CONTENIDO_ORIGINAL.timeline);
    expect(timelineEn).toHaveLength(CONTENIDO_ORIGINAL.timeline);
  });
});

describe('integridad previa a la migración', () => {
  it('ningún proyecto repite título: hoy el título es la clave de React', () => {
    // src/components/shared/Card.tsx usa `${p.title}-${currentPage}` como key.
    // Dos títulos iguales rompen el render, y por eso el esquema añade `slug`.
    const titulos = projectsData.map((p) => p.title.es);
    expect(new Set(titulos).size).toBe(titulos.length);
  });

  it('todo proyecto trae demo y repositorio para el visor', () => {
    // `demo` es el único campo que alimenta los tres iframes del visor.
    const sinDemo = projectsData.filter((p) => !p.demo?.trim());
    const sinRepo = projectsData.filter((p) => !p.repository?.trim());
    expect({ sinDemo: sinDemo.map((p) => p.title.es), sinRepo: sinRepo.map((p) => p.title.es) })
      .toEqual({ sinDemo: [], sinRepo: [] });
  });

  it('todo proyecto declara al menos una tecnología', () => {
    const sinStack = projectsData
      .filter((p) => p.technologies.length === 0)
      .map((p) => p.title.es);
    expect(sinStack).toEqual([]);
  });

  it('los porcentajes de skills son convertibles a entero 0..100', () => {
    // El esquema guarda un entero con check; la cadena "95%" es presentación.
    for (const s of skillsData) {
      const n = Number.parseInt(String(s.percentage).replace('%', ''), 10);
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThanOrEqual(100);
    }
  });

  it('los ítems de educación tienen título en ambos idiomas o cadena plana', () => {
    // educationData mezcla `{es,en}` y string plano: el seed debe tolerar ambos.
    for (const item of educationData.flatMap((c) => c.items)) {
      const t = item.title as unknown;
      const ok =
        typeof t === 'string' ||
        (typeof t === 'object' && t !== null && 'es' in (t as object));
      expect(ok).toBe(true);
    }
  });
});
