import { NextRequest, NextResponse } from 'next/server';
import { serverEnv } from '@/config/env';

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
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null; // OK
}
