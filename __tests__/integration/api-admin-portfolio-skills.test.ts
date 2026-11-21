/**
 * API de skills del portafolio (T-10, copia el patrón que T-09 estableció):
 * sin sesión → 401, `viewer` → 403 al escribir, cuerpo inválido → 400 con el
 * campo señalado, alta/edición/borrado/reorden correctos, cada escritura deja
 * auditoría e invalida la caché de `portfolio/repository.ts`.
 */
jest.mock('@/lib/supabaseServer', () => ({
  // `rpc` desde que reordenar es una transacción en Postgres
  // (`public.reordenar_portfolio`, migración 20261121).
  supabaseServer: { from: jest.fn(), rpc: jest.fn() },
}));

const mockRequireAdmin = jest.fn();
jest.mock('@/lib/admin/auth', () => ({
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
}));

jest.mock('@/lib/admin/audit', () => ({
  writeAuditLog: jest.fn().mockResolvedValue(undefined),
}));

const mockRevalidateTag = jest.fn();
jest.mock('next/cache', () => ({
  revalidateTag: (...args: unknown[]) => mockRevalidateTag(...args),
}));

import { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { writeAuditLog } from '@/lib/admin/audit';
import { GET as listar, POST as crear } from '@/app/api/admin/portfolio/skills/route';
import { PATCH as actualizar, DELETE as borrar } from '@/app/api/admin/portfolio/skills/[id]/route';
import { PATCH as reordenar } from '@/app/api/admin/portfolio/skills/reorder/route';

const mockWriteAuditLog = writeAuditLog as jest.Mock;

function auth(role: 'owner' | 'assistant' | 'viewer' | null) {
  if (role === null) {
    mockRequireAdmin.mockResolvedValue({
      ok: false,
      response: new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 }),
    });
    return;
  }
  mockRequireAdmin.mockResolvedValue({
    ok: true,
    user: { id: 'u1' },
    role,
    email: `${role}@test.com`,
    actor: { userId: 'u1', email: `${role}@test.com`, role },
  });
}

function authInsuficiente() {
  mockRequireAdmin.mockResolvedValue({
    ok: false,
    response: Response.json({ error: 'Permisos insuficientes' }, { status: 403 }),
  });
}

function tabla(porTabla: Record<string, unknown> | ((tabla: string) => unknown)) {
  (supabaseServer.from as jest.Mock).mockImplementation((nombreTabla: string) => {
    const encadenable: Record<string, unknown> = {};
    const self = () => encadenable;
    for (const m of ['select', 'eq', 'order', 'insert', 'update', 'delete']) {
      encadenable[m] = jest.fn(self);
    }
    const resolver = () => (typeof porTabla === 'function' ? porTabla(nombreTabla) : (porTabla[nombreTabla] ?? { data: [], error: null }));
    encadenable.single = jest.fn(() => Promise.resolve(resolver()));
    encadenable.maybeSingle = jest.fn(() => Promise.resolve(resolver()));
    encadenable.then = (resolve: (v: unknown) => unknown) => Promise.resolve(resolver()).then(resolve);
    return encadenable;
  });
}

function req(url: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  return new NextRequest(`http://localhost${url}`, init);
}

const SKILL = {
  id: 's1',
  slug: 'react',
  name: { es: 'React' },
  percentage: 90,
  color_hex: '',
  icon: '',
  is_published: true,
  position: 0,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('autenticación y permisos', () => {
  it('GET sin sesión → 401', async () => {
    auth(null);
    const res = await listar();
    expect(res.status).toBe(401);
  });

  it('POST con rol insuficiente → 403', async () => {
    authInsuficiente();
    const res = await crear(req('/x', { method: 'POST', body: '{}' }));
    expect(res.status).toBe(403);
  });

  it('PATCH /[id] con rol insuficiente → 403', async () => {
    authInsuficiente();
    const res = await actualizar(req('/x', { method: 'PATCH', body: '{}' }), { params: Promise.resolve({ id: 's1' }) });
    expect(res.status).toBe(403);
  });

  it('DELETE con rol insuficiente → 403', async () => {
    authInsuficiente();
    const res = await borrar(req('/x', { method: 'DELETE' }), { params: Promise.resolve({ id: 's1' }) });
    expect(res.status).toBe(403);
  });

  it('PATCH /reorder con rol insuficiente → 403', async () => {
    authInsuficiente();
    const res = await reordenar(req('/x', { method: 'PATCH', body: '{}' }));
    expect(res.status).toBe(403);
  });

  it('GET con cualquier rol admin (viewer) → 200', async () => {
    auth('viewer');
    tabla({ portfolio_skills: { data: [SKILL], error: null } });
    const res = await listar();
    expect(res.status).toBe(200);
  });
});

describe('POST — crear', () => {
  beforeEach(() => auth('owner'));

  it('cuerpo inválido → 400 con el campo señalado', async () => {
    tabla({});
    const res = await crear(req('/x', { method: 'POST', body: JSON.stringify({ slug: 'react' }) }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.percentage).toBeDefined();
  });

  it('alta correcta: inserta, audita e invalida la caché', async () => {
    tabla((t) => (t === 'portfolio_skills' ? { data: { ...SKILL }, error: null, count: 8 } : { data: [], error: null }));

    const res = await crear(req('/x', { method: 'POST', body: JSON.stringify({ slug: 'react', name: { es: 'React' }, percentage: 90 }) }));

    expect(res.status).toBe(201);
    expect(mockWriteAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'owner@test.com' }),
      expect.objectContaining({ action: 'portfolio_skill.create', resourceType: 'portfolio_skill' }),
    );
    expect(mockRevalidateTag).toHaveBeenCalledWith('portfolio:skills');
  });

  it('un slug duplicado (23505) → 400, no 500', async () => {
    tabla(() => ({ data: null, error: { code: '23505', message: 'duplicate key' } }));
    const res = await crear(req('/x', { method: 'POST', body: JSON.stringify({ slug: 'react', name: { es: 'React' }, percentage: 90 }) }));
    expect(res.status).toBe(400);
  });
});

