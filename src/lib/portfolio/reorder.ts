import { supabaseServer } from '@/lib/supabaseServer';

/** Las 8 tablas de contenido ordenable. Debe coincidir con la lista blanca
 *  de `public.reordenar_portfolio` (migración 20261121). */
export type TablaOrdenable =
  | 'portfolio_projects'
  | 'portfolio_skills'
  | 'portfolio_education_categories'
  | 'portfolio_education_items'
  | 'portfolio_badges'
  | 'portfolio_services'
  | 'portfolio_technologies'
  | 'portfolio_timeline';

export type ResultadoReorden =
  | { ok: true; filas: number }
  | { ok: false; mensaje: string; estado: number };

/**
 * Reordena una tabla de contenido en UNA transacción.
 *
 * Antes cada ruta hacía N updates sueltos con `Promise.all`. Dos defectos
 * que la auditoría de backend midió:
 *
 * 1. Sin atomicidad: si fallaba el update nº3, los dos primeros ya estaban
 *    aplicados y la ruta devolvía 500 con el orden a medio reescribir.
 * 2. La invariante que el comentario prometía ("el cliente manda la lista
 *    COMPLETA") no se comprobaba en ningún sitio: un `ids` parcial
 *    reindexaba ese subconjunto a 0..k-1 y dejaba posiciones duplicadas.
 *
 * Las dos las resuelve ahora la función de Postgres, que valida y escribe
 * dentro de la misma transacción. Aquí solo se traduce su error a un código
 * HTTP: los de validación son culpa de la petición (400), no del servidor.
 */
export async function reordenarPortfolio(
  tabla: TablaOrdenable,
  ids: string[]
): Promise<ResultadoReorden> {
  const { data, error } = await supabaseServer.rpc('reordenar_portfolio', {
    p_tabla: tabla,
    p_ids: ids,
  });

  if (error) {
    // 22023 invalid_parameter_value · 23503 id inexistente · 42501 tabla
    // fuera de la lista blanca. Los tres describen una petición mal formada.
    const codigosDeCliente = ['22023', '23503', '42501'];
    const esDeCliente = codigosDeCliente.includes(error.code ?? '');
    console.error(`[reorder] ${tabla}:`, error);
    return {
      ok: false,
      mensaje: esDeCliente ? error.message : 'No se pudo reordenar',
      estado: esDeCliente ? 400 : 500,
    };
  }

  return { ok: true, filas: typeof data === 'number' ? data : ids.length };
}
