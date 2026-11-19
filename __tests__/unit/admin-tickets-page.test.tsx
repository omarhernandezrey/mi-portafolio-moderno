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

jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: {
    from: () => {
      const builder = {
        select: () => builder,
        order: () => builder,
        then: (resolve: (v: { data: unknown[] | null; error: { message: string } | null }) => void) =>
          resolve({ data: errorTickets ? null : [], error: errorTickets }),
      };
      return builder;
    },
  },
}));

jest.mock('@/lib/admin/auth', () => ({
  getAdminRole: async () => 'owner',
}));

import AdminTicketsPage from '@/app/admin/(dashboard)/tickets/page';

describe('AdminTicketsPage — estado de error (T-28)', () => {
  beforeEach(() => {
    errorTickets = null;
  });

  it('si Supabase falla, muestra un error con Reintentar, no contadores en cero ni "No hay tickets activos"', async () => {
    errorTickets = { message: 'tabla caída' };

    const jsx = await AdminTicketsPage();
    render(jsx);

    expect(screen.queryByText('No hay tickets activos')).not.toBeInTheDocument();
    expect(screen.queryByText('Abiertos')).not.toBeInTheDocument();
    expect(screen.getByText('No se pudo cargar esta información')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('sin tickets de verdad (sin error): sigue mostrando "No hay tickets activos" y los contadores en cero', async () => {
    const jsx = await AdminTicketsPage();
    render(jsx);

    expect(screen.getAllByText('No hay tickets activos').length).toBeGreaterThan(0);
    expect(screen.getByText('Abiertos')).toBeInTheDocument();
    expect(screen.queryByText('No se pudo cargar esta información')).not.toBeInTheDocument();
  });
});
