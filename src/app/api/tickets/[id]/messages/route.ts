import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { z } from 'zod';
import { notifyTelegram } from '@/lib/chatbot/telegram';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';

const messageSchema = z.object({
  sender: z.enum(['admin', 'client']),
  content: z.string().min(1),
  attachments: z.array(z.string()).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin('viewer');
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const { data: messages, error } = await supabaseServer
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Ticket messages list API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin('assistant');
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const body = await req.json();
    const result = messageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const { sender, content, attachments } = result.data;

    const { data: message, error: msgError } = await supabaseServer
      .from('ticket_messages')
      .insert({ 
        ticket_id: id, 
        sender, 
        content, 
        attachments: attachments || [] 
      })
      .select()
      .single();

    if (msgError) throw msgError;

    const updateData: { updated_at: string; status?: string } = { updated_at: new Date().toISOString() };
    if (sender === 'admin') {
      updateData.status = 'waiting_client';
    } else {
      updateData.status = 'in_progress';
    }

    await supabaseServer
      .from('tickets')
      .update(updateData)
      .eq('id', id);

    if (sender === 'client') {
      const { data: ticket } = await supabaseServer.from('tickets').select('title').eq('id', id).single();
      await notifyTelegram(`💬 *Nueva respuesta* en Ticket: ${ticket?.title || 'Sin título'}\n${content.substring(0, 100)}...`);
    }

    await writeAuditLog(auth.actor, {
      action: 'ticket.message',
      resourceType: 'ticket',
      resourceId: id,
      metadata: { sender, messageId: message.id },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Ticket message creation API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
