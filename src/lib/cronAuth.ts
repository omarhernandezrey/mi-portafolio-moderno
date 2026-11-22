import { NextRequest, NextResponse } from 'next/server';
import { serverEnv } from '@/config/env';
import { secretosIguales } from '@/lib/secretoSeguro';

/**
 * Valida el Bearer token de las rutas cron.
 * - Siempre se exige (no depende de NODE_ENV)
 * - Si CRON_SECRET no está configurado, FALLA CERRADO (rechaza todo)
 */
export function requireCronAuth(req: NextRequest): NextResponse | null {
  const secret = serverEnv.CRON_SECRET;

  // Fail-closed: sin secret configurado no hay forma segura de autenticar
  if (!secret || secret.length < 10) {
    console.error('CRON_SECRET no configurado o demasiado corto — endpoint cron deshabilitado');
    return NextResponse.json({ error: 'Cron endpoint disabled' }, { status: 503 });
  }

  const authHeader = req.headers.get('authorization');
  if (!secretosIguales(authHeader, `Bearer ${secret}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null; // OK
}

/**
 * Igual que `requireCronAuth`, pero acepta ADEMÁS `UPTIME_CRON_SECRET`.
 *
 * Existe para poder darle a un disparador externo —cron-job.org y similares—
 * una llave que SOLO sirva para registrar una comprobación de salud. El
 * `CRON_SECRET` general abre once rutas, y entre ellas está
 * `cron/database-cleanup`, que borra filas, y las dos que mandan correo a los
 * suscriptores: entregarlo a un servicio gratuito de terceros sería darle ese
 * poder a cambio de un ping.
 *
 * Se sigue aceptando el general para que nada dependa de que la variable nueva
 * exista: mientras no esté definida, esto se comporta exactamente como antes.
 * Y el orden importa — se prueba primero el dedicado, así que el día que esté
 * configurado el disparador externo no necesita el otro para nada.
 */
export function requireUptimeCronAuth(req: NextRequest): NextResponse | null {
  const dedicado = serverEnv.UPTIME_CRON_SECRET;

  if (dedicado && dedicado.length >= 10) {
    const authHeader = req.headers.get('authorization');
    if (secretosIguales(authHeader, `Bearer ${dedicado}`)) return null;
  }

  return requireCronAuth(req);
}
