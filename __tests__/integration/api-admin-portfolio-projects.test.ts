/**
 * API de proyectos del portafolio (T-09, establece el patrón para T-10 a
 * T-12): sin sesión → 401, `viewer` → 403 al escribir, cuerpo inválido → 400
 * con el campo señalado, alta/edición/borrado/reorden correctos, cada
 * escritura deja auditoría e invalida la caché de `portfolio/repository.ts`.
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

const mockComprobarEmbebido = jest.fn();
jest.mock('@/lib/portfolio/embedCheck', () => ({
  comprobarEmbebido: (...args: unknown[]) => mockComprobarEmbebido(...args),
}));

const mockNotifyTelegram = jest.fn().mockResolvedValue({ sent: true });
jest.mock('@/lib/chatbot/telegram', () => ({
  notifyTelegram: (...args: unknown[]) => mockNotifyTelegram(...args),
}));

import { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { writeAuditLog } from '@/lib/admin/audit';
import { GET as listar, POST as crear } from '@/app/api/admin/portfolio/projects/route';
import { PATCH as actualizar, DELETE as borrar } from '@/app/api/admin/portfolio/projects/[id]/route';
import { PATCH as reordenar } from '@/app/api/admin/portfolio/projects/reorder/route';

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

/** Simula el rechazo real de `requireAdmin('owner')` cuando el rol no alcanza. */
function authInsuficiente() {
  mockRequireAdmin.mockResolvedValue({
    ok: false,
    response: Response.json({ error: 'Permisos insuficientes' }, { status: 403 }),
  });
}

function tabla(porTabla: Record<string, unknown> | ((tabla: string, metodo: string) => unknown)) {
  (supabaseServer.from as jest.Mock).mockImplementation((nombreTabla: string) => {
    const encadenable: Record<string, unknown> = {};
    const self = () => encadenable;
    let metodoLlamado = 'select';
    for (const m of ['select', 'eq', 'order', 'insert', 'update', 'delete']) {
      encadenable[m] = jest.fn((...args: unknown[]) => {
        metodoLlamado = m;
        return self();
      });
    }
    const resolver = () =>
      typeof porTabla === 'function' ? porTabla(nombreTabla, metodoLlamado) : (porTabla[nombreTabla] ?? { data: [], error: null });
    encadenable.single = jest.fn(() => Promise.resolve(resolver()));
    encadenable.maybeSingle = jest.fn(() => Promise.resolve(resolver()));
    encadenable.then = (resolve: (v: unknown) => unknown) => Promise.resolve(resolver()).then(resolve);
    return encadenable;
  });
}

function req(url: string, init?: RequestInit) {
  return new NextRequest(`http://localhost${url}`, init);
}

const PROYECTO = {
  id: 'p1',
  slug: 'demo',
  title: { es: 'Demo' },
  description: { es: 'Un demo' },
  technologies: ['React'],
  repository: '',
  demo: '',
  is_published: true,
  position: 0,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockComprobarEmbebido.mockResolvedValue({ demo: '', resultado: 'embebible', motivo: 'sin cabecera que lo bloquee' });
});

describe('autenticación y permisos', () => {
  it('GET sin sesión → 401', async () => {
    auth(null);
    const res = await listar();
    expect(res.status).toBe(401);
  });

  it('POST con viewer (rol insuficiente) → 403', async () => {
    authInsuficiente();
    const res = await crear(req('/api/admin/portfolio/projects', { method: 'POST', body: '{}' }));
    expect(res.status).toBe(403);
  });

  it('PATCH /[id] con viewer → 403', async () => {
    authInsuficiente();
    const res = await actualizar(req('/x', { method: 'PATCH', body: '{}' }), { params: Promise.resolve({ id: 'p1' }) });
    expect(res.status).toBe(403);
  });

  it('DELETE con viewer → 403', async () => {
    authInsuficiente();
    const res = await borrar(req('/x', { method: 'DELETE' }), { params: Promise.resolve({ id: 'p1' }) });
    expect(res.status).toBe(403);
  });

  it('PATCH /reorder con viewer → 403', async () => {
    authInsuficiente();
    const res = await reordenar(req('/x', { method: 'PATCH', body: '{}' }));
    expect(res.status).toBe(403);
  });

  it('GET con cualquier rol admin (viewer) → 200: solo escribir exige owner', async () => {
    auth('viewer');
    tabla({ portfolio_projects: { data: [PROYECTO], error: null } });
    const res = await listar();
    expect(res.status).toBe(200);
  });
});

