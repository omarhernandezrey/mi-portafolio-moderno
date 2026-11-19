/**
 * @jest-environment jsdom
 */

/**
 * T-28: el buscador de auditoría mandaba una petición por tecla, con
 * respuestas que pueden llegar fuera de orden y pintar un resultado viejo
 * encima de uno más nuevo. Ahora espera ~300ms tras la última tecla
 * (debounce) y cancela la petición anterior con `AbortController`.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

const mockAdminFetch = jest.fn();
jest.mock('@/lib/admin/client-fetch', () => {
  const actual = jest.requireActual('@/lib/admin/client-fetch');
  return { ...actual, adminFetch: (...args: unknown[]) => mockAdminFetch(...args) };
});

import AdminAuditPage from '@/app/admin/(dashboard)/audit/page';

function esperar(ms: number) {
  return act(() => new Promise((resolve) => setTimeout(resolve, ms)));
}

beforeEach(() => {
  mockAdminFetch.mockReset();
  mockAdminFetch.mockResolvedValue([]);
});

describe('AdminAuditPage — buscador con debounce y AbortController (T-28)', () => {
  it('escribir varias teclas rápido solo consulta una vez, con el valor final', async () => {
    render(<AdminAuditPage />);
    await waitFor(() => expect(mockAdminFetch).toHaveBeenCalledTimes(1)); // carga inicial

    const input = screen.getByPlaceholderText('Filtrar por email del actor...');
    fireEvent.change(input, { target: { value: 'a' } });
    await esperar(50);
    fireEvent.change(input, { target: { value: 'ad' } });
    await esperar(50);
    fireEvent.change(input, { target: { value: 'ada' } });

    // Aún dentro de la ventana del debounce: ninguna consulta nueva todavía.
    await esperar(100);
    expect(mockAdminFetch).toHaveBeenCalledTimes(1);

    await waitFor(() => expect(mockAdminFetch).toHaveBeenCalledTimes(2), { timeout: 2000 });
    const ultimaUrl = mockAdminFetch.mock.calls[1][0] as string;
    expect(ultimaUrl).toContain('actor=ada');
  });

  it('cada consulta manda un AbortSignal, para cancelar la anterior si sigue en vuelo', async () => {
    render(<AdminAuditPage />);
    await waitFor(() => expect(mockAdminFetch).toHaveBeenCalledTimes(1));

    const [, init] = mockAdminFetch.mock.calls[0];
    expect((init as RequestInit).signal).toBeInstanceOf(AbortSignal);
  });

  it('el botón «Actualizar» sigue funcionando (no manda el evento de clic como señal)', async () => {
    render(<AdminAuditPage />);
    await waitFor(() => expect(mockAdminFetch).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    await waitFor(() => expect(mockAdminFetch).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
