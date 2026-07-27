import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { generateContractPDF } from '@/lib/contracts/generate';
import { notifyTelegram } from '@/lib/chatbot/telegram';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Token faltante' }, { status: 400 });
    }

    const { data: lead, error: fetchError } = await supabaseServer
      .from('leads')
      .select('id, name, email, service_requested, budget, timeline, onboarding_step, contract_signed_at')
      .eq('onboarding_token', token)
      .single();

    if (fetchError || !lead) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 404 });
    }

    // Idempotencia: si ya firmó, no regenerar ni re-notificar
    if (lead.contract_signed_at) {
      return NextResponse.json({ success: true, alreadySigned: true });
    }

    // Orden de pasos: el brief (paso 2) debe existir antes de firmar
    if ((lead.onboarding_step || 1) < 2) {
      return NextResponse.json({ error: 'Completa el brief antes de firmar el contrato' }, { status: 400 });
    }

    // 1. Generar PDF
    const pdfBytes = await generateContractPDF({
      clientName: lead.name || 'Cliente',
      clientEmail: lead.email || '',
      service: lead.service_requested || 'Servicio de Desarrollo',
      budget: lead.budget || 'A convenir',
      timeline: lead.timeline || 'A convenir'
    });

    // 2. Subir a Supabase Storage — nombre determinista (upsert real, sin huérfanos)
    const fileName = `contrato_${lead.id}.pdf`;
    const { data: uploadData, error: uploadError } = await supabaseServer
      .storage
      .from('contracts')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError || !uploadData) {
      // Fallar en voz alta: no marcar como firmado si el PDF no quedó guardado
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: 'No se pudo guardar el contrato. Intenta de nuevo.' }, { status: 500 });
    }

    // 3. Actualizar lead
    const { error: updateError } = await supabaseServer
      .from('leads')
      .update({
        onboarding_step: 3,
        contract_signed_at: new Date().toISOString(),
        contract_url: uploadData.path
      })
      .eq('id', lead.id)
      .is('contract_signed_at', null); // doble seguro contra carreras

    if (updateError) {
      return NextResponse.json({ error: 'Error al actualizar el lead' }, { status: 500 });
    }

    // 4. Notificar a Omar
    await notifyTelegram(`✍️ *Contrato Firmado*\nCliente: ${lead.name}\nProyecto: ${lead.service_requested}`)
      .catch(e => console.error('notifyTelegram error:', e));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding contract error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