describe('POST — crear', () => {
  beforeEach(() => auth('owner'));

  it('cuerpo inválido → 400 con el campo señalado', async () => {
    tabla({});
    const res = await crear(req('/x', { method: 'POST', body: JSON.stringify({ slug: 'Con Mayúsculas' }) }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.slug).toBeDefined();
  });

  it('alta correcta: inserta, audita e invalida la caché', async () => {
    tabla((t) => {
      if (t === 'portfolio_projects') return { data: { ...PROYECTO }, error: null, count: 3 };
      return { data: [], error: null };
    });

    const res = await crear(
      req('/x', {
        method: 'POST',
        body: JSON.stringify({ slug: 'demo', title: { es: 'Demo' }, description: { es: 'Un demo' } }),
      }),
    );

    expect(res.status).toBe(201);
    expect(mockWriteAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'owner@test.com' }),
      expect.objectContaining({ action: 'portfolio_project.create', resourceType: 'portfolio_project' }),
    );
    expect(mockRevalidateTag).toHaveBeenCalledWith('portfolio:projects');
  });

  it('un slug duplicado (23505) → 400, no 500', async () => {
    tabla(() => ({ data: null, error: { code: '23505', message: 'duplicate key' } }));
    const res = await crear(
      req('/x', {
        method: 'POST',
        body: JSON.stringify({ slug: 'demo', title: { es: 'Demo' }, description: { es: 'Un demo' } }),
      }),
    );
    expect(res.status).toBe(400);
  });

  it('con demo: comprueba el embebido y avisa si el sitio lo bloquea, sin dejar de crear', async () => {
    mockComprobarEmbebido.mockResolvedValue({ demo: 'https://x.com', resultado: 'no-embebible', motivo: 'X-Frame-Options: DENY' });
    tabla((t) => {
      if (t === 'portfolio_projects') return { data: { ...PROYECTO, demo: 'https://x.com', demo_embeddable: false }, error: null, count: 1 };
      return { data: [], error: null };
    });

    const res = await crear(
      req('/x', {
        method: 'POST',
        body: JSON.stringify({ slug: 'demo', title: { es: 'Demo' }, description: { es: 'Un demo' }, demo: 'https://x.com' }),
      }),
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.embedCheck.resultado).toBe('no-embebible');
    expect(mockComprobarEmbebido).toHaveBeenCalledWith('https://x.com');
  });

  it('sin demo: no llama al comprobador de embebido', async () => {
    tabla((t) => {
      if (t === 'portfolio_projects') return { data: { ...PROYECTO }, error: null, count: 0 };
      return { data: [], error: null };
    });
    await crear(req('/x', { method: 'POST', body: JSON.stringify({ slug: 'demo', title: { es: 'Demo' }, description: { es: 'Un demo' } }) }));
    expect(mockComprobarEmbebido).not.toHaveBeenCalled();
  });
});

