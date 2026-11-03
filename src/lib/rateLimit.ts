const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Rate limiter simple por instancia (defensa básica anti-bombing).
 * No distribuido: en serverless protege por instancia warm, suficiente
 * como primera línea para endpoints que envían email.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean } {
  const now = Date.now();

  // Evitar crecimiento ilimitado
  if (buckets.size > 1000) {
    for (const [k, v] of buckets) {
      if (now >= v.resetAt) buckets.delete(k);
    }
  }

  const current = buckets.get(key);
  if (current && now < current.resetAt) {
    if (current.count >= limit) return { allowed: false };
    current.count++;
    return { allowed: true };
  }

  buckets.set(key, { count: 1, resetAt: now + windowMs });
  return { allowed: true };
}

export function clientIp(headers: Headers): string {
  // Vercel/proxies confiables setean x-real-ip; el primer valor de
  // x-forwarded-for lo controla el cliente y es spoofeable.
  const realIp = headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }

  return 'anonymous';
}
