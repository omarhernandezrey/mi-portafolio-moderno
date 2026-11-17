/**
 * Funciones puras de T-21 (sincronización GitHub → proyectos). Sin red ni
 * Supabase: quien llama (el cron) hace las consultas y le pasa los datos.
 */
import {
  construirProyectoPropuesto,
  generarSlugUnico,
  principalesLenguajes,
  slugificarRepo,
  tituloLegibleDeRepo,
} from '@/lib/portfolio/githubSync';

describe('slugificarRepo', () => {
  it('minúsculas y guiones, sin cambios en un nombre ya válido', () => {
    expect(slugificarRepo('mi-portafolio-moderno')).toBe('mi-portafolio-moderno');
  });

  it('convierte mayúsculas, espacios y guion bajo en guiones', () => {
    expect(slugificarRepo('Mi_Proyecto Genial')).toBe('mi-proyecto-genial');
  });

  it('colapsa guiones repetidos y recorta los de los extremos', () => {
    expect(slugificarRepo('--Doble__Guion--')).toBe('doble-guion');
  });
});

describe('generarSlugUnico', () => {
  it('sin colisión: devuelve el slug base tal cual', () => {
    expect(generarSlugUnico('demo', new Set())).toBe('demo');
  });

  it('con colisión: suma -2, y sigue subiendo si ese también existe', () => {
    expect(generarSlugUnico('demo', new Set(['demo']))).toBe('demo-2');
    expect(generarSlugUnico('demo', new Set(['demo', 'demo-2']))).toBe('demo-3');
  });
});

describe('tituloLegibleDeRepo', () => {
  it('reemplaza guiones y guion bajo por espacios y capitaliza cada palabra', () => {
    expect(tituloLegibleDeRepo('mi-portafolio_moderno')).toBe('Mi Portafolio Moderno');
  });
});

describe('principalesLenguajes', () => {
  it('ordena de mayor a menor bytes', () => {
    expect(principalesLenguajes({ CSS: 10, TypeScript: 900, HTML: 90 })).toEqual(['TypeScript', 'HTML', 'CSS']);
  });

  it('respeta el máximo', () => {
    const muchos = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`Lang${i}`, 10 - i]));
    expect(principalesLenguajes(muchos, 3)).toHaveLength(3);
  });

  it('sin lenguajes: lista vacía, no lanza', () => {
    expect(principalesLenguajes({})).toEqual([]);
  });
});

describe('construirProyectoPropuesto', () => {
  it('siempre is_published: false — nunca se publica solo', () => {
    const propuesta = construirProyectoPropuesto(
      { repoFullName: 'omarhernandezrey/demo', languagesBytes: { TypeScript: 100 } },
      new Set(),
    );
    expect(propuesta.is_published).toBe(false);
  });

  it('deriva slug, título y repositorio del nombre real del repo', () => {
    const propuesta = construirProyectoPropuesto(
      { repoFullName: 'omarhernandezrey/mi-app-cool', languagesBytes: { JavaScript: 50 } },
      new Set(),
    );
    expect(propuesta.slug).toBe('mi-app-cool');
    expect(propuesta.title).toEqual({ es: 'Mi App Cool', en: 'Mi App Cool' });
    expect(propuesta.repository).toBe('https://github.com/omarhernandezrey/mi-app-cool');
  });

  it('la descripción avisa que falta completarla — nunca inventa contenido del proyecto', () => {
    const propuesta = construirProyectoPropuesto(
      { repoFullName: 'omarhernandezrey/x', languagesBytes: {} },
      new Set(),
    );
    expect(propuesta.description.es).toMatch(/sin descripción/i);
  });

  it('las tecnologías son los lenguajes reales del repo, no una lista inventada', () => {
    const propuesta = construirProyectoPropuesto(
      { repoFullName: 'omarhernandezrey/x', languagesBytes: { Python: 500, Shell: 10 } },
      new Set(),
    );
    expect(propuesta.technologies).toEqual(['Python', 'Shell']);
  });

  it('evita colisión de slug contra los ya existentes', () => {
    const propuesta = construirProyectoPropuesto(
      { repoFullName: 'otraCuenta/demo', languagesBytes: {} },
      new Set(['demo']),
    );
    expect(propuesta.slug).toBe('demo-2');
  });

  it('demo y category quedan honestamente vacíos, nunca inventados', () => {
    const propuesta = construirProyectoPropuesto(
      { repoFullName: 'omarhernandezrey/x', languagesBytes: {} },
      new Set(),
    );
    expect(propuesta.demo).toBe('');
    expect(propuesta.category).toBeNull();
  });
});
