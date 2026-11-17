import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { writeContentVersion } from '@/lib/admin/versions';
import { supabaseServer } from '@/lib/supabaseServer';
import { technologyCreateSchema } from '@/lib/portfolio/schemas';

export async function GET() {
  const auth = await requireAdmin('viewer');
  if (!auth.ok) return auth.response;

  const { data, error } = await supabaseServer
    .from('portfolio_technologies')
    .select('*')
    .order('position', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const result = technologyCreateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const { count } = await supabaseServer
    .from('portfolio_technologies')
    .select('*', { count: 'exact', head: true });

  const { data, error } = await supabaseServer
    .from('portfolio_technologies')
    .insert({ ...result.data, position: count ?? 0 })
    .select()
    .single();

  if (error) {
    // 23505 = unique_violation (`name` ya existe: es la identidad, no hay slug en esta tabla).
    const status = error.code === '23505' ? 400 : 500;
    const message = error.code === '23505' ? `La tecnología «${result.data.name}» ya existe` : error.message;
    return NextResponse.json({ error: message }, { status });
  }

  await writeAuditLog(auth.actor, {
    action: 'portfolio_technology.create',
    resourceType: 'portfolio_technology',
    resourceId: data.id,
    metadata: { name: result.data.name },
  });

  await writeContentVersion(auth.actor, {
    action: 'create',
    resourceType: 'portfolio_technology',
    resourceId: data.id,
    before: null,
    after: data,
  });

  revalidateTag('portfolio:technologies');

  return NextResponse.json(data, { status: 201 });
}
