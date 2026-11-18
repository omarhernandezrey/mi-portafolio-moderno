/**
 * T-31: `GET /api/admin/subscribers` traía toda la historia sin tope.
 * Ahora la lista queda acotada (`limit`) y devuelve además 4 conteos
 * reales (`count: 'exact', head: true`), independientes del tope de la
 * lista.
 */
jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: { from: jest.fn() },
}));

const mockRequireAdmin = jest.fn();
jest.mock('@/lib/admin/auth', () => ({
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
}));

import { supabaseServer } from '@/lib/supabaseServer';
import { GET } from '@/app/api/admin/subscribers/route';

const mockFrom = supabaseServer.from as jest.Mock;

beforeEach(() => {
  mockFrom.mockReset();
  mockRequireAdmin.mockResolvedValue({
    ok: true,
    user: { id: 'u1' },
    role: 'owner',
    email: 'owner@test.com',
    actor: { userId: 'u1', email: 'owner@test.com', role: 'owner' },
  });
});

describe('GET /api/admin/subscribers (T-31)', () => {
  it('pide un límite en la lista y 4 conteos reales con head: true', async () => {
    let limiteUsado: number | null = null;
    const llamadasConHead: boolean[] = [];

    mockFrom.mockImplementation(() => {
      let esConteo = false;
      const builder = {
        select: (_cols: string, opts?: { count?: string; head?: boolean }) => {
          esConteo = Boolean(opts?.head);
          llamadasConHead.push(esConteo);
          return builder;
        },
        order: () => builder,
        limit: (n: number) => {
          limiteUsado = n;
          return builder;
        },
        eq: () => builder,
        is: () => builder,
        not: () => builder,
        then: (resolve: (v: { data: unknown[] | null; error: null; count: number }) => void) => {
          resolve(esConteo ? { data: null, error: null, count: 7 } : { data: [{ id: 's1' }], error: null, count: 0 });
        },
      };
      return builder;
    });

    const res = await GET();
    const body = await res.json();

    expect(limiteUsado).toBe(500);
    // 1 consulta de lista (sin head) + 4 de conteo (con head) = 5 llamadas a .select()
    expect(llamadasConHead.filter((h) => h === true).length).toBe(4);
    expect(llamadasConHead.filter((h) => h === false).length).toBe(1);

    expect(body.data).toEqual([{ id: 's1' }]);
    expect(body.counts).toEqual({ total: 7, confirmed: 7, pending: 7, unsubscribed: 7 });
  });

  it('sin sesión: 401, sin tocar la base', async () => {
    mockRequireAdmin.mockResolvedValue({ ok: false, response: new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 }) });
    const res = await GET();
    expect(res.status).toBe(401);
    expect(mockFrom).not.toHaveBeenCalled();
  });
});
