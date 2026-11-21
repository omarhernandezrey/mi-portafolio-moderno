import { NextRequest, NextResponse } from 'next/server';
import { draftMode } from 'next/headers';
import { rutaInternaSegura } from '@/lib/rutaInterna';

/**
 * Sale del modo borrador (T-18). Sin `requireAdmin`: una vez activado, salir
 * de la vista previa no necesita permisos extra — es la misma garantía que
 * "cerrar sesión", cualquiera puede hacerlo sobre su propia cookie.
 */
export async function GET(req: NextRequest) {
  // Esta ruta no pide sesión (ver arriba), así que su `next` lo controla
  // cualquiera: era una redirección abierta desde el dominio propio con
  // `?next=/\evil.com`. `rutaInternaSegura` decide por el origen resuelto.
  const ruta = rutaInternaSegura(req.nextUrl.searchParams.get('next'), req.nextUrl.origin);

  const dm = await draftMode();
  dm.disable();

  return NextResponse.redirect(new URL(ruta, req.nextUrl.origin));
}
