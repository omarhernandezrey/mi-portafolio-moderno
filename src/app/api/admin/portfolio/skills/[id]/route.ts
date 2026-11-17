import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { writeContentVersion } from '@/lib/admin/versions';
import { supabaseServer } from '@/lib/supabaseServer';
import { skillUpdateSchema } from '@/lib/portfolio/schemas';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json();

  const result = skillUpdateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
  }

  // `skillUpdateSchema` viene de `.partial()`: un campo ausente en el cuerpo
  // igual aparece como clave propia con valor `undefined` (zod no la omite).
  const update: Record<string, unknown> = Object.fromEntries(
    Object.entries(result.data).filter(([, valor]) => valor !== undefined),
  );

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
  }

  // Foto ANTERIOR completa: es el "before" de la versión (T-18).
  const { data: previo } = await supabaseServer.from('portfolio_skills').select('*').eq('id', id).single();

  const { data, error } = await supabaseServer
    .from('portfolio_skills')
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
    action: 'portfolio_skill.update',
    resourceType: 'portfolio_skill',
    resourceId: id,
    metadata: update,
  });

  await writeContentVersion(auth.actor, {
    action: 'update',
    resourceType: 'portfolio_skill',
    resourceId: id,
    before: previo ?? null,
    after: data,
  });

  revalidateTag('portfolio:skills');

  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const { data: borrado, error } = await supabaseServer
    .from('portfolio_skills')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAuditLog(auth.actor, {
    action: 'portfolio_skill.delete',
    resourceType: 'portfolio_skill',
    resourceId: id,
  });

  await writeContentVersion(auth.actor, {
    action: 'delete',
    resourceType: 'portfolio_skill',
    resourceId: id,
    before: borrado ?? null,
    after: null,
  });

  revalidateTag('portfolio:skills');

  return NextResponse.json({ success: true });
}
