/**
 * @jest-environment jsdom
 */

/**
 * Los valores de las barras de habilidades. Sin pruebas hasta ahora, y
 * mantenidos por DOS efectos que escribían el mismo estado:
 *
 *   useEffect(..., [language, localizedSkills])  -> todo a 0, hasAnimated=false
 *   useEffect(..., [selectedCategory, language]) -> porcentajes llenos, true
 *
 * `localizedSkills` es un `useMemo` sobre `[language]`, así que el primero se
 * dispara EXACTAMENTE cuando el segundo, que está declarado después y
 * sobrescribe los tres estados en el mismo commit. El contrato observable es
 * el del segundo: las barras se ven llenas. Estas pruebas lo fijan ANTES de
 * tocar nada, para poder demostrar que quitar el primero no cambia nada.
 */
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const estado = { idioma: 'es' };

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (clave: string) => clave,
    language: estado.idioma,
    isHydrated: true,
  }),
}));

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
});

/** Los porcentajes pintados, en orden. */
function porcentajes(): number[] {
  return Array.from(document.querySelectorAll('*'))
    .filter(
      (e) => e.children.length === 0 && /^\d+%$/.test((e.textContent || '').trim())
    )
    .map((e) => parseInt((e.textContent || '').trim(), 10));
}

describe('SkillSection — valores de las barras', () => {
  it('al montar, las barras ya están llenas (ninguna en 0)', () => {
    render(<SkillSection />);
    const valores = porcentajes();
    expect(valores.length).toBe(skillsData.length);
    expect(valores.every((v) => v > 0)).toBe(true);
  });

  it('los valores coinciden con los datos, no con una animación a medias', () => {
    render(<SkillSection />);
    const esperados = skillsData.map((s) =>
      parseInt(String(s.percentage).replace('%', ''), 10)
    );
    expect(porcentajes()).toEqual(esperados);
  });

  it('filtrar por categoría deja solo esa categoría, y llena', async () => {
    render(<SkillSection />);
    await userEvent.click(screen.getByRole('button', { name: 'Frontend' }));

    // El campo `category` de los datos es bilingüe, así que el número exacto
    // se deja al componente: lo que importa es que filtró (menos que el total)
    // y que lo que queda se ve lleno, no a medio animar.
    const valores = porcentajes();
    expect(valores.length).toBeGreaterThan(0);
    expect(valores.length).toBeLessThan(skillsData.length);
    expect(valores.every((v) => v > 0)).toBe(true);
  });

  it('volver a «todas» restaura la lista completa y llena', async () => {
    render(<SkillSection />);
    await userEvent.click(screen.getByRole('button', { name: 'Frontend' }));
    await userEvent.click(screen.getByRole('button', { name: 'skills.allSkills' }));

    expect(porcentajes().length).toBe(skillsData.length);
    expect(porcentajes().every((v) => v > 0)).toBe(true);
  });

  it('cambiar de idioma deja las barras llenas, no en 0', () => {
    const { rerender } = render(<SkillSection />);
    expect(porcentajes().every((v) => v > 0)).toBe(true);

    estado.idioma = 'en';
    rerender(<SkillSection />);

    const valores = porcentajes();
    expect(valores.length).toBe(skillsData.length);
    expect(valores.every((v) => v > 0)).toBe(true);
  });
});
