import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/admin/auth';
import { respuestaErrorBd } from '@/lib/admin/errorBd';

export const dynamic = 'force-dynamic';

/**
 * T-31: traía toda la historia de suscriptores sin tope para que la
 * página calculara sus 4 contadores filtrando ese array completo en el
 * cliente. Ahora la lista queda acotada (los últimos 500) y los
 * contadores salen de 4 `count: 'exact', head: true` reales — así el
 * total que se muestra no depende de cuántas filas trajo la lista.
 */
const LIMITE_LISTA = 500;

async function getCounts() {
  const [{ count: total }, { count: confirmed }, { count: pending }, { count: unsubscribed }] = await Promise.all([
    supabaseServer.from('subscribers').select('*', { count: 'exact', head: true }),
    supabaseServer.from('subscribers').select('*', { count: 'exact', head: true }).eq('confirmed', true).is('unsubscribed_at', null),
    supabaseServer.from('subscribers').select('*', { count: 'exact', head: true }).eq('confirmed', false).is('unsubscribed_at', null),
    supabaseServer.from('subscribers').select('*', { count: 'exact', head: true }).not('unsubscribed_at', 'is', null),
  ]);
  return {
    total: total ?? 0,
    confirmed: confirmed ?? 0,
    pending: pending ?? 0,
    unsubscribed: unsubscribed ?? 0,
  };
}

export async function GET() {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const [{ data, error }, counts] = await Promise.all([
    supabaseServer
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(LIMITE_LISTA),
    getCounts(),
  ]);

  if (error) return respuestaErrorBd(error, 'admin/subscribers');
  return NextResponse.json({ data: data || [], counts });
}
