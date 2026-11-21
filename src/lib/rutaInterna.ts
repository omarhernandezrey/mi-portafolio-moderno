/**
 * Convierte un `?next=` recibido del cliente en una ruta interna segura.
 *
 * El patrón que había repetido en varias rutas comprobaba prefijos a mano
 * (`startsWith('/')`, `!startsWith('//')`, y en `auth/callback` también
 * `!startsWith('/\\')`). Eso es una lista negra, y las listas negras de URLs
 * se escapan: `/\evil.com` pasa las dos primeras comprobaciones y
 * `new URL('/\\evil.com', origin)` resuelve a `https://evil.com/` — el
 * navegador trata `\` como `/` al normalizar la autoridad.
 *
 * Aquí se invierte la lógica: se resuelve la URL contra el propio origen y se
 * acepta solo si el resultado SIGUE en ese origen. Así da igual qué
 * codificación o separador se use para intentar salir; lo que decide es el
 * destino real, no la forma del texto.
 *
 * Devuelve siempre una ruta relativa (path + query + hash), nunca absoluta,
 * para que quien la use no pueda reintroducir el problema al concatenar.
 */
export function rutaInternaSegura(
  destino: string | null | undefined,
  origen: string,
  porDefecto = '/'
): string {
  if (!destino) return porDefecto;

  let resuelta: URL;
  let base: URL;
  try {
    base = new URL(origen);
    resuelta = new URL(destino, base);
  } catch {
    return porDefecto;
  }

  // El único criterio: ¿el destino real se queda en casa?
  if (resuelta.origin !== base.origin) return porDefecto;

  return `${resuelta.pathname}${resuelta.search}${resuelta.hash}`;
}
