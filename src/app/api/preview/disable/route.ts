import { NextRequest, NextResponse } from 'next/server';
import { draftMode } from 'next/headers';

/**
 * Sale del modo borrador (T-18). Sin `requireAdmin`: una vez activado, salir
 * de la vista previa no necesita permisos extra — es la misma garantía que
 * "cerrar sesión", cualquiera puede hacerlo sobre su propia cookie.
 */
export async function GET(req: NextRequest) {
  const destino = req.nextUrl.searchParams.get('next');
  const ruta = destino && destino.startsWith('/') && !destino.startsWith('//') ? destino : '/';

  const dm = await draftMode();
  dm.disable();

  return NextResponse.redirect(new URL(ruta, req.nextUrl.origin));
}
