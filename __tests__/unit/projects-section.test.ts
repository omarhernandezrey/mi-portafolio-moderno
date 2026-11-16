/**
 * T-07: el visor de proyectos lee de la base, pero lo que llega a `Card` y lo
 * que el buscador/paginador hacen con ello no cambia.
 *
 * Se mockea `@/lib/supabase/public` para que `getProjects()` caiga de forma
 * determinista al respaldo (`projectsData`), sin tocar la red en los tests.
 * Eso es, en los hechos, el mismo contenido que `Card` recibía antes de T-06/
 * T-07 — por eso esta comparación demuestra que nada cambió para `Card`.
 *
 * `coincideConBusqueda`/`paginar` se importan de `projectSearch.ts`, no de
 * `ProjectsSection.tsx`: ese componente usa `useTranslation` → `next-intl`
 * (ESM), que Jest no puede transformar, y no hace falta montarlo para probar
 * dos funciones puras.
 */
jest.mock('@/lib/supabase/public', () => ({
  crearClientePublico: () => {
    throw new Error('sin red en los tests');
  },
}));

import { projectsData, getLocalizedProjectsData } from '@/lib/projectsData';
import { getProjects } from '@/lib/portfolio/repository';
import { coincideConBusqueda, paginar } from '@/lib/portfolio/projectSearch';

const PROJECTS_PER_PAGE = 4;

describe('lo que recibe Card no cambió al pasar por getProjects()', () => {
  it('los 22 proyectos, ya localizados, son idénticos a los de projectsData en los dos idiomas', async () => {
    const proyectos = await getProjects();
    expect(proyectos).toHaveLength(22);
    expect(getLocalizedProjectsData(proyectos, 'es')).toEqual(getLocalizedProjectsData(projectsData, 'es'));
    expect(getLocalizedProjectsData(proyectos, 'en')).toEqual(getLocalizedProjectsData(projectsData, 'en'));
  });
});

describe('búsqueda y paginación: mismo resultado que antes de T-07', () => {
  const es = getLocalizedProjectsData(projectsData, 'es');

  it.each([
    ['react', 5],
    ['zzz-no-existe-en-ningun-proyecto', 0],
    ['vercel', 8],
  ])('buscar "%s" encuentra %i proyecto(s)', (termino, esperado) => {
    expect(es.filter((p) => coincideConBusqueda(p, termino as string))).toHaveLength(esperado as number);
  });

  it('no distingue mayúsculas ni dónde aparece el término (título, descripción o tecnologías)', () => {
    expect(coincideConBusqueda({ title: 'React Avanzado', description: 'd', technologies: [] }, 'REACT')).toBe(true);
    expect(coincideConBusqueda({ title: 't', description: 'hecho con Zustand', technologies: [] }, 'zustand')).toBe(true);
    expect(coincideConBusqueda({ title: 't', description: 'd', technologies: ['PostgreSQL'] }, 'postgresql')).toBe(true);
  });

  it('pagina de 4 en 4, igual que PROJECTS_PER_PAGE de siempre', () => {
    expect(paginar(es, 1, PROJECTS_PER_PAGE)).toEqual(es.slice(0, 4));
    expect(paginar(es, 2, PROJECTS_PER_PAGE)).toEqual(es.slice(4, 8));
    const totalPages = Math.ceil(es.length / PROJECTS_PER_PAGE);
    const ultima = paginar(es, totalPages, PROJECTS_PER_PAGE);
    expect(ultima.length).toBeGreaterThan(0);
    expect(ultima.length).toBeLessThanOrEqual(PROJECTS_PER_PAGE);
  });

  it('una página fuera de rango no revienta: devuelve un tramo vacío', () => {
    expect(paginar(es, 999, PROJECTS_PER_PAGE)).toEqual([]);
  });
});
