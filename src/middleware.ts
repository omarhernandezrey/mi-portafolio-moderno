import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo proteger rutas que empiecen con /admin (pero no /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionCookie = request.cookies.get('admin_session');

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Nota: En Edge Runtime (Middleware), no tenemos acceso fácil a serverEnv.ADMIN_SECRET 
    // directamente si no está en process.env. Vercel e inyecta process.env.
    // Para simplificar hoy, solo verificamos existencia. 
    // Una validación real requeriría comparar el hash si es crítico.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
