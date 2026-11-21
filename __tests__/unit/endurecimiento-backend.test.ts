/**
 * Endurecimiento (auditoría de backend, cuarto grupo).
 *
 * 1. `respuestaErrorBd`: ~39 sitios devolvían el `error.message` crudo de
 *    Postgres al cliente, y dos de ellos además el `code`. El mensaje lleva
 *    nombres de tablas, columnas y constraints. Y era además un MAL
 *    mensaje: todo salía como 500, incluidos los casos que son culpa de la
 *    petición — un slug repetido se mostraba como "Internal Server Error".
 *
 * 2. `secretosIguales`: el Bearer de los crons y el secreto del webhook de
 *    Telegram se comparaban con `!==`, que corta en el primer byte
 *    distinto. El repo ya resolvía exactamente esto con `timingSafeEqual`
 *    en `newsletter/unsubscribe`; las dos comprobaciones máquina-a-máquina
 *    más sensibles usaban el patrón que el propio proyecto había
 *    descartado.
 */
import { respuestaErrorBd } from '@/lib/admin/errorBd';
import { secretosIguales } from '@/lib/secretoSeguro';

let errorSpy: jest.SpyInstance;
beforeEach(() => {
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => errorSpy.mockRestore());

describe('respuestaErrorBd — no describe el esquema al cliente', () => {
  const MENSAJE_REVELADOR =
    'duplicate key value violates unique constraint "portfolio_projects_slug_key"';

  it('nunca reenvía el mensaje crudo de Postgres', async () => {
    const res = respuestaErrorBd({ code: '23505', message: MENSAJE_REVELADOR }, 'prueba');
    const cuerpo = await res.json();

    expect(JSON.stringify(cuerpo)).not.toContain('portfolio_projects');
    expect(JSON.stringify(cuerpo)).not.toContain('constraint');
    expect(JSON.stringify(cuerpo)).not.toContain('duplicate key');
  });

  it('un error desconocido no filtra nada y es 500', async () => {
    const res = respuestaErrorBd(
      { code: '08006', message: 'connection failure at 10.0.0.3:5432' },
      'prueba',
    );
    const cuerpo = await res.json();

    expect(res.status).toBe(500);
    expect(JSON.stringify(cuerpo)).not.toContain('10.0.0.3');
  });

  it('pero SÍ deja el error completo en el log del servidor', () => {
    respuestaErrorBd({ code: '23505', message: MENSAJE_REVELADOR }, 'admin/portfolio/projects');

    expect(errorSpy).toHaveBeenCalledWith(
      '[admin/portfolio/projects]',
      expect.objectContaining({ message: MENSAJE_REVELADOR }),
    );
  });
});

describe('respuestaErrorBd — además mejora el estado HTTP', () => {
  // Antes TODO era 500, incluidos los casos que son culpa de la petición.
  it.each([
    ['23505', 409, 'valor único'],
    ['23503', 409, 'no existe'],
    ['23502', 400, 'obligatorio'],
    ['23514', 400, 'reglas'],
    ['22P02', 400, 'formato inválido'],
    ['PGRST116', 404, 'No encontrado'],
    ['42501', 403, 'no permitida'],
  ])('código %s → %i', async (codigo, estado, fragmento) => {
    const res = respuestaErrorBd({ code: codigo, message: 'da igual' }, 'prueba');
    const cuerpo = await res.json();

    expect(res.status).toBe(estado);
    expect(cuerpo.error).toContain(fragmento);
  });

  it('un error sin código cae al genérico', async () => {
    const res = respuestaErrorBd({ message: 'algo raro' }, 'prueba');
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe('No se pudo completar la operación.');
  });

  it('aguanta un error nulo sin romperse', async () => {
    const res = respuestaErrorBd(null, 'prueba');
    expect(res.status).toBe(500);
  });
});

describe('secretosIguales', () => {
  it('acepta el secreto correcto', () => {
    expect(secretosIguales('Bearer s3cr3t-largo', 'Bearer s3cr3t-largo')).toBe(true);
  });

  it('rechaza uno distinto de la misma longitud', () => {
    expect(secretosIguales('Bearer s3cr3t-largo', 'Bearer s3cr3t-larGO')).toBe(false);
  });

  it('rechaza un prefijo correcto: acertar el principio no sirve', () => {
    expect(secretosIguales('Bearer s3cr', 'Bearer s3cr3t-largo')).toBe(false);
  });

  it('rechaza vacío, null y undefined sin lanzar', () => {
    expect(secretosIguales('', 'secreto')).toBe(false);
    expect(secretosIguales(null, 'secreto')).toBe(false);
    expect(secretosIguales(undefined, 'secreto')).toBe(false);
    expect(secretosIguales('recibido', null)).toBe(false);
    expect(secretosIguales(null, null)).toBe(false);
  });

  it('no lanza con longitudes distintas (timingSafeEqual sí lo haría)', () => {
    // El motivo de comprobar la longitud ANTES: `timingSafeEqual` exige
    // buffers del mismo tamaño y lanza si no lo son.
    expect(() => secretosIguales('corto', 'muchísimo más largo')).not.toThrow();
    expect(secretosIguales('corto', 'muchísimo más largo')).toBe(false);
  });

  it('distingue secretos con caracteres no ASCII', () => {
    expect(secretosIguales('clavé-ñ', 'clavé-ñ')).toBe(true);
    expect(secretosIguales('clave-n', 'clavé-ñ')).toBe(false);
  });
});
