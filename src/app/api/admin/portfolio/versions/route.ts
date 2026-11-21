import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { supabaseServer } from '@/lib/supabaseServer';
import { respuestaErrorBd } from '@/lib/admin/errorBd';

/**
 * Historial de un recurso (T-18). Solo `owner`: a diferencia de
 * `admin_audit_logs` (que cualquier rol admin puede leer), una versión
 * puede llevar el texto completo de un borrador sin publicar.
 *
 * Devuelve METADATOS, no contenido: ver el comentario del `select`.
 */
const LIMITE_POR_DEFECTO = 50;
const LIMITE_MAXIMO = 200;
export async function GET(req: NextRequest) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const resourceType = req.nextUrl.searchParams.get('resourceType');
  const resourceId = req.nextUrl.searchParams.get('resourceId');
  if (!resourceType || !resourceId) {
    return NextResponse.json({ error: 'Faltan resourceType y resourceId' }, { status: 400 });
  }

  // `limit` acotado: pedir más de LIMITE_MAXIMO no trae más.
  const limitePedido = Number(req.nextUrl.searchParams.get('limit'));
  const limite = Number.isFinite(limitePedido) && limitePedido > 0
    ? Math.min(Math.floor(limitePedido), LIMITE_MAXIMO)
    : LIMITE_POR_DEFECTO;

  // `select` explícito SIN `before`/`after`: era la consulta más pesada por
  // byte de todo el panel. Cada fila lleva dos fotos completas de la fila
  // versionada, y `content_versions` crece con CADA alta, edición y borrado
  // de los 9 recursos del portafolio (172 cursos y 99 proyectos hoy). Para
  // pintar una lista de "qué pasó y cuándo" no hace falta el contenido: la
  // ruta de restaurar ya lee la fila entera por su id cuando se necesita.
  const { data, error, count } = await supabaseServer
    .from('content_versions')
    .select('id, resource_type, resource_id, action, actor_id, actor_email, created_at', {
      count: 'exact',
    })
    .eq('resource_type', resourceType)
    .eq('resource_id', resourceId)
    .order('created_at', { ascending: false })
    .limit(limite);

  if (error) return respuestaErrorBd(error, 'admin/portfolio/versions');

  const versiones = data ?? [];
  const total = count ?? versiones.length;

  // Se dice cuántas hay en total y si quedaron fuera: una lista truncada en
  // silencio haría creer que ese es todo el historial del recurso.
  return NextResponse.json(versiones, {
    headers: {
      'X-Total-Count': String(total),
      'X-Truncated': String(total > versiones.length),
    },
  });
}
