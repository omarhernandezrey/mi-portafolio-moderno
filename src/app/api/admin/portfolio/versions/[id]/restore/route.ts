import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { supabaseServer } from '@/lib/supabaseServer';
import { RECURSOS_VERSIONABLES, writeContentVersion } from '@/lib/admin/versions';

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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await writeContentVersion(auth.actor, {
    action: 'restore',
    resourceType: version.resource_type,
    resourceId: version.resource_id,
    before: actual ?? null,
    after: restaurado,
  });

  const tag = ETIQUETA_CACHE[version.resource_type];
  if (tag) revalidateTag(tag);

  return NextResponse.json(restaurado);
}
