import { supabaseServer } from '@/lib/supabaseServer';
import crypto from 'crypto';

export type WebhookEvent = 
  | 'lead.created' 
  | 'lead.contacted' 
  | 'payment.received' 
  | 'project.started' 
  | 'ticket.opened';

export async function dispatchEvent(event: WebhookEvent, payload: Record<string, unknown>) {
  // 1. Buscar webhooks activos suscritos a este evento
  const { data: webhooks, error } = await supabaseServer
    .from('webhooks')
    .select('*')
    .eq('active', true)
    .contains('events', [event]);

  if (error) {
    console.error('Error fetching webhooks:', error);
    return;
  }

  if (!webhooks || webhooks.length === 0) return;

  // 2. Disparar cada webhook de forma asíncrona
  const dispatchPromises = (webhooks as { id: string; url: string; secret: string }[]).map(webhook =>
    sendWebhookRequest(webhook, event, payload)
  );

  await Promise.allSettled(dispatchPromises);
}

async function sendWebhookRequest(webhook: { id: string; url: string; secret: string }, event: WebhookEvent, payload: Record<string, unknown>, attempt = 1) {
  const timestamp = Date.now();
  const body = JSON.stringify({
    event,
    payload,
    timestamp
  });

  // Firmar el payload con el secreto del webhook usando HMAC-SHA256
  const signature = crypto
    .createHmac('sha256', webhook.secret)
    .update(body)
    .digest('hex');

  try {
    const res = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Timestamp': timestamp.toString(),
        'User-Agent': 'OmarPortafolio-Webhook/1.0'
      },
      body,
      // Timeout de 10 segundos
      signal: AbortSignal.timeout(10000)
    });

    const responseText = await res.text();

    // Registrar log
    await supabaseServer.from('webhook_logs').insert({
      webhook_id: webhook.id,
      event_type: event,
      payload,
      response_status: res.status,
      response_body: responseText.substring(0, 1000), // Limitar tamaño
      attempt
    });

    // Política de reintentos (si falla con 5xx o timeout)
    if (!res.ok && res.status >= 500 && attempt < 3) {
      await wait(Math.pow(2, attempt) * 1000); // 2s, 4s...
      return sendWebhookRequest(webhook, event, payload, attempt + 1);
    }

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook delivery failed (${webhook.url}):`, errorMessage);

    await supabaseServer.from('webhook_logs').insert({
      webhook_id: webhook.id,
      event_type: event,
      payload,
      error: errorMessage,
      attempt
    });

    if (attempt < 3) {
      await wait(Math.pow(2, attempt) * 1000);
      return sendWebhookRequest(webhook, event, payload, attempt + 1);
    }
  }
}

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
