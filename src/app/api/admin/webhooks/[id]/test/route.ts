import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import crypto from 'crypto';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { assertSafeWebhookUrl } from '@/lib/webhooks/ssrf';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const { data: webhook, error } = await supabaseServer
    .from('webhooks')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !webhook) {
    return NextResponse.json({ error: 'Webhook no encontrado' }, { status: 404 });
  }

  const safety = await assertSafeWebhookUrl(webhook.url);
  if (!safety.ok) {
    return NextResponse.json({ error: `Destino bloqueado: ${safety.error}` }, { status: 400 });
  }

  const timestamp = Date.now();
  const payload = {
    event: 'ping',
    payload: {
      webhook_id: id,
      message: 'Test ping from Admin Suite — Omar Hernández Portfolio',
    },
    timestamp,
  };

  const body = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', webhook.secret)
    .update(body)
    .digest('hex');

  let responseStatus: number | null = null;
  let responseBody: string | null = null;
  let errorMsg: string | null = null;

  try {
    const res = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': `sha256=${signature}`,
        'X-Webhook-Event': 'ping',
        'X-Webhook-ID': id,
        'X-Webhook-Timestamp': timestamp.toString(),
      },
      body,
      signal: AbortSignal.timeout(10000),
      // Igual que en el dispatcher: sin esto, un destino que pasa el guard de
      // IP puede redirigir a una dirección interna (169.254.169.254 y
      // similares) y aquí el cuerpo de ESA respuesta se guardaría en
      // `webhook_logs.response_body`, legible luego desde el panel.
      redirect: 'manual',
    });

    responseStatus = res.status;
    // Truncado al mismo tope que usa el dispatcher: un destino que responda
    // 10 MB no debe meterlos enteros en la tabla de logs.
    responseBody = await res.text().then((t) => t.substring(0, 1000)).catch(() => '');
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : 'Timeout o error de red';
  }

  await supabaseServer.from('webhook_logs').insert({
    webhook_id: id,
    event_type: 'ping',
    payload,
    response_status: responseStatus,
    response_body: responseBody,
    error: errorMsg,
    attempt: 1,
  });

  const success = !errorMsg && responseStatus !== null && responseStatus < 400;

  await writeAuditLog(auth.actor, {
    action: 'webhook.test',
    resourceType: 'webhook',
    resourceId: id,
    metadata: { success, status: responseStatus, error: errorMsg },
  });

  return NextResponse.json({
    success,
    status: responseStatus,
    error: errorMsg,
  });
}
