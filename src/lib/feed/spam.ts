import crypto from "crypto";
import { clientIp } from "@/lib/rateLimit";

/** Hash estable (IP + user-agent) para ip_hash / fingerprint — nunca se guarda la IP cruda. */
export function hashClientId(headers: Headers): string {
  const ip = clientIp(headers);
  const ua = headers.get("user-agent") || "unknown";
  return crypto.createHash("sha256").update(`${ip}:${ua}`).digest("hex");
}
