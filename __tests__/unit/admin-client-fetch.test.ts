import { adminFetch, AdminApiError } from '@/lib/admin/client-fetch';

describe('adminFetch', () => {
  const originalFetch = global.fetch;
  const originalWindow = global.window;

  beforeEach(() => {
    global.fetch = jest.fn();
    // Evitar side-effects de redirect en node: un stub mínimo de window,
    // tipado con cast (no @ts-expect-error: la directiva solo cubría la
    // línea de la asignación, no el literal incompleto de dentro).
    global.window = {
      location: { href: 'http://localhost/' },
    } as unknown as Window & typeof globalThis;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    global.window = originalWindow;
  });

  it('devuelve JSON en 200', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      ok: true,
      text: async () => JSON.stringify({ ok: true }),
      json: async () => ({ ok: true }),
    });

    await expect(adminFetch<{ ok: boolean }>('/api/admin/x')).resolves.toEqual({ ok: true });
  });

  it('401 lanza AdminApiError y redirige a login', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 401,
      ok: false,
      json: async () => ({ error: 'No autenticado' }),
    });

    await expect(adminFetch('/api/admin/x')).rejects.toBeInstanceOf(AdminApiError);
    expect(global.window.location.href).toContain('/admin/login');
  });

  it('403 lanza con mensaje de permisos', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 403,
      ok: false,
      json: async () => ({ error: 'Permisos insuficientes' }),
    });

    await expect(adminFetch('/api/admin/webhooks')).rejects.toMatchObject({
      status: 403,
      message: 'Permisos insuficientes',
    });
  });

  it('no redirige si redirectOnUnauthorized=false', async () => {
    global.window.location.href = 'http://localhost/stay';
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 401,
      ok: false,
      json: async () => ({}),
    });

    await expect(
      adminFetch('/api/admin/x', { redirectOnUnauthorized: false })
    ).rejects.toMatchObject({ status: 401 });
    expect(global.window.location.href).toBe('http://localhost/stay');
  });
});
