/**
 * MFA TOTP para el rol `owner` (T-19).
 *
 * Supabase no necesita que esta app "obligue" la activación: en cuanto el
 * usuario enrola un factor verificado, Supabase sube `nextLevel` a `aal2` en
 * cada sesión nueva, y la sesión en curso se queda en `aal1` hasta que
 * complete el desafío. Mientras nadie haya enrolado nada, `nextLevel` sigue
 * en `aal1` y no hay nada que exigir — MFA es opcional hasta que el propio
 * `owner` decide activarla desde `/admin/security`.
 */

export type NivelAal = 'aal1' | 'aal2' | null;

export interface EstadoAal {
  currentLevel: NivelAal;
  nextLevel: NivelAal;
}

/** `true` si hay un factor verificado y esta sesión todavía no completó el desafío. */
export function necesitaDesafioMfa(estado: EstadoAal): boolean {
  return estado.nextLevel === 'aal2' && estado.currentLevel !== 'aal2';
}
