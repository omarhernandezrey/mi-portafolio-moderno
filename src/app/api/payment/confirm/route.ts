import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { notifyTelegram } from '@/lib/chatbot/telegram';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { leadId, amount, method } = body;

    if (!leadId || !amount || !method) {
      return NextResponse.json({ error: 'Missing required fields (leadId, amount, method)' }, { status: 400 });
    }

    // 1. Actualizar el estado del lead en Supabase
    const { data, error } = await supabaseServer
      .from('leads')
      .update({ 
        status: 'paid',
        notes: `PAGO CONFIRMADO: ${amount} vía ${method}.`
      })
      .eq('id', leadId)
      .select('name, email')
      .single();

    if (error) {
      console.error('Error updating lead status:', error);
      return NextResponse.json({ error: 'Failed to update lead status in database' }, { status: 500 });
    }

    // 2. Notificar a Omar por Telegram
    const notificationText = `
💰 *¡PAGO CONFIRMADO!*
-------------------------
👤 *Cliente:* ${data?.name || 'No especificado'}
📧 *Email:* ${data?.email || 'No especificado'}
💵 *Monto:* ${amount}
💳 *Método:* ${method}
📍 *Lead ID:* \`${leadId}\`
-------------------------
El estado del lead ha sido actualizado a 'paid'.
    `.trim();

    await notifyTelegram(notificationText);

    return NextResponse.json({ 
      success: true, 
      message: 'Payment confirmed and notified successfully' 
    });

  } catch (error) {
    console.error('Payment confirmation endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error processing payment confirmation' }, { status: 500 });
  }
}
