import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { notifyTelegram } from '@/lib/chatbot/telegram';
import { requireCronAuth } from '@/lib/cronAuth';
import {
  bogotaDayRange,
  construirResumenDiario,
  formatearPagos,
  resumirPendientes,
  topServicio,
} from '@/lib/chatbot/dailySummary';

export const maxDuration = 30;

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authError = requireCronAuth(req);
  if (authError) return authError;

  try {
    const { start: startOfYesterday, end: startOfToday } = bogotaDayRange(1);

    // 1. Leads nuevos de ayer
    const { count: leadsCount, error: leadsErr } = await supabaseServer
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfYesterday)
      .lt('created_at', startOfToday);
    if (leadsErr) throw leadsErr;

    // 2. Pendientes de respuesta (status 'new' o 'cold'), con su fecha para medir antigüedad
    const { data: pendingLeads, error: pendingErr } = await supabaseServer
      .from('leads')
      .select('created_at')
      .in('status', ['new', 'cold']);
    if (pendingErr) throw pendingErr;
    const pendientes = resumirPendientes(pendingLeads ?? [], new Date());

    // 3. Pagos confirmados de ayer (status 'paid', por fecha de pago si existe)
    const { data: paidLeads, error: paidErr } = await supabaseServer
      .from('leads')
      .select('budget')
      .eq('status', 'paid')
      .gte('paid_at', startOfYesterday)
      .lt('paid_at', startOfToday);
    if (paidErr) throw paidErr;
    const pagosLabel = formatearPagos(paidLeads ?? []);

    // 4. Top servicio consultado de ayer
    const { data: topServiceData, error: serviceErr } = await supabaseServer
      .from('leads')
      .select('service_requested')
      .gte('created_at', startOfYesterday)
      .lt('created_at', startOfToday);
    if (serviceErr) throw serviceErr;
    const servicioTop = topServicio(topServiceData ?? []);

    const resumen = construirResumenDiario({
      leadsCount: leadsCount ?? 0,
      pendientes,
      pagosLabel,
      servicioTop,
    });

    if (resumen.skip) {
      return NextResponse.json({ skipped: true, reason: resumen.reason });
    }

    const resultado = await notifyTelegram(resumen.mensaje);
    return NextResponse.json({ success: true, telegram: resultado });
  } catch (error) {
    console.error('Cron daily summary error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
