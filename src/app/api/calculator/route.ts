import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { serverEnv } from '@/config/env';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Resend } from 'resend';
import { notifyTelegram } from '@/lib/chatbot/telegram';

export async function POST(req: NextRequest) {
  try {
    const { selections, visitorInfo, budget, language } = await req.json();

    // 1. Guardar lead en Supabase
    const { data: conv } = await supabaseServer
      .from('conversations')
      .insert({
        session_id: `calc-${Date.now()}`,
        visitor_name: visitorInfo.name,
        visitor_email: visitorInfo.email,
        language,
        intent: 'budget_calculator',
        summary: `Presupuesto calculado: $${budget}. Empresa: ${visitorInfo.company}`
      })
      .select()
      .single();

    if (conv) {
      await supabaseServer.from('leads').insert({
        conversation_id: conv.id,
        name: visitorInfo.name,
        email: visitorInfo.email,
        company: visitorInfo.company,
        budget: `$${budget} USD`,
        service_requested: 'Calculadora de Presupuesto',
        notes: `Selecciones: ${JSON.stringify(selections)}`,
        status: 'new'
      });
    }

    // 2. Generar PDF con pdf-lib
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText('PRESUPUESTO ESTIMADO', {
      x: 50,
      y: height - 50,
      size: 20,
      font,
      color: rgb(0, 0, 0.5),
    });

    page.drawText(`Para: ${visitorInfo.name}`, { x: 50, y: height - 100, size: 12, font: fontRegular });
    page.drawText(`Empresa: ${visitorInfo.company || 'N/A'}`, { x: 50, y: height - 120, size: 12, font: fontRegular });
    page.drawText(`Fecha: ${new Date().toLocaleDateString()}`, { x: 50, y: height - 140, size: 12, font: fontRegular });

    page.drawText('Desglose del Proyecto:', { x: 50, y: height - 200, size: 14, font });
    
    let yOffset = height - 230;
    // Simplificado: listar selecciones
    Object.entries(selections).forEach(([key, value]) => {
      const val = Array.isArray(value) ? value.join(', ') : value;
      page.drawText(`${key}: ${val}`, { x: 50, y: yOffset, size: 10, font: fontRegular });
      yOffset -= 20;
    });

    page.drawText('TOTAL ESTIMADO:', { x: 50, y: yOffset - 40, size: 16, font });
    page.drawText(`$${budget} USD`, { x: 200, y: yOffset - 40, size: 24, font, color: rgb(0, 0, 0.8) });

    page.drawText('Este presupuesto es un estimado inicial. Hablemos para concretar detalles.', {
      x: 50,
      y: 100,
      size: 10,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    });

    const pdfBytes = await pdfDoc.save();

    // 3. Enviar por Resend si la clave existe
    let emailSent = false;
    if (serverEnv.RESEND_API_KEY) {
      try {
        const resend = new Resend(serverEnv.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Omar Hernandez <onboarding@resend.dev>', // Ajustar a dominio verificado en prod
          to: visitorInfo.email,
          subject: 'Tu Presupuesto Estimado - Omar Hernández',
          text: `Hola ${visitorInfo.name}, adjunto encontrarás el presupuesto estimado para tu proyecto.`,
          attachments: [
            {
              filename: 'Presupuesto-Omar-Hernandez.pdf',
              content: Buffer.from(pdfBytes),
            },
          ],
        });
        emailSent = true;
      } catch (err) {
        console.error('Resend error:', err);
      }
    }

    // 4. Notificar a Telegram
    await notifyTelegram(`
🧮 *Nueva consulta en Calculadora*
Nombre: ${visitorInfo.name}
Email: ${visitorInfo.email}
Empresa: ${visitorInfo.company}
Presupuesto: *$${budget} USD*
Email enviado: ${emailSent ? '✅' : '❌ (Revisar Resend API Key)'}
    `.trim());

    return NextResponse.json({ success: true, emailSent });
  } catch (error) {
    console.error('Calculator API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
