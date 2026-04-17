import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { notifyTelegram } from '@/lib/chatbot/telegram';
import { z } from 'zod';

const deleteSchema = z.object({
  email: z.string().email(),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = deleteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const { email, reason } = result.data;

    // 1. Buscar conversaciones asociadas a ese email
    const { data: convs } = await supabaseServer
      .from('conversations')
      .select('id')
      .eq('visitor_email', email);

    if (!convs || convs.length === 0) {
      return NextResponse.json({ 
        message: 'No se encontraron datos asociados a este correo electrónico.' 
      }, { status: 404 });
    }

    const convIds = convs.map(c => c.id);

    // 2. Borrar datos (cascada borrará mensajes y leads por FK si está configurado, sino borramos manualmente)
    // Borrar leads primero por precaución
    await supabaseServer.from('leads').delete().in('conversation_id', convIds);
    // Borrar mensajes
    await supabaseServer.from('messages').delete().in('conversation_id', convIds);
    // Borrar conversaciones
    const { error: delError } = await supabaseServer.from('conversations').delete().eq('visitor_email', email);

    if (delError) throw delError;

    // 3. Notificar a Omar
    await notifyTelegram(`🗑️ *Derecho al olvido solicitado*\nEmail: ${email}\nMotivo: ${reason || 'No especificado'}\nAcción: Se han eliminado ${convs.length} conversaciones y sus datos asociados.`);

    return NextResponse.json({ 
      success: true, 
      message: `Se han eliminado todos los datos asociados a ${email} correctamente.` 
    });

  } catch (error) {
    console.error('Privacy Delete Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
