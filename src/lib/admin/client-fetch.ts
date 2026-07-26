export class AdminApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
    this.body = body;
  }
}

type AdminFetchOptions = RequestInit & {
  /** Si true (default), redirige a login en 401 */
  redirectOnUnauthorized?: boolean;
};

/** Separado para poder mockear en tests. */
export function redirectToAdminLogin(): void {
  if (typeof window === 'undefined') return;
  window.location.href = '/admin/login?error=unauthorized';
}

/**
 * fetch autenticado para el admin.
 * Maneja 401 (redirige a login) y parsea errores JSON.
 */
export async function adminFetch<T = unknown>(
  input: string,
  init: AdminFetchOptions = {}
): Promise<T> {
  const { redirectOnUnauthorized = true, headers, ...rest } = init;

  const res = await fetch(input, {
    ...rest,
    headers: {
      ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
  });

  if (res.status === 401) {
    if (redirectOnUnauthorized) {
      redirectToAdminLogin();
    }
    throw new AdminApiError('No autenticado', 401);
  }

  if (res.status === 403) {
    const body = await res.json().catch(() => ({}));
    throw new AdminApiError(
      (body as { error?: string }).error || 'Permisos insuficientes',
      403,
      body
    );
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AdminApiError(
      (body as { error?: string }).error || `Error ${res.status}`,
      res.status,
      body
    );
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
