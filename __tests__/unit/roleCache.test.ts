/**
 * Tests de la caché de rol (T-19): segunda lectura dentro del TTL no
 * consulta; pasado el TTL, sí. `ahora` se fija a mano para no depender del
 * reloj real ni de temporizadores falsos.
 */
import {
  guardarRolCacheado,
  invalidarRolCacheado,
  limpiarCacheDeRoles,
  obtenerRolCacheado,
  resolverRolDeUsuario,
  ROL_TTL_MS,
} from '@/lib/admin/roleCache';

beforeEach(() => {
  limpiarCacheDeRoles();
});

describe('obtenerRolCacheado / guardarRolCacheado', () => {
  it('sin entrada: undefined (hay que consultar)', () => {
    expect(obtenerRolCacheado('u1', 1000)).toBeUndefined();
  });

  it('dentro del TTL devuelve lo guardado, incluido null (sin rol, también cacheable)', () => {
    guardarRolCacheado('u1', 'owner', 1000);
    expect(obtenerRolCacheado('u1', 1000 + ROL_TTL_MS - 1)).toBe('owner');

    guardarRolCacheado('u2', null, 1000);
    expect(obtenerRolCacheado('u2', 1000)).toBeNull();
  });

  it('pasado el TTL, vuelve a undefined', () => {
    guardarRolCacheado('u1', 'owner', 1000);
    expect(obtenerRolCacheado('u1', 1000 + ROL_TTL_MS)).toBeUndefined();
  });

  it('invalidarRolCacheado borra la entrada antes de que venza el TTL', () => {
    guardarRolCacheado('u1', 'owner', 1000);
    invalidarRolCacheado('u1');
    expect(obtenerRolCacheado('u1', 1000)).toBeUndefined();
  });
});

describe('resolverRolDeUsuario', () => {
  it('la segunda lectura dentro del TTL no vuelve a consultar', async () => {
    const consultar = jest.fn().mockResolvedValue({ data: { role: 'owner' }, error: null });

    const primera = await resolverRolDeUsuario('u1', consultar, 1000);
    const segunda = await resolverRolDeUsuario('u1', consultar, 1000 + ROL_TTL_MS - 1);

    expect(primera).toBe('owner');
    expect(segunda).toBe('owner');
    expect(consultar).toHaveBeenCalledTimes(1);
  });

  it('pasado el TTL, consulta de nuevo', async () => {
    const consultar = jest
      .fn()
      .mockResolvedValueOnce({ data: { role: 'owner' }, error: null })
      .mockResolvedValueOnce({ data: { role: 'viewer' }, error: null });

    const primera = await resolverRolDeUsuario('u1', consultar, 1000);
    const segunda = await resolverRolDeUsuario('u1', consultar, 1000 + ROL_TTL_MS);

    expect(primera).toBe('owner');
    expect(segunda).toBe('viewer'); // si el rol cambió en Supabase, se refleja al vencer el TTL
    expect(consultar).toHaveBeenCalledTimes(2);
  });

  it('sin fila o con un rol inválido, cachea null (no reintenta en cada petición)', async () => {
    const consultar = jest.fn().mockResolvedValue({ data: null, error: null });
    expect(await resolverRolDeUsuario('u1', consultar, 1000)).toBeNull();
    expect(await resolverRolDeUsuario('u1', consultar, 1000)).toBeNull();
    expect(consultar).toHaveBeenCalledTimes(1);
  });

  it('usuarios distintos no comparten entrada', async () => {
    const consultarA = jest.fn().mockResolvedValue({ data: { role: 'owner' }, error: null });
    const consultarB = jest.fn().mockResolvedValue({ data: { role: 'viewer' }, error: null });
    expect(await resolverRolDeUsuario('a', consultarA, 1000)).toBe('owner');
    expect(await resolverRolDeUsuario('b', consultarB, 1000)).toBe('viewer');
  });

  /**
   * Defecto real encontrado en la auditoría de backend: `error` estaba en la
   * firma del callback y se descartaba. Un fallo transitorio de Supabase
   * devolvía `data: null`, se resolvía `null` y ese `null` quedaba CACHEADO
   * el TTL completo: 30 s de 403 «Sin rol de administración» en el
   * middleware y en toda la API, aunque la base ya respondiera bien.
   */
  describe('un fallo de la consulta no se cachea', () => {
    let errorSpy: jest.SpyInstance;
    beforeEach(() => {
      errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    afterEach(() => errorSpy.mockRestore());

    it('ante un error devuelve null (fail-closed) pero vuelve a consultar', async () => {
      const consultar = jest
        .fn()
        .mockResolvedValueOnce({ data: null, error: { message: 'fetch failed' } })
        .mockResolvedValueOnce({ data: { role: 'owner' }, error: null });

      // Primer intento: la BD falla → sin acceso, pero sin envenenar la caché.
      expect(await resolverRolDeUsuario('u1', consultar, 1000)).toBeNull();
      // Mismo instante: si el fallo se hubiera cacheado, no habría 2ª consulta
      // y el rol seguiría siendo null durante todo el TTL.
      expect(await resolverRolDeUsuario('u1', consultar, 1000)).toBe('owner');
      expect(consultar).toHaveBeenCalledTimes(2);
    });

    it('un error con data presente tampoco se cachea', async () => {
      const consultar = jest
        .fn()
        .mockResolvedValueOnce({ data: { role: 'owner' }, error: { message: 'parcial' } })
        .mockResolvedValueOnce({ data: { role: 'owner' }, error: null });

      expect(await resolverRolDeUsuario('u2', consultar, 1000)).toBeNull();
      expect(await resolverRolDeUsuario('u2', consultar, 1000)).toBe('owner');
      expect(consultar).toHaveBeenCalledTimes(2);
    });
  });
});
