/**
 * Decisiones puras de los eventos de Telegram de T-17. Sin red ni Supabase.
 */
import {
  debeAvisarProyectoPublicado,
  debeAvisarRachaEnRiesgo,
  esCaidaSostenida,
  mensajeVitalEnRiesgo,
  UMBRAL_RACHA_EN_RIESGO,
} from '@/lib/notifications/events';

describe('debeAvisarProyectoPublicado', () => {
  it('se envía: pasa de no publicado a publicado', () => {
    expect(debeAvisarProyectoPublicado({ estabaPublicado: false, quedaPublicado: true })).toBe(true);
  });

  it('no se envía: ya estaba publicado', () => {
    expect(debeAvisarProyectoPublicado({ estabaPublicado: true, quedaPublicado: true })).toBe(false);
  });

  it('no se envía: se está despublicando', () => {
    expect(debeAvisarProyectoPublicado({ estabaPublicado: true, quedaPublicado: false })).toBe(false);
  });

  it('no se envía: nunca estuvo publicado y sigue sin estarlo', () => {
    expect(debeAvisarProyectoPublicado({ estabaPublicado: false, quedaPublicado: false })).toBe(false);
  });
});

describe('debeAvisarRachaEnRiesgo', () => {
  it('se envía: racha suficiente y sin commit hoy', () => {
    expect(debeAvisarRachaEnRiesgo({ racha: UMBRAL_RACHA_EN_RIESGO, huboCommitHoy: false })).toBe(true);
  });

  it('no se envía: ya hubo commit hoy, la racha no está en riesgo', () => {
    expect(debeAvisarRachaEnRiesgo({ racha: 10, huboCommitHoy: true })).toBe(false);
  });

  it('no se envía: la racha es menor al umbral, no vale la pena avisar', () => {
    expect(debeAvisarRachaEnRiesgo({ racha: UMBRAL_RACHA_EN_RIESGO - 1, huboCommitHoy: false })).toBe(false);
  });
});

describe('esCaidaSostenida', () => {
  it('se envía: p75 por encima del umbral "poor" con muestras suficientes', () => {
    expect(esCaidaSostenida('LCP', 4500, 10)).toBe(true);
  });

  it('no se envía: p75 saludable aunque haya muchas muestras', () => {
    expect(esCaidaSostenida('LCP', 1800, 50)).toBe(false);
  });

  it('no se envía: pocas muestras, aunque el p75 sea malo (ruido, no dato)', () => {
    expect(esCaidaSostenida('INP', 600, 2)).toBe(false);
  });

  it('cada métrica usa su propio umbral oficial de web-vitals', () => {
    expect(esCaidaSostenida('CLS', 0.3, 10)).toBe(true);
    expect(esCaidaSostenida('CLS', 0.05, 10)).toBe(false);
  });
});

describe('mensajeVitalEnRiesgo', () => {
  it('formatea CLS con decimales y LCP/INP como enteros con ms', () => {
    expect(mensajeVitalEnRiesgo('CLS', 'mobile', 0.256)).toContain('0.26');
    expect(mensajeVitalEnRiesgo('LCP', 'desktop', 4521.7)).toContain('4522ms');
  });
});
