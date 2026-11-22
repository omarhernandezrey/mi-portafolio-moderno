import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { PURGA_INMEDIATA } from '@/lib/cachePurga';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { writeContentVersion } from '@/lib/admin/versions';
import { supabaseServer } from '@/lib/supabaseServer';
import { technologyUpdateSchema } from '@/lib/portfolio/schemas';
import { respuestaErrorBd } from '@/lib/admin/errorBd';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json();

  const result = technologyUpdateSchema.safeParse(body);
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
  const { data: previo } = await supabaseServer.from('portfolio_technologies').select('*').eq('id', id).single();

  const { data, error } = await supabaseServer
    .from('portfolio_technologies')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    const status = error.code === '23505' ? 400 : 500;
    const message = error.code === '23505' ? 'Esa tecnología ya existe' : error.message;
    return NextResponse.json({ error: message }, { status });
  }

  await writeAuditLog(auth.actor, {
    action: 'portfolio_technology.update',
    resourceType: 'portfolio_technology',
    resourceId: id,
    metadata: update,
  });

  await writeContentVersion(auth.actor, {
    action: 'update',
    resourceType: 'portfolio_technology',
    resourceId: id,
    before: previo ?? null,
    after: data,
  });

  revalidateTag('portfolio:technologies', PURGA_INMEDIATA);

  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const { data: borrado, error } = await supabaseServer
    .from('portfolio_technologies')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) return respuestaErrorBd(error, 'admin/portfolio/technologies/[id]');

  await writeAuditLog(auth.actor, {
    action: 'portfolio_technology.delete',
    resourceType: 'portfolio_technology',
    resourceId: id,
  });

  await writeContentVersion(auth.actor, {
    action: 'delete',
    resourceType: 'portfolio_technology',
    resourceId: id,
    before: borrado ?? null,
    after: null,
  });

  revalidateTag('portfolio:technologies', PURGA_INMEDIATA);

  return NextResponse.json({ success: true });
}
