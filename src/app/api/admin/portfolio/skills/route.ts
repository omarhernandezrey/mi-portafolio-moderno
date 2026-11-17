import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { supabaseServer } from '@/lib/supabaseServer';
import { skillCreateSchema } from '@/lib/portfolio/schemas';

export async function GET() {
  const auth = await requireAdmin('viewer');
  if (!auth.ok) return auth.response;

  const { data, error } = await supabaseServer
    .from('portfolio_skills')
    .select('*')
    .order('position', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const result = skillCreateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
  }

  // El siguiente puesto en el orden: al final de la lista.
  const { count } = await supabaseServer
    .from('portfolio_skills')
    .select('*', { count: 'exact', head: true });

  const { data, error } = await supabaseServer
    .from('portfolio_skills')
    .insert({ ...result.data, position: count ?? 0 })
    .select()
    .single();

  if (error) {
    // 23505 = unique_violation (el slug ya existe).
    const status = error.code === '23505' ? 400 : 500;
    const message = error.code === '23505' ? `El slug «${result.data.slug}» ya existe` : error.message;
    return NextResponse.json({ error: message }, { status });
  }

  await writeAuditLog(auth.actor, {
    action: 'portfolio_skill.create',
    resourceType: 'portfolio_skill',
    resourceId: data.id,
    metadata: { slug: result.data.slug },
  });

  revalidateTag('portfolio:skills');

  return NextResponse.json(data, { status: 201 });
}
