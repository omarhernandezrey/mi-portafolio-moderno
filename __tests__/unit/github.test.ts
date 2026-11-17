/**
 * Tests del cliente de GitHub (T-13). `fetch` siempre simulado: nunca se
 * llama a la API real desde Jest (la llamada real vive en
 * `scripts/verify-github-metrics.ts`, fuera de Jest).
 */
import {
  CupoAgotadoError,
  aplanarActividadDiaria,
  calcularPorcentajesDeLenguajes,
  calcularRachas,
  comprobarCupoDesdeCabeceras,
  huboPushHoy,
  obtenerConReintento202,
  obtenerEventosDelUsuario,
  obtenerTodasLasPaginas,
  siguienteUrlDeLink,
  type EventoGitHub,
  type FetchGitHub,
  type RespuestaGitHub,
} from '@/lib/github';

function respuesta(status: number, cuerpo: unknown, cabeceras: Record<string, string> = {}): RespuestaGitHub {
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: { get: (nombre) => cabeceras[nombre.toLowerCase()] ?? null },
    // Un 204 real no tiene cuerpo: `.json()` lanzaría "Unexpected end of
    // JSON input". Si el código llamara a `.json()` en un 204 por error,
    // este mock lo delataría en vez de disimularlo con un cuerpo falso.
    json: async () => {
      if (status === 204) throw new SyntaxError('Unexpected end of JSON input');
      return cuerpo;
    },
  };
}

describe('obtenerConReintento202', () => {
  it('202 con cuerpo vacío: reintenta y nunca devuelve "cero" como si fuera el dato real', async () => {
    const fetchImpl: FetchGitHub = jest
      .fn()
      .mockResolvedValueOnce(respuesta(202, {}))
      .mockResolvedValueOnce(respuesta(202, {}))
      .mockResolvedValueOnce(respuesta(200, { total: 42 }));
    const espera = jest.fn().mockResolvedValue(undefined);

    const resultado = await obtenerConReintento202<{ total: number }>('https://x/stats', fetchImpl, {}, espera);

    expect(resultado).toEqual({ total: 42 });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(espera).toHaveBeenCalledTimes(2);
  });

  it('si GitHub nunca termina de calcular, lanza en vez de simular un resultado', async () => {
    const fetchImpl: FetchGitHub = jest.fn().mockResolvedValue(respuesta(202, {}));
    const espera = jest.fn().mockResolvedValue(undefined);
    await expect(obtenerConReintento202('https://x/stats', fetchImpl, {}, espera)).rejects.toThrow(/sigue calculando/);
  });

  it('un error HTTP real (no 202) no se reintenta: se propaga', async () => {
    const fetchImpl: FetchGitHub = jest.fn().mockResolvedValue(respuesta(404, {}));
    await expect(obtenerConReintento202('https://x/stats', fetchImpl, {})).rejects.toThrow(/404/);
  });

  it('204 (repo sin commits) con un valor vacío dado: lo devuelve, sin llamar a .json()', async () => {
    const fetchImpl: FetchGitHub = jest.fn().mockResolvedValue(respuesta(204, null));
    const resultado = await obtenerConReintento202<number[]>(
      'https://x/stats/commit_activity',
      fetchImpl,
      {},
      undefined,
      []
    );
    expect(resultado).toEqual([]);
  });

  it('204 sin un valor vacío dado: es un error (no se confunde un repo vacío con una anomalía)', async () => {
    const fetchImpl: FetchGitHub = jest.fn().mockResolvedValue(respuesta(204, null));
    await expect(obtenerConReintento202('https://x/repos/algo', fetchImpl, {})).rejects.toThrow(/204/);
  });

  it('cupo casi agotado: se detiene con un error claro, incluso en un 202', async () => {
    const fetchImpl: FetchGitHub = jest
      .fn()
      .mockResolvedValue(respuesta(202, {}, { 'x-ratelimit-remaining': '10', 'x-ratelimit-reset': '1234567890' }));
    await expect(obtenerConReintento202('https://x/stats', fetchImpl, {})).rejects.toThrow(CupoAgotadoError);
  });
});

