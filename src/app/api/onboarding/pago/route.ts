import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { notifyTelegram } from '@/lib/chatbot/telegram';
import { updateLeadStatusInNotion } from '@/lib/chatbot/notion';

export async function POST(req: NextRequest) {
  try {
    const { token, paymentId } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Token faltante' }, { status: 400 });
    }

    const { data: lead, error: fetchError } = await supabaseServer
      .from('leads')
      .select('*')
      .eq('onboarding_token', token)
      .single();

    if (fetchError || !lead) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 404 });
    }

    // 1. Actualizar lead a estado 'in_progress' y marcar pago
    const { error: updateError } = await supabaseServer
      .from('leads')
      .update({ 
        onboarding_step: 4,
        status: 'in_progress',
        paid_at: new Date().toISOString(),
        payment_id: paymentId || 'manual_confirm'
      })
      .eq('id', lead.id);

    if (updateError) {
      return NextResponse.json({ error: 'Error al actualizar el lead' }, { status: 500 });
    }

    // 2. Notificar a Omar
    await notifyTelegram(`💰 *PAGO RECIBIDO*\nCliente: ${lead.name}\nProyecto: ${lead.service_requested}\nEstado: INICIADO`);

    // 3. Integración con Notion para cambiar estado
    if (lead.email) {
      await updateLeadStatusInNotion(lead.email, 'En proceso');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding pago error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
