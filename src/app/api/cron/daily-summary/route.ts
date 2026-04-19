import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { notifyTelegram } from '@/lib/chatbot/telegram';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Verificación de seguridad simple
  const authHeader = req.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const startOfYesterday = yesterday.toISOString();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfToday = today.toISOString();

    // 1. Conversaciones de ayer
    const { count: convCount, error: convErr } = await supabaseServer
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfYesterday)
      .lt('created_at', startOfToday);
    if (convErr) throw convErr;

    // 2. Leads nuevos de ayer
    const { count: leadsCount, error: leadsErr } = await supabaseServer
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfYesterday)
      .lt('created_at', startOfToday);
    if (leadsErr) throw leadsErr;

    // 3. Pendientes de respuesta (status 'new' o 'cold')
    const { count: pendingCount, error: pendingErr } = await supabaseServer
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .in('status', ['new', 'cold']);
    if (pendingErr) throw pendingErr;

    // 4. Pagos confirmados de ayer (status 'paid')
    const { data: paidLeads, error: paidErr } = await supabaseServer
      .from('leads')
      .select('budget')
      .eq('status', 'paid')
      .gte('created_at', startOfYesterday)
      .lt('created_at', startOfToday);
    if (paidErr) throw paidErr;

    const totalPaid = paidLeads?.reduce((acc, lead) => {
      // Intentar extraer el número del budget (ej: "$500 USD" -> 500)
      const amount = parseFloat(lead.budget?.replace(/[^0-9.]/g, '') || '0');
      return acc + (isNaN(amount) ? 0 : amount);
    }, 0) || 0;

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

    // 6. Enviar mensaje a Telegram
    const message = [
      '☀️ *Buenos días Omar*',
      'Ayer:',
      `- 🗨️ ${convCount || 0} conversaciones`,
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
