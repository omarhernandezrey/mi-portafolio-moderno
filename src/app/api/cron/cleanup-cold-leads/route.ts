import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { notifyTelegram } from '@/lib/chatbot/telegram';
import { requireCronAuth } from '@/lib/cronAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authError = requireCronAuth(req);
  if (authError) return authError;

  try {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    // 1. Buscar leads 'new' antiguos (tope por corrida para no explotar Telegram)
    const { data: coldLeads, error: fetchError } = await supabaseServer
      .from('leads')
      .select('id, name, service_requested')
      .eq('status', 'new')
      .lt('created_at', fortyEightHoursAgo)
      .limit(50);

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

    // 3. UN solo mensaje de Telegram con el resumen (antes: 1 mensaje por lead)
    const lines = coldLeads
      .slice(0, 10)
      .map(l => `• ${l.name || 'Desconocido'} (${l.service_requested || 'Sin servicio'})`);
    const extra = coldLeads.length > 10 ? `\n…y ${coldLeads.length - 10} más` : '';
    await notifyTelegram(
      `🥶 *${coldLeads.length} lead(s) frío(s) sin respuesta:*\n${lines.join('\n')}${extra}\nRevisa el dashboard para reactivarlos.`
    ).catch(e => console.error('notifyTelegram error:', e));

    return NextResponse.json({
      success: true,
      processed: coldLeads.length
    });

  } catch (error) {
    console.error('Cron cleanup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

