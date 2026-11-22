import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import {
  agregarUptimePorDia,
  type FilaDeUptime,
} from '@/lib/uptime/aggregate';
import { respuestaErrorBd } from '@/lib/admin/errorBd';

export const dynamic = 'force-dynamic';

/** Los mismos 90 días que anunciaba la gráfica vieja, ahora de verdad. */
const DIAS = 90;
/**
 * Tope de filas. Con una comprobación por hora, 90 días son ~2160; 4000 deja
 * margen de sobra si algún día se registra más a menudo, y acota la consulta
 * para que no pueda crecer sin límite (la lección de la auditoría de backend:
 * ningún `select` sin tope).
 */
const TOPE_DE_FILAS = 4000;

/**
 * Histórico de disponibilidad, agregado por día. Público y sin autenticación,
 * igual que `/api/health`: es la fuente de la gráfica de `/status`.
 *
 * `/status` NO habla con Supabase. La tabla `uptime_checks` no tiene políticas
 * para `anon` a propósito, así que la agregación pasa por aquí y el navegador
 * recibe 90 números, no 2160 filas.
 */
export async function GET() {
  const desde = new Date();
  desde.setUTCDate(desde.getUTCDate() - (DIAS - 1));
  desde.setUTCHours(0, 0, 0, 0);

  const { data, error } = await supabaseServer
    .from('uptime_checks')
    .select('checked_at, status, latency_ms')
    .gte('checked_at', desde.toISOString())
    .order('checked_at', { ascending: false })
    .limit(TOPE_DE_FILAS);

  if (error) {
    console.error(`[uptime/history] uptime_checks: ${error.message}`);
    return respuestaErrorBd(error, 'uptime/history');
  }

  const resumen = agregarUptimePorDia((data ?? []) as FilaDeUptime[], DIAS);

  return NextResponse.json(resumen);
}
