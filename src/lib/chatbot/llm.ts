import dotenv from 'dotenv';
import path from 'path';
import { serverEnv } from '@/config/env';
import { ChatMessage, ProviderCall, ProviderError } from './providers/types';
import { notifyTelegram } from './telegram';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
}

const DEFAULT_CHAIN = ['groq', 'nvidia', 'nvidia-mistral', 'nvidia-kimi', 'deepseek', 'mistral', 'cerebras', 'nvidia-nemotron', 'openrouter', 'huggingface', 'cloudflare', 'ollama'];
const TIMEOUT_MS = 15000;
const ERROR_THRESHOLD = 3;
const COOLDOWN_MS = 60 * 1000; // 1 minuto (recuperación rápida para Rate Limits)

// Circuit breaker en memoria (warm function)
const errorTracker: Record<string, { count: number; lastError: number }> = {};
const disabledByCircuit: Set<string> = new Set();

async function loadProvider(name: string): Promise<ProviderCall | null> {
  try {
    const mod = await import(`./providers/${name}`);
    return mod.call as ProviderCall;
  } catch {
    return null;
  }
}

function getChain(): string[] {
  const fromEnv = serverEnv.LLM_PROVIDER_CHAIN?.trim();
  if (!fromEnv) return DEFAULT_CHAIN;
  return fromEnv.split(',').map((s) => s.trim()).filter(Boolean);
}

function withTimeout<T>(p: (signal: AbortSignal) => Promise<T>, ms: number): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return p(ctrl.signal).finally(() => clearTimeout(timer));
}

async function handleProviderError(name: string, err: unknown) {
  const pe = err as ProviderError;
  const status = pe?.status;
  const isQuota = status === 429 || pe?.message?.toLowerCase().includes('quota') || pe?.message?.toLowerCase().includes('limit');
  const now = Date.now();

  // Si no existe tracking o el último error fue hace > 1h, reseteamos
  if (!errorTracker[name] || (now - errorTracker[name].lastError > COOLDOWN_MS)) {
    errorTracker[name] = { count: 0, lastError: 0 };
  }

  errorTracker[name].count++;
  errorTracker[name].lastError = now;

  const msg = `⚠️ LLM Error [${name}]: ${pe?.message || 'unknown error'}${status ? ` (HTTP ${status})` : ''}`;
  console.error(msg);

  // Si llegamos al límite de errores de cuota o es un error no reintentable (auth)
  if (errorTracker[name].count >= ERROR_THRESHOLD || pe?.retryable === false || isQuota) {
    if (!disabledByCircuit.has(name)) {
      disabledByCircuit.add(name);
      const alert = `🛑 Proveedor *${name}* desactivado temporalmente (Kill Switch).\nRazón: ${isQuota ? 'Cuota excedida' : `Errores persistentes (${errorTracker[name].count}/${ERROR_THRESHOLD})`}`;
      await notifyTelegram(alert);
    }
  }
}

