export const ADMIN_ROLES = ['owner', 'assistant', 'viewer'] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  owner: 'Propietario',
  assistant: 'Asistente',
  viewer: 'Solo lectura',
};

const ROLE_RANK: Record<AdminRole, number> = {
  viewer: 1,
  assistant: 2,
  owner: 3,
};

export function isAdminRole(value: unknown): value is AdminRole {
  return typeof value === 'string' && (ADMIN_ROLES as readonly string[]).includes(value);
}

export function hasMinRole(role: AdminRole, minRole: AdminRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minRole];
}
