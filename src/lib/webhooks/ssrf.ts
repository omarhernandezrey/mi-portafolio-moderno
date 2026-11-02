import dns from 'node:dns/promises';
import net from 'node:net';

/**
 * Bloquea destinos que permitirían SSRF desde el dispatcher de webhooks
 * (red interna, loopback, link-local y el endpoint de metadata de la nube).
 * Se resuelve el hostname a IP y se valida la IP real, no el string de la URL,
 * para evitar bypass por hostnames que resuelven a rangos privados.
 */
function isBlockedIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    if (a === 127) return true; // loopback
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 169 && b === 254) return true; // link-local + metadata (169.254.169.254)
    if (a === 0) return true; // 0.0.0.0/8
    return false;
  }

  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase();
    if (normalized === '::1') return true; // loopback
    if (normalized.startsWith('fe80:')) return true; // link-local
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true; // unique local fc00::/7
    if (normalized.startsWith('::ffff:')) {
      // IPv4-mapped IPv6: reutiliza la validación v4
      return isBlockedIp(normalized.replace('::ffff:', ''));
    }
    return false;
  }

  return true; // no parseable como IP -> no confiar
}

export async function assertSafeWebhookUrl(rawUrl: string): Promise<{ ok: true } | { ok: false; error: string }> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { ok: false, error: 'URL inválida' };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return { ok: false, error: 'Protocolo no permitido, usa http o https' };
  }

  const hostname = parsed.hostname.toLowerCase();
  if (hostname === 'localhost') {
    return { ok: false, error: 'No se permiten destinos locales' };
  }

  let addresses: string[];
  try {
    const records = await dns.lookup(hostname, { all: true, verbatim: true });
    addresses = records.map((r) => r.address);
  } catch {
    return { ok: false, error: 'No se pudo resolver el host' };
  }

  if (addresses.length === 0 || addresses.some(isBlockedIp)) {
    return { ok: false, error: 'El destino resuelve a una red interna o restringida' };
  }

  return { ok: true };
}
