/**
 * Agregación del resumen de GitHub para el panel (T-14). Todo puro: sin red
 * ni Supabase, para poder fijar `hoy` y probar la combinación entre repos
 * sin depender del reloj real ni de un mock de base de datos.
 */
import {
  agregarLenguajes,
  calcularRachaDePortafolio,
  calcularResumenDePortafolio,
  combinarActividadDiaria,
  type FilaMetricasRepo,
} from '@/lib/metrics/github-summary';

function fila(overrides: Partial<FilaMetricasRepo>): FilaMetricasRepo {
  return {
    repo: 'omarhernandezrey/x',
    daily_activity: [],
    languages_bytes: {},
    ...overrides,
  };
}

describe('combinarActividadDiaria', () => {
  it('suma los commits del mismo día entre repos distintos', () => {
    const filas = [
      fila({ repo: 'a', daily_activity: [{ fecha: '2026-11-10', commits: 2 }] }),
      fila({ repo: 'b', daily_activity: [{ fecha: '2026-11-10', commits: 3 }] }),
    ];
    const combinada = combinarActividadDiaria(filas);
    expect(combinada.get('2026-11-10')).toBe(5);
  });

  it('conserva días exclusivos de un solo repo', () => {
    const filas = [
      fila({ repo: 'a', daily_activity: [{ fecha: '2026-11-10', commits: 2 }] }),
      fila({ repo: 'b', daily_activity: [{ fecha: '2026-11-11', commits: 1 }] }),
    ];
    const combinada = combinarActividadDiaria(filas);
    expect(combinada.get('2026-11-10')).toBe(2);
    expect(combinada.get('2026-11-11')).toBe(1);
  });

  it('sin filas: mapa vacío, no lanza', () => {
    expect(combinarActividadDiaria([]).size).toBe(0);
  });
});

describe('agregarLenguajes', () => {
  it('suma bytes del mismo lenguaje entre repos y calcula el % sobre el total agregado', () => {
    const filas = [
      fila({ languages_bytes: { TypeScript: 700, CSS: 300 } }),
      fila({ languages_bytes: { TypeScript: 300 } }),
    ];
    const resultado = agregarLenguajes(filas);
    expect(resultado[0]).toEqual({ lenguaje: 'TypeScript', bytes: 1000, porcentaje: expect.closeTo(76.9, 0) });
    expect(resultado[1].lenguaje).toBe('CSS');
  });

  it('ordena de mayor a menor bytes, no por orden de aparición', () => {
    const filas = [fila({ languages_bytes: { CSS: 10, TypeScript: 900, HTML: 90 } })];
    const resultado = agregarLenguajes(filas);
    expect(resultado.map((r) => r.lenguaje)).toEqual(['TypeScript', 'HTML', 'CSS']);
  });

  it('sin languages_bytes en ningún repo (cron no ha corrido desde T-14): lista vacía, no lanza', () => {
    const filas = [fila({ languages_bytes: {} }), fila({ languages_bytes: {} })];
    expect(agregarLenguajes(filas)).toEqual([]);
  });
});

describe('calcularRachaDePortafolio', () => {
  it('un día con commit en CUALQUIER repo cuenta para la racha combinada, no solo el repo con más actividad', () => {
    // Repo A solo tiene el día 10; repo B solo el 11 y el 12. Ningún repo
    // por separado tiene una racha de 3, pero la actividad combinada sí.
    const filas = [
      fila({ repo: 'a', daily_activity: [{ fecha: '2026-11-10', commits: 1 }] }),
      fila({ repo: 'b', daily_activity: [{ fecha: '2026-11-11', commits: 1 }, { fecha: '2026-11-12', commits: 1 }] }),
    ];
    const combinada = combinarActividadDiaria(filas);
    const rachas = calcularRachaDePortafolio(combinada, '2026-11-12');
    expect(rachas.actual).toBe(3);
    expect(rachas.maxima).toBe(3);
  });

  it('sin actividad en ningún repo: racha 0', () => {
    expect(calcularRachaDePortafolio(new Map(), '2026-11-12')).toEqual({ actual: 0, maxima: 0 });
  });
});

