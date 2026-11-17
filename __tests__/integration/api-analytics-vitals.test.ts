/**
 * Tests de `POST /api/analytics/vitals` (T-15): el único punto por el que
 * una métrica de Web Vitals del navegador llega a `analytics_vitals`. Sin
 * política de `insert` para `anon` (ver la migración): esta ruta valida con
 * zod, limita por IP y recién ahí inserta con `supabaseServer`.
 */
const mockInsert = jest.fn().mockResolvedValue({ error: null });
jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: { from: () => ({ insert: mockInsert }) },
}));

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/analytics/vitals/route';

function peticion(body: unknown, ip = '1.2.3.4') {
  return new NextRequest('http://localhost/api/analytics/vitals', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-real-ip': ip },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mockInsert.mockClear();
  mockInsert.mockResolvedValue({ error: null });
});

describe('POST /api/analytics/vitals', () => {
  it('carga útil válida: 204 e inserta la fila limpia', async () => {
    const res = await POST(peticion(
      { path: '/es/proyectos?foo=bar#seccion', device: 'mobile', metric: 'LCP', value: 1800 },
      '10.1.0.1',
    ));
    expect(res.status).toBe(204);
    expect(mockInsert).toHaveBeenCalledWith({
      path: '/es/proyectos', // sin query ni hash
      device: 'mobile',
      metric: 'LCP',
      value: 1800,
    });
  });

  it('carga útil inválida (metric fuera de la lista): 400, no inserta', async () => {
    const res = await POST(peticion({ path: '/', device: 'mobile', metric: 'FCP', value: 1 }, '10.1.0.2'));
    expect(res.status).toBe(400);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('cuerpo que no es JSON: 400, no inserta', async () => {
    const req = new NextRequest('http://localhost/api/analytics/vitals', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-real-ip': '10.1.0.3' },
      body: 'no es json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('si Supabase falla al insertar: 500, el motivo no llega al cliente', async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: 'boom' } });
    const res = await POST(peticion({ path: '/', device: 'desktop', metric: 'CLS', value: 0.05 }, '10.1.0.4'));
    expect(res.status).toBe(500);
  });

  it('la petición 31 desde la misma IP en la ventana se bloquea con 429', async () => {
    const ip = '10.1.0.5';
    const carga = { path: '/', device: 'desktop', metric: 'INP', value: 150 };
    for (let i = 0; i < 30; i++) {
      const res = await POST(peticion(carga, ip));
      expect(res.status).toBe(204);
    }
    const bloqueada = await POST(peticion(carga, ip));
    expect(bloqueada.status).toBe(429);
    expect(mockInsert).toHaveBeenCalledTimes(30);
  });

  it('el límite es por IP: otra IP no se ve afectada por el límite agotado de la primera', async () => {
    const carga = { path: '/', device: 'mobile', metric: 'LCP', value: 1000 };
    const ipAgotada = '10.1.0.6';
    for (let i = 0; i < 30; i++) await POST(peticion(carga, ipAgotada));
    expect((await POST(peticion(carga, ipAgotada))).status).toBe(429);

    const res = await POST(peticion(carga, '10.1.0.7'));
    expect(res.status).toBe(204);
  });
});
