import crypto from 'crypto';
import { clientEnv, serverEnv } from '@/config/env';

function getSecret(): string {
  return (
    serverEnv.NEWSLETTER_UNSUBSCRIBE_SECRET ||
    serverEnv.CRON_SECRET ||
    serverEnv.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function signUnsubscribeId(id: string): string {
  return crypto
    .createHmac('sha256', getSecret())
    .update(id)
    .digest('hex')
    .slice(0, 40);
}

export function verifyUnsubscribeSignature(id: string, signature: string): boolean {
  const expected = signUnsubscribeId(id);
  if (signature.length !== expected.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

export function buildUnsubscribeUrl(id: string): string {
  const params = new URLSearchParams({
    id,
    sig: signUnsubscribeId(id),
  });
  return `${clientEnv.NEXT_PUBLIC_SITE_URL}/api/newsletter/unsubscribe?${params.toString()}`;
}
