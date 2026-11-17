import { agregarVitales, percentil, type FilaVital } from '@/lib/analytics/aggregate-vitals';

describe('percentil (T-15)', () => {
  it('p75 de una lista conocida, por interpolación lineal', () => {
    // Ordenados: 1,2,3,4,5,6,7,8,9,10 → rango = 0.75*9 = 6.75 → interpola entre índices 6 y 7 (valores 7 y 8).
    expect(percentil([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 75)).toBeCloseTo(7.75, 2);
  });

  it('con un solo valor, devuelve ese valor sin importar el percentil', () => {
    expect(percentil([42], 75)).toBe(42);
  });

  it('sin valores, devuelve 0 en vez de lanzar', () => {
    expect(percentil([], 75)).toBe(0);
  });

  it('no depende del orden de entrada', () => {
    expect(percentil([5, 1, 3, 2, 4], 50)).toBe(percentil([1, 2, 3, 4, 5], 50));
  });
});

function fila(overrides: Partial<FilaVital>): FilaVital {
  return { metric: 'LCP', device: 'mobile', value: 1000, ...overrides };
}

describe('agregarVitales (T-15)', () => {
  it('separa el p75 por métrica y dispositivo, no los mezcla', () => {
    const filas = [
      fila({ metric: 'LCP', device: 'mobile', value: 4000 }),
      fila({ metric: 'LCP', device: 'desktop', value: 1000 }),
    ];
    const resumen = agregarVitales(filas);
    const movil = resumen.find((r) => r.metric === 'LCP' && r.device === 'mobile');
    const escritorio = resumen.find((r) => r.metric === 'LCP' && r.device === 'desktop');
    expect(movil?.p75).toBe(4000);
    expect(escritorio?.p75).toBe(1000);
  });

  it('cuenta las muestras de cada combinación', () => {
    const filas = [
      fila({ metric: 'CLS', device: 'mobile', value: 0.1 }),
      fila({ metric: 'CLS', device: 'mobile', value: 0.2 }),
      fila({ metric: 'CLS', device: 'mobile', value: 0.3 }),
    ];
    const resumen = agregarVitales(filas);
    expect(resumen[0].muestras).toBe(3);
  });

  it('sin filas: lista vacía, no lanza ni inventa una combinación en cero', () => {
    expect(agregarVitales([])).toEqual([]);
  });

  it('solo incluye combinaciones con al menos una muestra real', () => {
    const resumen = agregarVitales([fila({ metric: 'INP', device: 'desktop', value: 200 })]);
    expect(resumen).toHaveLength(1);
    expect(resumen.some((r) => r.metric === 'LCP')).toBe(false);
  });

  it('ordena por métrica (LCP, INP, CLS) y luego por dispositivo (mobile, desktop)', () => {
    const filas = [
      fila({ metric: 'CLS', device: 'desktop', value: 0.1 }),
      fila({ metric: 'LCP', device: 'desktop', value: 1000 }),
      fila({ metric: 'INP', device: 'mobile', value: 150 }),
      fila({ metric: 'LCP', device: 'mobile', value: 2000 }),
    ];
    const resumen = agregarVitales(filas);
    expect(resumen.map((r) => `${r.metric}:${r.device}`)).toEqual([
      'LCP:mobile',
      'LCP:desktop',
      'INP:mobile',
      'CLS:desktop',
    ]);
  });
});
