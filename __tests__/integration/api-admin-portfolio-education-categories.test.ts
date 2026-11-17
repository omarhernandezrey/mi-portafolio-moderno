/**
 * API de categorías de educación (T-11, copia el patrón de T-09/T-10).
 * Lo propio de este recurso: `DELETE` cuenta cuántos ítems arrastra el
 * `on delete cascade` de `portfolio_education_items.category_id` ANTES de
 * borrar, y lo deja en la auditoría y en la respuesta.
 */
jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: { from: jest.fn() },
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
import { GET as listar, POST as crear } from '@/app/api/admin/portfolio/education-categories/route';
import { PATCH as actualizar, DELETE as borrar } from '@/app/api/admin/portfolio/education-categories/[id]/route';
import { PATCH as reordenar } from '@/app/api/admin/portfolio/education-categories/reorder/route';

const mockWriteAuditLog = writeAuditLog as jest.Mock;

function auth(role: 'owner' | 'assistant' | 'viewer' | null) {
  if (role === null) {
    mockRequireAdmin.mockResolvedValue({ ok: false, response: new Response(JSON.stringify({ error: 'No autenticado' }), { status: 401 }) });
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
  mockRequireAdmin.mockResolvedValue({ ok: false, response: Response.json({ error: 'Permisos insuficientes' }, { status: 403 }) });
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

function req(url: string, init?: RequestInit) {
  return new NextRequest(`http://localhost${url}`, init);
}

const CATEGORIA = { id: 'c1', slug: 'certificaciones', name: { es: 'Certificaciones' }, is_published: true, position: 0 };

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

  it('DELETE con rol insuficiente → 403', async () => {
    authInsuficiente();
    const res = await borrar(req('/x', { method: 'DELETE' }), { params: Promise.resolve({ id: 'c1' }) });
    expect(res.status).toBe(403);
  });
});

describe('POST — crear', () => {
  beforeEach(() => auth('owner'));

  it('cuerpo inválido → 400 con el campo señalado', async () => {
    tabla({});
    const res = await crear(req('/x', { method: 'POST', body: JSON.stringify({ slug: 'Con Mayúsculas', name: { es: 'x' } }) }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.slug).toBeDefined();
  });

  it('alta correcta: inserta, audita e invalida la caché', async () => {
    tabla((t) => (t === 'portfolio_education_categories' ? { data: { ...CATEGORIA }, error: null, count: 2 } : { data: [], error: null }));
    const res = await crear(req('/x', { method: 'POST', body: JSON.stringify({ slug: 'certificaciones', name: { es: 'Certificaciones' } }) }));
    expect(res.status).toBe(201);
    expect(mockWriteAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'owner@test.com' }),
      expect.objectContaining({ action: 'portfolio_education_category.create' }),
    );
    expect(mockRevalidateTag).toHaveBeenCalledWith('portfolio:education');
  });
});

describe('PATCH /[id] — actualizar', () => {
  it('cuerpo vacío → 400', async () => {
    auth('owner');
    const res = await actualizar(req('/x', { method: 'PATCH', body: '{}' }), { params: Promise.resolve({ id: 'c1' }) });
    expect(res.status).toBe(400);
  });

  it('actualiza, audita e invalida la caché', async () => {
    auth('owner');
    tabla({ portfolio_education_categories: { data: { ...CATEGORIA, name: { es: 'Nuevo nombre' } }, error: null } });
    const res = await actualizar(req('/x', { method: 'PATCH', body: JSON.stringify({ name: { es: 'Nuevo nombre' } }) }), {
      params: Promise.resolve({ id: 'c1' }),
    });
    expect(res.status).toBe(200);
    expect(mockRevalidateTag).toHaveBeenCalledWith('portfolio:education');
  });
});

describe('DELETE /[id] — borra y cuenta cuántos ítems arrastra', () => {
  beforeEach(() => auth('owner'));

  it('con 3 cursos en la categoría: borra, audita con itemsEliminados=3 y lo devuelve en la respuesta', async () => {
    tabla((t) => {
      if (t === 'portfolio_education_items') return { data: null, error: null, count: 3 };
      if (t === 'portfolio_education_categories') return { data: null, error: null };
      return { data: [], error: null };
    });

    const res = await borrar(req('/x', { method: 'DELETE' }), { params: Promise.resolve({ id: 'c1' }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.itemsEliminados).toBe(3);
    expect(mockWriteAuditLog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ action: 'portfolio_education_category.delete', metadata: { itemsEliminados: 3 } }),
    );
    expect(mockRevalidateTag).toHaveBeenCalledWith('portfolio:education');
  });

  it('sin cursos en la categoría: itemsEliminados=0', async () => {
    tabla((t) => {
      if (t === 'portfolio_education_items') return { data: null, error: null, count: 0 };
      return { data: null, error: null };
    });
    const res = await borrar(req('/x', { method: 'DELETE' }), { params: Promise.resolve({ id: 'c1' }) });
    const body = await res.json();
    expect(body.itemsEliminados).toBe(0);
  });
});

describe('PATCH /reorder', () => {
  it('reescribe la posición de cada id en el orden recibido', async () => {
    auth('owner');
    const actualizaciones: Array<{ position: number }> = [];
    (supabaseServer.from as jest.Mock).mockImplementation(() => {
      const encadenable: Record<string, unknown> = {};
      encadenable.update = jest.fn((v: { position: number }) => {
        actualizaciones.push(v);
        return encadenable;
      });
      encadenable.eq = jest.fn(() => Promise.resolve({ data: null, error: null }));
      return encadenable;
    });

    const ids = ['11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222'];
    const res = await reordenar(req('/x', { method: 'PATCH', body: JSON.stringify({ ids }) }));
    expect(res.status).toBe(200);
    expect(actualizaciones).toEqual([{ position: 0 }, { position: 1 }]);
  });
});
