/**
 * @jest-environment jsdom
 */

/**
 * T-28: un fallo real de Supabase al listar tickets hoy se pinta igual que
 * "No hay tickets activos" (0 en los 4 contadores) — un dato falso.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

let errorTickets: { message: string } | null = null;

// T-31 paginó esta página y le añadió 4 conteos reales (`count: 'exact',
// head: true`) independientes de la lista — el mock distingue esa consulta
// de conteo (sin filas) de la lista paginada, y solo la lista puede fallar.
jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: {
    from: () => {
      let esConteo = false;
      const builder = {
        select: (_cols: string, opts?: { count?: string; head?: boolean }) => {
          esConteo = Boolean(opts?.head);
          return builder;
        },
        order: () => builder,
        range: () => builder,
        eq: () => builder,
        then: (resolve: (v: { data: unknown[] | null; error: { message: string } | null; count: number | null }) => void) => {
          if (esConteo) {
            resolve({ data: null, error: null, count: 0 });
          } else {
            resolve({ data: errorTickets ? null : [], error: errorTickets, count: errorTickets ? null : 0 });
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

describe('AdminTicketsPage — estado de error (T-28)', () => {
  beforeEach(() => {
    errorTickets = null;
  });

  it('si Supabase falla, muestra un error con Reintentar, no contadores en cero ni "No hay tickets activos"', async () => {
    errorTickets = { message: 'tabla caída' };

    const jsx = await AdminTicketsPage({ searchParams: searchParams() });
    render(jsx);

    expect(screen.queryByText('No hay tickets activos')).not.toBeInTheDocument();
    expect(screen.queryByText('Abiertos')).not.toBeInTheDocument();
    expect(screen.getByText('No se pudo cargar esta información')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('sin tickets de verdad (sin error): sigue mostrando "No hay tickets activos" y los contadores en cero', async () => {
    const jsx = await AdminTicketsPage({ searchParams: searchParams() });
    render(jsx);

    expect(screen.getAllByText('No hay tickets activos').length).toBeGreaterThan(0);
    expect(screen.getByText('Abiertos')).toBeInTheDocument();
    expect(screen.queryByText('No se pudo cargar esta información')).not.toBeInTheDocument();
  });
});
