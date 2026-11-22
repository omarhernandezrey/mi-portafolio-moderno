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
import { render, screen, cleanup, waitFor, within } from '@testing-library/react';

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

/** 90 tramos: los 88 primeros sin datos, luego uno con incidencia y hoy al 100%. */
function historialDePrueba() {
  const dias = Array.from({ length: 90 }, (_, i) => {
    const f = new Date('2026-11-22T00:00:00.000Z');
    f.setUTCDate(f.getUTCDate() - (89 - i));
    return {
      fecha: f.toISOString().slice(0, 10),
      comprobaciones: 0,
      operativas: 0,
      porcentaje: null as number | null,
      latenciaMedia: null as number | null,
    };
  });
  dias[88] = { fecha: dias[88].fecha, comprobaciones: 24, operativas: 23, porcentaje: 95.8, latenciaMedia: 180 };
  dias[89] = { fecha: dias[89].fecha, comprobaciones: 12, operativas: 12, porcentaje: 100, latenciaMedia: 120 };
  return {
    dias,
    porcentajeGlobal: 97.2,
    diasConDatos: 2,
    totalComprobaciones: 36,
    registrandoDesde: `${dias[88].fecha}T00:10:00.000Z`,
  };
}

/** Responde según la URL: la página pide /api/health y /api/uptime/history. */
function servir(historial: unknown = historialDePrueba(), salud: unknown = SALUD) {
  global.fetch = jest.fn(async (url: unknown) => {
    const u = String(url);
    if (u.includes('/api/uptime/history')) {
      return { ok: true, json: async () => historial };
    }
    return { ok: true, json: async () => salud };
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  servir();
});

afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});

function textoDeLaPagina(): string {
  return document.body.textContent || '';
}

/**
 * Los tramos de la gráfica, acotados a SU lista. El `Footer` también tiene
 * `<li>`, así que un `getAllByRole('listitem')` suelto mezclaría ambos.
 */
function tramosDeLaGrafica(): HTMLElement[] {
  const lista = screen.queryByRole('list', { name: /Disponibilidad diaria/i });
  return lista ? within(lista).getAllByRole('listitem') : [];
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
    servir(historialDePrueba(), {
      ...SALUD,
      status: 'degraded',
      services: { ...SALUD.services, database: { status: 'degraded', latency: 980 } },
    });

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

describe('/status — historial real de disponibilidad', () => {
  it('pinta un tramo por día con los números que da el endpoint', async () => {
    render(<StatusPage />);
    await waitFor(() => {
      expect(screen.getByText(/Historial de disponibilidad/i)).toBeTruthy();
    });

    expect(tramosDeLaGrafica()).toHaveLength(90);
    // El resumen de cuántas comprobaciones hay detrás: sin eso, una gráfica
    // casi vacía se podría leer como noventa días de caída.
    expect(textoDeLaPagina()).toMatch(/90 días/);
    expect(textoDeLaPagina()).toMatch(/2 con datos/);
    expect(textoDeLaPagina()).toMatch(/36 comprobaciones/);
    expect(textoDeLaPagina()).toMatch(/97\.2%/);
  });

  it('un día sin datos lo dice, y no se presenta como 100%', async () => {
    render(<StatusPage />);
    await waitFor(() => {
      expect(screen.getByText(/Historial de disponibilidad/i)).toBeTruthy();
    });

    const tramos = tramosDeLaGrafica();
    // Los 88 primeros del fixture no tienen comprobaciones.
    expect(tramos[0].getAttribute('title')).toMatch(/sin datos/i);
    expect(tramos[0].getAttribute('title')).not.toMatch(/100%/);
    // El día con incidencia muestra su porcentaje real, no un redondeo a 100.
    expect(tramos[88].getAttribute('title')).toMatch(/95\.8% operativo/);
    expect(tramos[88].getAttribute('title')).toMatch(/23\/24 comprobaciones/);
    expect(tramos[89].getAttribute('title')).toMatch(/100% operativo/);
  });

  it('explica desde cuándo hay registro', async () => {
    render(<StatusPage />);
    await waitFor(() => {
      expect(textoDeLaPagina()).toMatch(/Registrando desde el/);
    });
    expect(textoDeLaPagina()).toMatch(/no porque el sitio estuviera caído/i);
  });

  it('con el registro recién estrenado no dibuja barras, lo explica', async () => {
    servir({
      dias: Array.from({ length: 90 }, (_, i) => ({
        fecha: `2026-09-${String((i % 28) + 1).padStart(2, '0')}`,
        comprobaciones: 0,
        operativas: 0,
        porcentaje: null,
        latenciaMedia: null,
      })),
      porcentajeGlobal: null,
      diasConDatos: 0,
      totalComprobaciones: 0,
      registrandoDesde: null,
    });

    render(<StatusPage />);
    await waitFor(() => {
      expect(textoDeLaPagina()).toMatch(/Todavía no hay comprobaciones registradas/i);
    });
    expect(tramosDeLaGrafica()).toHaveLength(0);
  });

  it('si el historial falla, lo dice y no afecta al estado actual', async () => {
    global.fetch = jest.fn(async (url: unknown) => {
      if (String(url).includes('/api/uptime/history')) {
        return { ok: false, json: async () => ({}) };
      }
      return { ok: true, json: async () => SALUD };
    }) as unknown as typeof fetch;

    render(<StatusPage />);
    await waitFor(() => {
      expect(textoDeLaPagina()).toMatch(/No se pudo cargar el historial/i);
    });
    // El estado de ahora mismo sigue ahí.
    expect(screen.getByText('Operational Protocol')).toBeTruthy();
  });
});
