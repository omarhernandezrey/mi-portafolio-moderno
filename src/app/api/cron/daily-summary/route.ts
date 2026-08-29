import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { notifyTelegram } from '@/lib/chatbot/telegram';
import { requireCronAuth } from '@/lib/cronAuth';
import { parseBudgetAmount } from '@/lib/budget';

export const maxDuration = 30;

export const dynamic = 'force-dynamic';

// Ventana de "ayer" en hora de Bogotá (UTC-5) independiente de la TZ del servidor
function bogotaDayRange(offsetDays = 1): { start: string; end: string } {
  const BOGOTA_OFFSET_MS = -5 * 60 * 60 * 1000;
  const nowBogota = new Date(Date.now() + BOGOTA_OFFSET_MS);
  const startBogota = new Date(nowBogota);
  startBogota.setUTCDate(startBogota.getUTCDate() - offsetDays);
  startBogota.setUTCHours(0, 0, 0, 0);
  const endBogota = new Date(startBogota);
  endBogota.setUTCDate(endBogota.getUTCDate() + 1);
  return {
    start: new Date(startBogota.getTime() - BOGOTA_OFFSET_MS).toISOString(),
    end: new Date(endBogota.getTime() - BOGOTA_OFFSET_MS).toISOString(),
  };
}

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

    // 2. Pendientes de respuesta (status 'new' o 'cold')
    const { count: pendingCount, error: pendingErr } = await supabaseServer
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .in('status', ['new', 'cold']);
    if (pendingErr) throw pendingErr;

    // 3. Pagos confirmados de ayer (status 'paid', por fecha de pago si existe)
    const { data: paidLeads, error: paidErr } = await supabaseServer
      .from('leads')
      .select('budget')
      .eq('status', 'paid')
      .gte('paid_at', startOfYesterday)
      .lt('paid_at', startOfToday);
    if (paidErr) throw paidErr;

    const totalPaid = paidLeads?.reduce(
      (acc, lead) => acc + parseBudgetAmount(lead.budget),
      0
    ) || 0;

    // 5. Top servicio consultado de ayer
    const { data: topServiceData, error: serviceErr } = await supabaseServer
      .from('leads')
      .select('service_requested')
      .gte('created_at', startOfYesterday)
      .lt('created_at', startOfToday);
    if (serviceErr) throw serviceErr;

    const serviceCounts: Record<string, number> = {};
    topServiceData?.forEach(l => {
      const s = l.service_requested || 'Otros';
      serviceCounts[s] = (serviceCounts[s] || 0) + 1;
    });
    const topService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // 4. Enviar mensaje a Telegram
    const message = [
      '☀️ *Buenos días Omar*',
      'Ayer:',
      `- 🎯 ${leadsCount || 0} leads nuevos`,
      `- ⏳ ${pendingCount || 0} pendientes de tu respuesta`,
      `- 💰 ${totalPaid} USD en pagos confirmados`,
      `Top servicio consultado: ${topService}`,
    ].join('\n');

    await notifyTelegram(message);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Cron daily summary error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
