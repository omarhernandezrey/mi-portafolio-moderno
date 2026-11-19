/**
 * @jest-environment jsdom
 */

/**
 * T-32: la tarjeta "Ventas cerradas" encendía su flecha hacia arriba con un
 * umbral fijo e inventado (`conversionRate >= 20`), sin relación con ningún
 * dato real. Ahora compara la conversión del mes contra la del mes
 * anterior — igual que ya hacían `leadsDelta`/`revenueDelta` — y dice "Sin
 * base" cuando no hay mes anterior con el que comparar.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';

type Filtros = { gte?: string; lt?: string; eq?: [string, unknown] };
let resolverConteo: (tabla: string, filtros: Filtros) => number = () => 0;

function tablaConteoFalsa(tabla: string) {
  const filtros: Filtros = {};
  const builder = {
    select: () => builder,
    gte: (_c: string, v: string) => { filtros.gte = v; return builder; },
    lt: (_c: string, v: string) => { filtros.lt = v; return builder; },
    eq: (c: string, v: unknown) => { filtros.eq = [c, v]; return builder; },
    neq: () => builder,
    in: () => builder,
    order: () => builder,
    limit: () => builder,
    then: (resolve: (v: { count: number; data: unknown[]; error: null }) => void) => {
      resolve({ count: resolverConteo(tabla, filtros), data: [], error: null });
    },
  };
  return builder;
}

jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: { from: (tabla: string) => tablaConteoFalsa(tabla) },
}));

jest.mock('@/lib/admin/auth', () => ({
  getAdminRole: async () => 'assistant', // sin ver ingresos -> aparece la tarjeta "Ventas cerradas"
}));

jest.mock('@/lib/admin/permissions', () => ({
  canAccessAdminPath: () => true,
}));

import NegocioDashboardPage from '@/app/admin/(dashboard)/negocio/page';

beforeEach(() => {
  resolverConteo = () => 0;
});

describe('negocio/page.tsx — conversión sin umbral inventado (T-32)', () => {
  it('con mes anterior: compara contra la conversión real del mes anterior, no un 20% fijo', async () => {
    // Este mes: 10 leads, 5 pagados -> 50% de conversión.
    // Mes anterior: 10 leads, 1 pagado -> 10% de conversión.
    // 50% vs 10% es una mejora real, aunque 50% > 20% no es lo que decide nada.
    resolverConteo = (tabla, f) => {
      if (tabla !== 'leads') return 0;
      if (f.eq?.[0] === 'status' && f.eq?.[1] === 'paid' && f.gte && !f.lt) return 5; // monthPaid
      if (f.eq?.[0] === 'status' && f.eq?.[1] === 'paid' && f.gte && f.lt) return 1; // prevPaid
      if (f.gte && !f.lt && !f.eq) return 10; // monthLeads
      if (f.gte && f.lt && !f.eq) return 10; // prevLeads
      return 0;
    };

    const jsx = await NegocioDashboardPage();
    render(jsx);

    const tarjeta = screen.getAllByText('Ventas cerradas').map((el) => el.closest('article')).find(Boolean) as HTMLElement;
    expect(tarjeta.textContent).toContain('+400%');
    const chip = tarjeta.querySelector('span[title]') as HTMLElement;
    expect(chip.getAttribute('title')).toContain('vs mes anterior');
    expect(tarjeta.textContent).not.toMatch(/\b20%\b(?!\d)/); // el umbral inventado ya no existe
  });

  it('sin leads pagados el mes anterior: dice "Sin base", no un cero/100% falso', async () => {
    resolverConteo = (tabla, f) => {
      if (tabla !== 'leads') return 0;
      if (f.eq?.[0] === 'status' && f.eq?.[1] === 'paid' && f.gte && !f.lt) return 2; // monthPaid
      if (f.eq?.[0] === 'status' && f.eq?.[1] === 'paid') return 0; // prevPaid
      if (f.gte && !f.lt && !f.eq) return 4; // monthLeads
      if (f.gte && f.lt && !f.eq) return 0; // prevLeads: sin base
      return 0;
    };

    const jsx = await NegocioDashboardPage();
    render(jsx);

    const tarjeta = screen.getAllByText('Ventas cerradas').map((el) => el.closest('article')).find(Boolean) as HTMLElement;
    const chip = tarjeta.querySelector('span[title]') as HTMLElement;
    expect(chip.getAttribute('title')).toBe('Sin base del mes anterior');
  });
});
