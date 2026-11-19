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
  { prefix: '/admin/security', minRole: 'owner' },
  { prefix: '/admin/reports', minRole: 'owner' },
  { prefix: '/admin/timer', minRole: 'assistant' },
  { prefix: '/admin/docs', minRole: 'assistant' },
  { prefix: '/admin/feed/new', minRole: 'owner' },
  { prefix: '/admin/feed', minRole: 'viewer' },
  { prefix: '/admin/tickets', minRole: 'viewer' },
  { prefix: '/admin/leads', minRole: 'viewer' },
  { prefix: '/admin/negocio', minRole: 'viewer' },
  { prefix: '/admin/proyectos', minRole: 'viewer' },
  { prefix: '/admin/skills', minRole: 'viewer' },
  { prefix: '/admin/educacion', minRole: 'viewer' },
  { prefix: '/admin/contenido', minRole: 'viewer' },
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
  { prefix: '/api/admin/leads', read: 'viewer', write: 'assistant' },
  { prefix: '/api/admin/feed', read: 'viewer', write: 'assistant' },
  // T-09: edición de contenido del portafolio. Solo `owner` escribe (lo
  // valida también cada handler con requireAdmin('owner')); cualquier rol
  // admin puede leer para ver el estado de borradores en el panel.
  { prefix: '/api/admin/portfolio', read: 'viewer', write: 'owner' },
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

/**
 * `area` es la reorganización de T-08: **Portafolio** (el motor: contenido y
 * métricas, que T-09 a T-14 van llenando) y **Negocio** (el CRM de siempre,
 * completo e intacto). Ningún destino cambia de URL al introducir `area`;
 * solo `/admin` cambia de contenido (pasa a ser el resumen del portafolio) y
 * lo que mostraba pasa a vivir en `/admin/negocio`.
 */
export const NAV_ITEMS: ReadonlyArray<{
  label: string;
  href: string;
  roles: readonly AdminRole[];
  group: 'core' | 'ops' | 'system';
  area: 'portfolio' | 'negocio';
}> = [
  { label: 'Resumen del portafolio', href: '/admin', roles: ['owner', 'assistant', 'viewer'], group: 'core', area: 'portfolio' },
  { label: 'Proyectos', href: '/admin/proyectos', roles: ['owner', 'assistant', 'viewer'], group: 'core', area: 'portfolio' },
  { label: 'Skills', href: '/admin/skills', roles: ['owner', 'assistant', 'viewer'], group: 'core', area: 'portfolio' },
  { label: 'Educación', href: '/admin/educacion', roles: ['owner', 'assistant', 'viewer'], group: 'core', area: 'portfolio' },
  { label: 'Contenido', href: '/admin/contenido', roles: ['owner', 'assistant', 'viewer'], group: 'core', area: 'portfolio' },
  { label: 'Resumen de negocio', href: '/admin/negocio', roles: ['owner', 'assistant', 'viewer'], group: 'core', area: 'negocio' },
  { label: 'Leads', href: '/admin/leads', roles: ['owner', 'assistant', 'viewer'], group: 'core', area: 'negocio' },
  { label: 'Tickets', href: '/admin/tickets', roles: ['owner', 'assistant', 'viewer'], group: 'core', area: 'negocio' },
  { label: 'Comunidad', href: '/admin/feed', roles: ['owner', 'assistant', 'viewer'], group: 'core', area: 'negocio' },
  { label: 'Cronómetro', href: '/admin/timer', roles: ['owner', 'assistant'], group: 'ops', area: 'negocio' },
  { label: 'Facturación', href: '/admin/invoices', roles: ['owner'], group: 'ops', area: 'negocio' },
  { label: 'Reportes', href: '/admin/reports/time', roles: ['owner'], group: 'ops', area: 'negocio' },
  { label: 'Suscriptores', href: '/admin/subscribers', roles: ['owner'], group: 'ops', area: 'negocio' },
  { label: 'Webhooks', href: '/admin/webhooks', roles: ['owner'], group: 'system', area: 'negocio' },
  { label: 'Logs de API', href: '/admin/logs', roles: ['owner'], group: 'system', area: 'negocio' },
  { label: 'Auditoría', href: '/admin/audit', roles: ['owner'], group: 'system', area: 'negocio' },
  { label: 'Seguridad', href: '/admin/security', roles: ['owner'], group: 'system', area: 'negocio' },
  { label: 'Ayuda', href: '/admin/docs', roles: ['owner', 'assistant'], group: 'system', area: 'negocio' },
];
