/**
 * Tests de `POST /api/auth/request-login` (T-19): el punto intermedio entre
 * el formulario de login y `supabase.auth.signInWithOtp`, para poder limitar
 * intentos antes de llegar a Supabase.
 */
const mockSignInWithOtp = jest.fn().mockResolvedValue({ error: null });
jest.mock('@/lib/supabase/public', () => ({
  crearClientePublico: () => ({ auth: { signInWithOtp: mockSignInWithOtp } }),
}));

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/request-login/route';

function peticion(email: unknown, ip = '1.2.3.4') {
  return new NextRequest('http://localhost/api/auth/request-login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-real-ip': ip },
    body: JSON.stringify({ email }),
  });
}

beforeEach(() => {
  mockSignInWithOtp.mockClear();
});

describe('POST /api/auth/request-login', () => {
  it('sin correo: 400, no llama a Supabase', async () => {
    const res = await POST(peticion(undefined, '10.0.0.1'));
    expect(res.status).toBe(400);
    expect(mockSignInWithOtp).not.toHaveBeenCalled();
  });

  it('con correo válido: pide el OTP y responde success', async () => {
    const res = await POST(peticion('omar@test.com', '10.0.0.2'));
    expect(res.status).toBe(200);
    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: 'omar@test.com',
      options: { emailRedirectTo: 'http://localhost/auth/callback' },
    });
  });

  it('si Supabase rechaza, pasa el motivo (sin inventar otro)', async () => {
    mockSignInWithOtp.mockResolvedValueOnce({ error: { message: 'Email rate limit exceeded' } });
    const res = await POST(peticion('omar@test.com', '10.0.0.3'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Email rate limit exceeded');
  });

  it('el intento N+1 desde la misma IP+correo se bloquea con 429', async () => {
    const ip = '10.0.0.4';
    const email = `limite-${Math.random()}@test.com`;
    for (let i = 0; i < 5; i++) {
      const res = await POST(peticion(email, ip));
      expect(res.status).toBe(200);
    }
    const bloqueado = await POST(peticion(email, ip));
    expect(bloqueado.status).toBe(429);
    expect(mockSignInWithOtp).toHaveBeenCalledTimes(5);
  });

  it('el límite es por correo, no solo por IP: otro correo desde la misma IP sí puede', async () => {
    const ip = '10.0.0.5';
    const correoAgotado = `agotado-${Math.random()}@test.com`;
    for (let i = 0; i < 5; i++) await POST(peticion(correoAgotado, ip));
    expect((await POST(peticion(correoAgotado, ip))).status).toBe(429);

    const res = await POST(peticion(`otro-${Math.random()}@test.com`, ip));
    expect(res.status).toBe(200);
  });
});
