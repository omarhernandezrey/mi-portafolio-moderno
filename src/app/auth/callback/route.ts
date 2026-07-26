import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { serverEnv } from '@/config/env'
import { isAdminRole } from '@/lib/admin/roles'
import { isEmailAllowed } from '@/lib/admin/access'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/admin'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      serverEnv.SUPABASE_URL,
      serverEnv.SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user || !isEmailAllowed(user.email, serverEnv.ADMIN_ALLOWED_EMAILS)) {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/admin/login?error=unauthorized`)
      }

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      if (!userRole || !isAdminRole(userRole.role)) {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/admin/login?error=unauthorized`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/admin/login?error=auth-code-error`)
}
