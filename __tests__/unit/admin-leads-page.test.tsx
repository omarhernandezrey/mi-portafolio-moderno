/**
 * @jest-environment jsdom
 */

/**
 * T-28: un fallo real de Supabase al listar leads hoy se pinta igual que
 * "no se encontraron oportunidades con esos filtros" — un dato falso. Este
 * test cubre solo el comportamiento nuevo (ambas vistas, móvil y escritorio,
 * comparten el mismo `<table>`/lista en el DOM de jsdom sin media queries).
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ToastProvider } from '@/components/ui/Toast';

let errorLeads: { message: string } | null = null;
let filasLeads: unknown[] = [];

jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: {
    from: () => {
      const builder = {
        select: () => builder,
        order: () => builder,
        range: () => builder,
        or: () => builder,
        eq: () => builder,
        then: (resolve: (v: { data: unknown[] | null; error: { message: string } | null; count: number | null }) => void) =>
          resolve({ data: errorLeads ? null : filasLeads, error: errorLeads, count: errorLeads ? null : filasLeads.length }),
      };
      return builder;
    },
  },
}));

jest.mock('@/lib/admin/auth', () => ({
  getAdminRole: async () => 'owner',
}));

import AdminLeadsPage from '@/app/admin/(dashboard)/leads/page';

function searchParams(params: Record<string, string> = {}) {
  return Promise.resolve(params);
}

describe('AdminLeadsPage — estado de error (T-28)', () => {
  beforeEach(() => {
    errorLeads = null;
    filasLeads = [];
  });

  it('si Supabase falla, muestra un error con Reintentar, no "Sin resultados"', async () => {
    errorLeads = { message: 'tabla caída' };

    const jsx = await AdminLeadsPage({ searchParams: searchParams() });
    render(<ToastProvider>{jsx}</ToastProvider>);

    expect(screen.queryByText('Sin resultados')).not.toBeInTheDocument();
    expect(screen.getAllByText('No se pudo cargar esta información').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Reintentar' }).length).toBeGreaterThan(0);
  });

  it('sin leads de verdad (sin error): sigue mostrando "Sin resultados", no el error', async () => {
    const jsx = await AdminLeadsPage({ searchParams: searchParams() });
    render(<ToastProvider>{jsx}</ToastProvider>);

    expect(screen.getAllByText('Sin resultados').length).toBeGreaterThan(0);
    expect(screen.queryByText('No se pudo cargar esta información')).not.toBeInTheDocument();
  });
});
