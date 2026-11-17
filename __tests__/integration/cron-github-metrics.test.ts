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
// T-21: `portfolio_projects` necesita su propio `select`/`insert` — por
// omisión, "sin proyectos todavía" (`data: []`), para que proponer un
// borrador no choque con nada en los tests que no son de T-21.
const mockProjectsSelect = jest.fn().mockResolvedValue({ data: [], error: null });
const mockProjectsInsert = jest.fn().mockResolvedValue({ error: null });
jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: {
    from: jest.fn((tabla: string) => {
      if (tabla === 'portfolio_projects') {
        return { select: mockProjectsSelect, insert: mockProjectsInsert };
      }
      return { upsert: mockUpsert };
    }),
  },
}));

const mockNotifyTelegram = jest.fn().mockResolvedValue({ sent: true });
jest.mock('@/lib/chatbot/telegram', () => ({
  notifyTelegram: (...args: unknown[]) => mockNotifyTelegram(...args),
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
    languagesBytes: { TypeScript: 1000 },
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
  mockProjectsSelect.mockClear();
  mockProjectsSelect.mockResolvedValue({ data: [], error: null });
  mockProjectsInsert.mockClear();
  mockProjectsInsert.mockResolvedValue({ error: null });
  mockNotifyTelegram.mockClear();
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

  it('el cupo agotado detiene toda la corrida: no empieza repos nuevos (los 5 workers concurrentes ya en vuelo sí terminan)', async () => {
    // 7 repos con CONCURRENCIA=5: los primeros 5 arrancan a la vez (uno de
    // ellos agota el cupo); el 6.º y 7.º solo los tomaría un worker que
    // volviera por más, y para entonces ya está "detener" en true.
    const repos = ['r0', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6'];
    mockObtenerRepos.mockResolvedValue(repos);
    mockObtenerMetricas.mockImplementation(async (repo: string) => {
      if (repo === 'r0') {
        throw new CupoAgotadoError('Cupo de la API de GitHub casi agotado (10 peticiones restantes). Se reinicia: luego.');
      }
      return metricasDe(repo);
    });

    const res = await GET(peticion());
    const body = await res.json();

    expect(body.completo).toBe(false);
    expect(body.procesados).toBe(4); // r1..r4
    expect(body.saltados).toEqual([{ repo: 'r0', motivo: expect.stringContaining('Cupo') }]);
    expect(body.pendientes).toEqual(['r5', 'r6']);
    expect(mockObtenerMetricas).not.toHaveBeenCalledWith('r5');
    expect(mockObtenerMetricas).not.toHaveBeenCalledWith('r6');
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

// T-21: un repo nuevo (sin fila en portfolio_projects) se propone como
// borrador; uno que ya tiene proyecto no se vuelve a proponer.
describe('T-21: proponer proyectos nuevos desde GitHub', () => {
  it('un repo sin proyecto todavía: se inserta como borrador (is_published: false) y avisa por Telegram', async () => {
    mockObtenerRepos.mockResolvedValue(['omarhernandezrey/proyecto-nuevo']);
    mockObtenerMetricas.mockImplementation(async (repo: string) => metricasDe(repo));

    const res = await GET(peticion());
    const body = await res.json();

    expect(body.propuestos).toEqual(['proyecto-nuevo']);
    expect(mockProjectsInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'proyecto-nuevo',
        repository: 'https://github.com/omarhernandezrey/proyecto-nuevo',
        is_published: false,
        technologies: ['TypeScript'],
      }),
    );
    expect(mockNotifyTelegram).toHaveBeenCalledWith(expect.stringContaining('proyecto-nuevo'));
  });

  it('un repo que ya tiene proyecto: no se propone ni se avisa de nuevo (sin novedad no hay mensaje)', async () => {
    mockObtenerRepos.mockResolvedValue(['omarhernandezrey/ya-existe']);
    mockObtenerMetricas.mockImplementation(async (repo: string) => metricasDe(repo));
    mockProjectsSelect.mockResolvedValue({
      data: [{ slug: 'ya-existe', repository: 'https://github.com/omarhernandezrey/ya-existe' }],
      error: null,
    });

    const res = await GET(peticion());
    const body = await res.json();

    expect(body.propuestos).toEqual([]);
    expect(mockProjectsInsert).not.toHaveBeenCalled();
    expect(mockNotifyTelegram).not.toHaveBeenCalled();
  });

  it('dos repos nuevos con el mismo slug derivado: el segundo no choca, se le suma un sufijo', async () => {
    mockObtenerRepos.mockResolvedValue(['omarhernandezrey/demo', 'otraCuenta/Demo']);
    mockObtenerMetricas.mockImplementation(async (repo: string) => metricasDe(repo));

    const res = await GET(peticion());
    const body = await res.json();

    expect(body.propuestos).toEqual(['demo', 'demo-2']);
  });

  it('sin repos procesados (todos fallaron): no intenta proponer nada', async () => {
    mockObtenerRepos.mockResolvedValue(['omarhernandezrey/rota']);
    mockObtenerMetricas.mockRejectedValue(new Error('404'));

    const res = await GET(peticion());
    const body = await res.json();

    expect(body.propuestos).toEqual([]);
    expect(mockProjectsSelect).not.toHaveBeenCalled();
  });
});
