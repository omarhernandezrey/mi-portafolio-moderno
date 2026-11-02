export const WEBHOOK_EVENTS = [
  'lead.created',
  'lead.updated',
  'lead.paid',
  'ticket.created',
  'ticket.closed',
  'invoice.created',
  'subscriber.confirmed',
  'ping',
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export function isWebhookEvent(value: string): value is WebhookEvent {
  return (WEBHOOK_EVENTS as readonly string[]).includes(value);
}
