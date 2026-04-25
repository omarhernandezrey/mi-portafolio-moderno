import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';
import { sendNewsletterConfirmation } from '@/lib/chatbot/email';
import { nanoid } from 'nanoid';

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const { email } = result.data;
    const token = nanoid(32);

    // Upsert en subscribers: si ya existe, actualizamos el token de confirmación
    const { error: dbError } = await supabaseServer
      .from('subscribers')
      .upsert({ 
        email, 
        source: 'newsletter_form',
        confirmed: false,
        confirmation_token: token,
        created_at: new Date().toISOString()
      }, { onConflict: 'email' });

    if (dbError) {
      console.error('Error saving subscriber:', dbError);
      return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 });
    }

    // Enviar email de confirmación
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
