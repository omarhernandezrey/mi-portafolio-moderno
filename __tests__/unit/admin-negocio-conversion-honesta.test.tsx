/**
 * @jest-environment jsdom
 */

/**
 * T-32: la tarjeta "Ventas cerradas" encendía su flecha hacia arriba con un
 * umbral fijo e inventado (`conversionRate >= 20`), sin relación con ningún
 * dato real. Ahora compara la conversión del mes contra la del mes
 * anterior — igual que ya hacían `leadsDelta`/`revenueDelta` — y dice "Sin
 * base" cuando no hay mes anterior con el que comparar.
 *
 * T-31 cambió `negocio/page.tsx` para traer leads y tickets con una sola
 * consulta cada uno (sin `count` por filtro) y agregar todo en JS — el
 * mock aquí da filas reales, no conteos.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

function lead(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'lead-1',
    name: 'Ada',
    email: 'ada@example.com',
    service_requested: 'Landing',
    status: 'new',
    created_at: '2026-11-05T00:00:00.000Z',
    paid_at: null,
    ...overrides,
  };
}

function leadsDelMes(mes: 'nov' | 'oct', total: number, pagadosEnElMes: number) {
  const dia = mes === 'nov' ? '2026-11-05' : '2026-10-05';
  return Array.from({ length: total }, (_, i) => {
    const pagado = i < pagadosEnElMes;
    return lead({
      id: `${mes}-${i}`,
      status: pagado ? 'paid' : 'new',
      created_at: `${dia}T00:00:00.000Z`,
      paid_at: pagado ? `${dia}T00:00:00.000Z` : null,
    });
  });
}

let leadsData: unknown[] = [];

jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: {
    from: (tabla: string) => {
      const builder = {
        select: () => builder,
        order: () => builder,
        neq: () => builder,
        eq: () => builder,
        gte: () => builder,
        lt: () => builder,
        then: (resolve: (v: { data: unknown[]; error: null }) => void) => {
          resolve({ data: tabla === 'leads' ? leadsData : [], error: null });
        },
      };
      return builder;
    },
  },
}));

jest.mock('@/lib/admin/auth', () => ({
  getAdminRole: async () => 'assistant', // sin ver ingresos -> aparece la tarjeta "Ventas cerradas"
}));

jest.mock('@/lib/admin/permissions', () => ({
  canAccessAdminPath: () => true,
}));

import NegocioDashboardPage from '@/app/admin/(dashboard)/negocio/page';

beforeEach(() => {
  leadsData = [];
});

describe('negocio/page.tsx — conversión sin umbral inventado (T-32)', () => {
  it('con mes anterior: compara contra la conversión real del mes anterior, no un 20% fijo', async () => {
    // Este mes: 10 leads, 5 pagados -> 50% de conversión.
    // Mes anterior: 10 leads, 1 pagado -> 10% de conversión.
    // 50% vs 10% es una mejora real, aunque 50% > 20% no es lo que decide nada.
    leadsData = [...leadsDelMes('nov', 10, 5), ...leadsDelMes('oct', 10, 1)];

    const jsx = await NegocioDashboardPage();
    render(jsx);

    const tarjeta = screen.getAllByText('Ventas cerradas').map((el) => el.closest('article')).find(Boolean) as HTMLElement;
    expect(tarjeta.textContent).toContain('+400%');
    const chip = tarjeta.querySelector('span[title]') as HTMLElement;
    expect(chip.getAttribute('title')).toContain('vs mes anterior');
    expect(tarjeta.textContent).not.toMatch(/\b20%\b(?!\d)/); // el umbral inventado ya no existe
  });

  it('sin leads pagados el mes anterior: dice "Sin base", no un cero/100% falso', async () => {
    leadsData = [...leadsDelMes('nov', 4, 2)]; // sin ningún lead en octubre: sin base de comparación

    const jsx = await NegocioDashboardPage();
    render(jsx);

    const tarjeta = screen.getAllByText('Ventas cerradas').map((el) => el.closest('article')).find(Boolean) as HTMLElement;
    const chip = tarjeta.querySelector('span[title]') as HTMLElement;
    expect(chip.getAttribute('title')).toBe('Sin base del mes anterior');
  });
});
