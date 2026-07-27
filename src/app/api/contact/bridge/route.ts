import { NextRequest, NextResponse } from 'next/server';
import { registerContactFormLead } from '@/lib/chatbot/contactBridge';
import { checkRateLimit, clientIp } from '@/lib/rateLimit';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Correo electrónico inválido').max(254),
  message: z.string().min(1, 'El mensaje no puede estar vacío').max(5000, 'El mensaje es demasiado largo'),
});

export async function POST(req: NextRequest) {
  try {
    // Anti spam: 5 mensajes / hora / IP
    const { allowed } = checkRateLimit(`contact:${clientIp(req.headers)}`, 5, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ error: 'Demasiados mensajes. Intenta más tarde.' }, { status: 429 });
    }

    const body = await req.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map(i => i.message).join('. ');
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const bridgeResult = await registerContactFormLead(result.data);

    if (!bridgeResult.success) {
      console.error('Contact Bridge error:', bridgeResult.error);
      return NextResponse.json({ error: 'Error al procesar el mensaje. Inténtalo de nuevo.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact Bridge API Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
