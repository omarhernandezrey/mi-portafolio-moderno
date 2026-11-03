import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';

const patchSchema = z.object({
  confirmed: z.boolean().optional(),
  unsubscribed_at: z.string().datetime().nullable().optional(),
}).strict();

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const { error } = await supabaseServer
    .from('subscribers')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAuditLog(auth.actor, {
    action: 'subscriber.delete',
    resourceType: 'subscriber',
    resourceId: id,
  });

  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json();
  const result = patchSchema.safeParse(body);

  if (!result.success || Object.keys(result.data).length === 0) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from('subscribers')
    .update(result.data)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAuditLog(auth.actor, {
    action: 'subscriber.update',
    resourceType: 'subscriber',
    resourceId: id,
    metadata: { keys: Object.keys(result.data) },
  });

  return NextResponse.json(data);
}
