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
      .select('*')
      .eq('onboarding_token', token)
      .single();

    if (fetchError || !lead) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 404 });
    }

    // 1. Generar PDF
    const pdfBytes = await generateContractPDF({
      clientName: lead.name || 'Cliente',
      clientEmail: lead.email || '',
      service: lead.service_requested || 'Servicio de Desarrollo',
      budget: lead.budget || 'A convenir',
      timeline: lead.timeline || 'A convenir'
    });

    // 2. Subir a Supabase Storage
    const fileName = `contrato_${lead.id}_${Date.now()}.pdf`;
    const { data: uploadData, error: uploadError } = await supabaseServer
      .storage
      .from('contracts')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      // Si el bucket no existe, fallará. 
      // TODO: Crear bucket 'contracts' en panel de Supabase
    }

    const contractUrl = uploadData ? uploadData.path : fileName;

    // 3. Actualizar lead
    const { error: updateError } = await supabaseServer
      .from('leads')
      .update({ 
        onboarding_step: 3,
        contract_signed_at: new Date().toISOString(),
        contract_url: contractUrl
      })
      .eq('id', lead.id);

    if (updateError) {
      return NextResponse.json({ error: 'Error al actualizar el lead' }, { status: 500 });
    }

    // 4. Notificar a Omar
    await notifyTelegram(`✍️ *Contrato Firmado*\nCliente: ${lead.name}\nProyecto: ${lead.service_requested}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding contract error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
