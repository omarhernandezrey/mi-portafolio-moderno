import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { supabaseServer } from '@/lib/supabaseServer';
import { badgeUpdateSchema } from '@/lib/portfolio/schemas';
import { subirImagenPortafolio } from '@/lib/portfolio/uploadImage';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json();

  const result = badgeUpdateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const { logo_data_url, certificate_data_url, ...resto } = result.data;
  const update: Record<string, unknown> = Object.fromEntries(
    Object.entries(resto).filter(([, valor]) => valor !== undefined),
  );

  if (logo_data_url) {
    const subida = await subirImagenPortafolio(logo_data_url, 'logos');
    if (!subida.ok) return NextResponse.json({ error: { logo: [subida.error] } }, { status: 400 });
    update.logo = subida.url;
  }
  if (certificate_data_url) {
    const subida = await subirImagenPortafolio(certificate_data_url, 'certificados');
    if (!subida.ok) return NextResponse.json({ error: { certificate_url: [subida.error] } }, { status: 400 });
    update.certificate_url = subida.url;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from('portfolio_badges')
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
    action: 'portfolio_badge.update',
    resourceType: 'portfolio_badge',
    resourceId: id,
    metadata: update,
  });

  revalidateTag('portfolio:badges');

  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const { error } = await supabaseServer.from('portfolio_badges').delete().eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAuditLog(auth.actor, {
    action: 'portfolio_badge.delete',
    resourceType: 'portfolio_badge',
    resourceId: id,
  });

  revalidateTag('portfolio:badges');

  return NextResponse.json({ success: true });
}