describe('PATCH /[id] — actualizar', () => {
  beforeEach(() => auth('owner'));

  it('cuerpo vacío → 400 (nada que actualizar)', async () => {
    const res = await actualizar(req('/x', { method: 'PATCH', body: '{}' }), { params: Promise.resolve({ id: 'p1' }) });
    expect(res.status).toBe(400);
  });

  it('actualiza, audita e invalida la caché', async () => {
    tabla({ portfolio_projects: { data: { ...PROYECTO, title: { es: 'Nuevo título' } }, error: null } });
    const res = await actualizar(
      req('/x', { method: 'PATCH', body: JSON.stringify({ title: { es: 'Nuevo título' } }) }),
      { params: Promise.resolve({ id: 'p1' }) },
    );
    expect(res.status).toBe(200);
    expect(mockWriteAuditLog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ action: 'portfolio_project.update', resourceId: 'p1' }),
    );
    expect(mockRevalidateTag).toHaveBeenCalledWith('portfolio:projects');
  });

  it('cambiar solo is_published no vuelve a comprobar el demo', async () => {
    tabla({ portfolio_projects: { data: { ...PROYECTO, is_published: false }, error: null } });
    await actualizar(req('/x', { method: 'PATCH', body: JSON.stringify({ is_published: false }) }), {
      params: Promise.resolve({ id: 'p1' }),
    });
    expect(mockComprobarEmbebido).not.toHaveBeenCalled();
  });

  it('cambiar el demo sí vuelve a comprobarlo', async () => {
    tabla({ portfolio_projects: { data: { ...PROYECTO, demo: 'https://y.com' }, error: null } });
    const res = await actualizar(
      req('/x', { method: 'PATCH', body: JSON.stringify({ demo: 'https://y.com' }) }),
      { params: Promise.resolve({ id: 'p1' }) },
    );
    expect(res.status).toBe(200);
    expect(mockComprobarEmbebido).toHaveBeenCalledWith('https://y.com');
  });

  // T-17: aviso de "proyecto publicado" — se envía solo en la transición
  // false→true, nunca en un PATCH que ya estaba publicado (duplicados).
  it('publicar un proyecto que estaba sin publicar: avisa por Telegram', async () => {
    tabla((_tabla, metodo) =>
      metodo === 'eq'
        ? { data: { is_published: false }, error: null } // estado ANTES de este PATCH
        : { data: { ...PROYECTO, is_published: true }, error: null }, // fila ya actualizada
    );
    const res = await actualizar(
      req('/x', { method: 'PATCH', body: JSON.stringify({ is_published: true }) }),
      { params: Promise.resolve({ id: 'p1' }) },
    );
    expect(res.status).toBe(200);
    expect(mockNotifyTelegram).toHaveBeenCalledWith(expect.stringContaining('Demo'));
  });

  it('volver a guardar is_published:true sobre un proyecto YA publicado: no avisa otra vez', async () => {
    tabla((_tabla, metodo) =>
      metodo === 'eq'
        ? { data: { is_published: true }, error: null } // ya estaba publicado antes de este PATCH
        : { data: { ...PROYECTO, is_published: true }, error: null },
    );
    const res = await actualizar(
      req('/x', { method: 'PATCH', body: JSON.stringify({ is_published: true }) }),
      { params: Promise.resolve({ id: 'p1' }) },
    );
    expect(res.status).toBe(200);
    expect(mockNotifyTelegram).not.toHaveBeenCalled();
  });

  it('despublicar un proyecto (is_published:false): no avisa de publicación', async () => {
    tabla({ portfolio_projects: { data: { ...PROYECTO, is_published: false }, error: null } });
    const res = await actualizar(
      req('/x', { method: 'PATCH', body: JSON.stringify({ is_published: false }) }),
      { params: Promise.resolve({ id: 'p1' }) },
    );
    expect(res.status).toBe(200);
    expect(mockNotifyTelegram).not.toHaveBeenCalled();
  });
});

describe('DELETE /[id] — borrar', () => {
  it('borra, audita e invalida la caché', async () => {
    auth('owner');
    tabla({ portfolio_projects: { data: null, error: null } });
    const res = await borrar(req('/x', { method: 'DELETE' }), { params: Promise.resolve({ id: 'p1' }) });
    expect(res.status).toBe(200);
    expect(mockWriteAuditLog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ action: 'portfolio_project.delete', resourceId: 'p1' }),
    );
    expect(mockRevalidateTag).toHaveBeenCalledWith('portfolio:projects');
  });
});

describe('PATCH /reorder', () => {
  beforeEach(() => auth('owner'));

  it('lista vacía → 400', async () => {
    const res = await reordenar(req('/x', { method: 'PATCH', body: JSON.stringify({ ids: [] }) }));
    expect(res.status).toBe(400);
  });

  it('reescribe la posición de cada id en el orden recibido', async () => {
    const actualizaciones: Array<{ position: number }> = [];
    (supabaseServer.from as jest.Mock).mockImplementation(() => {
      const encadenable: Record<string, unknown> = {};
      encadenable.update = jest.fn((valores: { position: number }) => {
        actualizaciones.push(valores);
        return encadenable;
      });
      encadenable.eq = jest.fn(() => Promise.resolve({ data: null, error: null }));
      return encadenable;
    });

    const ids = [
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
      '33333333-3333-4333-8333-333333333333',
    ];
    const res = await reordenar(req('/x', { method: 'PATCH', body: JSON.stringify({ ids }) }));

    expect(res.status).toBe(200);
    expect(actualizaciones).toEqual([{ position: 0 }, { position: 1 }, { position: 2 }]);
    expect(mockWriteAuditLog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ action: 'portfolio_project.reorder', metadata: { ids } }),
    );
    expect(mockRevalidateTag).toHaveBeenCalledWith('portfolio:projects');
  });
});
