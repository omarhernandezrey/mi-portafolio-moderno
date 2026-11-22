/**
 * API de cursos de educación (T-11, copia el patrón de T-09/T-10). Lo
 * propio: `logo`/`certificate_url` pueden subirse como archivo
 * (`logo_data_url`/`certificate_data_url`); el resultado de la subida pisa
 * lo que venga en el cuerpo para ese campo.
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

const mockSubirImagenPortafolio = jest.fn();
jest.mock('@/lib/portfolio/uploadImage', () => ({
  subirImagenPortafolio: (...args: unknown[]) => mockSubirImagenPortafolio(...args),
}));

import { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { writeAuditLog } from '@/lib/admin/audit';
import { GET as listar, POST as crear } from '@/app/api/admin/portfolio/education-items/route';
import { PATCH as actualizar, DELETE as borrar } from '@/app/api/admin/portfolio/education-items/[id]/route';
import { PATCH as reordenar } from '@/app/api/admin/portfolio/education-items/reorder/route';

const mockWriteAuditLog = writeAuditLog as jest.Mock;
const CATEGORY_ID = '123e4567-e89b-12d3-a456-426614174000';

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
    for (const m of ['select', 'eq', 'order', 'limit', 'insert', 'update', 'delete']) {
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

const ITEM = {
  id: 'i1',
  category_id: CATEGORY_ID,
  slug: 'curso-1',
  title: { es: 'Curso 1' },
  logo: '',
  certificate_url: '',
  is_new: false,
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
});

describe('POST — crear', () => {
  beforeEach(() => auth('owner'));

  it('cuerpo inválido → 400 (category_id no es uuid)', async () => {
    tabla({});
    const res = await crear(req('/x', { method: 'POST', body: JSON.stringify({ category_id: 'no-uuid', slug: 'x', title: { es: 'X' } }) }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.category_id).toBeDefined();
  });

  it('alta correcta sin imágenes: inserta, audita e invalida la caché', async () => {
    tabla((t) => (t === 'portfolio_education_items' ? { data: { ...ITEM }, error: null, count: 0 } : { data: [], error: null }));
    const res = await crear(
      req('/x', { method: 'POST', body: JSON.stringify({ category_id: CATEGORY_ID, slug: 'curso-1', title: { es: 'Curso 1' } }) }),
    );
    expect(res.status).toBe(201);
    expect(mockSubirImagenPortafolio).not.toHaveBeenCalled();
    expect(mockWriteAuditLog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ action: 'portfolio_education_item.create' }),
    );
    expect(mockRevalidateTag).toHaveBeenCalledWith('portfolio:education', { expire: 0 });
  });

  it('con logo_data_url: sube la imagen y guarda la URL resultante, no el data URL', async () => {
    mockSubirImagenPortafolio.mockResolvedValue({ ok: true, url: 'https://ozftxfwkhomnbvicjtae.supabase.co/storage/v1/object/public/portfolio-media/logos/x.png' });
    let insertado: Record<string, unknown> = {};
    tabla((t) => {
      if (t === 'portfolio_education_items') return { data: { ...ITEM, logo: 'https://ozftxfwkhomnbvicjtae.supabase.co/x.png' }, error: null, count: 0 };
      return { data: [], error: null };
    });
    (supabaseServer.from as jest.Mock).mockImplementation((nombreTabla: string) => {
      const encadenable: Record<string, unknown> = {};
      const self = () => encadenable;
      encadenable.select = jest.fn(self);
      encadenable.eq = jest.fn(self);
      encadenable.insert = jest.fn((valores: Record<string, unknown>) => {
        if (nombreTabla === 'portfolio_education_items') insertado = valores;
        return encadenable;
      });
      encadenable.single = jest.fn(() => Promise.resolve({ data: { ...ITEM, ...insertado }, error: null }));
      encadenable.then = (resolve: (v: unknown) => unknown) => Promise.resolve({ data: [], error: null, count: 0 }).then(resolve);
      return encadenable;
    });

    const res = await crear(
      req('/x', {
        method: 'POST',
        body: JSON.stringify({ category_id: CATEGORY_ID, slug: 'curso-1', title: { es: 'Curso 1' }, logo_data_url: 'data:image/png;base64,AAAA' }),
      }),
    );

    expect(res.status).toBe(201);
    expect(mockSubirImagenPortafolio).toHaveBeenCalledWith('data:image/png;base64,AAAA', 'logos');
    expect(insertado.logo).toBe('https://ozftxfwkhomnbvicjtae.supabase.co/storage/v1/object/public/portfolio-media/logos/x.png');
    expect(insertado).not.toHaveProperty('logo_data_url');
  });

  it('si la subida falla, da 400 con el error en el campo logo (no 500, no inserta nada)', async () => {
    mockSubirImagenPortafolio.mockResolvedValue({ ok: false, error: 'Formato de imagen no admitido' });
    tabla({});
    const res = await crear(
      req('/x', {
        method: 'POST',
        body: JSON.stringify({ category_id: CATEGORY_ID, slug: 'curso-1', title: { es: 'Curso 1' }, logo_data_url: 'data:text/plain;base64,AAAA' }),
      }),
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.logo).toEqual(['Formato de imagen no admitido']);
  });
});

describe('PATCH /[id] — actualizar', () => {
  beforeEach(() => auth('owner'));

  it('cuerpo vacío → 400', async () => {
    const res = await actualizar(req('/x', { method: 'PATCH', body: '{}' }), { params: Promise.resolve({ id: 'i1' }) });
    expect(res.status).toBe(400);
  });

  it('actualiza is_new sin tocar imágenes', async () => {
    tabla({ portfolio_education_items: { data: { ...ITEM, is_new: true }, error: null } });
    const res = await actualizar(req('/x', { method: 'PATCH', body: JSON.stringify({ is_new: true }) }), {
      params: Promise.resolve({ id: 'i1' }),
    });
    expect(res.status).toBe(200);
    expect(mockSubirImagenPortafolio).not.toHaveBeenCalled();
    expect(mockRevalidateTag).toHaveBeenCalledWith('portfolio:education', { expire: 0 });
  });
});

describe('DELETE /[id]', () => {
  it('borra, audita e invalida la caché', async () => {
    auth('owner');
    tabla({ portfolio_education_items: { data: null, error: null } });
    const res = await borrar(req('/x', { method: 'DELETE' }), { params: Promise.resolve({ id: 'i1' }) });
    expect(res.status).toBe(200);
    expect(mockWriteAuditLog).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ action: 'portfolio_education_item.delete' }));
  });
});

describe('PATCH /reorder', () => {
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
      p_tabla: 'portfolio_education_items',
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
