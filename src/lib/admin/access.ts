/** Utilidades puras usables en middleware (Edge) y route handlers. */

export function parseAllowedEmails(raw: string): string[] {
  if (!raw.trim()) return [];
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAllowed(
  email: string | undefined | null,
  allowlistRaw: string
): boolean {
  if (!email) return false;
  const allowlist = parseAllowedEmails(allowlistRaw);
  if (allowlist.length === 0) return true;
  return allowlist.includes(email.toLowerCase());
}

export function maskSecret(secret: string | null | undefined): string {
  if (!secret) return '';
  if (secret.length <= 8) return '••••••••';
  return `${secret.slice(0, 4)}…${secret.slice(-4)}`;
}

export function sanitizeWebhook<T extends { secret?: string | null }>(
  row: T
): Omit<T, 'secret'> & { secret: string; secret_masked: true } {
  const { secret, ...rest } = row;
  return {
    ...rest,
    secret: maskSecret(secret),
    secret_masked: true as const,
  };
}
