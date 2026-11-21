import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireCronAuth } from '@/lib/cronAuth';
import { agregarVitales, type FilaVital } from '@/lib/analytics/aggregate-vitals';
import { esCaidaSostenida, mensajeVitalEnRiesgo } from '@/lib/notifications/events';
import { reclamarAviso, liberarAviso } from '@/lib/notifications/dedupe';
import { notifyTelegram } from '@/lib/chatbot/telegram';
import { respuestaErrorBd } from '@/lib/admin/errorBd';

export const dynamic = 'force-dynamic';

const EVENTO = 'vitals_regression';
/** Ventana de "sostenida": 7 días, no una carga suelta. */
const VENTANA_DIAS = 7;

function clavePorMetrica(metric: string, device: string): string {
  return `${metric}:${device}`;
}

/**
 * Aviso de "caída sostenida de un Core Web Vital" (T-17). Agrega el p75 de
 * los últimos 7 días (reutiliza `agregarVitales` de T-15) y lo compara
 * contra el umbral oficial "poor" de `web-vitals`. Si una combinación
 * métrica+dispositivo se recupera, libera su aviso para poder volver a
 * notificar si vuelve a caer — no se queda callada para siempre tras el
 * primer aviso.
 */
export async function GET(req: NextRequest) {
  const authError = requireCronAuth(req);
  if (authError) return authError;

  const desde = new Date(Date.now() - VENTANA_DIAS * 24 * 3600 * 1000).toISOString();
  const { data, error } = await supabaseServer
    .from('analytics_vitals')
    .select('metric, device, value')
    .gte('captured_at', desde);
  if (error) {
    console.error(`[vitals-check] analytics_vitals: ${error.message}`);
    return respuestaErrorBd(error, 'cron/vitals-check');
  }

  const resumen = agregarVitales((data ?? []) as FilaVital[]);
  const resultados = [];

  for (const r of resumen) {
    const clave = clavePorMetrica(r.metric, r.device);
    const enRiesgo = esCaidaSostenida(r.metric, r.p75, r.muestras);

    if (!enRiesgo) {
      await liberarAviso(EVENTO, clave);
      resultados.push({ ...r, avisado: false, razon: 'dentro-de-lo-saludable' });
      continue;
    }

    const puedeAvisar = await reclamarAviso(EVENTO, clave);
    if (!puedeAvisar) {
      resultados.push({ ...r, avisado: false, razon: 'ya-avisado' });
      continue;
    }

    await notifyTelegram(mensajeVitalEnRiesgo(r.metric, r.device, r.p75));
    resultados.push({ ...r, avisado: true });
  }

  return NextResponse.json({ success: true, resultados });
}
