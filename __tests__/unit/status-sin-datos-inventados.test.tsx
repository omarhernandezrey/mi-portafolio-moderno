/**
 * @jest-environment jsdom
 */

/**
 * `/status` es una página PÚBLICA, y hasta ahora publicaba cuatro cosas que
 * nadie medía: un «Network Health 99.98%» literal, una gráfica de 90 días con
 * alturas `Math.random()` y tooltips afirmando «100% Stability», y tres
 * servicios cableados en verde (dos aquí y uno como stub del endpoint).
 *
 * Estas pruebas hacen dos cosas:
 *  1. fijan que lo que se muestra SALE del endpoint (si alguien vuelve a
 *     escribir un número a mano, la prueba no lo detecta por sí sola — pero
 *     sí detecta que los valores del endpoint dejen de pintarse);
 *  2. actúan de guardia contra la reaparición de lo que se quitó.
 */
import React from 'react';
import { render, screen, cleanup, waitFor } from '@testing-library/react';

jest.mock('@vercel/analytics', () => ({ track: jest.fn() }));
jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (k: string) => k, language: 'es', isHydrated: true }),
}));
jest.mock('@/i18n/navigation', () => {
  const Link = ({ children }: { children?: React.ReactNode }) => <a>{children}</a>;
  Link.displayName = 'Link';
  return { Link, usePathname: () => '/', useRouter: () => ({ push: jest.fn() }) };
});
jest.mock('next-intl', () => ({ useLocale: () => 'es' }));

import StatusPage from '@/app/status/page';

const SALUD = {
  status: 'operational',
  timestamp: '2026-11-22T18:40:00.000Z',
  latency_ms: 137,
  services: {
    database: { status: 'operational', latency: 42 },
    llm_gateway: { status: 'unknown' },
  },
};

beforeAll(() => {
  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

beforeEach(() => {
  global.fetch = jest.fn(async () => ({
    ok: true,
    json: async () => SALUD,
  })) as unknown as typeof fetch;
});

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

function textoDeLaPagina(): string {
  return document.body.textContent || '';
}

describe('/status — solo datos medidos', () => {
  it('pinta la latencia y el estado que devuelve /api/health', async () => {
    render(<StatusPage />);

    await waitFor(() => {
      expect(textoDeLaPagina()).toContain('137');
    });
    // La latencia de la base, que el endpoint mide con una consulta real.
    expect(textoDeLaPagina()).toContain('42ms');
    expect(screen.getByText('Operational Protocol')).toBeTruthy();
  });

  it('refleja un estado degradado en vez de afirmar que todo va bien', async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        ...SALUD,
        status: 'degraded',
        services: { ...SALUD.services, database: { status: 'degraded', latency: 980 } },
      }),
    })) as unknown as typeof fetch;

    render(<StatusPage />);

    await waitFor(() => {
      expect(screen.getByText('Performance Alert')).toBeTruthy();
    });
    expect(textoDeLaPagina()).toContain('980ms');
  });

  it('no vuelve a aparecer ninguno de los valores inventados', async () => {
    render(<StatusPage />);
    await waitFor(() => expect(textoDeLaPagina()).toContain('137'));

    const texto = textoDeLaPagina();
    // El porcentaje de uptime escrito a mano.
    expect(texto).not.toContain('99.98');
    expect(texto).not.toMatch(/Network Health/i);
    // La gráfica de 90 días que no leía nada.
    expect(texto).not.toMatch(/Uptime History/i);
    expect(texto).not.toMatch(/90-Day/i);
    expect(texto).not.toMatch(/Stability/i);
    // Los sellos que afirmaban propiedades no medidas.
    expect(texto).not.toMatch(/Zero-Downtime/i);
    expect(texto).not.toMatch(/End-to-End Encryption/i);
    // Los servicios que estaban siempre en verde sin medirse.
    expect(texto).not.toMatch(/Front-end Gateway/i);
    expect(texto).not.toMatch(/Event Dispatcher/i);
    expect(texto).not.toMatch(/Core Intelligence/i);
  });

  it('no queda ninguna barra decorativa de la gráfica borrada', async () => {
    render(<StatusPage />);
    await waitFor(() => expect(textoDeLaPagina()).toContain('137'));

    // La gráfica eran 70 divs con `title="Cycle N: ... Stability"`.
    expect(document.querySelectorAll('[title*="Cycle"]')).toHaveLength(0);
  });

  it('si el endpoint falla, lo dice en vez de inventar un estado', async () => {
    global.fetch = jest.fn(async () => ({
      ok: false,
      json: async () => ({}),
    })) as unknown as typeof fetch;

    render(<StatusPage />);

    await waitFor(() => {
      expect(screen.getByText('Protocol Break Detected')).toBeTruthy();
    });
    expect(textoDeLaPagina()).not.toContain('Operational Protocol');
  });
});