describe('PATCH /[id] — actualizar', () => {
  beforeEach(() => auth('owner'));

  it('cuerpo vacío → 400 (nada que actualizar)', async () => {
    const res = await actualizar(req('/x', { method: 'PATCH', body: '{}' }), { params: Promise.resolve({ id: 's1' }) });
    expect(res.status).toBe(400);
  });

  it('actualiza, audita e invalida la caché', async () => {
    tabla({ portfolio_skills: { data: { ...SKILL, percentage: 95 }, error: null } });
    const res = await actualizar(req('/x', { method: 'PATCH', body: JSON.stringify({ percentage: 95 }) }), {
      params: Promise.resolve({ id: 's1' }),
    });
    expect(res.status).toBe(200);
    expect(mockWriteAuditLog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ action: 'portfolio_skill.update', resourceId: 's1' }),
    );
    expect(mockRevalidateTag).toHaveBeenCalledWith('portfolio:skills');
  });

  it('percentage fuera de rango → 400', async () => {
    const res = await actualizar(req('/x', { method: 'PATCH', body: JSON.stringify({ percentage: 200 }) }), {
      params: Promise.resolve({ id: 's1' }),
    });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /[id] — borrar', () => {
  it('borra, audita e invalida la caché', async () => {
    auth('owner');
    tabla({ portfolio_skills: { data: null, error: null } });
    const res = await borrar(req('/x', { method: 'DELETE' }), { params: Promise.resolve({ id: 's1' }) });
    expect(res.status).toBe(200);
    expect(mockWriteAuditLog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ action: 'portfolio_skill.delete', resourceId: 's1' }),
    );
    expect(mockRevalidateTag).toHaveBeenCalledWith('portfolio:skills');
  });
});

describe('PATCH /reorder', () => {
  beforeEach(() => auth('owner'));

  it('lista vacía → 400', async () => {
    const res = await reordenar(req('/x', { method: 'PATCH', body: JSON.stringify({ ids: [] }) }));
    expect(res.status).toBe(400);
  });

  /**
   * Reordenar dejó de ser N updates sueltos desde la auditoría de backend:
   * ahora es una sola transacción en `public.reordenar_portfolio`
   * (migración 20261121), que además rechaza listas incompletas. El
   * comportamiento de las posiciones se prueba contra PostgreSQL real en la
   * migración; aquí se comprueba que la ruta llama al RPC con SU tabla.
   */
  it('delega en la transacción de Postgres con su tabla y sus ids', async () => {
    (supabaseServer.rpc as jest.Mock).mockResolvedValue({ data: 3, error: null });

    const ids = [
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
      '33333333-3333-4333-8333-333333333333',
    ];
    const res = await reordenar(req('/x', { method: 'PATCH', body: JSON.stringify({ ids }) }));

    expect(res.status).toBe(200);
    expect(supabaseServer.rpc).toHaveBeenCalledWith('reordenar_portfolio', {
      p_tabla: 'portfolio_skills',
      p_ids: ids,
    });
  });

  it('una lista incompleta es culpa de la petición: 400, no 500', async () => {
    (supabaseServer.rpc as jest.Mock).mockResolvedValue({
      data: null,
      error: { code: '22023', message: 'La lista debe traer las 5 filas, llegaron 3' },
    });

    const ids = ['11111111-1111-4111-8111-111111111111'];
    const res = await reordenar(req('/x', { method: 'PATCH', body: JSON.stringify({ ids }) }));
    expect(res.status).toBe(400);
  });
});
