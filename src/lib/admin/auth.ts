import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { serverEnv } from '@/config/env';
import { type AdminRole, hasMinRole, isAdminRole } from './roles';
import { minRoleForApiRequest } from './permissions';
import { isEmailAllowed, maskSecret, sanitizeWebhook } from './access';
import type { AuditActor } from './audit';

export type AdminAuthSuccess = {
  ok: true;
  user: User;
  role: AdminRole;
  email: string;
  actor: AuditActor;
};

export type AdminAuthFailure = {
  ok: false;
  response: NextResponse;
};

export type AdminAuthResult = AdminAuthSuccess | AdminAuthFailure;

export { isEmailAllowed, maskSecret, sanitizeWebhook };

/**
 * Valida sesión Supabase + rol en user_roles + allowlist opcional.
 * Usar al inicio de cada handler de /api/admin/* y /api/tickets/*.
 */
export async function requireAdmin(minRole: AdminRole = 'viewer'): Promise<AdminAuthResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'No autenticado' }, { status: 401 }),
    };
  }

  const email = user.email || '';

  if (!isEmailAllowed(email, serverEnv.ADMIN_ALLOWED_EMAILS)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 }),
    };
  }

  const { data: userRole, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !userRole || !isAdminRole(userRole.role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Sin rol de administración' }, { status: 403 }),
    };
  }

  const role = userRole.role;

  if (!hasMinRole(role, minRole)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 }),
    };
  }

  return {
    ok: true,
    user,
    role,
    email,
    actor: { userId: user.id, email, role },
  };
}

/** Resuelve rol mínimo según path + método HTTP y valida. */
export async function requireAdminForPath(
  pathname: string,
  method: string = 'GET'
): Promise<AdminAuthResult> {
  return requireAdmin(minRoleForApiRequest(pathname, method));
}

/**
 * Lee el rol del usuario actual sin redirigir ni devolver una respuesta HTTP.
 * Pensado para páginas/componentes servidor que ya están detrás de
 * AdminLayout (que valida sesión + rol) y solo necesitan el rol para decidir
 * qué UI mostrar (ej. ocultar botones de escritura a un `viewer`).
 * Devuelve null si no hay sesión o rol válido (no debería pasar bajo el layout).
 */
export async function getAdminRole(): Promise<AdminRole | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!userRole || !isAdminRole(userRole.role)) return null;

  return userRole.role;
}
