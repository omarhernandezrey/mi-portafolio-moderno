import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { serverEnv } from './config/env'
import { canAccessAdminPath, minRoleForApiRequest } from './lib/admin/permissions'
import { hasMinRole, isAdminRole } from './lib/admin/roles'
import { isEmailAllowed } from './lib/admin/access'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

async function runSupabaseAuth(request: NextRequest) {
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

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl
  const isApi = pathname.startsWith('/api/')

  const unauthorized = (status: number, message: string) => {
    if (isApi) {
      return NextResponse.json({ error: message }, { status })
    }
    const loginUrl = new URL('/admin/login', request.url)
    if (status === 403) loginUrl.searchParams.set('error', 'unauthorized')
    return NextResponse.redirect(loginUrl)
  }

  if (pathname === '/admin/login' && user) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  const isProtectedAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login'
  const isProtectedAdminApi =
    pathname.startsWith('/api/admin') || pathname.startsWith('/api/tickets')

  if (!isProtectedAdminPage && !isProtectedAdminApi) {
    return response
  }

  if (!user) {
    return unauthorized(401, 'No autenticado')
  }

  if (!isEmailAllowed(user.email, serverEnv.ADMIN_ALLOWED_EMAILS)) {
    return unauthorized(403, 'Acceso no autorizado')
  }

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!userRole || !isAdminRole(userRole.role)) {
    return unauthorized(403, 'Sin rol de administración')
  }

  const role = userRole.role

  if (isProtectedAdminApi) {
    const minRole = minRoleForApiRequest(pathname, request.method)
    if (!hasMinRole(role, minRole)) {
      return unauthorized(403, 'Permisos insuficientes')
    }
    return response
  }

  if (!canAccessAdminPath(pathname, role)) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return response
}

// Rutas fuera del árbol src/app/[locale]/ — next-intl no debe reescribirlas
// (con localePrefix:'as-needed' igual reescribe internamente a /es/<path>
// para el locale por defecto, y como esa ruta no existe bajo [locale], da 404).
const NON_LOCALIZED_PREFIXES = [
  '/status',
  '/onboarding',
  '/proposal',
  '/certificates',
  '/auth',
  '/opengraph-image',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // /admin y /api/* nunca deben pasar por el locale routing — son rutas
  // absolutas, no localizadas. El early-return es la barrera real, no
  // solo el matcher.
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/')) {
    return runSupabaseAuth(request)
  }

  if (NON_LOCALIZED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return NextResponse.next()
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/tickets/:path*',
    '/((?!_next|.*\\..*).*)',
  ],
}
