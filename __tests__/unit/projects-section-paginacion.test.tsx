/**
 * @jest-environment jsdom
 */

/**
 * Paginación de ProjectsSection: la sección pública de proyectos no tenía
 * ninguna prueba, y su página actual se mantenía con DOS efectos que
 * sincronizaban estado (reiniciar a 1 al buscar, y recortar la página si la
 * búsqueda dejaba menos páginas que la página en la que estabas).
 *
 * Estas pruebas se escribieron y se pasaron ANTES de tocar el componente, para
 * medir el comportamiento real y no la implementación nueva.
 */
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('@vercel/analytics', () => ({ track: jest.fn() }));

/**
 * Se sustituye SOLO `AnimatePresence`, por un paso directo de los hijos. El
 * resto de framer-motion (motion, useScroll, useTransform) es el de verdad.
 * En jsdom no hay nada que haga avanzar las animaciones, así que las
 * animaciones de salida no terminan nunca y las tarjetas de la página
 * anterior se quedan en el DOM: sin esto, al pasar a la página 3 se verían
 * los cuatro proyectos de la 1 además de los de la 3, y la prueba no podría
 * distinguir «muestra la página correcta» de «muestra todo».
 */
jest.mock('framer-motion', () => {
  const real = jest.requireActual('framer-motion');
  return {
    ...real,
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
  };
});
jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    language: 'es',
    // Devuelve la clave con sus parámetros, para poder afirmar sobre el
    // estado de la paginación sin depender de los textos traducidos.
    t: (clave: string, params?: Record<string, unknown>) =>
      params ? `${clave}:${JSON.stringify(params)}` : clave,
  }),
}));

import ProjectsSection from '@/components/sections/ProjectsSection';
import type { Project } from '@/lib/projectsData';

beforeAll(() => {
  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
});

afterEach(cleanup);

/** PROJECTS_PER_PAGE es 4, así que 10 proyectos dan 3 páginas. */
function proyecto(nombre: string, tecnologia: string): Project {
  return {
    title: { es: nombre, en: nombre },
    description: { es: `Descripción de ${nombre}`, en: `About ${nombre}` },
    technologies: [tecnologia],
    repository: `https://github.com/omar/${nombre.toLowerCase()}`,
    demo: '',
    category: { es: 'Web', en: 'Web' },
  } as Project;
}

// Nueve con «React» y uno solo con «Svelte»: buscar «svelte» deja 1 resultado
// (1 página) y buscar «react» deja 9 (3 páginas).
const PROYECTOS: Project[] = [
  ...Array.from({ length: 9 }, (_, i) => proyecto(`Proyecto${i + 1}`, 'React')),
  proyecto('ProyectoSvelte', 'Svelte'),
];

/**
 * Los títulos de los proyectos visibles. Es la aserción que importa: lo que
 * el visitante ve en la rejilla, independiente del cromo de la paginación
 * (que se duplica entre escritorio y móvil, y desaparece con una sola
 * página).
 */
function proyectosVisibles(): string[] {
  return Array.from(document.querySelectorAll('h3'))
    .map((h) => (h.textContent || '').trim())
    // El estado vacío también es un h3; su texto es una clave de i18n, no un
    // título de proyecto.
    .filter((texto) => texto && !texto.startsWith('projects.'));
}

/** Solo existe cuando hay más de una página. */
function estadoDePagina(): { current: number; total: number } {
  const nodo = screen.getByText(/^projects\.pageStatus:/);
  return JSON.parse(nodo.textContent!.replace('projects.pageStatus:', ''));
}

function campoDeBusqueda(): HTMLInputElement {
  return screen.getByRole('textbox') as HTMLInputElement;
}

/** Hay dos paginaciones en el DOM (escritorio y móvil): basta pulsar una. */
async function irAPagina(n: number) {
  const botones = screen.getAllByRole('button', {
    name: `projects.goToPage:{"page":${n}}`,
  });
  await userEvent.click(botones[0]);
}

describe('ProjectsSection — paginación', () => {
  it('arranca en la página 1 con los primeros cuatro proyectos', () => {
    render(<ProjectsSection projects={PROYECTOS} />);
    expect(proyectosVisibles()).toEqual([
      'Proyecto1',
      'Proyecto2',
      'Proyecto3',
      'Proyecto4',
    ]);
    expect(estadoDePagina()).toEqual({ current: 1, total: 3 });
  });

  it('navegar a la última página muestra su tramo', async () => {
    render(<ProjectsSection projects={PROYECTOS} />);
    await irAPagina(3);
    expect(estadoDePagina()).toEqual({ current: 3, total: 3 });
    expect(proyectosVisibles()).toEqual(['Proyecto9', 'ProyectoSvelte']);
  });

  it('buscar reinicia a la página 1', async () => {
    render(<ProjectsSection projects={PROYECTOS} />);
    await irAPagina(2);
    expect(estadoDePagina().current).toBe(2);

    await userEvent.type(campoDeBusqueda(), 'react');

    expect(estadoDePagina()).toEqual({ current: 1, total: 3 });
    expect(proyectosVisibles()[0]).toBe('Proyecto1');
  });

  it('si la búsqueda deja menos páginas, no se queda en una página vacía', async () => {
    render(<ProjectsSection projects={PROYECTOS} />);
    await irAPagina(3);
    expect(proyectosVisibles()).toEqual(['Proyecto9', 'ProyectoSvelte']);

    // «svelte» deja un solo resultado: una sola página. Sin recorte, la
    // página 3 de un solo tramo no tendría nada que pintar.
    await userEvent.type(campoDeBusqueda(), 'svelte');

    expect(proyectosVisibles()).toEqual(['ProyectoSvelte']);
  });

  it('borrar la búsqueda devuelve todas las páginas desde la primera', async () => {
    render(<ProjectsSection projects={PROYECTOS} />);
    await userEvent.type(campoDeBusqueda(), 'svelte');
    expect(proyectosVisibles()).toEqual(['ProyectoSvelte']);

    await userEvent.clear(campoDeBusqueda());

    expect(estadoDePagina()).toEqual({ current: 1, total: 3 });
    expect(proyectosVisibles()).toEqual([
      'Proyecto1',
      'Proyecto2',
      'Proyecto3',
      'Proyecto4',
    ]);
  });

  it('una búsqueda sin resultados muestra el estado vacío, no una página rota', async () => {
    render(<ProjectsSection projects={PROYECTOS} />);
    await irAPagina(3);

    await userEvent.type(campoDeBusqueda(), 'nadacoincide');

    expect(proyectosVisibles()).toEqual([]);
    expect(screen.getByText('projects.noResults')).toBeTruthy();
  });

  it('el botón de limpiar del estado vacío restaura la primera página', async () => {
    render(<ProjectsSection projects={PROYECTOS} />);
    await irAPagina(3);
    await userEvent.type(campoDeBusqueda(), 'nadacoincide');

    await userEvent.click(screen.getByText('projects.clearFilters'));

    expect(campoDeBusqueda().value).toBe('');
    expect(proyectosVisibles()).toEqual([
      'Proyecto1',
      'Proyecto2',
      'Proyecto3',
      'Proyecto4',
    ]);
  });
});
