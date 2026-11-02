import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireAdmin, sanitizeWebhook } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { assertSafeWebhookUrl } from '@/lib/webhooks/ssrf';

const updateSchema = z.object({
  active: z.boolean().optional(),
  url: z.string().url('URL inválida').optional(),
  events: z.array(z.string()).min(1, 'Selecciona al menos un evento').optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json();

  const result = updateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const update: Record<string, unknown> = result.data;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
  }

  if (typeof update.url === 'string') {
    const safety = await assertSafeWebhookUrl(update.url);
    if (!safety.ok) {
      return NextResponse.json({ error: safety.error }, { status: 400 });
    }
  }

  const { data, error } = await supabaseServer
    .from('webhooks')
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAuditLog(auth.actor, {
    action: 'webhook.update',
    resourceType: 'webhook',
    resourceId: id,
    metadata: update,
  });

  return NextResponse.json(sanitizeWebhook(data));
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const { error } = await supabaseServer
    .from('webhooks')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAuditLog(auth.actor, {
    action: 'webhook.delete',
    resourceType: 'webhook',
    resourceId: id,
  });

  return NextResponse.json({ success: true });
}
