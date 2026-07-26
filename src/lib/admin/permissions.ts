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
  { prefix: '/admin/audit', minRole: 'owner' },
  { prefix: '/admin/reports', minRole: 'owner' },
  { prefix: '/admin/timer', minRole: 'assistant' },
  { prefix: '/admin/docs', minRole: 'assistant' },
  { prefix: '/admin/conversations', minRole: 'viewer' },
  { prefix: '/admin/tickets', minRole: 'viewer' },
  { prefix: '/admin/leads', minRole: 'viewer' },
  { prefix: '/admin', minRole: 'viewer' },
];

type ApiPermission = {
  prefix: string;
  /** Rol mínimo para GET/HEAD */
  read: AdminRole;
  /** Rol mínimo para POST/PATCH/PUT/DELETE (default = read) */
  write?: AdminRole;
};

/** Prefijos de API admin: lectura vs escritura */
export const ADMIN_API_PERMISSIONS: ReadonlyArray<ApiPermission> = [
  { prefix: '/api/admin/invoices', read: 'owner', write: 'owner' },
  { prefix: '/api/admin/subscribers', read: 'owner', write: 'owner' },
  { prefix: '/api/admin/webhooks', read: 'owner', write: 'owner' },
  { prefix: '/api/admin/webhook-logs', read: 'owner', write: 'owner' },
  { prefix: '/api/admin/logs', read: 'owner' },
  { prefix: '/api/admin/audit', read: 'owner' },
  { prefix: '/api/admin/timer/report', read: 'owner' },
  { prefix: '/api/admin/timer', read: 'assistant', write: 'assistant' },
  { prefix: '/api/admin/leads', read: 'assistant', write: 'assistant' },
  { prefix: '/api/admin/conversations', read: 'viewer' },
  { prefix: '/api/tickets', read: 'viewer', write: 'assistant' },
  { prefix: '/api/admin', read: 'viewer', write: 'assistant' },
];

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function matchApiPermission(pathname: string): ApiPermission | undefined {
  return ADMIN_API_PERMISSIONS.find(
    (p) => pathname === p.prefix || pathname.startsWith(`${p.prefix}/`)
  );
}

export function canAccessAdminPath(pathname: string, role: AdminRole): boolean {
  if (pathname === '/admin/login') return true;

  const match = ADMIN_PATH_PERMISSIONS.find(
    (p) => pathname === p.prefix || pathname.startsWith(`${p.prefix}/`)
  );

  if (!match) return hasMinRole(role, 'viewer');
  return hasMinRole(role, match.minRole);
}

/** @deprecated Prefer minRoleForApiRequest(pathname, method) */
export function minRoleForApiPath(pathname: string): AdminRole {
  return minRoleForApiRequest(pathname, 'GET');
}

export function minRoleForApiRequest(pathname: string, method: string): AdminRole {
  const match = matchApiPermission(pathname);
  if (!match) return 'viewer';

  const isWrite = WRITE_METHODS.has(method.toUpperCase());
  if (isWrite) return match.write ?? match.read;
  return match.read;
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
  { label: 'Auditoría', href: '/admin/audit', roles: ['owner'], group: 'system' },
  { label: 'Docs', href: '/admin/docs', roles: ['owner', 'assistant'], group: 'system' },
];
