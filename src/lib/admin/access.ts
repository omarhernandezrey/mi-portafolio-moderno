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
  // Falla CERRADO: una allowlist vacía solía dejar pasar a cualquiera con
  // sesión de Supabase, que es exactamente lo contrario de lo que una
  // allowlist promete. Si la variable falta de verdad (no es un error
  // transitorio), el panel se queda cerrado para todos, Omar incluido — por
  // eso el error queda en logs con el nombre exacto de la variable a poner.
  if (allowlist.length === 0) {
    console.error(
      'ADMIN_ALLOWED_EMAILS no configurada: el panel queda cerrado para todos. ' +
        'Define la variable (lista de correos separados por coma) para recuperar el acceso.'
    );
    return false;
  }
  return allowlist.includes(email.trim().toLowerCase());
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
