import { vitalsEventSchema } from '@/lib/analytics/schemas';

describe('vitalsEventSchema (T-15)', () => {
  it('acepta una carga útil válida', () => {
    const resultado = vitalsEventSchema.safeParse({
      path: '/es/sobre-mi',
      device: 'mobile',
      metric: 'LCP',
      value: 1823.4,
    });
    expect(resultado.success).toBe(true);
  });

  it.each([
    ['metric fuera de la lista cerrada', { path: '/', device: 'mobile', metric: 'FCP', value: 1 }],
    ['device fuera de la lista cerrada', { path: '/', device: 'tablet', metric: 'LCP', value: 1 }],
    ['value negativo', { path: '/', device: 'mobile', metric: 'CLS', value: -0.1 }],
    ['value no finito', { path: '/', device: 'mobile', metric: 'LCP', value: Infinity }],
    ['path vacío', { path: '', device: 'mobile', metric: 'LCP', value: 1 }],
    ['falta metric', { path: '/', device: 'mobile', value: 1 }],
  ])('rechaza: %s', (_nombre, carga) => {
    expect(vitalsEventSchema.safeParse(carga).success).toBe(false);
  });
});
