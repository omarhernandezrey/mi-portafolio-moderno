import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { writeContentVersion } from '@/lib/admin/versions';
import { supabaseServer } from '@/lib/supabaseServer';
import { projectCreateSchema } from '@/lib/portfolio/schemas';
import { comprobarEmbebido } from '@/lib/portfolio/embedCheck';
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
    .from('portfolio_projects')
    .select('*')
    .order('position', { ascending: true })
    .limit(TOPE_LISTA);

  if (error) return respuestaErrorBd(error, 'admin/portfolio/projects');

  if (data && data.length >= TOPE_LISTA * 0.9) {
    console.warn(
      `[portfolio_projects] ${data.length} filas, cerca del tope de ${TOPE_LISTA}: ` +
        'el reorden necesita la lista completa y dejará de funcionar al superarlo.'
    );
  }

  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const result = projectCreateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const { is_published, demo, ...resto } = result.data;

  // Comprobación de embebido (T-07): se avisa si el demo bloquea el iframe
  // del visor, no se bloquea la publicación — un error de red tampoco cuenta
  // como bloqueo (ver embedCheck.ts).
  let demoEmbeddable = true;
  let embedCheck: Awaited<ReturnType<typeof comprobarEmbebido>> | null = null;
  if (demo) {
    embedCheck = await comprobarEmbebido(demo);
    demoEmbeddable = embedCheck.resultado !== 'no-embebible';
  }

  // El siguiente puesto en el orden: al final de la lista.
  const { count } = await supabaseServer
    .from('portfolio_projects')
    .select('*', { count: 'exact', head: true });

  const { data, error } = await supabaseServer
    .from('portfolio_projects')
    .insert({
      ...resto,
      demo,
      is_published,
      demo_embeddable: demoEmbeddable,
      demo_checked_at: embedCheck ? new Date().toISOString() : null,
      position: count ?? 0,
    })
    .select()
    .single();

  if (error) {
    // 23505 = unique_violation (el slug ya existe).
    const status = error.code === '23505' ? 400 : 500;
    const message = error.code === '23505' ? `El slug «${resto.slug}» ya existe` : error.message;
    return NextResponse.json({ error: message }, { status });
  }

  await writeAuditLog(auth.actor, {
    action: 'portfolio_project.create',
    resourceType: 'portfolio_project',
    resourceId: data.id,
    metadata: { slug: resto.slug },
  });

  await writeContentVersion(auth.actor, {
    action: 'create',
    resourceType: 'portfolio_project',
    resourceId: data.id,
    before: null,
    after: data,
  });

  revalidateTag('portfolio:projects');

  return NextResponse.json({ ...data, embedCheck }, { status: 201 });
}
