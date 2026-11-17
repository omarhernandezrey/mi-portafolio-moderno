/**
 * Tests de `GET /auth/callback` (T-19, corregido): el camino real del enlace
 * mágico es `token_hash` + `verifyOtp` (patrón SSR de Supabase). El camino
 * `code` se conserva por compatibilidad, pero el enlace del correo ya no lo
 * usa: con flujo implícito los tokens llegaban en el fragmento `#...` y un
 * route handler no recibe fragmentos — por eso el login nunca completaba.
 */
const mockVerifyOtp = jest.fn();
const mockExchange = jest.fn();
const mockGetUser = jest.fn();
const mockSignOut = jest.fn().mockResolvedValue({ error: null });
const mockMaybeSingle = jest.fn();

jest.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      verifyOtp: mockVerifyOtp,
      exchangeCodeForSession: mockExchange,
      getUser: mockGetUser,
      signOut: mockSignOut,
    },
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: mockMaybeSingle }),
      }),
    }),
  }),
}));

jest.mock('next/headers', () => ({
  cookies: async () => ({ getAll: () => [], set: () => undefined }),
}));

import { GET } from '@/app/auth/callback/route';

const ORIGEN = 'https://omarhernandezrey.com';

function peticion(query: string) {
  return new Request(`${ORIGEN}/auth/callback${query}`);
}

function sesionValida(email = 'hernandezreyomar@gmail.com', role = 'owner') {
  mockVerifyOtp.mockResolvedValue({ error: null });
  mockExchange.mockResolvedValue({ error: null });
  mockGetUser.mockResolvedValue({ data: { user: { id: 'u1', email } } });
  mockMaybeSingle.mockResolvedValue({ data: { role } });
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.ADMIN_ALLOWED_EMAILS = 'hernandezreyomar@gmail.com';
});

describe('GET /auth/callback con token_hash (camino real del correo)', () => {
  it('token válido + correo autorizado + rol admin → redirige a /admin', async () => {
    sesionValida();
    const res = await GET(peticion('?token_hash=abc&type=magiclink'));
    expect(res.headers.get('location')).toBe(`${ORIGEN}/admin`);
    expect(mockVerifyOtp).toHaveBeenCalledWith({ type: 'magiclink', token_hash: 'abc' });
    expect(mockExchange).not.toHaveBeenCalled();
  });

  it('un type desconocido cae a magiclink en vez de pasarlo crudo', async () => {
    sesionValida();
    await GET(peticion('?token_hash=abc&type=raro'));
    expect(mockVerifyOtp).toHaveBeenCalledWith({ type: 'magiclink', token_hash: 'abc' });
  });

  it('token expirado → vuelve al login con auth-code-error', async () => {
    mockVerifyOtp.mockResolvedValue({ error: { message: 'otp_expired' } });
    const res = await GET(peticion('?token_hash=viejo&type=magiclink'));
    expect(res.headers.get('location')).toBe(`${ORIGEN}/admin/login?error=auth-code-error`);
  });

  it('correo fuera de la allowlist → signOut y unauthorized', async () => {
    sesionValida('intruso@test.com');
    const res = await GET(peticion('?token_hash=abc&type=magiclink'));
    expect(res.headers.get('location')).toBe(`${ORIGEN}/admin/login?error=unauthorized`);
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('sin fila en user_roles → signOut y unauthorized', async () => {
    sesionValida();
    mockMaybeSingle.mockResolvedValue({ data: null });
    const res = await GET(peticion('?token_hash=abc&type=magiclink'));
    expect(res.headers.get('location')).toBe(`${ORIGEN}/admin/login?error=unauthorized`);
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('el next externo (//evil.com) se descarta y se va a /admin', async () => {
    sesionValida();
    const res = await GET(peticion('?token_hash=abc&type=magiclink&next=//evil.com'));
    expect(res.headers.get('location')).toBe(`${ORIGEN}/admin`);
  });
});

describe('GET /auth/callback con code (compatibilidad)', () => {
  it('code válido sigue funcionando vía exchangeCodeForSession', async () => {
    sesionValida();
    const res = await GET(peticion('?code=xyz'));
    expect(res.headers.get('location')).toBe(`${ORIGEN}/admin`);
    expect(mockExchange).toHaveBeenCalledWith('xyz');
    expect(mockVerifyOtp).not.toHaveBeenCalled();
  });

  it('sin code ni token_hash → auth-code-error', async () => {
    const res = await GET(peticion(''));
    expect(res.headers.get('location')).toBe(`${ORIGEN}/admin/login?error=auth-code-error`);
  });
});
