import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { notifyTelegram } from '@/lib/chatbot/telegram';
import { updateLeadStatusInNotion } from '@/lib/chatbot/notion';

/**
 * El cliente confirma que pagó el anticipo desde el wizard de onboarding.
 * No verificamos el pago aquí (los links de pago son manuales): el estado final
 * 'paid' lo confirma Omar desde el admin (/api/payment/confirm) tras revisar
 * Wompi/Nequi. Este endpoint solo marca la intención y notifica.
 */
export async function POST(req: NextRequest) {
  try {
    const { token, paymentId } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Token faltante' }, { status: 400 });
    }

    const { data: lead, error: fetchError } = await supabaseServer
      .from('leads')
      .select('id, name, email, service_requested, status, payment_id')
      .eq('onboarding_token', token)
      .single();

    if (fetchError || !lead) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 404 });
    }

    // Idempotencia: si ya confirmó, no re-notificar
    if (lead.payment_id) {
      return NextResponse.json({ success: true, alreadyConfirmed: true });
    }

    const { error: updateError } = await supabaseServer
      .from('leads')
      .update({
        onboarding_step: 4,
        status: 'contacted', // Pendiente de verificación manual — NO 'paid' sin verificar
        paid_at: new Date().toISOString(),
        payment_id: paymentId || 'manual_confirm'
      })
      .eq('id', lead.id)
      .is('payment_id', null); // Doble seguro contra carreras

    if (updateError) {
      return NextResponse.json({ error: 'Error al actualizar el lead' }, { status: 500 });
    }

    await notifyTelegram(
      `⚠️ *PAGO AUTODECLARADO (verificar)*\nCliente: ${lead.name}\nProyecto: ${lead.service_requested || 'N/D'}\nAcción: Verifica Wompi/Nequi y confirma desde el admin.`
    ).catch(e => console.error('notifyTelegram error:', e));

    // Notion es best-effort: una caída de Notion no debe fallar el endpoint
    if (lead.email) {
      await updateLeadStatusInNotion(lead.email, 'Pago por verificar')
        .catch(e => console.error('updateLeadStatusInNotion error:', e));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding pago error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
