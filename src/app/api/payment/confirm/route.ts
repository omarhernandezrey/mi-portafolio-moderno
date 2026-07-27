import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { notifyTelegram } from '@/lib/chatbot/telegram';
import { requireAdmin } from '@/lib/admin/auth';

/**
 * Confirmación manual de pago (por ejemplo desde el admin tras verificar Wompi/Nequi).
 * PROTEGIDA: solo roles assistant+ — NUNCA expuesta al público ni al cliente.
 * Nota: los pagos reales del cliente se confirman vía onboarding con token.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin('assistant');
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const { leadId, amount, method } = body;

    if (!leadId || !amount || !method) {
      return NextResponse.json({ error: 'Missing required fields (leadId, amount, method)' }, { status: 400 });
    }

    // Append de nota de pago SIN destruir el contexto original del lead
    const { data: current } = await supabaseServer
      .from('leads')
      .select('notes')
      .eq('id', leadId)
      .maybeSingle();

    const paymentNote = `[${new Date().toISOString().split('T')[0]}] PAGO CONFIRMADO: ${amount} vía ${method} (por ${auth.email})`;
    const notes = current?.notes
      ? `${current.notes}\n${paymentNote}`
      : paymentNote;

    const { data, error } = await supabaseServer
      .from('leads')
      .update({
        status: 'paid',
        notes,
        paid_at: new Date().toISOString(),
      })
      .eq('id', leadId)
      .select('name, email')
      .single();

    if (error) {
      console.error('Error updating lead status:', error);
      return NextResponse.json({ error: 'Failed to update lead status in database' }, { status: 500 });
    }

    const notificationText = `
💰 *¡PAGO CONFIRMADO!*
-------------------------
👤 *Cliente:* ${data?.name || 'No especificado'}
📧 *Email:* ${data?.email || 'No especificado'}
💵 *Monto:* ${amount}
💳 *Método:* ${method}
✍️ *Registrado por:* ${auth.email}
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
