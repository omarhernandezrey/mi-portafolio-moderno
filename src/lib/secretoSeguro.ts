import crypto from 'crypto';

/**
 * Compara dos secretos en tiempo constante.
 *
 * `a !== b` sobre cadenas corta en el primer carácter distinto, así que el
 * tiempo de respuesta depende de cuántos caracteres se acertaron. Es la
 * puerta de atrás clásica para adivinar un secreto byte a byte.
 *
 * El riesgo real por HTTP es bajo: el ruido de red suele tapar esas
 * diferencias de nanosegundos. Lo que motiva este helper no es un ataque
 * inminente, sino la incoherencia: `src/lib/newsletter/unsubscribe.ts` ya
 * resolvía exactamente este caso con `timingSafeEqual`, mientras que las
 * dos comprobaciones máquina-a-máquina MÁS sensibles del proyecto —el
 * Bearer de los crons y el secreto del webhook de Telegram— usaban `!==`.
 * Se unifica en el patrón que el propio repo ya había elegido.
 *
 * La comparación de longitudes previa no es una fuga: `timingSafeEqual`
 * lanza si los buffers miden distinto, así que hay que mirarlo antes. La
 * longitud de un secreto no es el secreto.
 */
export function secretosIguales(
  recibido: string | null | undefined,
  esperado: string | null | undefined
): boolean {
  if (!recibido || !esperado) return false;

  const bufRecibido = Buffer.from(recibido);
  const bufEsperado = Buffer.from(esperado);

  if (bufRecibido.length !== bufEsperado.length) return false;

  return crypto.timingSafeEqual(bufRecibido, bufEsperado);
}
