/**
 * @jest-environment jsdom
 */

/**
 * T-28: un fallo real de Supabase al listar publicaciones del feed hoy se
 * pinta igual que "Sin publicaciones" — un dato falso.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

let errorFeed: { message: string } | null = null;

jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: {
    from: () => {
      const builder = {
        select: () => builder,
        order: () => builder,
        range: () => builder,
        eq: () => builder,
        then: (resolve: (v: { data: unknown[] | null; error: { message: string } | null; count: number | null }) => void) =>
          resolve({ data: errorFeed ? null : [], error: errorFeed, count: errorFeed ? null : 0 }),
      };
      return builder;
    },
  },
}));

jest.mock('@/lib/admin/auth', () => ({
  getAdminRole: async () => 'owner',
}));

import AdminFeedPage from '@/app/admin/(dashboard)/feed/page';

function searchParams(params: Record<string, string> = {}) {
  return Promise.resolve(params);
}

describe('AdminFeedPage — estado de error (T-28)', () => {
  beforeEach(() => {
    errorFeed = null;
  });

  it('si Supabase falla, muestra un error con Reintentar, no "Sin publicaciones"', async () => {
    errorFeed = { message: 'tabla caída' };

    const jsx = await AdminFeedPage({ searchParams: searchParams() });
    render(jsx);

    expect(screen.queryByText('Sin publicaciones')).not.toBeInTheDocument();
    expect(screen.getByText('No se pudo cargar esta información')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });

  it('sin publicaciones de verdad (sin error): sigue mostrando "Sin publicaciones"', async () => {
    const jsx = await AdminFeedPage({ searchParams: searchParams() });
    render(jsx);

    expect(screen.getByText('Sin publicaciones')).toBeInTheDocument();
    expect(screen.queryByText('No se pudo cargar esta información')).not.toBeInTheDocument();
  });
});