describe('comprobarCupoDesdeCabeceras', () => {
  it('con cupo de sobra, no hace nada', () => {
    expect(() => comprobarCupoDesdeCabeceras({ get: () => '4999' })).not.toThrow();
  });

  it('bajo el mínimo, lanza con la hora de reinicio', () => {
    const reset = Math.floor(Date.now() / 1000) + 3600;
    const cabeceras = { get: (n: string) => (n === 'x-ratelimit-remaining' ? '20' : String(reset)) };
    expect(() => comprobarCupoDesdeCabeceras(cabeceras)).toThrow(/20 peticiones restantes/);
  });

  it('sin la cabecera (otra API, o un mock incompleto), no revienta', () => {
    expect(() => comprobarCupoDesdeCabeceras({ get: () => null })).not.toThrow();
  });
});

describe('siguienteUrlDeLink / obtenerTodasLasPaginas', () => {
  it('extrae la URL de rel="next" entre varios rel', () => {
    const link = '<https://api.github.com/x?page=2>; rel="next", <https://api.github.com/x?page=5>; rel="last"';
    expect(siguienteUrlDeLink(link)).toBe('https://api.github.com/x?page=2');
  });

  it('sin cabecera Link, no hay siguiente página', () => {
    expect(siguienteUrlDeLink(null)).toBeNull();
  });

  it('dos páginas se concatenan en el orden correcto', async () => {
    const fetchImpl: FetchGitHub = jest
      .fn()
      .mockResolvedValueOnce(respuesta(200, [{ id: 1 }, { id: 2 }], { link: '<https://x/?page=2>; rel="next"' }))
      .mockResolvedValueOnce(respuesta(200, [{ id: 3 }]));

    const resultado = await obtenerTodasLasPaginas<{ id: number }>('https://x/?page=1', fetchImpl, {});

    expect(resultado).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect((fetchImpl as jest.Mock).mock.calls[1][0]).toBe('https://x/?page=2');
  });

  it('una sola página: ni siquiera busca una siguiente', async () => {
    const fetchImpl: FetchGitHub = jest.fn().mockResolvedValue(respuesta(200, [{ id: 1 }]));
    const resultado = await obtenerTodasLasPaginas<{ id: number }>('https://x/?page=1', fetchImpl, {});
    expect(resultado).toEqual([{ id: 1 }]);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});

describe('calcularPorcentajesDeLenguajes', () => {
  it('bytes -> porcentajes que suman exactamente 100', () => {
    const porcentajes = calcularPorcentajesDeLenguajes({ TypeScript: 700, CSS: 200, HTML: 100 });
    const suma = Object.values(porcentajes).reduce((a, b) => a + b, 0);
    expect(suma).toBe(100);
    expect(porcentajes.TypeScript).toBeCloseTo(70, 0);
  });

  it('un caso que redondea feo (tercios) igual suma 100, ajustado en el de más bytes', () => {
    const porcentajes = calcularPorcentajesDeLenguajes({ A: 1, B: 1, C: 1 });
    const suma = Object.values(porcentajes).reduce((a, b) => a + b, 0);
    // No es un entero exacto por cómo IEEE754 representa los decimales (33.3
    // tres veces no cae justo en 100.0 en binario); 9 decimales de margen
    // prueba que la suma es 100 para cualquier propósito real.
    expect(suma).toBeCloseTo(100, 9);
  });

  it('sin lenguajes, objeto vacío (no NaN ni división por cero)', () => {
    expect(calcularPorcentajesDeLenguajes({})).toEqual({});
  });
});

describe('calcularRachas', () => {
  it('días consecutivos cuentan como racha', () => {
    const r = calcularRachas(['2026-11-10', '2026-11-11', '2026-11-12'], '2026-11-12');
    expect(r.actual).toBe(3);
    expect(r.maxima).toBe(3);
  });

  it('un hueco corta la racha actual, pero la máxima histórica queda registrada', () => {
    const dias = ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-10'];
    const r = calcularRachas(dias, '2026-11-10');
    expect(r.actual).toBe(1); // el 10 está solo
    expect(r.maxima).toBe(5); // del 1 al 5
  });

  it('si ayer hubo actividad pero hoy todavía no, la racha sigue viva (el día no ha terminado)', () => {
    const r = calcularRachas(['2026-11-09', '2026-11-10'], '2026-11-11');
    expect(r.actual).toBe(2);
  });

  it('sin actividad reciente, la racha actual es 0', () => {
    const r = calcularRachas(['2026-10-01'], '2026-11-11');
    expect(r.actual).toBe(0);
    expect(r.maxima).toBe(1);
  });

  it('sin ningún día de actividad, todo en 0', () => {
    expect(calcularRachas([], '2026-11-11')).toEqual({ actual: 0, maxima: 0 });
  });
});

describe('aplanarActividadDiaria', () => {
  it('reparte los 7 días de una semana en fechas distintas, con sus commits', () => {
    // 2026-11-08 es domingo 00:00 UTC.
    const semanaUnix = Date.UTC(2026, 10, 8) / 1000;
    const dias = aplanarActividadDiaria([{ week: semanaUnix, days: [1, 0, 2, 0, 0, 0, 3] }]);
    expect(dias).toHaveLength(7);
    expect(dias.map((d) => d.commits)).toEqual([1, 0, 2, 0, 0, 0, 3]);
    // Todas las fechas son días distintos y consecutivos.
    const fechas = dias.map((d) => d.fecha);
    expect(new Set(fechas).size).toBe(7);
  });

  it('varias semanas producen días en orden, sin huecos ni repetidos', () => {
    const semana1 = Date.UTC(2026, 10, 1) / 1000;
    const semana2 = Date.UTC(2026, 10, 8) / 1000;
    const dias = aplanarActividadDiaria([
      { week: semana1, days: [0, 0, 0, 0, 0, 0, 0] },
      { week: semana2, days: [0, 0, 0, 0, 0, 0, 0] },
    ]);
    const fechas = dias.map((d) => d.fecha);
    expect(new Set(fechas).size).toBe(14);
  });
});

describe('huboPushHoy (T-17)', () => {
  function push(fechaIso: string): EventoGitHub {
    return { type: 'PushEvent', created_at: fechaIso };
  }

  it('hay un PushEvent de hoy (Bogotá): true', () => {
    // 2026-11-17T02:00:00Z en Bogotá (UTC-5) es 2026-11-16.
    expect(huboPushHoy([push('2026-11-17T02:00:00Z')], '2026-11-16')).toBe(true);
  });

  it('solo hay eventos de otros días: false', () => {
    expect(huboPushHoy([push('2026-11-15T12:00:00Z')], '2026-11-16')).toBe(false);
  });

  it('ignora eventos que no son PushEvent, aunque sean de hoy', () => {
    const evento: EventoGitHub = { type: 'WatchEvent', created_at: '2026-11-16T12:00:00Z' };
    expect(huboPushHoy([evento], '2026-11-16')).toBe(false);
  });

  it('sin eventos: false, no lanza', () => {
    expect(huboPushHoy([], '2026-11-16')).toBe(false);
  });
});

describe('obtenerEventosDelUsuario (T-17)', () => {
  it('pide /users/{usuario}/events (sin /public, para incluir repos privados)', async () => {
    const fetchImpl: FetchGitHub = jest.fn().mockResolvedValue(
      respuesta(200, [{ type: 'PushEvent', created_at: '2026-11-16T10:00:00Z' }]),
    );
    const eventos = await obtenerEventosDelUsuario('omarhernandezrey', 'tok', fetchImpl);
    expect(eventos).toHaveLength(1);
    expect((fetchImpl as jest.Mock).mock.calls[0][0]).toBe(
      'https://api.github.com/users/omarhernandezrey/events?per_page=100',
    );
  });

  it('respuesta no-ok: lanza con el status', async () => {
    const fetchImpl: FetchGitHub = jest.fn().mockResolvedValue(respuesta(404, null));
    await expect(obtenerEventosDelUsuario('omarhernandezrey', 'tok', fetchImpl)).rejects.toThrow('404');
  });
});
