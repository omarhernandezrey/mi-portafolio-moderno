/**
 * @jest-environment jsdom
 */

/**
 * Resumen del portafolio (T-14): KPI de cabecera + 4 gráficas, con datos
 * reales de `github_metrics`. Igual que en T-13, se fija `hoy` indirectamente
 * vía los datos de prueba para no depender del reloj real.
 */
import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, within } from '@testing-library/react';

type FilaFalsa = { repo: string; daily_activity: unknown; languages_bytes: unknown; captured_at: string };

let filasGithubMetrics: FilaFalsa[] = [];
let errorGithubMetrics: { message: string } | null = null;

jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: {
    from: (tabla: string) => {
      if (tabla === 'github_metrics') {
        return {
          select: () => ({
            order: async () => ({ data: filasGithubMetrics, error: errorGithubMetrics }),
          }),
        };
      }
      return {
        select: async () => ({ count: 0, error: null }),
      };
    },
  },
}));

import PortafolioDashboardPage from '@/app/admin/(dashboard)/page';

function filaMetrica(overrides: Partial<FilaFalsa> = {}): FilaFalsa {
  return {
    repo: 'omarhernandezrey/portafolio',
    daily_activity: [],
    languages_bytes: {},
    captured_at: '2026-11-16',
    ...overrides,
  };
}

describe('PortafolioDashboardPage — KPI y gráficas (T-14)', () => {
  beforeEach(() => {
    filasGithubMetrics = [];
    errorGithubMetrics = null;
  });

  it('sin filas en github_metrics: muestra el estado vacío, no KPI ni gráficas', async () => {
    const jsx = await PortafolioDashboardPage();
    render(jsx);

    expect(screen.getByText('Aún sin panel de métricas')).toBeInTheDocument();
    expect(screen.queryByText(/COMMITS, ÚLTIMOS 30 DÍAS/i)).not.toBeInTheDocument();
  });

  it('con filas reales: muestra los 4 KPI calculados y las 4 gráficas, sin el estado vacío', async () => {
    filasGithubMetrics = [
      filaMetrica({
        repo: 'omarhernandezrey/portafolio',
        daily_activity: [
          { fecha: '2026-11-15', commits: 4 },
          { fecha: '2026-11-10', commits: 2 },
        ],
        languages_bytes: { TypeScript: 900, CSS: 100 },
      }),
      filaMetrica({
        repo: 'omarhernandezrey/otro-repo',
        daily_activity: [{ fecha: '2026-11-16', commits: 1 }],
        languages_bytes: { TypeScript: 300 },
      }),
    ];

    const jsx = await PortafolioDashboardPage();
    render(jsx);

    expect(screen.queryByText('Aún sin panel de métricas')).not.toBeInTheDocument();

    // 3 días con actividad combinada (15, 10 y 16 de noviembre) → racha actual de 1 (hoy, el 16).
    expect(screen.getByText('COMMITS, ÚLTIMOS 30 DÍAS')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument(); // 4 + 2 + 1
    expect(screen.getByText('REPOSITORIOS ACTIVOS')).toBeInTheDocument();
    expect(screen.getByText('LENGUAJE PRINCIPAL')).toBeInTheDocument();
    expect(screen.getAllByText('TypeScript').length).toBeGreaterThan(0); // aparece en el KPI y en la gráfica de lenguajes

    expect(screen.getByText('Actividad diaria (últimos 90 días)')).toBeInTheDocument();
    expect(screen.getByText('Mapa de contribuciones')).toBeInTheDocument();
    expect(screen.getByText('Lenguajes (bytes agregados)')).toBeInTheDocument();
    expect(screen.getByText('Commits por repositorio (30 días)')).toBeInTheDocument();
  });

  it('con repos capturados pero sin languages_bytes (cron aún no corrió desde T-14): KPI de lenguaje en estado vacío propio', async () => {
    filasGithubMetrics = [
      filaMetrica({ daily_activity: [{ fecha: '2026-11-16', commits: 1 }], languages_bytes: {} }),
    ];

    const jsx = await PortafolioDashboardPage();
    render(jsx);

    const tarjetaLenguaje = screen.getByText('LENGUAJE PRINCIPAL').closest('article') as HTMLElement;
    expect(within(tarjetaLenguaje).getByText('Sin datos')).toBeInTheDocument();
  });
});
