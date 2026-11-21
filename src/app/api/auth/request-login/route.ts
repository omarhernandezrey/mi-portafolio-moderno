import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { crearClientePublico } from '@/lib/supabase/public';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';

const EsquemaCorreo = z.string().email().max(254);

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

// Cota por IP sola, además de la de IP+correo. Sin esta, el contador por
// correo nunca se agota si cada intento usa una dirección distinta: 10.000
// correos nuevos desde una IP son 10.000 envíos permitidos.
const INTENTOS_POR_IP = 15;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  // `.email()` de zod y tope de 254 (el máximo de RFC 5321): antes bastaba
  // una cadena no vacía, así que 64 KB de basura consumían una ranura del
  // límite y viajaban a Supabase.
  if (!EsquemaCorreo.safeParse(email).success) {
    return NextResponse.json({ error: 'Correo requerido.' }, { status: 400 });
  }

  const ip = clientIp(req.headers);
  const clave = `admin-login:${ip}:${email.toLowerCase()}`;
  const { allowed } = checkRateLimit(clave, INTENTOS_PERMITIDOS, VENTANA_MS);
  const { allowed: permitidoPorIp } = checkRateLimit(
    `admin-login-ip:${ip}`,
    INTENTOS_POR_IP,
    VENTANA_MS
  );
  if (!allowed || !permitidoPorIp) {
    return NextResponse.json(
      { error: 'Demasiados intentos con este correo. Espera unos minutos e inténtalo de nuevo.' },
      { status: 429 }
    );
  }

  const { error } = await crearClientePublico().auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${req.nextUrl.origin}/auth/callback`,
      // El panel NO es un registro: solo pueden entrar los correos que ya
      // tienen fila en `user_roles` (y pasan la allowlist). Sin esto,
      // `signInWithOtp` crea el usuario en `auth.users` por omisión, así que
      // esta ruta pública servía para dar de alta usuarios ajenos y para
      // mandarles un correo desde el dominio de Omar. No da acceso al panel
      // —`requireAdmin` sigue exigiendo rol—, pero sí quema reputación de
      // remitente, cuota de envío de Supabase y ensucia el directorio.
      shouldCreateUser: false,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
