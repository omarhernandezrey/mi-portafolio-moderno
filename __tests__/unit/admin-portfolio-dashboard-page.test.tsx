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

// T-27: `leads`/`tickets` se consultan ahora con filtros encadenados
// (gte/lt/in/neq) para el 5.º KPI y la franja de Negocio — el mismo nombre
// de tabla recibe más de una consulta con filtros distintos, así que el
// conteo falso se decide por los filtros vistos, no solo por la tabla.
type FiltrosVistos = { gte?: string; lt?: string; in?: unknown; neq?: unknown; eq?: [string, unknown] };
let resolverConteo: (tabla: string, filtros: FiltrosVistos) => number = () => 0;
let erroresPorTabla: Record<string, string | undefined> = {};

function tablaConteoFalsa(tabla: string) {
  const filtros: FiltrosVistos = {};
  const builder = {
    select: () => builder,
    gte: (_campo: string, valor: string) => { filtros.gte = valor; return builder; },
    lt: (_campo: string, valor: string) => { filtros.lt = valor; return builder; },
    in: (_campo: string, valores: unknown) => { filtros.in = valores; return builder; },
    neq: (_campo: string, valor: unknown) => { filtros.neq = valor; return builder; },
    eq: (campo: string, valor: unknown) => { filtros.eq = [campo, valor]; return builder; },
    order: () => builder,
    limit: () => builder,
    then: (resolve: (v: { count: number | null; error: { message: string } | null }) => void) => {
      const mensaje = erroresPorTabla[tabla];
      resolve(mensaje ? { count: null, error: { message: mensaje } } : { count: resolverConteo(tabla, filtros), error: null });
    },
  };
  return builder;
}

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
      return tablaConteoFalsa(tabla);
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
    resolverConteo = () => 0;
    erroresPorTabla = {};
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

describe('PortafolioDashboardPage — 5.º KPI y franja de Negocio (T-27)', () => {
  beforeEach(() => {
    // Una fila mínima: solo interesa que `hayMetricas` sea true y el grid de
    // KPI se renderice; el contenido de estos tests es el KPI/franja nuevos.
    filasGithubMetrics = [filaMetrica({ daily_activity: [{ fecha: '2026-11-16', commits: 1 }] })];
    errorGithubMetrics = null;
    resolverConteo = () => 0;
    erroresPorTabla = {};
  });

  it('leads del sitio este mes, comparado con el anterior: cuenta solo contact_form/budget_calculator', async () => {
    resolverConteo = (tabla, filtros) => {
      if (tabla !== 'leads') return 0;
      if (filtros.in && filtros.lt) return 4; // mes anterior
      if (filtros.in && !filtros.lt) return 10; // este mes
      return 0;
    };

    const jsx = await PortafolioDashboardPage();
    render(jsx);

    const tarjeta = screen.getByText('LEADS DESDE EL SITIO ESTE MES').closest('article') as HTMLElement;
    expect(within(tarjeta).getByText('10')).toBeInTheDocument();
    expect(within(tarjeta).getByText('+150%')).toBeInTheDocument();
  });

  it('sin leads del sitio en el mes anterior: dice "Sin base", no inventa un porcentaje', async () => {
    resolverConteo = (tabla, filtros) => {
      if (tabla !== 'leads') return 0;
      if (filtros.in && filtros.lt) return 0; // mes anterior, sin base
      if (filtros.in && !filtros.lt) return 5;
      return 0;
    };

    const jsx = await PortafolioDashboardPage();
    render(jsx);

    const tarjeta = screen.getByText('LEADS DESDE EL SITIO ESTE MES').closest('article') as HTMLElement;
    expect(within(tarjeta).getByText('5')).toBeInTheDocument();
    expect(within(tarjeta).getByText('Sin base')).toBeInTheDocument();
  });

  it('si falla el conteo de leads del sitio, el KPI muestra — en vez de un cero falso', async () => {
    erroresPorTabla.leads = 'tabla caída';

    const jsx = await PortafolioDashboardPage();
    render(jsx);

    const tarjeta = screen.getByText('LEADS DESDE EL SITIO ESTE MES').closest('article') as HTMLElement;
    expect(within(tarjeta).getByText('—')).toBeInTheDocument();
  });

  it('franja de Negocio: leads nuevos (todas las fuentes) y tickets urgentes, con enlaces a cada sección', async () => {
    resolverConteo = (tabla, filtros) => {
      if (tabla === 'leads' && !filtros.in) return 3; // total del mes, sin filtrar por source
      if (tabla === 'tickets') return 1;
      return 0;
    };

    const jsx = await PortafolioDashboardPage();
    render(jsx);

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('leads nuevos este mes')).toBeInTheDocument();
    expect(screen.getByText('ticket urgente')).toBeInTheDocument(); // singular con 1

    const enlaceLeads = screen.getByRole('link', { name: /leads nuevos este mes/i });
    expect(enlaceLeads).toHaveAttribute('href', '/admin/leads');
    const enlaceTickets = screen.getByRole('link', { name: /ticket urgente/i });
    expect(enlaceTickets).toHaveAttribute('href', '/admin/tickets');
  });

  it('sin tickets urgentes, el número queda neutro: el color no narra una urgencia que no existe', async () => {
    resolverConteo = (tabla, filtros) => (tabla === 'leads' && !filtros.in ? 2 : 0);

    const jsx = await PortafolioDashboardPage();
    render(jsx);

    const enlaceTickets = screen.getByRole('link', { name: /tickets urgentes/i });
    const numero = within(enlaceTickets).getByText('0');
    expect(numero.className).not.toContain('admin-warning');
  });

  it('si falla una de las dos consultas de la franja, no se muestra una franja a medias', async () => {
    erroresPorTabla.tickets = 'tabla caída';

    const jsx = await PortafolioDashboardPage();
    render(jsx);

    expect(screen.queryByText('Mientras tanto en Negocio')).not.toBeInTheDocument();
  });

  it('el encabezado cuenta proyectos PUBLICADOS, no los borradores que propone el sync de GitHub (T-21)', async () => {
    const conteos: Record<string, { count: number; filtroPublicado: boolean }> = {
      portfolio_projects: { count: 0, filtroPublicado: false },
      portfolio_skills: { count: 0, filtroPublicado: false },
    };
    resolverConteo = (tabla, filtros) => {
      if (tabla in conteos) {
        conteos[tabla].filtroPublicado = filtros.eq?.[0] === 'is_published' && filtros.eq?.[1] === true;
      }
      return tabla === 'portfolio_projects' ? 22 : tabla === 'portfolio_skills' ? 8 : 0;
    };

    const jsx = await PortafolioDashboardPage();
    render(jsx);

    expect(screen.getByText('· 22 proyectos · 8 skills publicados')).toBeInTheDocument();
    expect(conteos.portfolio_projects.filtroPublicado).toBe(true); // filtra is_published
    expect(conteos.portfolio_skills.filtroPublicado).toBe(false); // skills no tiene borradores que excluir
  });
});
