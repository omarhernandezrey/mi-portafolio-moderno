import { createClient } from '@supabase/supabase-js';
import { clientEnv } from '@/config/env';

/**
 * Cliente de solo lectura para contenido público del portafolio.
 *
 * `src/lib/supabase/server.ts` depende de `cookies()` (sesión del admin) y
 * eso no se puede llamar dentro de una función envuelta en `unstable_cache`
 * (Next.js la marca como dinámica y revienta). Este cliente no lee cookies ni
 * persiste sesión: es la clave `anon`, limitada por RLS a lo publicado, igual
 * que vería cualquier visitante. No se usa `service_role` aquí.
 */
export function crearClientePublico() {
  return createClient(clientEnv.NEXT_PUBLIC_SUPABASE_URL, clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
}
