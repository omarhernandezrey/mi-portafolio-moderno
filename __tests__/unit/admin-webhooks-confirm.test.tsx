/**
 * @jest-environment jsdom
 */

/**
 * T-30: `window.confirm` nativo → `ConfirmDialog` del sistema al borrar un
 * webhook.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const mockAdminFetch = jest.fn();
jest.mock('@/lib/admin/client-fetch', () => {
  const actual = jest.requireActual('@/lib/admin/client-fetch');
  return { ...actual, adminFetch: (...args: unknown[]) => mockAdminFetch(...args) };
});

import AdminWebhooksPage from '@/app/admin/(dashboard)/webhooks/page';

function webhook(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'wh-1',
    url: 'https://example.com/hook',
    events: ['lead.created'],
    secret: 'shh',
    active: true,
    created_at: '2026-11-17T00:00:00Z',
    updated_at: '2026-11-17T00:00:00Z',
    ...overrides,
  };
}

beforeEach(() => {
  mockAdminFetch.mockReset();
});

describe('AdminWebhooksPage — borrar con ConfirmDialog (T-30)', () => {
  it('clic en «Eliminar webhook» abre el diálogo con el host; confirmar manda el DELETE', async () => {
    mockAdminFetch.mockResolvedValueOnce([webhook()]).mockResolvedValueOnce([]);
    render(<AdminWebhooksPage />);

    await screen.findByText('https://example.com/hook');
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar webhook' }));
    expect(mockAdminFetch).toHaveBeenCalledTimes(2); // solo la carga inicial, aún no el DELETE

    const dialogo = await screen.findByRole('dialog', { name: 'Eliminar webhook' });
    expect(dialogo.textContent).toContain('example.com');

    mockAdminFetch.mockResolvedValueOnce(undefined);
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() =>
      expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/webhooks/wh-1', { method: 'DELETE' }),
    );
  });
});
