import { NextResponse } from 'next/server';
import { comprobarSalud } from '@/lib/health/check';

export const dynamic = 'force-dynamic';

/**
 * Estado actual, público y sin autenticación: lo pingea el workflow
 * `check-health.yml` cada hora y lo lee `/status`.
 *
 * La comprobación vive en `src/lib/health/check.ts`, compartida con
 * `/api/cron/uptime-record` (el que escribe el histórico), para que la página
 * pública y el registro no puedan contar cosas distintas del mismo momento.
 */
export async function GET() {
  try {
    return NextResponse.json(await comprobarSalud());
  } catch (err) {
    // No exponer detalles internos (paths, SQL) al público
    console.error('Health check fatal:', err);
    return NextResponse.json(
      { status: 'down', timestamp: new Date().toISOString() },
      { status: 500 },
    );
  }
}
