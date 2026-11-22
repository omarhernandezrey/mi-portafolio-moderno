/**
 * Las dos rutas del registro real de disponibilidad.
 *
 * Nacen para que `/status` pueda dibujar un histórico de verdad: la gráfica
 * anterior no leía nada (alturas `Math.random()`, «100% Stability» por barra).
 * Lo que se protege aquí:
 *
 *  - el cron exige `CRON_SECRET` y NO da por registrado lo que no se guardó;
 *  - escribe la MISMA comprobación que sirve `/api/health`, no una paralela;
 *  - el histórico público acota la consulta y nunca devuelve filas crudas.
 */
const mockFrom = jest.fn();
jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: { from: (...a: unknown[]) => mockFrom(...a) },
}));

const mockRequireCronAuth = jest.fn();
jest.mock('@/lib/cronAuth', () => ({
  requireCronAuth: (...a: unknown[]) => mockRequireCronAuth(...a),
  // La ruta usa la variante acotada, que acepta además `UPTIME_CRON_SECRET`
  // para poder dársela a un disparador externo sin entregarle las otras diez
  // rutas. Su lógica se prueba aparte, en
  // `__tests__/unit/uptime-cron-secreto-acotado.test.ts`.
  requireUptimeCronAuth: (...a: unknown[]) => mockRequireCronAuth(...a),
}));

const mockComprobarSalud = jest.fn();
jest.mock('@/lib/health/check', () => ({
  comprobarSalud: (...a: unknown[]) => mockComprobarSalud(...a),
}));

import { NextRequest, NextResponse } from 'next/server';
import { GET as registrar } from '@/app/api/cron/uptime-record/route';
import { GET as historial } from '@/app/api/uptime/history/route';

const SALUD = {
  status: 'operational' as const,
  timestamp: '2026-11-22T18:00:00.000Z',
  latency_ms: 137,
  services: {
    database: { status: 'operational' as const, latency: 42 },
    llm_gateway: { status: 'unknown' as const },
  },
};

function peticion() {
  return new NextRequest('http://localhost/api/cron/uptime-record');
}

beforeEach(() => {
  jest.clearAllMocks();
  mockRequireCronAuth.mockReturnValue(null); // autorizado
  mockComprobarSalud.mockResolvedValue(SALUD);
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('GET /api/cron/uptime-record', () => {
  it('sin el secreto del cron no registra nada', async () => {
    mockRequireCronAuth.mockReturnValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    );

    const res = await registrar(peticion());

    expect(res.status).toBe(401);
    expect(mockFrom).not.toHaveBeenCalled();
    expect(mockComprobarSalud).not.toHaveBeenCalled();
  });

  it('guarda una fila con lo que midió la comprobación compartida', async () => {
    const insert = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ insert });

    const res = await registrar(peticion());

    expect(res.status).toBe(200);
    expect(mockFrom).toHaveBeenCalledWith('uptime_checks');
    // Los valores salen de `comprobarSalud`, no se recalculan aquí: así la
    // página pública y el registro no pueden discrepar.
    expect(insert).toHaveBeenCalledWith({
      checked_at: SALUD.timestamp,
      status: 'operational',
      latency_ms: 137,
      database_status: 'operational',
      database_latency_ms: 42,
    });
  });

  it('registra un estado degradado tal cual, sin maquillarlo', async () => {
    mockComprobarSalud.mockResolvedValue({
      ...SALUD,
      status: 'degraded',
      latency_ms: 2500,
      services: {
        database: { status: 'degraded', latency: 2400 },
        llm_gateway: { status: 'unknown' },
      },
    });
    const insert = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ insert });

    await registrar(peticion());

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'degraded', database_status: 'degraded' }),
    );
  });

  it('si el insert falla, responde error en vez de decir que registró', async () => {
    const insert = jest.fn().mockResolvedValue({
      error: { code: '42501', message: 'permission denied' },
    });
    mockFrom.mockReturnValue({ insert });

    const res = await registrar(peticion());

    expect(res.status).toBeGreaterThanOrEqual(400);
    const cuerpo = await res.json();
    expect(cuerpo.success).toBeUndefined();
  });
});

describe('GET /api/uptime/history', () => {
  /** `select(...).gte(...).order(...).limit(...)` */
  function consultaDevuelve(data: unknown, error: unknown = null) {
    const limit = jest.fn().mockResolvedValue({ data, error });
    const order = jest.fn(() => ({ limit }));
    const gte = jest.fn(() => ({ order }));
    const select = jest.fn(() => ({ gte }));
    return { mock: { select }, limit, order, gte, select };
  }

  it('devuelve 90 tramos agregados, no las filas crudas', async () => {
    const q = consultaDevuelve([
      { checked_at: new Date().toISOString(), status: 'operational', latency_ms: 100 },
    ]);
    mockFrom.mockReturnValue(q.mock);

    const res = await historial();
    const cuerpo = await res.json();

    expect(res.status).toBe(200);
    expect(mockFrom).toHaveBeenCalledWith('uptime_checks');
    expect(cuerpo.dias).toHaveLength(90);
    expect(cuerpo.totalComprobaciones).toBe(1);
    // Nada de `checked_at` suelto viajando al navegador.
    expect(JSON.stringify(cuerpo)).not.toContain('checked_at');
  });

  it('acota la consulta: ningún select sin tope', async () => {
    const q = consultaDevuelve([]);
    mockFrom.mockReturnValue(q.mock);

    await historial();

    expect(q.limit).toHaveBeenCalled();
    const tope = q.limit.mock.calls[0][0];
    expect(typeof tope).toBe('number');
    expect(tope).toBeGreaterThan(0);
  });

  it('sin datos devuelve la ventana completa con porcentaje null, no 0', async () => {
    const q = consultaDevuelve([]);
    mockFrom.mockReturnValue(q.mock);

    const cuerpo = await (await historial()).json();

    expect(cuerpo.dias).toHaveLength(90);
    expect(cuerpo.porcentajeGlobal).toBeNull();
    expect(cuerpo.diasConDatos).toBe(0);
    expect(cuerpo.dias.every((d: { porcentaje: number | null }) => d.porcentaje === null)).toBe(true);
  });

  it('si la consulta falla, no inventa un historial vacío', async () => {
    const q = consultaDevuelve(null, { code: '42P01', message: 'no existe' });
    mockFrom.mockReturnValue(q.mock);

    const res = await historial();

    expect(res.status).toBeGreaterThanOrEqual(400);
    const cuerpo = await res.json();
    expect(cuerpo.dias).toBeUndefined();
  });
});
