import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';
import { Resend } from 'resend';
import { serverEnv } from '@/config/env';
import fs from 'fs';
import path from 'path';

const schema = z.object({
  email: z.string().email(),
  magnetId: z.enum(['checklist', 'guia-precios', 'plantilla-brief']),
});

const magnets = {
  'checklist': {
    name: 'Checklist: ¿Qué pedirle a un desarrollador?',
    file: 'checklist.pdf',
    subject: '🎁 Tu Checklist: ¿Qué pedirle a un desarrollador? — Omar Hernández'
  },
  'guia-precios': {
    name: 'Guía: Precios reales Desarrollo Web LATAM 2026',
    file: 'guia-precios.pdf',
    subject: '🎁 Tu Guía de Precios: Desarrollo Web LATAM 2026 — Omar Hernández'
  },
  'plantilla-brief': {
    name: 'Plantilla: Brief de proyecto digital',
    file: 'plantilla-brief.pdf',
    subject: '🎁 Tu Plantilla: Brief de proyecto digital — Omar Hernández'
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Email inválido o recurso no encontrado' }, { status: 400 });
    }

    const { email, magnetId } = result.data;
    const magnet = magnets[magnetId];

    // 1. Guardar en Supabase (tabla subscribers)
    const { error: dbError } = await supabaseServer
      .from('subscribers')
      .upsert({ 
        email, 
        source: magnetId,
        created_at: new Date().toISOString()
      }, { onConflict: 'email' });

    if (dbError) {
      console.error('Error saving subscriber:', dbError);
      // Continuamos aunque falle el guardado en DB (para no bloquear al usuario)
    }

    // 2. Enviar email con attachment vía Resend
    if (!serverEnv.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Servicio de email no configurado' }, { status: 500 });
    }

    const resend = new Resend(serverEnv.RESEND_API_KEY);
    const pdfPath = path.join(process.cwd(), 'public', 'leadmagnets', magnet.file);
    const pdfBuffer = fs.readFileSync(pdfPath);

    const { error: emailError } = await resend.emails.send({
      from: 'Omar Hernández <onboarding@resend.dev>', // Usar dominio verificado en prod
      to: [email],
      subject: magnet.subject,
      attachments: [
        {
          filename: magnet.file,
          content: pdfBuffer,
        },
      ],
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2>¡Aquí tienes tu recurso!</h2>
          <p>Hola,</p>
          <p>Gracias por tu interés. Adjunto a este correo encontrarás el PDF: <strong>${magnet.name}</strong>.</p>
          <p>Espero que esta información te sea de gran utilidad para tu próximo proyecto digital.</p>
          <p>Si tienes alguna pregunta o te gustaría discutir un proyecto real, no dudes en responder a este correo o agendar una consulta gratuita aquí:</p>
          <p><a href="https://omarhernandezrey.com/calculadora">Calculadora de presupuestos interactiva</a></p>
          <br/>
          <p>¡Disfruta el contenido!</p>
          <p>—<br/><strong>Omar Hernández Rey</strong><br/>Full Stack Developer</p>
        </div>
      `,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      return NextResponse.json({ error: 'Error al enviar el email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lead magnet API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
