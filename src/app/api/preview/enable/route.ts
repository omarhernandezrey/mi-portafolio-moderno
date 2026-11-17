import { NextRequest, NextResponse } from 'next/server';
import { draftMode } from 'next/headers';
import { requireAdmin } from '@/lib/admin/auth';

/**
 * Activa el modo borrador de Next.js (T-18): la home pública empieza a
 * incluir proyectos sin publicar, leídos con `service_role`
 * (`leerProyectosConBorradores`) en vez de la clave `anon`. Solo `owner`
 * puede activarlo — nunca un secreto en la URL, que es el patrón típico de
 * un CMS headless pero no el de este panel (aquí ya hay sesión).
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const destino = req.nextUrl.searchParams.get('next');
  // Solo rutas relativas al propio sitio: nunca seguir una URL externa.
  const ruta = destino && destino.startsWith('/') && !destino.startsWith('//') ? destino : '/';

  const dm = await draftMode();
  dm.enable();

  return NextResponse.redirect(new URL(ruta, req.nextUrl.origin));
}
