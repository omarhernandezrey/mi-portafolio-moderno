/**
 * API de perfil → intereses (T-12). A diferencia de los demás recursos, no
 * hay id por elemento: `portfolio_profile` guarda `interests` como UNA fila
 * con `content` jsonb. Por eso solo GET (lee esa fila) y PUT (reemplaza el
 * array entero, upsert por `section`) — sin `[id]/route.ts` ni
 * `reorder/route.ts`.
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
import { GET as leer, PUT as reemplazar } from '@/app/api/admin/portfolio/profile/interests/route';

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

function req(url: string, init?: RequestInit) {
  return new NextRequest(`http://localhost${url}`, init);
}

const INTERES_VALIDO = { title: 'Open Source', href: 'https://opensource.org/', iconKey: 'Globe' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('autenticación y permisos', () => {
  it('GET sin sesión → 401', async () => {
    auth(null);
    const res = await leer();
    expect(res.status).toBe(401);
  });

  it('PUT con rol insuficiente → 403', async () => {
    authInsuficiente();
    const res = await reemplazar(req('/x', { method: 'PUT', body: '{}' }));
    expect(res.status).toBe(403);
  });
});

describe('GET', () => {
  it('sin fila todavía: devuelve un array vacío publicado, no un error', async () => {
    auth('viewer');
    (supabaseServer.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    });
    const res = await leer();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ content: [], is_published: true });
  });

  it('con fila: devuelve su content tal cual', async () => {
    auth('viewer');
    (supabaseServer.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: { content: [INTERES_VALIDO], is_published: true }, error: null }),
    });
    const res = await leer();
    const body = await res.json();
    expect(body.content).toEqual([INTERES_VALIDO]);
  });
});

describe('PUT — reemplaza el array entero', () => {
  beforeEach(() => auth('owner'));

  it('cuerpo inválido (href que no es URL) → 400', async () => {
    const res = await reemplazar(
      req('/x', { method: 'PUT', body: JSON.stringify({ content: [{ title: 'x', href: 'no-es-url', iconKey: 'Globe' }] }) }),
    );
    expect(res.status).toBe(400);
  });

  it('un iconKey que no existe en el registro → 400', async () => {
    const res = await reemplazar(
      req('/x', { method: 'PUT', body: JSON.stringify({ content: [{ title: 'x', href: 'https://x.com', iconKey: 'NoExiste' }] }) }),
    );
    expect(res.status).toBe(400);
  });

  it('upsert correcto: audita con el total de intereses e invalida la caché', async () => {
    const mockUpsert = jest.fn().mockReturnThis();
    (supabaseServer.from as jest.Mock).mockReturnValue({
      upsert: mockUpsert,
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { content: [INTERES_VALIDO], is_published: true }, error: null }),
    });

    const res = await reemplazar(req('/x', { method: 'PUT', body: JSON.stringify({ content: [INTERES_VALIDO], is_published: true }) }));

    expect(res.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(
      { section: 'interests', content: [INTERES_VALIDO], is_published: true },
      { onConflict: 'section' },
    );
    expect(mockWriteAuditLog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ action: 'portfolio_profile_interests.update', metadata: { total: 1 } }),
    );
    expect(mockRevalidateTag).toHaveBeenCalledWith('portfolio:profile');
  });

  it('una lista vacía es un reemplazo válido (quitar todos los intereses)', async () => {
    (supabaseServer.from as jest.Mock).mockReturnValue({
      upsert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { content: [], is_published: true }, error: null }),
    });
    const res = await reemplazar(req('/x', { method: 'PUT', body: JSON.stringify({ content: [] }) }));
    expect(res.status).toBe(200);
  });
});
