import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { z } from 'zod';
import { notifyTelegram } from '@/lib/chatbot/telegram';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';

const ticketSchema = z.object({
  lead_id: z.string().uuid().optional(),
  title: z.string().min(3),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  content: z.string().min(10),
});

export async function GET() {
  const auth = await requireAdmin('viewer');
  if (!auth.ok) return auth.response;

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
  const auth = await requireAdmin('assistant');
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const result = ticketSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const { lead_id, title, priority, content } = result.data;

    const { data: ticket, error: ticketError } = await supabaseServer
      .from('tickets')
      .insert({ lead_id, title, priority, status: 'open' })
      .select()
      .single();

    if (ticketError) throw ticketError;

    const { error: msgError } = await supabaseServer
      .from('ticket_messages')
      .insert({ ticket_id: ticket.id, sender: 'client', content });

    if (msgError) throw msgError;

    await notifyTelegram(`🎫 *Nuevo Ticket*: ${title}\nPrioridad: ${priority}\nMensaje: ${content.substring(0, 100)}...`);

    await writeAuditLog(auth.actor, {
      action: 'ticket.create',
      resourceType: 'ticket',
      resourceId: ticket.id,
      metadata: { title, priority, lead_id },
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Ticket creation API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
