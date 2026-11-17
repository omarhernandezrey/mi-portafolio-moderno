/**
 * API de historial y restauración (T-18). `content_versions` no tiene
 * política de `select` para `anon`/`authenticated` (verificado en la base
 * real: una fila insertada con `service_role` no aparece al leerla con la
 * clave `anon`, aunque sí con `service_role` — ver la ficha de T-18 en
 * PLAN_MAESTRO_DASHBOARD.md §6). Aquí se prueba la capa de aplicación:
 * listar exige `owner`, restaurar también, y restaurar es en sí mismo un
 * guardado más (queda su propia versión con `action: 'restore'`).
 */
jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: { from: jest.fn() },
}));

const mockRequireAdmin = jest.fn();
jest.mock('@/lib/admin/auth', () => ({
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
}));

const mockWriteContentVersion = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/admin/versions', () => {
  const real = jest.requireActual('@/lib/admin/versions');
  return { ...real, writeContentVersion: (...args: unknown[]) => mockWriteContentVersion(...args) };
});

const mockRevalidateTag = jest.fn();
jest.mock('next/cache', () => ({
  revalidateTag: (...args: unknown[]) => mockRevalidateTag(...args),
}));

import { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { GET as listar } from '@/app/api/admin/portfolio/versions/route';
import { POST as restaurar } from '@/app/api/admin/portfolio/versions/[id]/restore/route';

function req(url: string, init?: RequestInit) {
  return new NextRequest(`http://localhost${url}`, init);
}

function auth(role: 'owner' | 'assistant' | 'viewer' | null) {
  if (role === null) {
    mockRequireAdmin.mockResolvedValue({ ok: false, response: new Response(null, { status: 401 }) });
    return;
  }
  if (role !== 'owner') {
    mockRequireAdmin.mockResolvedValue({ ok: false, response: Response.json({ error: 'Permisos insuficientes' }, { status: 403 }) });
    return;
  }
  mockRequireAdmin.mockResolvedValue({
    ok: true,
    user: { id: 'u1' },
    role: 'owner',
    email: 'owner@test.com',
    actor: { userId: 'u1', email: 'owner@test.com', role: 'owner' },
  });
}

/** Cliente simulado: una tabla → una respuesta, con el mismo helper encadenable de los demás tests. */
function tabla(porTabla: Record<string, unknown> | ((tabla: string, metodo: string) => unknown)) {
  (supabaseServer.from as jest.Mock).mockImplementation((nombreTabla: string) => {
    const encadenable: Record<string, unknown> = {};
    const self = () => encadenable;
    let metodoLlamado = 'select';
    for (const m of ['select', 'eq', 'order', 'upsert', 'maybeSingle']) {
      encadenable[m] = jest.fn((...args: unknown[]) => {
        metodoLlamado = m;
        return self();
      });
    }
    const resolver = () =>
      typeof porTabla === 'function' ? porTabla(nombreTabla, metodoLlamado) : (porTabla[nombreTabla] ?? { data: [], error: null });
    encadenable.single = jest.fn(() => Promise.resolve(resolver()));
    encadenable.then = (resolve: (v: unknown) => unknown) => Promise.resolve(resolver()).then(resolve);
    return encadenable;
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/admin/portfolio/versions', () => {
  it('sin sesión → 401', async () => {
    auth(null);
    const res = await listar(req('/x?resourceType=portfolio_project&resourceId=p1'));
    expect(res.status).toBe(401);
  });

  it('rol insuficiente (no owner) → 403, aunque sea admin', async () => {
    auth('assistant');
    const res = await listar(req('/x?resourceType=portfolio_project&resourceId=p1'));
    expect(res.status).toBe(403);
  });

  it('faltan resourceType/resourceId → 400', async () => {
    auth('owner');
    const res = await listar(req('/x'));
    expect(res.status).toBe(400);
  });

  it('owner con parámetros válidos: lista el historial de ese recurso', async () => {
    auth('owner');
    tabla({ content_versions: { data: [{ id: 'v1', resource_type: 'portfolio_project', resource_id: 'p1' }], error: null } });
    const res = await listar(req('/x?resourceType=portfolio_project&resourceId=p1'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
  });
});

const VERSION_UPDATE = {
  id: 'v1',
  resource_type: 'portfolio_project',
  resource_id: 'p1',
  action: 'update',
  before: { id: 'p1', title: 'Antes' },
  after: { id: 'p1', title: 'Después' },
};

const VERSION_DELETE = {
  id: 'v2',
  resource_type: 'portfolio_skill',
  resource_id: 's1',
  action: 'delete',
  before: { id: 's1', slug: 'react' },
  after: null,
};

describe('POST /api/admin/portfolio/versions/[id]/restore', () => {
  it('sin sesión → 401', async () => {
    auth(null);
    const res = await restaurar(req('/x', { method: 'POST' }), { params: Promise.resolve({ id: 'v1' }) });
    expect(res.status).toBe(401);
  });

  it('rol insuficiente → 403', async () => {
    auth('viewer');
    const res = await restaurar(req('/x', { method: 'POST' }), { params: Promise.resolve({ id: 'v1' }) });
    expect(res.status).toBe(403);
  });

  it('versión inexistente → 404', async () => {
    auth('owner');
    tabla({ content_versions: { data: null, error: { message: 'no encontrada' } } });
    const res = await restaurar(req('/x', { method: 'POST' }), { params: Promise.resolve({ id: 'inexistente' }) });
    expect(res.status).toBe(404);
  });

  it('tipo de recurso desconocido → 400', async () => {
    auth('owner');
    tabla({ content_versions: { data: { ...VERSION_UPDATE, resource_type: 'algo_inventado' }, error: null } });
    const res = await restaurar(req('/x', { method: 'POST' }), { params: Promise.resolve({ id: 'v1' }) });
    expect(res.status).toBe(400);
  });

  it('restaura una versión "update": upsert con el "after", audita como restore, invalida la caché', async () => {
    auth('owner');
    tabla((t, metodo) => {
      if (t === 'content_versions') return { data: VERSION_UPDATE, error: null };
      // portfolio_projects: el `maybeSingle` del estado actual, y el `single` tras el upsert.
      if (metodo === 'maybeSingle') return { data: { id: 'p1', title: 'Después' }, error: null };
      return { data: { id: 'p1', title: 'Antes' }, error: null };
    });

    const res = await restaurar(req('/x', { method: 'POST' }), { params: Promise.resolve({ id: 'v1' }) });
    expect(res.status).toBe(200);
    expect(mockWriteContentVersion).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ action: 'restore', resourceType: 'portfolio_project', resourceId: 'p1' }),
    );
    expect(mockRevalidateTag).toHaveBeenCalledWith('portfolio:projects');
  });

  it('restaura una versión "delete" (sin "after"): revive con el "before" (undelete)', async () => {
    auth('owner');
    tabla((t) => {
      if (t === 'content_versions') return { data: VERSION_DELETE, error: null };
      return { data: { id: 's1', slug: 'react' }, error: null };
    });

    const res = await restaurar(req('/x', { method: 'POST' }), { params: Promise.resolve({ id: 'v2' }) });
    expect(res.status).toBe(200);
    expect(mockRevalidateTag).toHaveBeenCalledWith('portfolio:skills');
  });

  it('una versión sin "before" ni "after" (no debería existir, pero se defiende): 400, no intenta un upsert vacío', async () => {
    auth('owner');
    tabla({ content_versions: { data: { ...VERSION_UPDATE, before: null, after: null }, error: null } });
    const res = await restaurar(req('/x', { method: 'POST' }), { params: Promise.resolve({ id: 'v1' }) });
    expect(res.status).toBe(400);
  });
});
