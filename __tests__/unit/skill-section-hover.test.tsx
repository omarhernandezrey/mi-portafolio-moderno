/**
 * @jest-environment jsdom
 */

/**
 * La animación de hover de las barras de habilidades.
 *
 * `skill-section-valores.test.tsx` fija los valores EN REPOSO; esto fija el
 * recorrido del hover, que era justo lo que faltaba para poder tocar el núcleo
 * de `requestAnimationFrame` sin red. El contrato observable:
 *
 *   - al entrar el ratón, la barra arranca en 0 y sube hasta su porcentaje;
 *   - al salir, vuelve a su porcentaje;
 *   - cambiar de categoría o idioma deja todo en reposo, sin rastro de una
 *     animación a medias.
 *
 * Escritas y pasadas en verde ANTES de refactorizar.
 */
import React from 'react';
import { render, screen, cleanup, act, fireEvent } from '@testing-library/react';

const estado = { idioma: 'es' };

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (clave: string) => clave,
    language: estado.idioma,
    isHydrated: true,
  }),
}));

// `AnimatePresence` deja las tarjetas salientes en el DOM en jsdom, donde nada
// hace avanzar las animaciones de salida.
jest.mock('framer-motion', () => {
  const real = jest.requireActual('framer-motion');
  return {
    ...real,
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
  };
});

import SkillSection from '@/components/sections/SkillSection';
import { skillsData } from '@/lib/skillsData';

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

afterEach(() => {
  cleanup();
  estado.idioma = 'es';
  jest.useRealTimers();
});

/** Los porcentajes pintados, en orden. */
function porcentajes(): number[] {
  return Array.from(document.querySelectorAll('*'))
    .filter(
      (e) => e.children.length === 0 && /^\d+%$/.test((e.textContent || '').trim())
    )
    .map((e) => parseInt((e.textContent || '').trim(), 10));
}

/** La tarjeta `idx`: el elemento que lleva los manejadores de ratón. */
function tarjeta(idx: number): HTMLElement {
  const porcentaje = Array.from(document.querySelectorAll('*')).filter(
    (e) => e.children.length === 0 && /^\d+%$/.test((e.textContent || '').trim())
  )[idx];
  const card = porcentaje.closest('.group');
  if (!card) throw new Error(`sin tarjeta para el índice ${idx}`);
  return card as HTMLElement;
}

/**
 * Avanza la animación. `requestAnimationFrame` de jsdom se apoya en un
 * temporizador, así que con temporizadores falsos se puede mover el reloj —
 * pero `performance.now()` NO avanza con ellos, y la animación calcula su
 * progreso con él. Por eso se mueven los dos a la vez.
 */
function avanzar(ms: number) {
  const base = performance.now();
  const spy = jest.spyOn(performance, 'now');
  let transcurrido = 0;
  spy.mockImplementation(() => base + transcurrido);
  const paso = 16;
  for (let t = 0; t < ms; t += paso) {
    transcurrido = Math.min(t + paso, ms);
    act(() => {
      jest.advanceTimersByTime(paso);
    });
  }
  spy.mockRestore();
}

/**
 * Entra el ratón y deja correr al menos un frame. Hace falta: el manejador
 * solo PROGRAMA un `requestAnimationFrame`, así que justo después del evento
 * el valor pintado sigue siendo el de reposo.
 */
function entrar(idx: number, ms = 16) {
  act(() => {
    fireEvent.mouseEnter(tarjeta(idx));
  });
  avanzar(ms);
}

const PORCENTAJE_0 = parseInt(
  String(skillsData[0].percentage).replace('%', ''),
  10
);

describe('SkillSection — animación de hover', () => {
  it('al entrar el ratón, la barra baja a 0 y empieza a subir', () => {
    jest.useFakeTimers();
    render(<SkillSection />);
    expect(porcentajes()[0]).toBe(PORCENTAJE_0);

    entrar(0);

    // Arranca desde 0 (el hover pasa `fromOverride = 0`) y sube desde ahí.
    expect(porcentajes()[0]).toBeLessThan(PORCENTAJE_0);
  });

  it('la animación termina en el porcentaje real de la habilidad', () => {
    jest.useFakeTimers();
    render(<SkillSection />);

    entrar(0);
    // 350ms es la duración que pasa el manejador de hover.
    avanzar(500);

    expect(porcentajes()[0]).toBe(PORCENTAJE_0);
  });

  it('no afecta a las demás tarjetas', () => {
    jest.useFakeTimers();
    render(<SkillSection />);
    const antes = porcentajes();

    entrar(0);

    const durante = porcentajes();
    expect(durante.slice(1)).toEqual(antes.slice(1));
  });

  it('al salir el ratón, la barra vuelve a su porcentaje', () => {
    jest.useFakeTimers();
    render(<SkillSection />);

    entrar(0);
    expect(porcentajes()[0]).toBeLessThan(PORCENTAJE_0);

    act(() => {
      fireEvent.mouseLeave(tarjeta(0));
    });

    expect(porcentajes()[0]).toBe(PORCENTAJE_0);
  });

  it('cambiar de categoría a mitad de animación no deja barras a medias', async () => {
    jest.useFakeTimers();
    render(<SkillSection />);

    entrar(0);
    expect(porcentajes()[0]).toBeLessThan(PORCENTAJE_0);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Frontend' }));
    });

    // Todas las visibles, llenas: ni ceros ni valores intermedios.
    const valores = porcentajes();
    expect(valores.length).toBeGreaterThan(0);
    expect(valores.every((v) => v > 0)).toBe(true);
  });

  it('cambiar de idioma a mitad de animación tampoco', () => {
    jest.useFakeTimers();
    const { rerender } = render(<SkillSection />);

    entrar(0);
    expect(porcentajes()[0]).toBeLessThan(PORCENTAJE_0);

    estado.idioma = 'en';
    act(() => {
      rerender(<SkillSection />);
    });

    const valores = porcentajes();
    expect(valores.length).toBe(skillsData.length);
    expect(valores.every((v) => v > 0)).toBe(true);
  });

  it('entrar en dos tarjetas seguidas anima la segunda sin romper la primera', () => {
    jest.useFakeTimers();
    render(<SkillSection />);

    entrar(0);
    avanzar(500);
    act(() => {
      fireEvent.mouseLeave(tarjeta(0));
    });
    entrar(1);

    expect(porcentajes()[0]).toBe(PORCENTAJE_0);
    expect(porcentajes()[1]).toBeLessThan(
      parseInt(String(skillsData[1].percentage).replace('%', ''), 10)
    );
  });
});
