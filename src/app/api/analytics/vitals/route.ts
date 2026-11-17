import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';
import { vitalsEventSchema } from '@/lib/analytics/schemas';

export const dynamic = 'force-dynamic';

/**
 * Recibe una métrica de Web Vitals por llamada (T-15). Una visita normal
 * manda como mucho 3 (LCP, INP, CLS) por página; 30 cada 5 minutos por IP
 * deja navegar varias páginas sin rozar el límite y sigue frenando un
 * script que mande miles de filas falsas — la razón completa de por qué
 * esto es un endpoint con límite de tasa y no una política de `insert`
 * abierta para `anon` está en la migración y en la ficha de T-15.
 */
const LIMITE_POR_VENTANA = 30;
const VENTANA_MS = 5 * 60 * 1000;

/** Solo el pathname: sin query ni hash, que podrían llevar algo sensible. */
function limpiarPath(path: string): string {
  return path.split('?')[0].split('#')[0].slice(0, 300) || '/';
}

export async function POST(req: NextRequest) {
  const { allowed } = checkRateLimit(`analytics-vitals:${clientIp(req.headers)}`, LIMITE_POR_VENTANA, VENTANA_MS);
  if (!allowed) {
    return NextResponse.json({ error: 'Demasiadas solicitudes.' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = vitalsEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Carga útil inválida.' }, { status: 400 });
  }

  const { path, device, metric, value } = parsed.data;
  const { error } = await supabaseServer.from('analytics_vitals').insert({
    path: limpiarPath(path),
    device,
    metric,
    value,
  });

  if (error) {
    console.error(`[analytics/vitals] ${error.message}`);
    return NextResponse.json({ error: 'No se pudo guardar.' }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
