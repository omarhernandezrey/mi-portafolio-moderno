/**
 * @jest-environment jsdom
 */

/**
 * T-31: `negocio/page.tsx` hacía ~20 viajes a Supabase — un `count` por
 * cada una de las 6 etapas del pipeline y por cada uno de los 7 días de
 * actividad, más 7 consultas más. Ahora trae leads y tickets una sola vez
 * cada uno (+1 de invoices si hay permiso de ver ingresos) y agrega todo
 * en JS.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

const llamadasPorTabla: Record<string, number> = {};

function lead(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'lead-1',
    name: 'Ada',
    email: 'ada@example.com',
    service_requested: 'Landing',
    status: 'new',
    created_at: '2026-11-17T00:00:00.000Z',
    paid_at: null,
    ...overrides,
  };
}

let leadsData: unknown[] = [];
let ticketsData: unknown[] = [];
let invoicesData: unknown[] = [];

jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: {
    from: (tabla: string) => {
      llamadasPorTabla[tabla] = (llamadasPorTabla[tabla] ?? 0) + 1;
      const builder = {
        select: () => builder,
        order: () => builder,
        neq: () => builder,
        eq: () => builder,
        gte: () => builder,
        lt: () => builder,
        then: (resolve: (v: { data: unknown[]; error: null }) => void) => {
          const data = tabla === 'leads' ? leadsData : tabla === 'tickets' ? ticketsData : invoicesData;
          resolve({ data, error: null });
        },
      };
      return builder;
    },
  },
}));

jest.mock('@/lib/admin/auth', () => ({
  getAdminRole: async () => 'owner',
}));

import NegocioDashboardPage from '@/app/admin/(dashboard)/negocio/page';

beforeEach(() => {
  for (const k of Object.keys(llamadasPorTabla)) delete llamadasPorTabla[k];
  leadsData = [];
  ticketsData = [];
  invoicesData = [];
});

describe('NegocioDashboardPage — consultas con tope (T-31)', () => {
  it('trae leads y tickets con una sola consulta cada uno (no 20)', async () => {
    leadsData = [
      lead({ id: '1', status: 'new', created_at: '2026-11-17T00:00:00.000Z' }),
      lead({ id: '2', status: 'paid', created_at: '2026-11-10T00:00:00.000Z', paid_at: '2026-11-17T00:00:00.000Z' }),
      lead({ id: '3', status: 'lost', created_at: '2025-10-01T00:00:00.000Z' }), // mes anterior lejano
    ];
    ticketsData = [
      { id: 't1', title: 'Ticket urgente', status: 'open', priority: 'urgent', created_at: '2026-11-17T00:00:00.000Z' },
      { id: 't2', title: 'Ticket normal', status: 'open', priority: 'low', created_at: '2026-11-16T00:00:00.000Z' },
    ];

    const jsx = await NegocioDashboardPage();
    render(jsx);

    // 1 consulta a leads, 1 a tickets, 1 a invoices (role owner) = 3 totales.
    expect(llamadasPorTabla.leads).toBe(1);
    expect(llamadasPorTabla.tickets).toBe(1);
    expect(llamadasPorTabla.invoices).toBe(1);

    // Los conteos agregados en JS llegan correctos a la vista.
    expect(screen.getByText('1 urgentes')).toBeInTheDocument();
    expect(screen.getByText('Ticket urgente')).toBeInTheDocument();
  });

  it('sin leads ni tickets: no revienta y cuenta todo en cero', async () => {
    const jsx = await NegocioDashboardPage();
    render(jsx);
    expect(llamadasPorTabla.leads).toBe(1);
    expect(llamadasPorTabla.tickets).toBe(1);
  });
});
