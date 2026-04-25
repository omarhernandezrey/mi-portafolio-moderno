import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { notifyTelegram } from '@/lib/chatbot/telegram';
import { serverEnv } from '@/config/env';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Verificación de seguridad simple (puedes mejorarla con un token en el header)
  const authHeader = req.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${serverEnv.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    // 1. Buscar leads 'new' antiguos
    const { data: coldLeads, error: fetchError } = await supabaseServer
      .from('leads')
      .select('id, name, service_requested')
      .eq('status', 'new')
      .lt('created_at', fortyEightHoursAgo);

    if (fetchError) throw fetchError;

    if (!coldLeads || coldLeads.length === 0) {
      return NextResponse.json({ message: 'No cold leads found.' });
    }

    // 2. Marcar como 'cold'
    const { error: updateError } = await supabaseServer
      .from('leads')
      .update({ status: 'cold' })
      .in('id', coldLeads.map(l => l.id));

    if (updateError) throw updateError;

    // 3. Notificar a Omar
    for (const lead of coldLeads) {
      await notifyTelegram(`🥶 *Lead frío sin respuesta*: ${lead.name || 'Desconocido'} (${lead.service_requested || 'Sin servicio especificado'}). Revisa el dashboard para reactivarlo.`);
    }

    return NextResponse.json({ 
      success: true, 
      processed: coldLeads.length 
    });

  } catch (error) {
    console.error('Cron cleanup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
