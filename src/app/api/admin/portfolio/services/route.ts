import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { PURGA_INMEDIATA } from '@/lib/cachePurga';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { writeContentVersion } from '@/lib/admin/versions';
import { supabaseServer } from '@/lib/supabaseServer';
import { serviceCreateSchema } from '@/lib/portfolio/schemas';
import { respuestaErrorBd } from '@/lib/admin/errorBd';

/** Tope holgado: ver el comentario del GET sobre su relación con el reorden. */
const TOPE_LISTA = 2000;

export async function GET() {
  const auth = await requireAdmin('viewer');
  if (!auth.ok) return auth.response;

  // El panel carga la lista entera porque el reorden EXIGE mandar todos los
  // ids: `public.reordenar_portfolio` rechaza una lista incompleta
  // (migración 20261121). Por eso el tope es holgado y no una paginación —
  // paginar aquí rompería el reorden. Si alguna tabla se acercara a este
  // número, lo que toca es cambiar el mecanismo de reorden, no subir el
  // tope en silencio: por eso avisa por consola antes de llegar.
  const { data, error } = await supabaseServer
    .from('portfolio_services')
    .select('*')
    .order('position', { ascending: true })
    .limit(TOPE_LISTA);

  if (error) return respuestaErrorBd(error, 'admin/portfolio/services');

  if (data && data.length >= TOPE_LISTA * 0.9) {
    console.warn(
      `[portfolio_services] ${data.length} filas, cerca del tope de ${TOPE_LISTA}: ` +
        'el reorden necesita la lista completa y dejará de funcionar al superarlo.'
    );
  }

  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const result = serviceCreateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const { count } = await supabaseServer
    .from('portfolio_services')
    .select('*', { count: 'exact', head: true });

  const { data, error } = await supabaseServer
    .from('portfolio_services')
    .insert({ ...result.data, position: count ?? 0 })
    .select()
    .single();

  if (error) {
    const status = error.code === '23505' ? 400 : 500;
    const message = error.code === '23505' ? `El slug «${result.data.slug}» ya existe` : error.message;
    return NextResponse.json({ error: message }, { status });
  }

  await writeAuditLog(auth.actor, {
    action: 'portfolio_service.create',
    resourceType: 'portfolio_service',
    resourceId: data.id,
    metadata: { slug: result.data.slug },
  });

  await writeContentVersion(auth.actor, {
    action: 'create',
    resourceType: 'portfolio_service',
    resourceId: data.id,
    before: null,
    after: data,
  });

  revalidateTag('portfolio:services', PURGA_INMEDIATA);

  return NextResponse.json(data, { status: 201 });
}
