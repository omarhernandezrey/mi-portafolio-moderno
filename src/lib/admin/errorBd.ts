import { NextResponse } from 'next/server';

/** Forma mínima de un error de PostgREST/Supabase. */
export interface ErrorBd {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
}

/**
 * Traduce un error de Supabase a una respuesta HTTP.
 *
 * Antes ~39 sitios devolvían `error.message` crudo al cliente. Dos
 * problemas distintos:
 *
 * 1. FILTRA ESTRUCTURA. El mensaje de Postgres lleva nombres de tablas,
 *    columnas y constraints ("duplicate key value violates unique
 *    constraint \"portfolio_projects_slug_key\""). Es rol-autenticado, así
 *    que no es una fuga al público, pero describe el esquema a quien no
 *    necesita conocerlo.
 *
 * 2. ERA UN MAL MENSAJE. Todo salía como 500, incluidos los casos que son
 *    culpa de la petición y que la pantalla debería poder explicar: un
 *    slug repetido se mostraba como "Internal Server Error" en vez de
 *    "ya existe un registro con ese valor".
 *
 * Así que esto no es solo tapar: los códigos conocidos se traducen a un
 * mensaje en español y al estado correcto (409, 400, 404…), y lo
 * desconocido cae a un 500 genérico. El error completo SIEMPRE se escribe
 * en el log del servidor, que es donde se diagnostica.
 */
export function respuestaErrorBd(
  error: ErrorBd | null | undefined,
  contexto: string,
): NextResponse {
  console.error(`[${contexto}]`, error);

  const codigo = error?.code ?? '';

  switch (codigo) {
    case '23505': // unique_violation
      return NextResponse.json(
        { error: 'Ya existe un registro con ese valor único.', codigo },
        { status: 409 },
      );

    case '23503': // foreign_key_violation
      return NextResponse.json(
        { error: 'Hace referencia a un registro que no existe.', codigo },
        { status: 409 },
      );

    case '23502': // not_null_violation
      return NextResponse.json(
        { error: 'Falta un campo obligatorio.', codigo },
        { status: 400 },
      );

    case '23514': // check_violation
      return NextResponse.json(
        { error: 'Un valor no cumple las reglas de la tabla.', codigo },
        { status: 400 },
      );

    case '22P02': // invalid_text_representation (p. ej. un uuid mal formado)
      return NextResponse.json(
        { error: 'Identificador con formato inválido.', codigo },
        { status: 400 },
      );

    case 'PGRST116': // 0 filas donde se esperaba exactamente 1
      return NextResponse.json({ error: 'No encontrado.', codigo }, { status: 404 });

    case '42501': // insufficient_privilege
      return NextResponse.json({ error: 'Operación no permitida.', codigo }, { status: 403 });

    default:
      // Nada de `error.message` aquí: lo desconocido no se reenvía.
      return NextResponse.json({ error: 'No se pudo completar la operación.' }, { status: 500 });
  }
}
