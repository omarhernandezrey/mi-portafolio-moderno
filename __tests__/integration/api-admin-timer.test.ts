/**
 * `POST|GET /api/admin/timer` — cronómetro de horas facturables.
 *
 * Tres defectos reales de la auditoría de backend (grupo "corrección de
 * datos"), todos sobre la columna de la que salen las horas del informe:
 *
 * 1. Sin zod: `projectId` entraba directo al insert (FK a `leads`),
 *    `description` sin tope y `entryId` sin forma de UUID (un id mal
 *    formado daba 500 por `22P02` en vez de 400).
 * 2. `stop` no comprobaba `stopped_at`: volver a parar una entrada ya
 *    parada recalculaba la duración desde `started_at` hasta AHORA y la
 *    sobrescribía — 2 h paradas ayer pasaban a 26 h al re-pararlas hoy.
 * 3. El GET descartaba `error`, así que un fallo de BD se presentaba en el
 *    panel como «no hay cronómetros corriendo».
 */
const mockFrom = jest.fn();
jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: { from: (...a: unknown[]) => mockFrom(...a) },
}));

const mockRequireAdmin = jest.fn();
jest.mock('@/lib/admin/auth', () => ({
  requireAdmin: (...a: unknown[]) => mockRequireAdmin(...a),
}));

const mockWriteAuditLog = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/admin/audit', () => ({
  writeAuditLog: (...a: unknown[]) => mockWriteAuditLog(...a),
}));

import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/admin/timer/route';

const UUID_PROYECTO = '11111111-1111-4111-8111-111111111111';
const UUID_ENTRADA = '22222222-2222-4222-8222-222222222222';

function post(body: unknown) {
  return new NextRequest('http://localhost/api/admin/timer', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** `select(...).eq(...).maybeSingle()` devuelve la entrada dada. */
function lecturaDevuelve(entrada: unknown, error: unknown = null) {
  return {
    select: () => ({
      eq: () => ({ maybeSingle: async () => ({ data: entrada, error }) }),
    }),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockRequireAdmin.mockResolvedValue({
    ok: true, user: { id: 'u1' }, role: 'owner', email: 'o@test.com', actor: { userId: 'u1' },
  });
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  void errorSpy;
});

afterEach(() => jest.restoreAllMocks());

describe('POST /api/admin/timer — validación', () => {
  it('rechaza una acción desconocida sin tocar la base', async () => {
    const res = await POST(post({ action: 'pausar', entryId: UUID_ENTRADA }));
    expect(res.status).toBe(400);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('start sin projectId válido → 400, no un 500 por la FK', async () => {
    const res = await POST(post({ action: 'start', projectId: 'no-es-uuid' }));
    expect(res.status).toBe(400);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('stop con entryId mal formado → 400, no 500 por 22P02', async () => {
    const res = await POST(post({ action: 'stop', entryId: 'abc' }));
    expect(res.status).toBe(400);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('rechaza una descripción desmesurada', async () => {
    const res = await POST(
      post({ action: 'start', projectId: UUID_PROYECTO, description: 'x'.repeat(600) })
    );
    expect(res.status).toBe(400);
  });

  it('cuerpo que no es JSON → 400', async () => {
    const req = new NextRequest('http://localhost/api/admin/timer', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'no-es-json',
    });
    expect((await POST(req)).status).toBe(400);
  });
});

describe('POST /api/admin/timer — parar', () => {
  it('no vuelve a parar un cronómetro ya parado: 409 y duración intacta', async () => {
    mockFrom.mockReturnValue(
      lecturaDevuelve({
        started_at: '2026-11-19T10:00:00.000Z',
        stopped_at: '2026-11-19T12:00:00.000Z',
        duration_seconds: 7200,
      })
    );

    const res = await POST(post({ action: 'stop', entryId: UUID_ENTRADA }));
    const cuerpo = await res.json();

    expect(res.status).toBe(409);
    // Devuelve la duración real para que el panel pueda mostrarla.
    expect(cuerpo.durationSeconds).toBe(7200);
    // Y, sobre todo, no audita una parada que no ocurrió.
    expect(mockWriteAuditLog).not.toHaveBeenCalled();
  });

  it('un cronómetro inexistente es 404, no 500', async () => {
    mockFrom.mockReturnValue(lecturaDevuelve(null));
    const res = await POST(post({ action: 'stop', entryId: UUID_ENTRADA }));
    expect(res.status).toBe(404);
  });

  it('un cronómetro activo sí se para y se audita', async () => {
    const iniciado = new Date(Date.now() - 60_000).toISOString();
    mockFrom.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: { started_at: iniciado, stopped_at: null, duration_seconds: null },
            error: null,
          }),
        }),
      }),
      update: () => ({
        eq: () => ({
          is: () => ({
            select: () => ({
              maybeSingle: async () => ({ data: { id: UUID_ENTRADA }, error: null }),
            }),
          }),
        }),
      }),
    }));

    const res = await POST(post({ action: 'stop', entryId: UUID_ENTRADA }));
    expect(res.status).toBe(200);
    expect(mockWriteAuditLog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ action: 'timer.stop' })
    );
  });
});

describe('GET /api/admin/timer', () => {
  it('un fallo de base NO se presenta como "no hay cronómetros"', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        is: () => ({
          order: async () => ({ data: null, error: { message: 'conexión caída' } }),
        }),
      }),
    });

    const res = await GET();
    expect(res.status).toBe(500);
  });

  it('sin cronómetros activos devuelve una lista vacía con 200', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        is: () => ({ order: async () => ({ data: [], error: null }) }),
      }),
    });

    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });
});
