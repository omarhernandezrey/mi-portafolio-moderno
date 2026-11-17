import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { supabaseServer } from '@/lib/supabaseServer';
import { projectUpdateSchema } from '@/lib/portfolio/schemas';
import { comprobarEmbebido } from '@/lib/portfolio/embedCheck';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json();

  const result = projectUpdateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
  }

  // `projectUpdateSchema` viene de `.partial()`: un campo ausente en el
  // cuerpo igual aparece como clave propia con valor `undefined` (zod no la
  // omite), así que `Object.keys` por sí solo no detecta "no mandaron nada".
  const update: Record<string, unknown> = Object.fromEntries(
    Object.entries(result.data).filter(([, valor]) => valor !== undefined),
  );

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
  }

  // Solo se vuelve a comprobar el embebido si el `demo` cambió en esta
  // edición: re-comprobar en cada guardado de título/descripción haría una
  // petición de red externa por cada tecleo, sin motivo.
  let embedCheck: Awaited<ReturnType<typeof comprobarEmbebido>> | null = null;
  if (typeof update.demo === 'string' && update.demo) {
    embedCheck = await comprobarEmbebido(update.demo);
    update.demo_embeddable = embedCheck.resultado !== 'no-embebible';
    update.demo_checked_at = new Date().toISOString();
  }

  const { data, error } = await supabaseServer
    .from('portfolio_projects')
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
    action: 'portfolio_project.update',
    resourceType: 'portfolio_project',
    resourceId: id,
    metadata: update,
  });

  revalidateTag('portfolio:projects');

  return NextResponse.json({ ...data, embedCheck });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const { error } = await supabaseServer.from('portfolio_projects').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAuditLog(auth.actor, {
    action: 'portfolio_project.delete',
    resourceType: 'portfolio_project',
    resourceId: id,
  });

  revalidateTag('portfolio:projects');

  return NextResponse.json({ success: true });
}
