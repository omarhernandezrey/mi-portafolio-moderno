import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { z } from 'zod';
import { notifyTelegram } from '@/lib/chatbot/telegram';

const ticketSchema = z.object({
  lead_id: z.string().uuid().optional(),
  title: z.string().min(3),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  content: z.string().min(10), // Primer mensaje del ticket
});

export async function GET() {
  try {
    const { data: tickets, error } = await supabaseServer
      .from('tickets')
      .select('*, lead:leads(name, company)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Tickets list API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = ticketSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const { lead_id, title, priority, content } = result.data;

    // 1. Crear el ticket
    const { data: ticket, error: ticketError } = await supabaseServer
      .from('tickets')
      .insert({ lead_id, title, priority, status: 'open' })
      .select()
      .single();

    if (ticketError) throw ticketError;

    // 2. Crear el primer mensaje
    const { error: msgError } = await supabaseServer
      .from('ticket_messages')
      .insert({ ticket_id: ticket.id, sender: 'client', content });

    if (msgError) throw msgError;

    // 3. Notificar a Telegram
    await notifyTelegram(`🎫 *Nuevo Ticket*: ${title}\nPrioridad: ${priority}\nMensaje: ${content.substring(0, 100)}...`);

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Ticket creation API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
