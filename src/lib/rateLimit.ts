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
  return headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anonymous';
}
