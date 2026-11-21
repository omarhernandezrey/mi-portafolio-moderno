import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { supabaseServer } from '@/lib/supabaseServer';
import { RECURSOS_VERSIONABLES, writeContentVersion } from '@/lib/admin/versions';
import { writeAuditLog, type AuditAction } from '@/lib/admin/audit';

/** Qué caché de `portfolio/repository.ts` invalidar tras restaurar cada tipo de recurso. */
const ETIQUETA_CACHE: Record<string, string> = {
  portfolio_project: 'portfolio:projects',
  portfolio_skill: 'portfolio:skills',
  portfolio_education_category: 'portfolio:education',
  portfolio_education_item: 'portfolio:education',
  portfolio_badge: 'portfolio:badges',
  portfolio_service: 'portfolio:services',
  portfolio_technology: 'portfolio:technologies',
  portfolio_timeline: 'portfolio:timeline',
  portfolio_profile: 'portfolio:profile',
};

/**
 * Restaura una versión histórica (T-18): "antes" de un borrado o "después"
 * de una edición, lo que exista — ambos son la foto completa de la fila, así
 * que restaurar es volver a escribirla tal cual con un `upsert`. Es, en sí
 * misma, un guardado más: queda su propia fila en `content_versions` con
 * `action: 'restore'`, igual que exige la ficha.
 */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const { data: version, error: versionError } = await supabaseServer
    .from('content_versions')
    .select('*')
    .eq('id', id)
    .single();

  if (versionError) {
    return NextResponse.json({ error: 'Versión no encontrada' }, { status: 404 });
  }

  const recurso = RECURSOS_VERSIONABLES[version.resource_type];
  if (!recurso) {
    return NextResponse.json({ error: `Tipo de recurso desconocido: ${version.resource_type}` }, { status: 400 });
  }

  // La foto a restaurar: el estado "después" de esa versión, o si esa
  // versión fue un borrado (sin "después"), el estado justo antes de borrar.
  const foto = (version.after ?? version.before) as Record<string, unknown> | null;
  if (!foto) {
    return NextResponse.json({ error: 'Esta versión no tiene una foto que restaurar' }, { status: 400 });
  }

  // La foto viene de `content_versions`, no de la petición, pero eso no la
  // hace de fiar: es la ÚNICA escritura del portafolio que no pasa por un
  // esquema, y lo que escriba acaba publicado en el sitio. Dos comprobaciones
  // mínimas antes del upsert.

  // 1) Que sea de verdad un objeto de columnas (un jsonb puede ser array,
  //    número o cadena, y el upsert con un array escribiría varias filas).
  if (typeof foto !== 'object' || Array.isArray(foto)) {
    return NextResponse.json(
      { error: 'La foto de esta versión no tiene forma de fila' },
      { status: 422 },
    );
  }

  // 2) Que la foto sea de la fila que dice ser. Sin esto, el upsert podía
  //    tocar OTRA fila mientras el registro posterior en `content_versions`
  //    afirmaba haber restaurado `version.resource_id`.
  const idEnLaFoto = foto[recurso.columnaId];
  if (idEnLaFoto !== version.resource_id) {
    return NextResponse.json(
      {
        error: `La foto apunta a otra fila (${recurso.columnaId}=${String(idEnLaFoto)}) ` +
          `que la versión registrada (${version.resource_id})`,
      },
      { status: 409 },
    );
  }

  // El estado actual del recurso, para dejarlo como "before" de esta
  // restauración (puede no existir, si la versión a restaurar era un alta
  // sobre un recurso que después se borró).
  const { data: actual } = await supabaseServer
    .from(recurso.tabla)
    .select('*')
    .eq(recurso.columnaId, version.resource_id)
    .maybeSingle();

  const { data: restaurado, error } = await supabaseServer
    .from(recurso.tabla)
    .upsert(foto, { onConflict: recurso.columnaId })
    .select()
    .single();

  if (error) {
    // 42703 (columna inexistente) y 42P01 significan que la foto es de un
    // esquema anterior al actual: es culpa del dato guardado, no un fallo
    // del servidor, y el mensaje opaco de 500 no decía cuál de las dos.
    const esquemaDesfasado = error.code === '42703' || error.code === '42P01';
    console.error('[restore] no se pudo restaurar la versión', id, error);
    return NextResponse.json(
      {
        error: esquemaDesfasado
          ? 'Esta versión se guardó con un esquema anterior y ya no encaja en la tabla'
          : 'No se pudo restaurar la versión',
      },
      { status: esquemaDesfasado ? 422 : 500 },
    );
  }

  await writeContentVersion(auth.actor, {
    action: 'restore',
    resourceType: version.resource_type,
    resourceId: version.resource_id,
    before: actual ?? null,
    after: restaurado,
  });

  // Además del historial de contenido, el registro de auditoría: restaurar
  // sobrescribe una fila publicada y hasta ahora no aparecía en /admin/audit.
  await writeAuditLog(auth.actor, {
    action: `${version.resource_type}.restore` as AuditAction,
    resourceType: version.resource_type,
    resourceId: version.resource_id,
    metadata: { versionId: id, versionAction: version.action, creadaEl: version.created_at },
  });

  const tag = ETIQUETA_CACHE[version.resource_type];
  if (tag) revalidateTag(tag);

  return NextResponse.json(restaurado);
}
