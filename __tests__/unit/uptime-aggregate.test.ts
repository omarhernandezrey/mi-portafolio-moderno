/**
 * Agregación del histórico de disponibilidad.
 *
 * La prueba central de este archivo es la de los huecos: un día sin
 * comprobaciones tiene que salir como «sin datos», NUNCA como 100%. Toda esta
 * función existe porque `/status` publicaba una gráfica con alturas
 * `Math.random()` afirmando «100% Stability»; rellenar los huecos con un valor
 * optimista sería el mismo error con otra forma.
 */
import {
  agregarUptimePorDia,
  type FilaDeUptime,
} from '@/lib/uptime/aggregate';

const HASTA = new Date('2026-11-22T12:00:00.000Z');

function check(
  dia: string,
  status: FilaDeUptime['status'] = 'operational',
  latency_ms = 100,
  hora = '08:00:00',
): FilaDeUptime {
  return { checked_at: `${dia}T${hora}.000Z`, status, latency_ms };
}

describe('agregarUptimePorDia', () => {
  it('devuelve exactamente los días pedidos, del más antiguo al más reciente', () => {
    const r = agregarUptimePorDia([], 7, HASTA);
    expect(r.dias).toHaveLength(7);
    expect(r.dias[0].fecha).toBe('2026-11-16');
    expect(r.dias[6].fecha).toBe('2026-11-22');
  });

  it('un día sin comprobaciones es «sin datos», no 100%', () => {
    const r = agregarUptimePorDia([check('2026-11-22')], 3, HASTA);

    const [antier, ayer, hoy] = r.dias;
    expect(antier.comprobaciones).toBe(0);
    expect(antier.porcentaje).toBeNull();
    expect(antier.latenciaMedia).toBeNull();
    expect(ayer.porcentaje).toBeNull();
    // Y el día que sí tiene datos sale al 100%, para que la diferencia entre
    // «sin datos» y «perfecto» sea inequívoca.
    expect(hoy.porcentaje).toBe(100);
  });

  it('sin ninguna comprobación, el porcentaje global es null y no 0', () => {
    const r = agregarUptimePorDia([], 30, HASTA);
    expect(r.porcentajeGlobal).toBeNull();
    expect(r.diasConDatos).toBe(0);
    expect(r.totalComprobaciones).toBe(0);
    expect(r.registrandoDesde).toBeNull();
    // Un 0% diría «estuvo caído 30 días», que es una afirmación falsa.
    expect(r.dias.every((d) => d.porcentaje === null)).toBe(true);
  });

  it('calcula el porcentaje del día sobre sus propias comprobaciones', () => {
    const filas = [
      check('2026-11-22', 'operational', 100, '00:00:00'),
      check('2026-11-22', 'operational', 200, '01:00:00'),
      check('2026-11-22', 'degraded', 900, '02:00:00'),
      check('2026-11-22', 'down', 50, '03:00:00'),
    ];
    const r = agregarUptimePorDia(filas, 1, HASTA);

    const hoy = r.dias[0];
    expect(hoy.comprobaciones).toBe(4);
    expect(hoy.operativas).toBe(2);
    expect(hoy.porcentaje).toBe(50);
    expect(hoy.latenciaMedia).toBe(Math.round((100 + 200 + 900 + 50) / 4));
  });

  it('redondea a un decimal: 24 comprobaciones no dan más precisión', () => {
    // 23 de 24 operativas = 95.8333…%
    const filas = Array.from({ length: 24 }, (_, i) =>
      check(
        '2026-11-22',
        i === 0 ? 'down' : 'operational',
        100,
        `${String(i).padStart(2, '0')}:00:00`,
      ),
    );
    const r = agregarUptimePorDia(filas, 1, HASTA);
    expect(r.dias[0].porcentaje).toBe(95.8);
  });

  it('el porcentaje global ignora los días sin datos', () => {
    const filas = [
      check('2026-11-22', 'operational'),
      check('2026-11-22', 'down', 100, '09:00:00'),
    ];
    // 30 días de ventana, datos en uno solo: 1 de 2 operativas = 50%.
    const r = agregarUptimePorDia(filas, 30, HASTA);

    expect(r.porcentajeGlobal).toBe(50);
    expect(r.diasConDatos).toBe(1);
    // Si los 29 días vacíos contaran como 100%, el global saldría ~98%: una
    // cifra tranquilizadora construida sobre nada.
    expect(r.porcentajeGlobal).not.toBeGreaterThan(50);
  });

  it('descarta comprobaciones fuera de la ventana sin romper los tramos', () => {
    const filas = [
      check('2026-01-01'), // muy anterior
      check('2026-11-22'),
      check('2027-01-01'), // futuro
    ];
    const r = agregarUptimePorDia(filas, 3, HASTA);

    expect(r.dias).toHaveLength(3);
    expect(r.totalComprobaciones).toBe(1);
    expect(r.dias[2].comprobaciones).toBe(1);
  });

  it('informa desde cuándo hay registro, con la comprobación más antigua', () => {
    const filas = [
      check('2026-11-22', 'operational', 100, '10:00:00'),
      check('2026-11-20', 'operational', 100, '03:00:00'),
      check('2026-11-21', 'operational', 100, '23:00:00'),
    ];
    const r = agregarUptimePorDia(filas, 7, HASTA);
    expect(r.registrandoDesde).toBe('2026-11-20T03:00:00.000Z');
  });

  it('agrupa por fecha UTC, no por la zona de quien mire', () => {
    // 23:30 UTC del 21 y 00:30 UTC del 22: días distintos en UTC, aunque en
    // Bogotá (UTC-5) ambos caigan el 21.
    const filas = [
      check('2026-11-21', 'operational', 100, '23:30:00'),
      check('2026-11-22', 'down', 100, '00:30:00'),
    ];
    const r = agregarUptimePorDia(filas, 2, HASTA);

    expect(r.dias[0]).toMatchObject({ fecha: '2026-11-21', porcentaje: 100 });
    expect(r.dias[1]).toMatchObject({ fecha: '2026-11-22', porcentaje: 0 });
  });

  it('un día entero caído es 0%, distinguible de «sin datos»', () => {
    const filas = [
      check('2026-11-22', 'down', 100, '00:00:00'),
      check('2026-11-22', 'down', 100, '01:00:00'),
    ];
    const r = agregarUptimePorDia(filas, 1, HASTA);

    expect(r.dias[0].porcentaje).toBe(0);
    expect(r.dias[0].porcentaje).not.toBeNull();
    expect(r.dias[0].comprobaciones).toBe(2);
  });

  it('con 0 días devuelve una ventana vacía sin reventar', () => {
    const r = agregarUptimePorDia([check('2026-11-22')], 0, HASTA);
    expect(r.dias).toEqual([]);
    expect(r.porcentajeGlobal).toBeNull();
  });
});
