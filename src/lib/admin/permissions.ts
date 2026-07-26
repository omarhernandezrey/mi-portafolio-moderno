import type { AdminRole } from './roles';
import { hasMinRole } from './roles';

/**
 * Matriz única de permisos admin (paths de UI).
 * Middleware y AdminNav deben basarse en esto.
 */
export const ADMIN_PATH_PERMISSIONS: ReadonlyArray<{
  prefix: string;
  minRole: AdminRole;
}> = [
  { prefix: '/admin/invoices', minRole: 'owner' },
  { prefix: '/admin/subscribers', minRole: 'owner' },
  { prefix: '/admin/webhooks', minRole: 'owner' },
  { prefix: '/admin/logs', minRole: 'owner' },
  { prefix: '/admin/reports', minRole: 'owner' },
  { prefix: '/admin/timer', minRole: 'assistant' },
  { prefix: '/admin/docs', minRole: 'assistant' },
  { prefix: '/admin/conversations', minRole: 'viewer' },
  { prefix: '/admin/tickets', minRole: 'viewer' },
  { prefix: '/admin/leads', minRole: 'viewer' },
  { prefix: '/admin', minRole: 'viewer' },
];

/** Prefijos de API admin y rol mínimo por recurso */
export const ADMIN_API_PERMISSIONS: ReadonlyArray<{
  prefix: string;
  minRole: AdminRole;
}> = [
  { prefix: '/api/admin/invoices', minRole: 'owner' },
  { prefix: '/api/admin/subscribers', minRole: 'owner' },
  { prefix: '/api/admin/webhooks', minRole: 'owner' },
  { prefix: '/api/admin/webhook-logs', minRole: 'owner' },
  { prefix: '/api/admin/logs', minRole: 'owner' },
  { prefix: '/api/admin/timer/report', minRole: 'owner' },
  { prefix: '/api/admin/timer', minRole: 'assistant' },
  { prefix: '/api/admin/leads', minRole: 'assistant' },
  { prefix: '/api/admin/conversations', minRole: 'viewer' },
  { prefix: '/api/tickets', minRole: 'viewer' },
  { prefix: '/api/admin', minRole: 'viewer' },
];

export function canAccessAdminPath(pathname: string, role: AdminRole): boolean {
  if (pathname === '/admin/login') return true;

  const match = ADMIN_PATH_PERMISSIONS.find(
    (p) => pathname === p.prefix || pathname.startsWith(`${p.prefix}/`)
  );

  if (!match) return hasMinRole(role, 'viewer');
  return hasMinRole(role, match.minRole);
}

export function minRoleForApiPath(pathname: string): AdminRole {
  const match = ADMIN_API_PERMISSIONS.find(
    (p) => pathname === p.prefix || pathname.startsWith(`${p.prefix}/`)
  );
  return match?.minRole ?? 'viewer';
}

export const NAV_ITEMS: ReadonlyArray<{
  label: string;
  href: string;
  roles: readonly AdminRole[];
  group: 'core' | 'ops' | 'system';
}> = [
  { label: 'Dashboard', href: '/admin', roles: ['owner', 'assistant', 'viewer'], group: 'core' },
  { label: 'Leads', href: '/admin/leads', roles: ['owner', 'assistant', 'viewer'], group: 'core' },
  { label: 'Conversaciones', href: '/admin/conversations', roles: ['owner', 'assistant', 'viewer'], group: 'core' },
  { label: 'Tickets', href: '/admin/tickets', roles: ['owner', 'assistant', 'viewer'], group: 'core' },
  { label: 'Timer', href: '/admin/timer', roles: ['owner', 'assistant'], group: 'ops' },
  { label: 'Facturación', href: '/admin/invoices', roles: ['owner'], group: 'ops' },
  { label: 'Suscriptores', href: '/admin/subscribers', roles: ['owner'], group: 'ops' },
  { label: 'Webhooks', href: '/admin/webhooks', roles: ['owner'], group: 'system' },
  { label: 'Logs de API', href: '/admin/logs', roles: ['owner'], group: 'system' },
  { label: 'Docs', href: '/admin/docs', roles: ['owner', 'assistant'], group: 'system' },
];
