/**
 * @jest-environment jsdom
 */

/**
 * T-30: el menú «más acciones» de un suscriptor no tenía Escape, clic fuera
 * ni foco, y el borrado usaba `window.confirm` nativo. Cubre las tres
 * piezas de accesibilidad y el `ConfirmDialog` nuevo.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const mockAdminFetch = jest.fn();
jest.mock('@/lib/admin/client-fetch', () => {
  const actual = jest.requireActual('@/lib/admin/client-fetch');
  return { ...actual, adminFetch: (...args: unknown[]) => mockAdminFetch(...args) };
});

import SubscribersPage from '@/app/admin/(dashboard)/subscribers/page';

function subscriber(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'sub-1',
    email: 'ada@example.com',
    source: 'newsletter',
    consent_at: '2026-11-17T00:00:00Z',
    followup_sent_at: null,
    created_at: '2026-11-17T00:00:00Z',
    confirmed: true,
    confirmation_token: null,
    unsubscribed_at: null,
    ...overrides,
  };
}

beforeEach(() => {
  mockAdminFetch.mockReset();
});

describe('SubscribersPage — menú accesible y borrado con ConfirmDialog (T-30)', () => {
  it('Escape cierra el menú y devuelve el foco al botón que lo abrió', async () => {
    mockAdminFetch.mockResolvedValueOnce({ data: [subscriber()], counts: { total: 1, confirmed: 1, pending: 0, unsubscribed: 0 } });
    render(<SubscribersPage />);

    const disparador = await screen.findByRole('button', { name: 'Más acciones para ada@example.com' });
    fireEvent.click(disparador);
    const menu = await screen.findByRole('menu', { name: 'Acciones para ada@example.com' });

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(menu).not.toBeInTheDocument());
    expect(disparador).toHaveFocus();
  });

  it('un clic fuera del menú lo cierra', async () => {
    mockAdminFetch.mockResolvedValueOnce({ data: [subscriber()], counts: { total: 1, confirmed: 1, pending: 0, unsubscribed: 0 } });
    render(<SubscribersPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Más acciones para ada@example.com' }));
    const menu = await screen.findByRole('menu', { name: 'Acciones para ada@example.com' });

    fireEvent.mouseDown(document.body);
    await waitFor(() => expect(menu).not.toBeInTheDocument());
  });

  it('borrar desde el menú abre el ConfirmDialog; confirmar manda el DELETE', async () => {
    mockAdminFetch.mockResolvedValueOnce({ data: [subscriber()], counts: { total: 1, confirmed: 1, pending: 0, unsubscribed: 0 } });
    render(<SubscribersPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Más acciones para ada@example.com' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Eliminar suscriptor/ }));

    const dialogo = await screen.findByRole('dialog', { name: 'Eliminar suscriptor' });
    expect(mockAdminFetch).toHaveBeenCalledTimes(1); // solo la carga inicial

    mockAdminFetch.mockResolvedValueOnce(undefined);
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() =>
      expect(mockAdminFetch).toHaveBeenCalledWith('/api/admin/subscribers/sub-1', { method: 'DELETE' }),
    );
    await waitFor(() => expect(dialogo).not.toBeInTheDocument());
  });
});
