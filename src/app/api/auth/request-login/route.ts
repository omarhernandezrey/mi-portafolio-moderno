import { NextRequest, NextResponse } from 'next/server';
import { crearClientePublico } from '@/lib/supabase/public';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';

/**
 * Pide el enlace mágico de acceso al panel (T-19).
 *
 * Antes `admin/login/page.tsx` llamaba a `supabase.auth.signInWithOtp` desde
 * el navegador: nada entre el formulario y Supabase podía frenar a quien
 * probara correos al por mayor. Esta ruta es ese punto intermedio.
 *
 * Límite: 5 solicitudes por IP + correo cada 15 minutos. `checkRateLimit` es
 * en memoria, por instancia (ver su comentario en `src/lib/rateLimit.ts`):
 * en serverless con varias instancias calientes, cada una lleva su propio
 * contador, así que el límite real es "N por instancia", no "N en total".
 * Para un límite exacto entre instancias haría falta contarlo en una tabla
 * de Supabase (un `upsert` con incremento atómico, por IP+correo+ventana) en
 * vez de en memoria del proceso. Se acepta esta aproximación como primera
 * línea — sigue sirviendo contra un intento automatizado simple — y queda
 * anotado qué se necesitaría para la versión exacta.
 */
const INTENTOS_PERMITIDOS = 5;
const VENTANA_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  if (!email) {
    return NextResponse.json({ error: 'Correo requerido.' }, { status: 400 });
  }

  const ip = clientIp(req.headers);
  const clave = `admin-login:${ip}:${email.toLowerCase()}`;
  const { allowed } = checkRateLimit(clave, INTENTOS_PERMITIDOS, VENTANA_MS);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Demasiados intentos con este correo. Espera unos minutos e inténtalo de nuevo.' },
      { status: 429 }
    );
  }

  const { error } = await crearClientePublico().auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${req.nextUrl.origin}/auth/callback` },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
