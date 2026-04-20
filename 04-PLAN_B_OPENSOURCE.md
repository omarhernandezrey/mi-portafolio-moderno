# Migraciones de emergencia (si un servicio empieza a cobrar)

## Si Groq cobra
> **Ya no es un problema.** Desde FASE 27 el sistema tiene failover automático: cuando Groq falla, el siguiente proveedor de la cadena responde sin que toques código. Cadena actual (todos sin tarjeta):
- **Reemplazo 1 (automático):** OpenRouter (https://openrouter.ai) — modelos `:free` (Llama 3.3 70B, DeepSeek R1, etc.)
- **Reemplazo 2 (automático):** Cerebras (https://cloud.cerebras.ai) — Llama 3.1 70B ultrarrápido, 1M tokens/día gratis
- **Reemplazo 3 (automático):** Cloudflare Workers AI (https://developers.cloudflare.com/workers-ai/) — ~10k req/día gratis
- **Reemplazo 4 (automático):** Ollama local con Llama 3.2 3B — corre en tu PC, sin internet, $0 perpetuo

## Si Supabase cobra
- Self-host Supabase en VPS Hetzner $4/mes (un café)
- O migrar a Neon (Postgres serverless free), o Turso (SQLite free)

## Si Vercel cobra
- Cloudflare Pages (free, mejor que Vercel free en algunos aspectos)
- Netlify free
- Self-host con Coolify en VPS

## Si Telegram cobra
- Discord webhook (gratis, igual de simple)
- Email vía Resend free (3000 emails/mes)

## Si GitHub cobra Actions privados
- Pasar el repo a público (Actions ilimitadas)
- O usar GitLab CI free
