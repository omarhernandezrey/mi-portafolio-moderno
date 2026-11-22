import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { PURGA_INMEDIATA } from '@/lib/cachePurga';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { reordenarPortfolio } from '@/lib/portfolio/reorder';
import { reorderSchema } from '@/lib/portfolio/schemas';

/**
 * `position` es por categoría (ver `route.ts` de este recurso), así que el
 * cliente manda solo los ids de UNA categoría en el orden deseado — nunca
 * la lista global — y aquí se reescribe 0..n-1 sobre esos ids, igual que en
 * cualquier otro reorder.
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
  const reorden = await reordenarPortfolio('portfolio_education_items', ids);
  if (!reorden.ok) {
    return NextResponse.json({ error: reorden.mensaje }, { status: reorden.estado });
  }

  await writeAuditLog(auth.actor, {
    action: 'portfolio_education_item.reorder',
    resourceType: 'portfolio_education_item',
    metadata: { ids, filas: reorden.filas },
  });

  revalidateTag('portfolio:education', PURGA_INMEDIATA);

  return NextResponse.json({ success: true });
}
