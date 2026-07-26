import {
  canAccessAdminPath,
  minRoleForApiPath,
  minRoleForApiRequest,
} from '@/lib/admin/permissions';
import { hasMinRole, isAdminRole } from '@/lib/admin/roles';
import { isEmailAllowed, maskSecret, sanitizeWebhook } from '@/lib/admin/access';

describe('admin roles', () => {
  it('valida roles conocidos', () => {
    expect(isAdminRole('owner')).toBe(true);
    expect(isAdminRole('assistant')).toBe(true);
    expect(isAdminRole('viewer')).toBe(true);
    expect(isAdminRole('admin')).toBe(false);
    expect(isAdminRole(null)).toBe(false);
  });

  it('compara jerarquía de roles', () => {
    expect(hasMinRole('owner', 'viewer')).toBe(true);
    expect(hasMinRole('assistant', 'owner')).toBe(false);
    expect(hasMinRole('viewer', 'assistant')).toBe(false);
    expect(hasMinRole('assistant', 'assistant')).toBe(true);
  });
});

describe('admin path permissions', () => {
  it('bloquea facturas a assistant y viewer', () => {
    expect(canAccessAdminPath('/admin/invoices', 'owner')).toBe(true);
    expect(canAccessAdminPath('/admin/invoices/new', 'assistant')).toBe(false);
    expect(canAccessAdminPath('/admin/invoices', 'viewer')).toBe(false);
  });

  it('permite leads a viewer y bloquea timer', () => {
    expect(canAccessAdminPath('/admin/leads', 'viewer')).toBe(true);
    expect(canAccessAdminPath('/admin/leads/abc', 'viewer')).toBe(true);
    expect(canAccessAdminPath('/admin/timer', 'viewer')).toBe(false);
    expect(canAccessAdminPath('/admin/timer', 'assistant')).toBe(true);
  });

  it('bloquea webhooks/logs a no-owner', () => {
    expect(canAccessAdminPath('/admin/webhooks', 'owner')).toBe(true);
    expect(canAccessAdminPath('/admin/logs', 'assistant')).toBe(false);
    expect(canAccessAdminPath('/admin/docs', 'assistant')).toBe(true);
    expect(canAccessAdminPath('/admin/docs', 'viewer')).toBe(false);
  });

  it('resuelve minRole de APIs (lectura)', () => {
    expect(minRoleForApiPath('/api/admin/webhooks')).toBe('owner');
    expect(minRoleForApiPath('/api/admin/timer')).toBe('assistant');
    expect(minRoleForApiPath('/api/admin/timer/report')).toBe('owner');
    expect(minRoleForApiPath('/api/admin/conversations')).toBe('viewer');
    expect(minRoleForApiPath('/api/tickets/xyz')).toBe('viewer');
    expect(minRoleForApiPath('/api/admin/audit')).toBe('owner');
  });

  it('diferencia lectura vs escritura en tickets', () => {
    expect(minRoleForApiRequest('/api/tickets', 'GET')).toBe('viewer');
    expect(minRoleForApiRequest('/api/tickets', 'POST')).toBe('assistant');
    expect(minRoleForApiRequest('/api/tickets/abc', 'PATCH')).toBe('assistant');
    expect(minRoleForApiRequest('/api/tickets/abc/messages', 'GET')).toBe('viewer');
    expect(minRoleForApiRequest('/api/tickets/abc/messages', 'POST')).toBe('assistant');
  });

  it('bloquea path de auditoría a no-owner', () => {
    expect(canAccessAdminPath('/admin/audit', 'owner')).toBe(true);
    expect(canAccessAdminPath('/admin/audit', 'assistant')).toBe(false);
    expect(canAccessAdminPath('/admin/audit', 'viewer')).toBe(false);
  });
});

describe('admin allowlist y secrets', () => {
  it('permite todos si allowlist vacía', () => {
    expect(isEmailAllowed('a@b.com', '')).toBe(true);
    expect(isEmailAllowed('a@b.com', '  ')).toBe(true);
  });

  it('restringe por allowlist', () => {
    expect(isEmailAllowed('omar@test.com', 'omar@test.com, other@x.com')).toBe(true);
    expect(isEmailAllowed('OMAR@TEST.COM', 'omar@test.com')).toBe(true);
    expect(isEmailAllowed('hacker@evil.com', 'omar@test.com')).toBe(false);
    expect(isEmailAllowed(null, 'omar@test.com')).toBe(false);
  });

  it('enmascara secrets de webhooks', () => {
    expect(maskSecret('abcdefghijklmnop')).toBe('abcd…mnop');
    expect(maskSecret('short')).toBe('••••••••');
    expect(sanitizeWebhook({ id: '1', secret: 'supersecretvalue' }).secret).toBe('supe…alue');
    expect(sanitizeWebhook({ id: '1', secret: 'supersecretvalue' }).secret_masked).toBe(true);
  });
});
