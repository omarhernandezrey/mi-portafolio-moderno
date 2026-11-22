/**
 * `requireUptimeCronAuth` — el secreto acotado del registro de uptime.
 *
 * Nace porque el cron de GitHub Actions no dispara con fiabilidad y el de
 * Vercel es imposible en plan Hobby (solo admite crons diarios), así que el
 * disparo se le encarga a un servicio externo. Y ese servicio necesita una
 * llave.
 *
 * El `CRON_SECRET` general abre ONCE rutas, entre ellas
 * `cron/database-cleanup` (borra filas), `newsletter/send` y
 * `cron/email-followup` (mandan correo a los suscriptores). Dárselo a un
 * servicio gratuito de terceros sería cambiar un ping por la capacidad de
 * borrar datos y escribir a tus suscriptores.
 *
 * Lo que estas pruebas fijan: el secreto dedicado sirve para el registro de
 * uptime y para NADA más.
 */
const entorno: { cron: string; uptime: string } = { cron: '', uptime: '' };

jest.mock('@/config/env', () => ({
  serverEnv: {
    get CRON_SECRET() {
      return entorno.cron;
    },
    get UPTIME_CRON_SECRET() {
      return entorno.uptime;
    },
  },
}));

import { NextRequest } from 'next/server';
import { requireCronAuth, requireUptimeCronAuth } from '@/lib/cronAuth';

const GENERAL = 'secreto-general-de-los-crons-1234';
const SOLO_UPTIME = 'secreto-solo-para-uptime-5678';

function peticion(token?: string) {
  return new NextRequest('http://localhost/api/cron/uptime-record', {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
}

beforeEach(() => {
  entorno.cron = GENERAL;
  entorno.uptime = SOLO_UPTIME;
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

describe('requireUptimeCronAuth', () => {
  it('acepta el secreto dedicado', () => {
    expect(requireUptimeCronAuth(peticion(SOLO_UPTIME))).toBeNull();
  });

  it('sigue aceptando el general, para no romper nada existente', () => {
    expect(requireUptimeCronAuth(peticion(GENERAL))).toBeNull();
  });

  it('rechaza cualquier otro token', async () => {
    const res = requireUptimeCronAuth(peticion('otro-token-cualquiera-xxxx'));
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
  });

  it('rechaza una petición sin cabecera', () => {
    const res = requireUptimeCronAuth(peticion());
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
  });

  it('sin el dedicado configurado, se comporta como la guarda general', () => {
    entorno.uptime = '';
    expect(requireUptimeCronAuth(peticion(GENERAL))).toBeNull();

    const res = requireUptimeCronAuth(peticion(SOLO_UPTIME));
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
  });

  it('ignora un dedicado demasiado corto en vez de aceptarlo', () => {
    // Un secreto de 4 caracteres no es un secreto. No debe dar acceso.
    entorno.uptime = 'abc';
    const res = requireUptimeCronAuth(peticion('abc'));
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
  });

  it('falla cerrado si no hay NINGÚN secreto configurado', () => {
    entorno.cron = '';
    entorno.uptime = '';
    const res = requireUptimeCronAuth(peticion(GENERAL));
    expect(res).not.toBeNull();
    expect(res!.status).toBe(503);
  });
});

describe('el secreto dedicado NO abre las demás rutas', () => {
  it('la guarda general lo rechaza', () => {
    // Esta es la prueba que da sentido a todo lo anterior: las otras diez
    // rutas usan `requireCronAuth`, y con el secreto de uptime deben
    // responder 401. Si esto dejara de cumplirse, entregar la llave al
    // servicio externo le daría acceso a borrar filas y a mandar correo.
    const res = requireCronAuth(peticion(SOLO_UPTIME));
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
  });

  it('y sigue aceptando el general, que es su llave', () => {
    expect(requireCronAuth(peticion(GENERAL))).toBeNull();
  });
});
