/**
 * @jest-environment jsdom
 */

/**
 * T-28: un fallo real de Supabase al listar facturas hoy se pinta igual que
 * "Sin facturas" (totales en $0.00) — un dato falso.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

let errorInvoices: { message: string } | null = null;

jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: {
    from: () => {
      const builder = {
        select: () => builder,
        order: () => builder,
        then: (resolve: (v: { data: unknown[] | null; error: { message: string } | null }) => void) =>
          resolve({ data: errorInvoices ? null : [], error: errorInvoices }),
      };
      return builder;
    },
  },
}));

import AdminInvoicesPage from '@/app/admin/(dashboard)/invoices/page';

describe('AdminInvoicesPage — estado de error (T-28)', () => {
  beforeEach(() => {
    errorInvoices = null;
  });

  it('si Supabase falla, muestra un error con Reintentar, no "Sin facturas" con totales en cero', async () => {
    errorInvoices = { message: 'tabla caída' };

    const jsx = await AdminInvoicesPage();
    render(jsx);

    expect(screen.queryByText('Sin facturas')).not.toBeInTheDocument();
    expect(screen.queryByText('Total facturado')).not.toBeInTheDocument();
    expect(screen.getByText('No se pudo cargar esta información')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('sin facturas de verdad (sin error): sigue mostrando "Sin facturas" y los totales en cero', async () => {
    const jsx = await AdminInvoicesPage();
    render(jsx);

    expect(screen.getAllByText('Sin facturas').length).toBeGreaterThan(0);
    expect(screen.getByText('Total facturado')).toBeInTheDocument();
    expect(screen.queryByText('No se pudo cargar esta información')).not.toBeInTheDocument();
  });
});
