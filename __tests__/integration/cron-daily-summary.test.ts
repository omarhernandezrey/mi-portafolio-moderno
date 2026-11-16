/**
 * Tests del resumen diario de Telegram (T-16).
 *
 * `supabaseServer` y `notifyTelegram` se simulan: nunca se llama a la API
 * real de Telegram ni a una base de datos real.
 */
jest.mock('@/config/env', () => ({
  serverEnv: {
    CRON_SECRET: 'test-cron-secret-largo',
  },
}));

const mockNotify = jest.fn().mockResolvedValue({ sent: true });
jest.mock('@/lib/chatbot/telegram', () => ({
  notifyTelegram: (...args: unknown[]) => mockNotify(...args),
}));

function cadenaFalsa(respuestas: Array<{ data?: unknown; count?: unknown; error?: unknown }>) {
  let i = 0;
  return jest.fn(() => {
    const resultado = respuestas[i] ?? { data: [], error: null };
    i += 1;
    const encadenable: Record<string, unknown> = {};
    const self = () => encadenable;
    for (const metodo of ['select', 'eq', 'gte', 'lt', 'in', 'order', 'limit']) {
      encadenable[metodo] = jest.fn(self);
    }
    encadenable.then = (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
      Promise.resolve(resultado).then(resolve, reject);
    return encadenable;
  });
}

jest.mock('@/lib/supabaseServer', () => ({ supabaseServer: { from: jest.fn() } }));

import { NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { GET } from '@/app/api/cron/daily-summary/route';
import { construirResumenDiario, formatearPagos, resumirPendientes, topServicio } from '@/lib/chatbot/dailySummary';

function peticionAutenticada() {
  return new NextRequest('http://localhost/api/cron/daily-summary', {
    headers: { authorization: 'Bearer test-cron-secret-largo' },
  });
}

/** Orden real de las 4 consultas que hace la ruta: leads nuevos, pendientes, pagados, servicios. */
function mockearConsultas(opts: {
  leadsCount?: number;
  pendientes?: { created_at: string }[];
  pagados?: { budget: string | null }[];
  servicios?: { service_requested: string | null }[];
}) {
  (supabaseServer.from as jest.Mock) = cadenaFalsa([
    { count: opts.leadsCount ?? 0, error: null },
    { data: opts.pendientes ?? [], error: null },
    { data: opts.pagados ?? [], error: null },
    { data: opts.servicios ?? [], error: null },
  ]);
}

beforeEach(() => {
  mockNotify.mockClear();
});

describe('helpers puros', () => {
  it('resumirPendientes separa los que llevan más de 48h', () => {
    const ahora = new Date('2026-01-10T12:00:00Z');
    const pendientes = [
      { created_at: '2026-01-10T11:00:00Z' }, // 1h: reciente
      { created_at: '2026-01-08T00:00:00Z' }, // >48h: viejo
      { created_at: '2026-01-07T00:00:00Z' }, // >48h: viejo
    ];
    expect(resumirPendientes(pendientes, ahora)).toEqual({ total: 3, viejos: 2 });
  });

  it('formatearPagos devuelve null sin pagos, no el texto "Sin pagos confirmados"', () => {
    expect(formatearPagos([])).toBeNull();
    expect(formatearPagos([{ budget: '$1200 USD' }])).toContain('1,200');
  });

  it('topServicio devuelve null sin leads, no "N/A"', () => {
    expect(topServicio([])).toBeNull();
    expect(topServicio([{ service_requested: 'SEO' }, { service_requested: 'SEO' }, { service_requested: 'Web' }])).toBe('SEO');
  });

  it('construirResumenDiario: sin ninguna señal, se salta', () => {
    const resultado = construirResumenDiario({
      leadsCount: 0,
      pendientes: { total: 2, viejos: 0 },
      pagosLabel: null,
      servicioTop: null,
    });
    expect(resultado.skip).toBe(true);
  });

  it('construirResumenDiario: con pagos y sin leads, hay sección de pagos y no de leads', () => {
    const resultado = construirResumenDiario({
      leadsCount: 0,
      pendientes: { total: 0, viejos: 0 },
      pagosLabel: '$1,200',
      servicioTop: null,
    });
    expect(resultado.skip).toBe(false);
    if (!resultado.skip) {
      expect(resultado.mensaje).toContain('💰');
      expect(resultado.mensaje).not.toContain('🎯');
    }
  });
});

describe('GET /api/cron/daily-summary', () => {
  it('día sin actividad: no llama a Telegram y responde skipped', async () => {
    mockearConsultas({});
    const res = await GET(peticionAutenticada());
    const body = await res.json();
    expect(body.skipped).toBe(true);
    expect(mockNotify).not.toHaveBeenCalled();
  });

  it('día con leads: envía y el texto trae los números reales', async () => {
    mockearConsultas({
      leadsCount: 3,
      servicios: [
        { service_requested: 'Sitios Web' },
        { service_requested: 'Sitios Web' },
        { service_requested: 'SEO' },
      ],
    });
    const res = await GET(peticionAutenticada());
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(mockNotify).toHaveBeenCalledTimes(1);
    const mensaje = mockNotify.mock.calls[0][0] as string;
    expect(mensaje).toContain('3 leads nuevos');
    expect(mensaje).toContain('Sitios Web');
    expect(mensaje).not.toContain('N/A');
  });

  it('día con pagos y sin leads: sección de pagos presente, de leads ausente', async () => {
    mockearConsultas({ pagados: [{ budget: '$1200 USD' }] });
    const res = await GET(peticionAutenticada());
    await res.json();
    expect(mockNotify).toHaveBeenCalledTimes(1);
    const mensaje = mockNotify.mock.calls[0][0] as string;
    expect(mensaje).toContain('💰');
    expect(mensaje).not.toContain('🎯');
  });

  it('pendientes solo recientes (ninguno > 48h): no se mencionan', async () => {
    const haceUnaHora = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    mockearConsultas({ leadsCount: 1, pendientes: [{ created_at: haceUnaHora }] });
    const res = await GET(peticionAutenticada());
    await res.json();
    const mensaje = mockNotify.mock.calls[0][0] as string;
    expect(mensaje).not.toContain('⏳');
  });

  it('sin CRON_SECRET válido: 401, no consulta nada', async () => {
    mockearConsultas({ leadsCount: 99 });
    const req = new NextRequest('http://localhost/api/cron/daily-summary', {
      headers: { authorization: 'Bearer otra-cosa' },
    });
    const res = await GET(req);
    expect(res.status).toBe(401);
    expect(mockNotify).not.toHaveBeenCalled();
  });
});

describe('guardarraíl: sin plantillas fijas en los cron de Telegram', () => {
  it('ningún texto de los cron contiene N/A o "Sin pagos confirmados" como literal fijo', () => {
    const fs = require('node:fs') as typeof import('node:fs');
    const path = require('node:path') as typeof import('node:path');
    const dir = path.join(process.cwd(), 'src/app/api/cron');
    const archivos = fs.readdirSync(dir, { recursive: true, encoding: 'utf8' }) as string[];
    const rutas = archivos.filter((f) => f.endsWith('.ts')).map((f) => path.join(dir, f));
    for (const ruta of rutas) {
      // Los comentarios de este mismo cambio citan las plantillas viejas para
      // explicar por qué ya no están: se quitan antes de buscarlas en el código.
      const sinComentarios = fs
        .readFileSync(ruta, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '');
      expect(sinComentarios).not.toContain("'N/A'");
      expect(sinComentarios).not.toContain('"N/A"');
      expect(sinComentarios).not.toContain('Sin pagos confirmados');
    }
  });
});
