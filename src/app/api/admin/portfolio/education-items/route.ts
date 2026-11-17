import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { supabaseServer } from '@/lib/supabaseServer';
import { educationItemCreateSchema } from '@/lib/portfolio/schemas';
import { subirImagenPortafolio } from '@/lib/portfolio/uploadImage';

export async function GET() {
  const auth = await requireAdmin('viewer');
  if (!auth.ok) return auth.response;

  const { data, error } = await supabaseServer
    .from('portfolio_education_items')
    .select('*')
    .order('position', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const result = educationItemCreateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const { logo_data_url, certificate_data_url, ...resto } = result.data;
  let { logo, certificate_url } = resto;

  if (logo_data_url) {
    const subida = await subirImagenPortafolio(logo_data_url, 'logos');
    if (!subida.ok) return NextResponse.json({ error: { logo: [subida.error] } }, { status: 400 });
    logo = subida.url;
  }
  if (certificate_data_url) {
    const subida = await subirImagenPortafolio(certificate_data_url, 'certificados');
    if (!subida.ok) return NextResponse.json({ error: { certificate_url: [subida.error] } }, { status: 400 });
    certificate_url = subida.url;
  }

  const { count } = await supabaseServer
    .from('portfolio_education_items')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', resto.category_id);

  const { data, error } = await supabaseServer
    .from('portfolio_education_items')
    .insert({ ...resto, logo, certificate_url, position: count ?? 0 })
    .select()
    .single();

  if (error) {
    const status = error.code === '23505' ? 400 : 500;
    const message = error.code === '23505' ? `El slug «${resto.slug}» ya existe` : error.message;
    return NextResponse.json({ error: message }, { status });
  }

  await writeAuditLog(auth.actor, {
    action: 'portfolio_education_item.create',
    resourceType: 'portfolio_education_item',
    resourceId: data.id,
    metadata: { slug: resto.slug, category_id: resto.category_id },
  });

  revalidateTag('portfolio:education');

  return NextResponse.json(data, { status: 201 });
}
