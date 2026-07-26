import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { serverEnv } from '@/config/env';
import { type AdminRole, hasMinRole, isAdminRole } from './roles';
import { minRoleForApiPath } from './permissions';
import { isEmailAllowed, maskSecret, sanitizeWebhook } from './access';

export type AdminAuthSuccess = {
  ok: true;
  user: User;
  role: AdminRole;
  email: string;
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

  return { ok: true, user, role, email };
}

/** Resuelve rol mínimo según el path de la request y valida. */
export async function requireAdminForPath(pathname: string): Promise<AdminAuthResult> {
  return requireAdmin(minRoleForApiPath(pathname));
}
