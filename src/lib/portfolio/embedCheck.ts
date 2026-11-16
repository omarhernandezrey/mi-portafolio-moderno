/**
 * Comprobador de embebido (T-07): ¿el sitio de un `demo` deja que `Card.tsx`
 * lo muestre dentro de un iframe, o lo bloquea con `X-Frame-Options` o la
 * directiva `frame-ancestors` de `Content-Security-Policy`?
 *
 * Solo la función y sus tests por ahora. Quien la ejecute y guarde el
 * resultado en `demo_embeddable`/`demo_checked_at` es el panel (T-09), al
 * guardar o editar el `demo` de un proyecto — no se ejecuta sola contra los
 * 22 proyectos actuales desde aquí.
 */

export type ResultadoEmbebido = 'embebible' | 'no-embebible' | 'sin-comprobar';

const CABECERA_BLOQUEANTE = /^\s*(deny|sameorigin)\s*$/i;
const FRAME_ANCESTORS_NONE = /frame-ancestors\s+([^;]+)/i;

/** `demo` de cada proyecto, para no repetir la URL en cada aviso. */
export interface ComprobacionEmbebido {
  demo: string;
  resultado: ResultadoEmbebido;
  motivo: string;
}

/**
 * Hace `fetch` al `demo` y decide si se puede embeber.
 *
 * - `X-Frame-Options: DENY` o `SAMEORIGIN` bloquean cualquier origen ajeno
 *   (el portafolio nunca es el mismo origen del demo): no embebible.
 * - `frame-ancestors 'none'` en `Content-Security-Policy` bloquea a todos:
 *   no embebible. Cualquier otro valor de `frame-ancestors` (una lista de
 *   orígenes, `'self'`, `*`…) no se evalúa aquí: no es un bloqueo universal
 *   y decidir si el portafolio está en esa lista es responsabilidad de quien
 *   llame a esta función con el origen real, no de este chequeo genérico.
 * - Sin ninguna de las dos cabeceras: embebible.
 * - Un error de red (demo caído, DNS, timeout) **no** se interpreta como
 *   bloqueo: no se pudo comprobar, así que no se marca una tarjeta buena
 *   como rota por un problema de red transitorio.
 */
export async function comprobarEmbebido(
  demo: string,
  hacerFetch: typeof fetch = fetch,
): Promise<ComprobacionEmbebido> {
  let respuesta: Response;
  try {
    respuesta = await hacerFetch(demo, { method: 'GET', redirect: 'follow' });
  } catch (e) {
    return {
      demo,
      resultado: 'sin-comprobar',
      motivo: `no se pudo contactar el demo: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  const xfo = respuesta.headers.get('x-frame-options')?.trim();
  if (xfo && CABECERA_BLOQUEANTE.test(xfo)) {
    return { demo, resultado: 'no-embebible', motivo: `X-Frame-Options: ${xfo}` };
  }

  const csp = respuesta.headers.get('content-security-policy');
  const frameAncestors = csp ? FRAME_ANCESTORS_NONE.exec(csp)?.[1]?.trim() : null;
  if (frameAncestors && /'none'/i.test(frameAncestors)) {
    return { demo, resultado: 'no-embebible', motivo: `frame-ancestors: ${frameAncestors}` };
  }

  return { demo, resultado: 'embebible', motivo: 'sin cabecera que lo bloquee' };
}
