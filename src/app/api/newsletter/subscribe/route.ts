import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';
import { sendNewsletterConfirmation } from '@/lib/chatbot/email';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';
import crypto from 'crypto';

const schema = z.object({
  email: z.string().email().max(254),
});

export async function POST(req: NextRequest) {
  try {
    // Anti email-bombing: 5 suscripciones / hora / IP
    const { allowed } = checkRateLimit(`newsletter:${clientIp(req.headers)}`, 5, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta más tarde.' }, { status: 429 });
    }

    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const { email } = result.data;

    // ¿Ya existe y está confirmado? No lo "desconfirmamos" ni reseteamos su fecha
    const { data: existing } = await supabaseServer
      .from('subscribers')
      .select('id, confirmed')
      .eq('email', email)
      .maybeSingle();

    if (existing?.confirmed) {
      // Respuesta genérica OK sin cambiar estado (anti enumeration + anti sabotaje)
      return NextResponse.json({ success: true });
    }

    const token = crypto.randomBytes(24).toString('hex');

    const { error: dbError } = await supabaseServer
      .from('subscribers')
      .upsert({
        email,
        source: 'newsletter_form',
        confirmed: false,
        confirmation_token: token,
        // Solo setear created_at en inserts nuevos — no pisar la fecha original
        ...(existing ? {} : { created_at: new Date().toISOString() }),
      }, { onConflict: 'email' });

    if (dbError) {
      console.error('Error saving subscriber:', dbError);
      return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 });
    }

    const sent = await sendNewsletterConfirmation(email, token);

    if (!sent) {
      return NextResponse.json({ error: 'Error al enviar el email de confirmación' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
