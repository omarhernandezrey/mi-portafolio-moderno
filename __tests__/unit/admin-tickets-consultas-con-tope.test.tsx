/**
 * @jest-environment jsdom
 */

/**
 * T-31: `tickets/page.tsx` traía toda la historia sin tope (`order()` sin
 * `range`) y calculaba los 4 contadores filtrando ese array completo en
 * el cliente. Ahora pagina con `.range()` + filtro por estado, y los
 * contadores salen de 4 `count: 'exact', head: true` independientes de la
 * página actual.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

let filasTickets: unknown[] = [];
let totalTickets = 0;
const conteosPorEstado: Record<string, number> = { open: 0, in_progress: 0, waiting_client: 0, closed: 0 };
let ultimoRange: { from: number; to: number } | null = null;
let ultimoEqStatus: string | undefined;

jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: {
    from: () => {
      let esConteo = false;
      let estadoFiltrado: string | undefined;
      const builder = {
        select: (_cols: string, opts?: { count?: string; head?: boolean }) => {
          esConteo = Boolean(opts?.head);
          return builder;
        },
        order: () => builder,
        range: (from: number, to: number) => {
          ultimoRange = { from, to };
          return builder;
        },
        eq: (_campo: string, valor: string) => {
          estadoFiltrado = valor;
          if (!esConteo) ultimoEqStatus = valor;
          return builder;
        },
        then: (resolve: (v: { data: unknown[] | null; error: null; count: number }) => void) => {
          if (esConteo) {
            resolve({ data: null, error: null, count: estadoFiltrado ? conteosPorEstado[estadoFiltrado] ?? 0 : 0 });
          } else {
            resolve({ data: filasTickets, error: null, count: totalTickets });
          }
        },
      };
      return builder;
    },
  },
}));

jest.mock('@/lib/admin/auth', () => ({
  getAdminRole: async () => 'owner',
}));

import AdminTicketsPage from '@/app/admin/(dashboard)/tickets/page';

function searchParams(params: Record<string, string> = {}) {
  return Promise.resolve(params);
}

beforeEach(() => {
  filasTickets = [];
  totalTickets = 0;
  conteosPorEstado.open = 0;
  conteosPorEstado.in_progress = 0;
  conteosPorEstado.waiting_client = 0;
  conteosPorEstado.closed = 0;
  ultimoRange = null;
  ultimoEqStatus = undefined;
});

describe('AdminTicketsPage — consultas con tope (T-31)', () => {
  it('la lista pide un rango acotado (range), no toda la historia', async () => {
    filasTickets = [{ id: 't1', title: 'Ticket 1', status: 'open', priority: 'low', updated_at: '2026-11-17T00:00:00Z' }];
    totalTickets = 1;

    await AdminTicketsPage({ searchParams: searchParams() });

    expect(ultimoRange).not.toBeNull();
    expect(ultimoRange).toEqual({ from: 0, to: 19 }); // DEFAULT_PAGE_SIZE = 20
  });

  it('el filtro por estado llega como eq() a la consulta de la lista', async () => {
    filasTickets = [];
    totalTickets = 0;

    await AdminTicketsPage({ searchParams: searchParams({ status: 'closed' }) });

    expect(ultimoEqStatus).toBe('closed');
  });

  it('los 4 contadores de cabecera son conteos reales (count: exact, head: true), no el array de la página actual', async () => {
    // Página actual trae 1 ticket, pero el total de "closed" es 50 — si los
    // contadores vinieran del array paginado, mostrarían 1, no 50.
    filasTickets = [{ id: 't1', title: 'Ticket 1', status: 'closed', priority: 'low', updated_at: '2026-11-17T00:00:00Z' }];
    totalTickets = 50;
    conteosPorEstado.closed = 50;
    conteosPorEstado.open = 3;

    render(await AdminTicketsPage({ searchParams: searchParams({ status: 'closed' }) }));

    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('hay un formulario para filtrar por estado y controles de paginación cuando hay resultados', async () => {
    filasTickets = [{ id: 't1', title: 'Ticket 1', status: 'open', priority: 'low', updated_at: '2026-11-17T00:00:00Z' }];
    totalTickets = 25;

    render(await AdminTicketsPage({ searchParams: searchParams() }));

    expect(screen.getByLabelText('Filtrar por estado')).toBeInTheDocument();
    expect(screen.getAllByText(/Mostrando/).length).toBeGreaterThan(0);
  });
});
