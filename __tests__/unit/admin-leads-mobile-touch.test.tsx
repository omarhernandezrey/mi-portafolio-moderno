/**
 * @jest-environment jsdom
 */

/**
 * T-29: «Ver perfil» en la tarjeta móvil de un lead quedaba en ~28px real
 * (px-3 py-1.5, sin alto mínimo) — por debajo del objetivo táctil de 44px.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ToastProvider } from '@/components/ui/Toast';

jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: {
    from: () => {
      const builder = {
        select: () => builder,
        order: () => builder,
        range: () => builder,
        or: () => builder,
        eq: () => builder,
        then: (resolve: (v: { data: unknown[]; error: null; count: number }) => void) =>
          resolve({
            data: [
              {
                id: 'lead-1',
                name: 'Ada',
                email: 'ada@example.com',
                phone: null,
                company: null,
                type: 'client',
                service_requested: null,
                budget: null,
                timeline: null,
                status: 'new',
                created_at: '2026-11-17T00:00:00Z',
              },
            ],
            error: null,
            count: 1,
          }),
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

describe('AdminLeadsPage — «Ver perfil» a 44px en la tarjeta móvil (T-29)', () => {
  it('el enlace lleva min-h-11', async () => {
    const jsx = await AdminLeadsPage({ searchParams: searchParams() });
    render(<ToastProvider>{jsx}</ToastProvider>);

    const enlaces = screen.getAllByRole('link', { name: /Ver perfil/ });
    expect(enlaces.length).toBeGreaterThan(0);
    for (const enlace of enlaces) {
      expect(enlace.className).toContain('min-h-11');
    }
  });
});
