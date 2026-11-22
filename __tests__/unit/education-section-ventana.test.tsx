/**
 * @jest-environment jsdom
 */

/**
 * La ventana «cargar más» de la línea de tiempo de educación. Sin pruebas
 * hasta ahora, y mantenida por un efecto que, al cambiar la lista, reescribía
 * CUATRO estados a la vez (`visibleItems`, `visibleCount`, `hasMore`,
 * `isLoading`) — tres de ellos derivables de la lista más la cuenta.
 *
 * Escritas y pasadas en verde ANTES de tocar el componente.
 */
import React from 'react';
import { render, cleanup, act } from '@testing-library/react';

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (k: string) => k, language: 'es', isHydrated: true }),
}));

// En jsdom nada hace avanzar las animaciones de salida de framer-motion.
jest.mock('framer-motion', () => {
  const real = jest.requireActual('framer-motion');
  return {
    ...real,
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
  };
});

import EducationSection from '@/components/sections/EducationSection';

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
  window.matchMedia = ((q: string) => ({
    matches: false,
    media: q,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    },
  })) as unknown as typeof window.matchMedia;
});

afterEach(cleanup);

/** El propio botón de «cargar más» lleva también la clase `timeline-item`. */
function cursosVisibles(): number {
  return document.querySelectorAll('.timeline-item:not(.load-more)').length;
}

function botonCargarMas(): HTMLElement | null {
  return document.querySelector('.load-more');
}

/** El componente retrasa 250 ms el siguiente tramo para animar la carga. */
async function cargarUnoMas() {
  jest.useFakeTimers();
  try {
    act(() => {
      botonCargarMas()!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    act(() => {
      jest.advanceTimersByTime(300);
    });
  } finally {
    jest.useRealTimers();
  }
}

describe('EducationSection — ventana de la línea de tiempo', () => {
  it('arranca con el primer tramo y ofrece cargar más', () => {
    render(<EducationSection />);
    // INITIAL_VISIBLE_ITEMS es 7.
    expect(cursosVisibles()).toBe(7);
    expect(botonCargarMas()).not.toBeNull();
  });

  it('cargar más añade un curso', async () => {
    render(<EducationSection />);
    expect(cursosVisibles()).toBe(7);

    await cargarUnoMas();

    // LOAD_MORE_STEP es 1.
    expect(cursosVisibles()).toBe(8);
    expect(botonCargarMas()).not.toBeNull();
  });

  it('cargar más dos veces acumula', async () => {
    render(<EducationSection />);
    await cargarUnoMas();
    await cargarUnoMas();
    expect(cursosVisibles()).toBe(9);
  });

});
