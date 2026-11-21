import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { EmailOtpType } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { serverEnv } from '@/config/env'
import { isAdminRole } from '@/lib/admin/roles'
import { isEmailAllowed } from '@/lib/admin/access'
import { rutaInternaSegura } from '@/lib/rutaInterna'

/**
 * Callback del enlace mágico (T-19).
 *
 * Camino principal: `token_hash` + `type`, el patrón SSR de Supabase. El
 * enlace del correo apunta aquí directamente y `verifyOtp` crea la sesión en
 * el servidor (cookies incluidas). El camino `code` original no funcionaba de
 * punta a punta: `signInWithOtp` se hace con un cliente de flujo implícito,
 * así que Supabase devolvía los tokens en el fragmento `#...` de la URL, que
 * un route handler jamás recibe. Se conserva `code` por compatibilidad con
 * enlaces OAuth/PKCE que sí traen query param.
 */
const TIPOS_OTP: ReadonlyArray<EmailOtpType> = ['magiclink', 'email', 'recovery', 'invite', 'email_change']

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const typeParam = searchParams.get('type')
  // Solo rutas internas. Antes se comprobaban prefijos a mano (`//`, `/\`);
  // ahora decide el origen ya resuelto, que no depende de acertar la lista
  // de separadores. Mismo helper que las dos rutas de vista previa.
  const next = rutaInternaSegura(searchParams.get('next'), origin, '/admin')

  if (code || tokenHash) {
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

    const { error } = tokenHash
      ? await supabase.auth.verifyOtp({
          type: TIPOS_OTP.includes(typeParam as EmailOtpType)
            ? (typeParam as EmailOtpType)
            : 'magiclink',
          token_hash: tokenHash,
        })
      : await supabase.auth.exchangeCodeForSession(code as string)

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