async function callProviderChain(
  args: {
    systemPrompt: string;
    history: ChatMessage[];
    userMessage: string;
    sessionId?: string;
    imageDataUrl?: string;
    isReview?: boolean;
  }
): Promise<string> {
  const chain = getChain();
  const errors: string[] = [];
  const now = Date.now();

  for (const name of chain) {
    // Si hay imagen, forzamos Groq ya que es el único con Vision en nuestro setup free
    if (args.imageDataUrl && name !== 'groq') continue;

    // Si está desactivado pero pasó el tiempo de cooldown, le damos otra oportunidad
    if (disabledByCircuit.has(name)) {
      if (errorTracker[name] && (now - errorTracker[name].lastError > COOLDOWN_MS)) {
        disabledByCircuit.delete(name);
        errorTracker[name].count = 0;
        console.log(`♻️ Proveedor ${name} reactivado tras cooldown`);
      } else {
        continue;
      }
    }

    const call = await loadProvider(name);
    if (!call) {
      errors.push(`${name}: adapter not found`);
      continue;
    }

    const startTime = Date.now();
    try {
      const text = await withTimeout(
        (signal) => call({ 
          systemPrompt: args.systemPrompt, 
          history: args.history, 
          userMessage: args.userMessage, 
          signal, 
          imageDataUrl: args.imageDataUrl 
        }),
        TIMEOUT_MS
      );
      const latency = Date.now() - startTime;

      if (process.env.NODE_ENV !== 'production' && !args.isReview) {
        console.log(`✅ LLM provider hit: ${name} (${latency}ms)`);
      }

      // Log success to DB (fire and forget)
      if (!args.isReview) {
        import('@/lib/supabaseServer').then(({ supabaseServer }) => {
          supabaseServer.from('api_logs').insert({
            provider: name,
            latency_ms: latency,
            status: 'success',
            session_id: args.sessionId
          }).then(({ error }) => error && console.error('Error logging success:', error));
        });
      }
      
      // Si tuvo éxito, podemos resetear gradualmente el contador o dejarlo así para ver ráfagas
      if (errorTracker[name] && errorTracker[name].count > 0) {
        errorTracker[name].count = 0;
      }

      return text;
    } catch (err) {
      const latency = Date.now() - startTime;
      await handleProviderError(name, err);
      errors.push(`${name}: ${err instanceof Error ? err.message : 'failed'}`);

      // Log failure to DB (fire and forget)
      if (!args.isReview) {
        import('@/lib/supabaseServer').then(({ supabaseServer }) => {
          const pe = err as ProviderError;
          supabaseServer.from('api_logs').insert({
            provider: name,
            latency_ms: latency,
            status: 'error',
            error_message: pe?.message || 'unknown error',
            http_status: pe?.status,
            session_id: args.sessionId
          }).then(({ error }) => error && console.error('Error logging failure:', error));
        });
      }

      continue;
    }
  }

  if (args.isReview) return "OK"; // Si falla la revisión, asumimos OK para no bloquear

  console.error('❌ All LLM providers failed:', errors.join(' | '));
  await notifyTelegram(`🚨 *EMERGENCIA*: Todos los proveedores LLM fallaron. El chat está mostrando el mensaje de fallback.`);
  return 'Lo siento, mi cerebro artificial está experimentando una alta demanda en este momento. 🧠⚡\n\nPara no hacerte esperar, puedes hablar directamente con Omar por WhatsApp haciendo clic aquí: <<<HANDOFF>>>{"summary":"Error técnico en el chat (todos los proveedores fallaron)","urgency":"high"}<<<END>>>';
}

async function reviewReply(
  reply: string,
  systemPrompt: string,
  sessionId?: string
): Promise<string> {
  // Omitimos revisión para mensajes muy cortos (saludos, despedidas, etc.)
  if (reply.length < 60) return "OK";

  const reviewPrompt = `Revisa esta respuesta del asistente de Omar. ¿Cumple con: voz de Omar, máximo 4 frases, no inventa precios, hace avanzar la venta? Responde solo "OK" o "FIX: <razón>".\n\nRespuesta a revisar:\n"${reply}"`;
  
  return callProviderChain({
    systemPrompt: "Eres un auditor de calidad de respuestas de chatbot. Responde estrictamente solo OK o FIX: <razón>.",
    history: [],
    userMessage: reviewPrompt,
    sessionId,
    isReview: true
  });
}

export async function generateReply(
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string,
  sessionId?: string,
  imageDataUrl?: string
): Promise<string> {
  // Primera generación
  let text = await callProviderChain({ systemPrompt, history, userMessage, sessionId, imageDataUrl });

  // Si es un mensaje de error o fallback, no revisamos
  if (text.includes('<<<HANDOFF>>>') && text.includes('fallaron')) return text;

  // Auto-revisión
  const review = await reviewReply(text, systemPrompt, sessionId);

  if (review.startsWith('FIX:')) {
    const reason = review.replace('FIX:', '').trim();
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔍 Auto-revisión detectó problemas: ${reason}. Regenerando...`);
    }

    // Segunda generación con instrucción correctiva
    const retryUserMessage = `${userMessage}\n\n[REVISIÓN]: Tu respuesta anterior fue rechazada por: ${reason}. Por favor genera una nueva respuesta corregida siguiendo todas las reglas.`;
    text = await callProviderChain({ systemPrompt, history, userMessage: retryUserMessage, sessionId, imageDataUrl });
  }

  return text;
}
