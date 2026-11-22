/**
 * @jest-environment jsdom
 */

/**
 * La ventana de «cargar más» del archivo del blog. Sin pruebas hasta ahora, y
 * su reinicio al cambiar de filtro lo hacía un efecto que observaba
 * `[query, activeTopic, sort]`.
 *
 * Escritas y pasadas en verde ANTES de tocar el componente.
 */
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// `@/i18n/navigation` reexporta el Link de next-intl, que es ESM y Jest no
// puede cargar. Se sustituye por un <a> simple: el enrutado localizado no es
// lo que se prueba aquí.
jest.mock('@/i18n/navigation', () => {
  const Link = ({
    children,
    href,
  }: {
    children?: React.ReactNode;
    href: string | { pathname: string };
  }) => (
    <a href={typeof href === 'string' ? href : (href?.pathname ?? '#')}>
      {children}
    </a>
  );
  Link.displayName = 'Link';
  return { Link, usePathname: () => '/', useRouter: () => ({ push: jest.fn() }) };
});

import BlogArchive from '@/components/blog/BlogArchive';
import type { PostMetadata } from '@/lib/blog';

afterEach(cleanup);

/**
 * 15 entradas. En la vista por defecto la primera va como destacada y el
 * archivo muestra las 14 restantes, con la ventana en 6.
 */
const POSTS: PostMetadata[] = Array.from({ length: 15 }, (_, i) => ({
  title: `Ensayo ${String(i + 1).padStart(2, '0')}`,
  slug: `ensayo-${i + 1}`,
  // Fechas descendentes para que «newest» dé un orden estable y predecible.
  date: `2026-01-${String(28 - i).padStart(2, '0')}`,
  description: `Resumen del ensayo ${i + 1}`,
  tags: i === 14 ? ['seo'] : ['desarrollo'],
  author: 'Omar Hernández Rey',
  readingTime: 5,
})) as PostMetadata[];

/**
 * Títulos únicos: la sección «empieza por aquí» repite tres entradas que
 * también están en el archivo, y contarlas dos veces falsearía los totales.
 */
function titulosVisibles(): string[] {
  const vistos = Array.from(document.querySelectorAll('a'))
    .map((a) => (a.textContent || '').trim())
    .map((texto) => texto.match(/Ensayo \d\d/)?.[0])
    .filter((v): v is string => Boolean(v));
  return [...new Set(vistos)];
}

function botonCargarMas(): HTMLElement | null {
  return screen.queryByRole('button', { name: /Cargar más ensayos/i });
}

function campoDeBusqueda(): HTMLInputElement {
  return screen.getByRole('searchbox') as HTMLInputElement;
}

describe('BlogArchive — ventana de «cargar más»', () => {
  it('arranca mostrando una ventana parcial y ofrece cargar más', () => {
    render(<BlogArchive posts={POSTS} locale="es" />);
    // El destacado más los 6 del primer tramo: menos que las 15 totales.
    expect(titulosVisibles().length).toBeLessThan(POSTS.length);
    expect(botonCargarMas()).not.toBeNull();
  });

  it('cargar más amplía la ventana', async () => {
    render(<BlogArchive posts={POSTS} locale="es" />);
    const antes = titulosVisibles().length;

    await userEvent.click(botonCargarMas()!);

    expect(titulosVisibles().length).toBeGreaterThan(antes);
  });

  it('cambiar la búsqueda devuelve la ventana a su tamaño inicial', async () => {
    render(<BlogArchive posts={POSTS} locale="es" />);
    const inicial = titulosVisibles().length;

    await userEvent.click(botonCargarMas()!);
    expect(titulosVisibles().length).toBeGreaterThan(inicial);

    // «Ensayo» coincide con todas, así que el conjunto filtrado es el mismo
    // tamaño: lo que debe cambiar es SOLO la ventana, que vuelve al inicio.
    await userEvent.type(campoDeBusqueda(), 'Ensayo');

    expect(botonCargarMas()).not.toBeNull();
    expect(titulosVisibles().length).toBeLessThanOrEqual(inicial);
  });

  it('cambiar el orden devuelve la ventana a su tamaño inicial', async () => {
    render(<BlogArchive posts={POSTS} locale="es" />);
    await userEvent.click(botonCargarMas()!);
    const ampliada = titulosVisibles().length;

    await userEvent.selectOptions(screen.getByRole('combobox'), 'oldest');

    expect(titulosVisibles().length).toBeLessThan(ampliada);
    expect(botonCargarMas()).not.toBeNull();
  });

  it('filtrar por tema devuelve la ventana a su tamaño inicial', async () => {
    render(<BlogArchive posts={POSTS} locale="es" />);
    await userEvent.click(botonCargarMas()!);
    const ampliada = titulosVisibles().length;

    // Los botones de tema aparecen duplicados (barra lateral y versión
    // compacta): basta pulsar uno.
    const temas = screen.getAllByRole('button', { name: /desarrollo/i });
    await userEvent.click(temas[0]);

    expect(titulosVisibles().length).toBeLessThan(ampliada);
  });

  it('al cargar todo, el botón desaparece', async () => {
    render(<BlogArchive posts={POSTS} locale="es" />);
    for (let i = 0; i < 5 && botonCargarMas(); i += 1) {
      await userEvent.click(botonCargarMas()!);
    }
    expect(botonCargarMas()).toBeNull();
    expect(titulosVisibles().length).toBe(POSTS.length);
  });
});