describe('calcularResumenDePortafolio', () => {
  const HOY = '2026-11-16';

  it('estado vacío: sin filas, todo en cero/null, no lanza', () => {
    const resumen = calcularResumenDePortafolio([], HOY);
    expect(resumen.totalRepos).toBe(0);
    expect(resumen.reposActivos).toBe(0);
    expect(resumen.commitsUltimos30Dias).toBe(0);
    expect(resumen.variacionCommits30Dias).toBeNull();
    expect(resumen.rachaActual).toBe(0);
    expect(resumen.lenguajePrincipal).toBeNull();
    expect(resumen.lenguajesOrdenados).toEqual([]);
    expect(resumen.actividadReciente).toEqual([]);
    expect(resumen.commitsPorRepositorio).toEqual([]);
  });

  it('cuenta solo los commits dentro de los últimos 30 días, no los de hace 40', () => {
    const filas = [
      fila({
        repo: 'a',
        daily_activity: [
          { fecha: '2026-11-15', commits: 3 }, // dentro de la ventana
          { fecha: '2026-10-07', commits: 50 }, // hace 40 días: fuera
        ],
      }),
    ];
    const resumen = calcularResumenDePortafolio(filas, HOY);
    expect(resumen.commitsUltimos30Dias).toBe(3);
  });

  it('variación: compara contra los 30 días anteriores a esos 30, no contra todo el historial', () => {
    const filas = [
      fila({
        repo: 'a',
        daily_activity: [
          { fecha: '2026-11-15', commits: 20 }, // últimos 30 días
          { fecha: '2026-10-01', commits: 10 }, // periodo anterior (30-60 días atrás)
        ],
      }),
    ];
    const resumen = calcularResumenDePortafolio(filas, HOY);
    expect(resumen.commitsUltimos30Dias).toBe(20);
    expect(resumen.variacionCommits30Dias).toBeCloseTo(100, 0); // de 10 a 20 = +100%
  });

  it('sin actividad en el periodo anterior: variación es null, no Infinity ni un cero engañoso', () => {
    const filas = [fila({ repo: 'a', daily_activity: [{ fecha: '2026-11-15', commits: 5 }] })];
    const resumen = calcularResumenDePortafolio(filas, HOY);
    expect(resumen.variacionCommits30Dias).toBeNull();
  });

  it('repositorios activos: solo cuenta los que tuvieron >=1 commit en la ventana, no el total de repos capturados', () => {
    const filas = [
      fila({ repo: 'activo', daily_activity: [{ fecha: '2026-11-15', commits: 1 }] }),
      fila({ repo: 'inactivo', daily_activity: [{ fecha: '2026-01-01', commits: 5 }] }),
    ];
    const resumen = calcularResumenDePortafolio(filas, HOY);
    expect(resumen.totalRepos).toBe(2);
    expect(resumen.reposActivos).toBe(1);
  });

  it('commitsPorRepositorio: uno por repo, ordenado de mayor a menor, dentro de la ventana de 30 días', () => {
    const filas = [
      fila({ repo: 'poco', daily_activity: [{ fecha: '2026-11-15', commits: 2 }] }),
      fila({ repo: 'mucho', daily_activity: [{ fecha: '2026-11-14', commits: 9 }] }),
    ];
    const resumen = calcularResumenDePortafolio(filas, HOY);
    expect(resumen.commitsPorRepositorio).toEqual([
      { repo: 'mucho', commits: 9 },
      { repo: 'poco', commits: 2 },
    ]);
  });

  it('actividadReciente viene en orden cronológico, no en el orden en que llegaron los repos', () => {
    const filas = [
      fila({ repo: 'a', daily_activity: [{ fecha: '2026-11-15', commits: 1 }] }),
      fila({ repo: 'b', daily_activity: [{ fecha: '2026-11-10', commits: 2 }] }),
    ];
    const resumen = calcularResumenDePortafolio(filas, HOY);
    const fechas = resumen.actividadReciente.map((d) => d.fecha);
    expect(fechas).toEqual([...fechas].sort());
  });
});
