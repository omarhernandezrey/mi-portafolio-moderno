/**
 * Caché corta del rol de admin (T-19).
 *
 * Hoy cada petición a `/admin/*` consulta `user_roles` hasta tres veces:
 * `middleware.ts`, `AdminLayout` y, si la petición es a una API, también
 * `requireAdmin()`. Esta caché evita repetir la consulta dentro de la
 * ventana de TTL.
 *
 * Límite real, y por qué se acepta: `middleware.ts` corre en el runtime Edge
 * y los otros dos en Node — son procesos distintos y esta caché, en memoria
 * de módulo, no cruza esa frontera. Lo que sí logra: dentro de cada runtime,
 * en la misma instancia caliente, la segunda consulta en la misma ventana se
 * ahorra. El coste aceptado es el TTL: un cambio de rol (owner → viewer, por
 * ejemplo) puede tardar hasta `ROL_TTL_MS` en reflejarse en todas las capas.
 * Para una caché exacta y compartida entre runtimes haría falta un almacén
 * externo (Edge Config, o la propia fila de `user_roles` con un `updated_at`
 * que invalide); no se construye aquí por no ser parte de esta ficha.
 */
import type { AdminRole } from './roles';
import { isAdminRole } from './roles';

export const ROL_TTL_MS = 30_000;

interface EntradaCache {
  role: AdminRole | null;
  expiraEn: number;
}

const cache = new Map<string, EntradaCache>();

/** `undefined` = sin entrada vigente (hay que consultar); `null` = vigente y sin rol de admin. */
export function obtenerRolCacheado(userId: string, ahora: number = Date.now()): AdminRole | null | undefined {
  const entrada = cache.get(userId);
  if (!entrada || ahora >= entrada.expiraEn) return undefined;
  return entrada.role;
}

export function guardarRolCacheado(userId: string, role: AdminRole | null, ahora: number = Date.now()): void {
  cache.set(userId, { role, expiraEn: ahora + ROL_TTL_MS });
}

/** Tras cambiar el rol de alguien desde el panel, para no esperar a que venza el TTL. */
export function invalidarRolCacheado(userId: string): void {
  cache.delete(userId);
}

export function limpiarCacheDeRoles(): void {
  cache.clear();
}

/**
 * Resuelve el rol de `userId`: de la caché si está vigente; si no, llama a
 * `consultarRol` (quien llama arma la consulta real a `user_roles`, para no
 * acoplar esta caché al tipo del cliente de Supabase — comparar su tipo
 * genérico completo contra una interfaz propia es, además, lo que hacía que
 * TypeScript fallara con "Type instantiation is excessively deep") y deja
 * el resultado en caché. `ahora` existe para que el test pueda fijar la hora
 * en vez de depender del reloj real.
 */
export async function resolverRolDeUsuario(
  userId: string,
  consultarRol: () => PromiseLike<{ data: { role: string } | null; error: unknown }>,
  ahora: number = Date.now()
): Promise<AdminRole | null> {
  const cacheado = obtenerRolCacheado(userId, ahora);
  if (cacheado !== undefined) return cacheado;

  const { data } = await consultarRol();
  const role = data && isAdminRole(data.role) ? data.role : null;
  guardarRolCacheado(userId, role, ahora);
  return role;
}
