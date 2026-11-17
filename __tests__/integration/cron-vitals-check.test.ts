/**
 * Tests de `GET /api/cron/vitals-check` (T-17): el aviso de "caída
 * sostenida de un Core Web Vital". `supabaseServer` y el dedupe se simulan.
 */
jest.mock('@/config/env', () => ({
  serverEnv: { CRON_SECRET: 'test-cron-secret-largo' },
}));

const mockFrom = jest.fn();
jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: { from: (...args: unknown[]) => mockFrom(...args) },
}));

const mockReclamarAviso = jest.fn();
const mockLiberarAviso = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/notifications/dedupe', () => ({
  reclamarAviso: (...args: unknown[]) => mockReclamarAviso(...args),
  liberarAviso: (...args: unknown[]) => mockLiberarAviso(...args),
}));

const mockNotifyTelegram = jest.fn().mockResolvedValue({ sent: true });
jest.mock('@/lib/chatbot/telegram', () => ({
  notifyTelegram: (...args: unknown[]) => mockNotifyTelegram(...args),
}));

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/cron/vitals-check/route';

function peticion(secret = 'test-cron-secret-largo') {
  return new NextRequest('http://localhost/api/cron/vitals-check', {
    headers: { authorization: `Bearer ${secret}` },
  });
}

function filasVitals(filas: Array<{ metric: string; device: string; value: number }>) {
  mockFrom.mockImplementation(() => ({
    select: () => ({ gte: async () => ({ data: filas, error: null }) }),
  }));
}

const MUCHAS_MUESTRAS_MALAS = Array.from({ length: 6 }, () => ({ metric: 'LCP', device: 'mobile', value: 5000 }));
const MUCHAS_MUESTRAS_BUENAS = Array.from({ length: 6 }, () => ({ metric: 'LCP', device: 'mobile', value: 1200 }));

beforeEach(() => {
  mockFrom.mockReset();
  mockReclamarAviso.mockReset();
  mockLiberarAviso.mockClear();
  mockNotifyTelegram.mockClear();
});

describe('GET /api/cron/vitals-check', () => {
  it('sin secret válido: 401', async () => {
    const res = await GET(peticion('otro'));
    expect(res.status).toBe(401);
  });

  it('sin datos: nada que avisar, no lanza', async () => {
    filasVitals([]);
    const res = await GET(peticion());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.resultados).toEqual([]);
    expect(mockNotifyTelegram).not.toHaveBeenCalled();
  });

  it('p75 por encima del umbral "poor" y no avisado antes: se envía', async () => {
    filasVitals(MUCHAS_MUESTRAS_MALAS);
    mockReclamarAviso.mockResolvedValue(true);
    const res = await GET(peticion());
    expect(res.status).toBe(200);
    expect(mockNotifyTelegram).toHaveBeenCalledWith(expect.stringContaining('LCP'));
  });

  it('p75 saludable: no avisa, y libera cualquier aviso previo (permite volver a avisar si recae)', async () => {
    filasVitals(MUCHAS_MUESTRAS_BUENAS);
    const res = await GET(peticion());
    expect(res.status).toBe(200);
    expect(mockNotifyTelegram).not.toHaveBeenCalled();
    expect(mockLiberarAviso).toHaveBeenCalledWith('vitals_regression', 'LCP:mobile');
  });

  it('ya se había avisado de esta misma combinación: no se repite', async () => {
    filasVitals(MUCHAS_MUESTRAS_MALAS);
    mockReclamarAviso.mockResolvedValue(false);
    const res = await GET(peticion());
    expect(res.status).toBe(200);
    expect(mockNotifyTelegram).not.toHaveBeenCalled();
  });
});
