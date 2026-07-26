import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';

const updateSchema = z.object({
  status: z.enum(['open', 'in_progress', 'waiting_client', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assigned_to: z.string().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin('viewer');
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const { data: ticket, error } = await supabaseServer
      .from('tickets')
      .select('*, lead:leads(*)')
      .eq('id', id)
      .single();

    if (error || !ticket) {
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Ticket detail API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin('assistant');
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const body = await req.json();
    const result = updateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const { error } = await supabaseServer
      .from('tickets')
      .update({ ...result.data, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    await writeAuditLog(auth.actor, {
      action: 'ticket.update',
      resourceType: 'ticket',
      resourceId: id,
      metadata: result.data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ticket update API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
