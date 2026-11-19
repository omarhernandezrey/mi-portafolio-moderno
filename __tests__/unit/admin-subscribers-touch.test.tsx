/**
 * @jest-environment jsdom
 */

/**
 * T-29: el botón de borrar en la tarjeta móvil de un suscriptor era
 * `h-9 w-9` (36px) — por debajo del objetivo táctil de 44px.
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

describe('SubscribersPage — borrar a 44px en la tarjeta móvil (T-29)', () => {
  it('el botón de borrar lleva h-11 w-11', async () => {
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
      ],
      counts: { total: 1, confirmed: 1, pending: 0, unsubscribed: 0 },
    });

    render(<SubscribersPage />);

    const boton = await screen.findByRole('button', { name: 'Eliminar ada@example.com' });
    expect(boton.className).toContain('h-11');
    expect(boton.className).toContain('w-11');
  });
});
