/**
 * @jest-environment jsdom
 */

/**
 * El carrusel de certificados destacados. Sin pruebas hasta ahora, y su
 * reinicio al cambiar la lista lo hacía un efecto que observaba `[courses]`.
 * `courses` llega de un `useMemo` que depende del idioma, así que ese reinicio
 * ocurre de verdad cuando el visitante cambia de idioma.
 *
 * Escritas y pasadas en verde ANTES de tocar el componente.
 */
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (k: string) => k, language: 'es', isHydrated: true }),
}));

// En jsdom nada hace avanzar las animaciones, así que las salidas no terminan
// y las diapositivas anteriores se quedarían en el DOM.
jest.mock('framer-motion', () => {
  const real = jest.requireActual('framer-motion');
  return {
    ...real,
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
  };
});

import FeaturedCertificates, {
  type FeaturedCertificate,
} from '@/components/sections/FeaturedCertificates';

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

function curso(id: string, title: string): FeaturedCertificate {
  return {
    id,
    title,
    institution: 'Platzi',
    summary: `Resumen de ${title}`,
    logo: '/images/logo.png',
    certificate: null,
  };
}

const EN_ES = [curso('a', 'Uno'), curso('b', 'Dos'), curso('c', 'Tres')];
// Misma lista, otro idioma: array NUEVO con los mismos ids.
const EN_EN = [curso('a', 'One'), curso('b', 'Two'), curso('c', 'Three')];

/** El indicador «01 / 03» aparece duplicado (escritorio y móvil). */
function indiceVisible(): string {
  const marcas = Array.from(document.querySelectorAll('strong'))
    .map((s) => (s.textContent || '').trim())
    .filter((t) => /^\d\d$/.test(t));
  return marcas[0];
}

function tituloActivo(): string {
  return (document.querySelectorAll('h4')[0]?.textContent || '').trim();
}

const siguiente = () =>
  userEvent.click(
    screen.getAllByRole('button', { name: 'education.carouselNext' })[0]
  );

describe('FeaturedCertificates — carrusel', () => {
  it('arranca en la primera diapositiva', () => {
    render(<FeaturedCertificates courses={EN_ES} />);
    expect(indiceVisible()).toBe('01');
    expect(tituloActivo()).toBe('Uno');
  });

  it('avanza a la siguiente', async () => {
    render(<FeaturedCertificates courses={EN_ES} />);
    await siguiente();
    expect(indiceVisible()).toBe('02');
    expect(tituloActivo()).toBe('Dos');
  });

  it('cambiar la lista (p. ej. de idioma) vuelve a la primera', async () => {
    const { rerender } = render(<FeaturedCertificates courses={EN_ES} />);
    await siguiente();
    await siguiente();
    expect(indiceVisible()).toBe('03');

    rerender(<FeaturedCertificates courses={EN_EN} />);

    expect(indiceVisible()).toBe('01');
    expect(tituloActivo()).toBe('One');
  });

  it('una lista más corta no deja el carrusel en una diapositiva inexistente', async () => {
    const { rerender } = render(<FeaturedCertificates courses={EN_ES} />);
    await siguiente();
    await siguiente();
    expect(indiceVisible()).toBe('03');

    rerender(<FeaturedCertificates courses={[curso('z', 'Único')]} />);

    expect(indiceVisible()).toBe('01');
    expect(tituloActivo()).toBe('Único');
  });

  it('da la vuelta al llegar al final', async () => {
    render(<FeaturedCertificates courses={EN_ES} />);
    await siguiente();
    await siguiente();
    await siguiente();
    expect(indiceVisible()).toBe('01');
    expect(tituloActivo()).toBe('Uno');
  });
});
