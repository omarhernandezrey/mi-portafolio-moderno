import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { reordenarPortfolio } from '@/lib/portfolio/reorder';
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

  // Una sola transacción en Postgres: valida que la lista sea el contenido
  // completo (sin huecos, repetidos ni ids ajenos) y reescribe todas las
  // posiciones de golpe. Antes eran N updates sueltos que podían quedarse a
  // medias. Ver migración 20261121_reordenar_portfolio_atomico.sql.
  const reorden = await reordenarPortfolio('portfolio_projects', ids);
  if (!reorden.ok) {
    return NextResponse.json({ error: reorden.mensaje }, { status: reorden.estado });
  }

  await writeAuditLog(auth.actor, {
    action: 'portfolio_project.reorder',
    resourceType: 'portfolio_project',
    metadata: { ids, filas: reorden.filas },
  });

  revalidateTag('portfolio:projects');

  return NextResponse.json({ success: true });
}
