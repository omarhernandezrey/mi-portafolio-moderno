import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { serverEnv } from './config/env'
import { canAccessAdminPath, minRoleForApiRequest } from './lib/admin/permissions'
import { hasMinRole, isAdminRole } from './lib/admin/roles'
import { isEmailAllowed } from './lib/admin/access'

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

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/tickets/:path*'],
}
