import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { supabaseServer } from '@/lib/supabaseServer';
import { reorderSchema } from '@/lib/portfolio/schemas';

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const result = reorderSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const { ids } = result.data;

  const resultados = await Promise.all(
    ids.map((id, index) => supabaseServer.from('portfolio_badges').update({ position: index }).eq('id', id)),
  );

  const fallo = resultados.find((r) => r.error);
  if (fallo?.error) {
    return NextResponse.json({ error: fallo.error.message }, { status: 500 });
  }

  await writeAuditLog(auth.actor, {
    action: 'portfolio_badge.reorder',
    resourceType: 'portfolio_badge',
    metadata: { ids },
  });

  revalidateTag('portfolio:badges');

  return NextResponse.json({ success: true });
}
