/**
 * @jest-environment jsdom
 */

/**
 * T-31: los 4 contadores de SubscribersPage ahora vienen del `counts` que
 * manda el API (`count: 'exact', head: true`), no de contar el array
 * cargado — que puede venir acotado a 500 filas.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

const mockAdminFetch = jest.fn();
jest.mock('@/lib/admin/client-fetch', () => {
  const actual = jest.requireActual('@/lib/admin/client-fetch');
  return { ...actual, adminFetch: (...args: unknown[]) => mockAdminFetch(...args) };
});

import SubscribersPage from '@/app/admin/(dashboard)/subscribers/page';

describe('SubscribersPage — conteos reales, no del array cargado (T-31)', () => {
  it('muestra el total del servidor aunque la lista cargada tenga menos filas', async () => {
    mockAdminFetch.mockResolvedValueOnce({
      data: [
        {
          id: 'sub-1',
          email: 'ada@example.com',
          source: 'newsletter',
          consent_at: '2026-11-17T00:00:00Z',
          followup_sent_at: null,
          created_at: '2026-11-17T00:00:00Z',
          confirmed: true,
          confirmation_token: null,
          unsubscribed_at: null,
        },
      ], // solo 1 fila cargada
      counts: { total: 842, confirmed: 800, pending: 40, unsubscribed: 2 }, // pero el total real es 842
    });

    render(<SubscribersPage />);

    expect(await screen.findByText('842')).toBeInTheDocument();
    expect(screen.getByText('800')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
