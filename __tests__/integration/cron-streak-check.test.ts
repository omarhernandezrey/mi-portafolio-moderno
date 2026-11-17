/**
 * Tests de `GET /api/cron/streak-check` (T-17): el aviso de "racha en
 * riesgo". `github.ts` (salvo `obtenerEventosDelUsuario`), `supabaseServer`
 * y el dedupe se simulan; nunca se llama a la API real de GitHub.
 */
jest.mock('@/config/env', () => ({
  serverEnv: { CRON_SECRET: 'test-cron-secret-largo', GITHUB_TOKEN: 'token-de-prueba' },
}));

const mockObtenerEventos = jest.fn();
jest.mock('@/lib/github', () => {
  const real = jest.requireActual('@/lib/github');
  return { ...real, obtenerEventosDelUsuario: (...args: unknown[]) => mockObtenerEventos(...args) };
});

const mockFrom = jest.fn();
jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: { from: (...args: unknown[]) => mockFrom(...args) },
}));

const mockReclamarAviso = jest.fn();
jest.mock('@/lib/notifications/dedupe', () => ({
  reclamarAviso: (...args: unknown[]) => mockReclamarAviso(...args),
  liberarAviso: jest.fn(),
}));

const mockNotifyTelegram = jest.fn().mockResolvedValue({ sent: true });
jest.mock('@/lib/chatbot/telegram', () => ({
  notifyTelegram: (...args: unknown[]) => mockNotifyTelegram(...args),
}));

import { NextRequest } from 'next/server';
import { hoyEnBogota } from '@/lib/github';
import { GET } from '@/app/api/cron/streak-check/route';

const HOY = hoyEnBogota();

function diasAtras(n: number): string {
  const d = new Date(`${HOY}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

function peticion(secret = 'test-cron-secret-largo') {
  return new NextRequest('http://localhost/api/cron/streak-check', {
    headers: { authorization: `Bearer ${secret}` },
  });
}

/** Racha de 3 días consecutivos terminando AYER (hoy todavía no tiene fila). */
function filasConRachaDe3() {
  mockFrom.mockImplementation(() => ({
    select: () => ({
      order: async () => ({
        data: [
          {
            repo: 'omarhernandezrey/x',
            captured_at: diasAtras(0),
            daily_activity: [
              { fecha: diasAtras(1), commits: 1 },
              { fecha: diasAtras(2), commits: 2 },
              { fecha: diasAtras(3), commits: 1 },
            ],
            languages_bytes: {},
          },
        ],
        error: null,
      }),
    }),
  }));
}

function filasSinRacha() {
  mockFrom.mockImplementation(() => ({
    select: () => ({
      order: async () => ({
        data: [{ repo: 'omarhernandezrey/x', captured_at: diasAtras(0), daily_activity: [], languages_bytes: {} }],
        error: null,
      }),
    }),
  }));
}

beforeEach(() => {
  mockObtenerEventos.mockReset();
  mockFrom.mockReset();
  mockReclamarAviso.mockReset();
  mockNotifyTelegram.mockClear();
});

describe('GET /api/cron/streak-check', () => {
  it('sin secret válido: 401, no toca GitHub ni Supabase', async () => {
    const res = await GET(peticion('otro'));
    expect(res.status).toBe(401);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('racha insuficiente: no se envía, ni siquiera consulta los eventos de GitHub', async () => {
    filasSinRacha();
    const res = await GET(peticion());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.skipped).toBe(true);
    expect(body.reason).toBe('racha-insuficiente');
    expect(mockObtenerEventos).not.toHaveBeenCalled();
    expect(mockNotifyTelegram).not.toHaveBeenCalled();
  });

  it('racha en riesgo (sin commit hoy todavía): se envía', async () => {
    filasConRachaDe3();
    mockObtenerEventos.mockResolvedValue([]); // sin push hoy
    mockReclamarAviso.mockResolvedValue(true);
    const res = await GET(peticion());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockNotifyTelegram).toHaveBeenCalledWith(expect.stringContaining('racha'));
  });

  it('racha alta pero YA hubo commit hoy: no se envía', async () => {
    filasConRachaDe3();
    mockObtenerEventos.mockResolvedValue([{ type: 'PushEvent', created_at: `${HOY}T12:00:00Z` }]);
    const res = await GET(peticion());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.skipped).toBe(true);
    expect(body.reason).toBe('ya-hubo-commit-hoy');
    expect(mockNotifyTelegram).not.toHaveBeenCalled();
  });

  it('ya se avisó hoy (dedupe): no se vuelve a enviar', async () => {
    filasConRachaDe3();
    mockObtenerEventos.mockResolvedValue([]);
    mockReclamarAviso.mockResolvedValue(false);
    const res = await GET(peticion());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.skipped).toBe(true);
    expect(body.reason).toBe('ya-avisado-hoy');
    expect(mockNotifyTelegram).not.toHaveBeenCalled();
  });
});
