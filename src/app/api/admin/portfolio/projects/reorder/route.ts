import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { supabaseServer } from '@/lib/supabaseServer';
import { reorderSchema } from '@/lib/portfolio/schemas';

/**
 * Reordenar: el cliente manda la lista COMPLETA de ids en el orden deseado
 * (ya calculado tras un botón subir/bajar); aquí se reescribe `position`
 * 0..n-1 en ese orden. No hay "mover de 3 a 7": siempre se manda la lista
 * entera, así nunca hay huecos ni posiciones repetidas por una actualización
 * parcial.
 */
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
    ids.map((id, index) =>
      supabaseServer.from('portfolio_projects').update({ position: index }).eq('id', id),
    ),
  );

  const fallo = resultados.find((r) => r.error);
  if (fallo?.error) {
    return NextResponse.json({ error: fallo.error.message }, { status: 500 });
  }

  await writeAuditLog(auth.actor, {
    action: 'portfolio_project.reorder',
    resourceType: 'portfolio_project',
    metadata: { ids },
  });

  revalidateTag('portfolio:projects');

  return NextResponse.json({ success: true });
}
