/**
 * Activar/desactivar el modo borrador de Next.js (T-18). Activar exige
 * `owner`; desactivar no (es "salir", no un privilegio). Los dos redirigen
 * solo a una ruta relativa del propio sitio — nunca a una URL externa, para
 * que `next` no sea una puerta de redirección abierta.
 */
// Las variables de los mocks se declaran DENTRO de la factory de `jest.mock`
// (que Jest sube al principio del archivo) y se exponen con un nombre propio
// para no chocar con el "no se puede acceder antes de inicializar" que da
// referenciar un `const` externo todavía no evaluado en ese punto.
jest.mock('next/headers', () => {
  const mockEnable = jest.fn();
  const mockDisable = jest.fn();
  return {
    draftMode: jest.fn().mockResolvedValue({ enable: mockEnable, disable: mockDisable }),
    __mockEnable: mockEnable,
    __mockDisable: mockDisable,
  };
});

const mockRequireAdmin = jest.fn();
jest.mock('@/lib/admin/auth', () => ({
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
}));

import { NextRequest } from 'next/server';
import * as nextHeaders from 'next/headers';
import { GET as activar } from '@/app/api/preview/enable/route';
import { GET as desactivar } from '@/app/api/preview/disable/route';

type ConMocks = typeof nextHeaders & { __mockEnable: jest.Mock; __mockDisable: jest.Mock };
const mockEnable = (nextHeaders as ConMocks).__mockEnable;
const mockDisable = (nextHeaders as ConMocks).__mockDisable;

function req(url: string) {
  return new NextRequest(`http://localhost${url}`);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/preview/enable', () => {
  it('sin sesión de owner → 401/403, no activa el modo borrador', async () => {
    mockRequireAdmin.mockResolvedValue({ ok: false, response: new Response(null, { status: 401 }) });
    const res = await activar(req('/x'));
    expect(res.status).toBe(401);
    expect(mockEnable).not.toHaveBeenCalled();
  });

  it('con sesión de owner: activa el modo borrador y redirige a "next"', async () => {
    mockRequireAdmin.mockResolvedValue({ ok: true, user: { id: 'u1' }, role: 'owner', email: 'o@test.com', actor: {} });
    const res = await activar(req('/x?next=/es'));
    expect(mockEnable).toHaveBeenCalled();
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/es');
  });

  it('un "next" que apunta fuera del sitio se ignora: redirige a "/" en vez de seguirlo', async () => {
    mockRequireAdmin.mockResolvedValue({ ok: true, user: { id: 'u1' }, role: 'owner', email: 'o@test.com', actor: {} });
    const res = await activar(req('/x?next=https://evil.example.com'));
    expect(res.headers.get('location')).toBe('http://localhost/');
  });

  it('un "next" protocol-relative (//evil.com) también se ignora', async () => {
    mockRequireAdmin.mockResolvedValue({ ok: true, user: { id: 'u1' }, role: 'owner', email: 'o@test.com', actor: {} });
    const res = await activar(req('/x?next=//evil.example.com'));
    expect(res.headers.get('location')).toBe('http://localhost/');
  });
});

describe('GET /api/preview/disable', () => {
  it('desactiva el modo borrador sin exigir sesión', async () => {
    const res = await desactivar(req('/x?next=/en'));
    expect(mockDisable).toHaveBeenCalled();
    expect(mockRequireAdmin).not.toHaveBeenCalled();
    expect(res.headers.get('location')).toBe('http://localhost/en');
  });

  it('sin "next": redirige a "/"', async () => {
    const res = await desactivar(req('/x'));
    expect(res.headers.get('location')).toBe('http://localhost/');
  });
});
