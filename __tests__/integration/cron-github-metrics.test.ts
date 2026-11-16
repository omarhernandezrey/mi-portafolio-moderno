/**
 * Tests de `GET /api/cron/github-metrics` (T-13). `github.ts` y
 * `supabaseServer` se simulan: nunca se llama a la API real de GitHub desde
 * Jest (esa llamada real vive en `scripts/verify-github-metrics.ts`).
 */
jest.mock('@/config/env', () => ({
  serverEnv: {
    CRON_SECRET: 'test-cron-secret-largo',
    GITHUB_TOKEN: 'token-de-prueba',
  },
}));

const mockObtenerRepos = jest.fn();
const mockObtenerMetricas = jest.fn();
jest.mock('@/lib/github', () => {
  const real = jest.requireActual('@/lib/github');
  return {
    ...real,
    obtenerReposDelUsuario: (...args: unknown[]) => mockObtenerRepos(...args),
    obtenerMetricasDeRepositorio: (...args: unknown[]) => mockObtenerMetricas(...args),
  };
});

const mockUpsert = jest.fn().mockResolvedValue({ error: null });
jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: { from: jest.fn(() => ({ upsert: mockUpsert })) },
}));

import { NextRequest } from 'next/server';
import { CupoAgotadoError } from '@/lib/github';
import { GET } from '@/app/api/cron/github-metrics/route';

function peticion(secret = 'test-cron-secret-largo') {
  return new NextRequest('http://localhost/api/cron/github-metrics', {
    headers: { authorization: `Bearer ${secret}` },
  });
}

function metricasDe(repo: string) {
  return {
    repo,
    commits: 10,
    additions: 100,
    deletions: 20,
    languages: { TypeScript: 100 },
    stars: 1,
    forks: 0,
    openPrs: 0,
    closedPrs: 2,
    dailyActivity: [],
    currentStreak: 1,
    longestStreak: 3,
  };
}

beforeEach(() => {
  mockObtenerRepos.mockReset();
  mockObtenerMetricas.mockReset();
  mockUpsert.mockClear();
});

describe('GET /api/cron/github-metrics', () => {
  it('sin CRON_SECRET válido, responde como el resto de crons (401, sin tocar GitHub)', async () => {
    const res = await GET(peticion('otra-cosa'));
    expect(res.status).toBe(401);
    expect(mockObtenerRepos).not.toHaveBeenCalled();
  });

  it('procesa cada repositorio y lo sube a Supabase', async () => {
    mockObtenerRepos.mockResolvedValue(['omarhernandezrey/a', 'omarhernandezrey/b']);
    mockObtenerMetricas.mockImplementation(async (repo: string) => metricasDe(repo));

    const res = await GET(peticion());
    const body = await res.json();

    expect(body.success).toBe(true);
    expect(body.procesados).toBe(2);
    expect(body.saltados).toEqual([]);
    expect(mockUpsert).toHaveBeenCalledTimes(2);
  });

  it('un repositorio que falla por un motivo normal se salta; los demás siguen', async () => {
    mockObtenerRepos.mockResolvedValue(['omarhernandezrey/rota', 'omarhernandezrey/buena']);
    mockObtenerMetricas.mockImplementation(async (repo: string) => {
      if (repo === 'omarhernandezrey/rota') throw new Error('404: repo renombrado');
      return metricasDe(repo);
    });

    const res = await GET(peticion());
    const body = await res.json();

    expect(body.procesados).toBe(1);
    expect(body.saltados).toEqual([{ repo: 'omarhernandezrey/rota', motivo: '404: repo renombrado' }]);
  });

  it('el cupo agotado detiene toda la corrida (no sigue gastando lo poco que quede)', async () => {
    mockObtenerRepos.mockResolvedValue(['omarhernandezrey/a', 'omarhernandezrey/b', 'omarhernandezrey/c']);
    mockObtenerMetricas
      .mockResolvedValueOnce(metricasDe('omarhernandezrey/a'))
      .mockImplementationOnce(async () => {
        throw new CupoAgotadoError('Cupo de la API de GitHub casi agotado (10 peticiones restantes). Se reinicia: luego.');
      });

    const res = await GET(peticion());
    const body = await res.json();

    expect(body.procesados).toBe(1);
    expect(mockObtenerMetricas).toHaveBeenCalledTimes(2); // no llegó a "c"
  });

  it('sin GITHUB_TOKEN configurado, responde 503 identificable', async () => {
    const { serverEnv } = jest.requireMock('@/config/env') as { serverEnv: Record<string, string> };
    const original = serverEnv.GITHUB_TOKEN;
    serverEnv.GITHUB_TOKEN = '';
    try {
      const res = await GET(peticion());
      expect(res.status).toBe(503);
      expect(mockObtenerRepos).not.toHaveBeenCalled();
    } finally {
      serverEnv.GITHUB_TOKEN = original;
    }
  });
});
