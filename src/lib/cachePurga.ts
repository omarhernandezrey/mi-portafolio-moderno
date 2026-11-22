/**
 * Perfil de expiración para `revalidateTag` (Next 16).
 *
 * En Next 15 bastaba `revalidateTag(tag)`: la etiqueta se purgaba y la
 * siguiente petición recibía datos frescos. En Next 16 la firma exige un
 * segundo argumento que decide CUÁNTO TIEMPO se puede seguir sirviendo
 * contenido viejo mientras la revalidación corre por detrás.
 *
 * La documentación recomienda `'max'` (ventana de un año, nunca bloquea).
 * Aquí NO se usa, a propósito:
 *
 * · Con `'max'`, Omar publica un proyecto desde el panel, abre el sitio y
 *   sigue viendo la versión anterior — la revalidación ocurre por detrás y
 *   el primer visitante recibe lo viejo. En un sitio de noticias eso es
 *   deseable; en un panel cuyo propósito declarado es ser "el motor real
 *   del portafolio", parece que el guardado no funcionó.
 *
 * · `{ expire: 0 }` es el equivalente EXACTO del comportamiento de Next 15
 *   (la propia documentación dice que la forma de un solo argumento se
 *   comportaba así). Una subida de framework no debería cambiar en silencio
 *   lo que el usuario ve.
 *
 * · El coste —que la siguiente petición espere a la revalidación— es
 *   irrelevante con el tráfico de un portafolio, y solo lo paga quien entra
 *   justo después de una edición.
 *
 * `updateTag`, que sería la otra opción, no aplica: solo funciona dentro de
 * Server Actions y aquí todo son Route Handlers.
 *
 * Si algún día se prefiere servir contenido viejo a cambio de latencia,
 * basta cambiar esta constante por `'max'` en un solo sitio.
 */
export const PURGA_INMEDIATA = { expire: 0 } as const;
