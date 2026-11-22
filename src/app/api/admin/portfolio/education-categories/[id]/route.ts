import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { PURGA_INMEDIATA } from '@/lib/cachePurga';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { writeContentVersion } from '@/lib/admin/versions';
import { supabaseServer } from '@/lib/supabaseServer';
import { educationCategoryUpdateSchema } from '@/lib/portfolio/schemas';
import { respuestaErrorBd } from '@/lib/admin/errorBd';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json();

  const result = educationCategoryUpdateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const update: Record<string, unknown> = Object.fromEntries(
    Object.entries(result.data).filter(([, valor]) => valor !== undefined),
  );

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
  }

  // Foto ANTERIOR completa: es el "before" de la versión (T-18).
  const { data: previo } = await supabaseServer
    .from('portfolio_education_categories')
    .select('*')
    .eq('id', id)
    .single();

  const { data, error } = await supabaseServer
    .from('portfolio_education_categories')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    const status = error.code === '23505' ? 400 : 500;
    const message = error.code === '23505' ? 'Ese slug ya existe' : error.message;
    return NextResponse.json({ error: message }, { status });
  }

  await writeAuditLog(auth.actor, {
    action: 'portfolio_education_category.update',
    resourceType: 'portfolio_education_category',
    resourceId: id,
    metadata: update,
  });

  await writeContentVersion(auth.actor, {
    action: 'update',
    resourceType: 'portfolio_education_category',
    resourceId: id,
    before: previo ?? null,
    after: data,
  });

  revalidateTag('portfolio:education', PURGA_INMEDIATA);

  return NextResponse.json(data);
}

/**
 * `portfolio_education_items.category_id` tiene `on delete cascade`: borrar
 * la categoría borra también sus ítems en la base. Aquí se cuentan ANTES de
 * borrar, para dejarlo en la auditoría y devolverlo en la respuesta — el
 * diálogo de confirmación del panel ya muestra ese número (lo calcula de la
 * lista de ítems que ya tiene cargada), esto es la constancia del lado del
 * servidor de cuántos se fueron de verdad.
 */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const { count: itemsEliminados } = await supabaseServer
    .from('portfolio_education_items')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id);

  const { data: borrado, error } = await supabaseServer
    .from('portfolio_education_categories')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) return respuestaErrorBd(error, 'admin/portfolio/education-categories/[id]');

  await writeAuditLog(auth.actor, {
    action: 'portfolio_education_category.delete',
    resourceType: 'portfolio_education_category',
    resourceId: id,
    metadata: { itemsEliminados: itemsEliminados ?? 0 },
  });

  // Nota: `on delete cascade` también borra los ítems de esta categoría en
  // la base, pero ese borrado lo ejecuta Postgres, no esta ruta — no queda
  // una versión por cada ítem perdido así. Restaurar esta categoría no
  // revive sus ítems; es una limitación conocida, no un intento fallido.
  await writeContentVersion(auth.actor, {
    action: 'delete',
    resourceType: 'portfolio_education_category',
    resourceId: id,
    before: borrado ?? null,
    after: null,
  });

  revalidateTag('portfolio:education', PURGA_INMEDIATA);

  return NextResponse.json({ success: true, itemsEliminados: itemsEliminados ?? 0 });
}
