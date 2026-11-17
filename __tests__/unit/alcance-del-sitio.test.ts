import {
  FUENTES_DEL_SITIO,
  bogotaStartOfMonth,
  calcularVariacionMensual,
} from '@/lib/admin/alcanceDelSitio';

describe('FUENTES_DEL_SITIO', () => {
  it('es exactamente formulario + calculadora, nunca chatbot ni manual', () => {
    expect(FUENTES_DEL_SITIO).toEqual(['contact_form', 'budget_calculator']);
  });
});

describe('bogotaStartOfMonth', () => {
  it('el mes actual cae a medianoche Bogotá del día 1', () => {
    // 2026-11-17 15:00 UTC = 2026-11-17 10:00 Bogotá (UTC-5)
    const ahora = new Date('2026-11-17T15:00:00.000Z');
    const inicio = bogotaStartOfMonth(0, ahora);
    // Medianoche Bogotá del 1 de noviembre = 05:00 UTC.
    expect(inicio.toISOString()).toBe('2026-11-01T05:00:00.000Z');
  });

  it('un mes atrás retrocede de noviembre a octubre', () => {
    const ahora = new Date('2026-11-17T15:00:00.000Z');
    const inicio = bogotaStartOfMonth(1, ahora);
    expect(inicio.toISOString()).toBe('2026-10-01T05:00:00.000Z');
  });

  it('cruza el año: enero menos un mes es diciembre del año anterior', () => {
    const ahora = new Date('2027-01-05T03:00:00.000Z');
    const inicio = bogotaStartOfMonth(1, ahora);
    expect(inicio.toISOString()).toBe('2026-12-01T05:00:00.000Z');
  });

  it('una hora antes de medianoche Bogotá sigue contando como el mes en curso', () => {
    // 2026-12-01T04:59:59Z = 2026-11-30T23:59:59 Bogotá: aún noviembre.
    const ahora = new Date('2026-12-01T04:59:59.000Z');
    const inicio = bogotaStartOfMonth(0, ahora);
    expect(inicio.toISOString()).toBe('2026-11-01T05:00:00.000Z');
  });
});

describe('calcularVariacionMensual', () => {
  it('sin mes anterior con datos, no hay división por cero: null', () => {
    expect(calcularVariacionMensual(5, 0)).toBeNull();
  });

  it('crecimiento se reporta en positivo', () => {
    expect(calcularVariacionMensual(15, 10)).toBeCloseTo(50);
  });

  it('caída se reporta en negativo', () => {
    expect(calcularVariacionMensual(5, 10)).toBeCloseTo(-50);
  });

  it('a cero desde un mes anterior real es una caída del 100%', () => {
    expect(calcularVariacionMensual(0, 8)).toBeCloseTo(-100);
  });
});
