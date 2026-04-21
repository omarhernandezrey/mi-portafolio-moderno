import dotenv from 'dotenv';
import path from 'path';
import { ChatMessage, ProviderCall, ProviderError } from './providers/types';
import { notifyTelegram } from './telegram';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
}

const DEFAULT_CHAIN = ['groq', 'openrouter', 'cerebras', 'cloudflare', 'ollama'];
const TIMEOUT_MS = 8000;
const ERROR_THRESHOLD = 3;
const COOLDOWN_MS = 60 * 60 * 1000; // 1 hora

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
  const fromEnv = process.env.LLM_PROVIDER_CHAIN?.trim();
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

export async function generateReply(
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  const chain = getChain();
  const errors: string[] = [];
  const now = Date.now();

  for (const name of chain) {
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

    try {
      const text = await withTimeout(
        (signal) => call({ systemPrompt, history, userMessage, signal }),
        TIMEOUT_MS
      );
      if (process.env.NODE_ENV !== 'production') {
        console.log(`✅ LLM provider hit: ${name}`);
      }
      
      // Si tuvo éxito, podemos resetear gradualmente el contador o dejarlo así para ver ráfagas
      if (errorTracker[name] && errorTracker[name].count > 0) {
        errorTracker[name].count = 0;
      }

      return text;
    } catch (err) {
      await handleProviderError(name, err);
      errors.push(`${name}: ${err instanceof Error ? err.message : 'failed'}`);
      continue;
    }
  }

  console.error('❌ All LLM providers failed:', errors.join(' | '));
  return '<<<QUOTA_EXCEEDED>>>';
}

