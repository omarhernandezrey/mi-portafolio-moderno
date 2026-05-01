import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { serverEnv } from './config/env'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    serverEnv.SUPABASE_URL,
    serverEnv.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refrescar sesión si existe
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Redirigir si ya está autenticado y trata de ir al login
  if (pathname === '/admin/login' && user) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Rutas de administración protegidas
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Obtener el rol del usuario desde la tabla user_roles
    // Usamos el cliente con service_role para asegurar que podemos leer el rol incluso si RLS es estricto
    // Pero aquí usamos el cliente anon del middleware que tiene la sesión del usuario.
    // La política "Users can view own role" permite que el usuario lea su propio rol.
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = userRole?.role || 'viewer'

    // Reglas de acceso granulares
    if (role === 'assistant') {
      // El asistente no puede ver facturas ni reportes de tiempo/financieros
      const forbiddenPaths = ['/admin/invoices', '/admin/reports'];
      if (forbiddenPaths.some(p => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    } else if (role === 'viewer') {
      // El observador solo puede ver el dashboard principal
      if (pathname !== '/admin' && !pathname.startsWith('/admin/leads') && !pathname.startsWith('/admin/tickets')) {
         // Permitimos ver listas pero quizás no acciones de escritura (esto se valida en el componente o API)
         // Por ahora redirigimos al admin principal si intenta entrar a zonas restringidas
         const restrictedPaths = ['/admin/invoices', '/admin/reports', '/admin/timer'];
         if (restrictedPaths.some(p => pathname.startsWith(p))) {
           return NextResponse.redirect(new URL('/admin', request.url))
         }
      }
    }
    // El owner tiene acceso total (no hacemos nada)
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
