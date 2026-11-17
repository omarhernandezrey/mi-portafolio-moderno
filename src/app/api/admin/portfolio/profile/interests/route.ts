import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { writeContentVersion } from '@/lib/admin/versions';
import { supabaseServer } from '@/lib/supabaseServer';
import { interestsContentSchema } from '@/lib/portfolio/schemas';

/**
 * No es una lista de filas con su propio id: `portfolio_profile` guarda la
 * sección `interests` como UNA fila con `content` jsonb (ver `schemas.ts`).
 * Por eso no hay `[id]/route.ts` ni `reorder/route.ts` — GET lee esa fila
 * (o un array vacío si todavía no existe) y PUT reemplaza el array entero,
 * reordenar incluido.
 */
export async function GET() {
  const auth = await requireAdmin('viewer');
  if (!auth.ok) return auth.response;

  const { data, error } = await supabaseServer
    .from('portfolio_profile')
    .select('content, is_published')
    .eq('section', 'interests')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? { content: [], is_published: true });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const result = interestsContentSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
  }

  // Foto ANTERIOR completa: es el "before" de la versión (T-18). Incluye
  // `section` (no solo `content`/`is_published`) para que una restauración
  // futura pueda volver a hacer `upsert` sobre la misma clave.
  const { data: previo } = await supabaseServer
    .from('portfolio_profile')
    .select('section, content, is_published')
    .eq('section', 'interests')
    .maybeSingle();

  const { data, error } = await supabaseServer
    .from('portfolio_profile')
    .upsert(
      { section: 'interests', content: result.data.content, is_published: result.data.is_published },
      { onConflict: 'section' },
    )
    .select('section, content, is_published')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAuditLog(auth.actor, {
    action: 'portfolio_profile_interests.update',
    resourceType: 'portfolio_profile',
    resourceId: 'interests',
    metadata: { total: result.data.content.length },
  });

  await writeContentVersion(auth.actor, {
    action: 'update',
    resourceType: 'portfolio_profile',
    resourceId: 'interests',
    before: previo ?? null,
    after: data,
  });

  revalidateTag('portfolio:profile');

  return NextResponse.json(data);
}
