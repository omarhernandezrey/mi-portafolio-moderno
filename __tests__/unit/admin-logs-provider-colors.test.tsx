/**
 * @jest-environment jsdom
 */

/**
 * T-30: la paleta por proveedor (`groq`, `openrouter`...) venía de 8 colores
 * crudos de Tailwind elegidos a mano. Ahora usa `assignSeriesColors` de
 * `charts/palette.ts`, aplicado como estilo en línea (igual que las
 * gráficas SVG) en vez de clases `bg-orange-500` etc.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

const mockAdminFetch = jest.fn();
jest.mock('@/lib/admin/client-fetch', () => {
  const actual = jest.requireActual('@/lib/admin/client-fetch');
  return { ...actual, adminFetch: (...args: unknown[]) => mockAdminFetch(...args) };
});

import AdminApiLogsPage from '@/app/admin/(dashboard)/logs/page';

function log(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'log-1',
    created_at: '2026-11-17T00:00:00Z',
    provider: 'groq',
    latency_ms: 200,
    status: 'ok',
    error_message: null,
    http_status: 200,
    session_id: 'sess-1',
    ...overrides,
  };
}

beforeEach(() => {
  mockAdminFetch.mockReset();
});

describe('ApiLogsPage — colores por proveedor desde la paleta (T-30)', () => {
  it('la insignia del proveedor no usa clases crudas de Tailwind, lleva color vía estilo', async () => {
    mockAdminFetch.mockResolvedValueOnce([log()]);
    render(<AdminApiLogsPage />);

    const insignias = await screen.findAllByText('groq');
    // Al menos una insignia (tarjeta de "Uso por proveedor" o fila/tarjeta del log)
    // debe llevar el color por estilo en línea, no por clase bg-orange-500.
    const conEstilo = insignias.filter((el) => el.closest('[style]'));
    expect(conEstilo.length).toBeGreaterThan(0);

    for (const el of insignias) {
      expect(el.className).not.toMatch(/bg-orange-500|text-orange-400|border-orange-500/);
    }
  });
});
