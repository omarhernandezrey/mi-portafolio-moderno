import dotenv from 'dotenv';
import path from 'path';
import { ChatMessage, ProviderCall, ProviderError } from './providers/types';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
}

const DEFAULT_CHAIN = ['groq', 'openrouter', 'cerebras', 'cloudflare', 'ollama'];
const TIMEOUT_MS = 8000;

const disabledThisProcess = new Set<string>();

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

export async function generateReply(
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  const chain = getChain();
  const errors: string[] = [];

  for (const name of chain) {
    if (disabledThisProcess.has(name)) continue;

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
      return text;
    } catch (err) {
      const pe = err as ProviderError;
      const status = pe?.status ? ` (HTTP ${pe.status})` : '';
      errors.push(`${name}${status}: ${pe?.message || 'unknown error'}`);

      if (pe?.retryable === false) {
        disabledThisProcess.add(name);
      }
      continue;
    }
  }

  console.error('❌ All LLM providers failed:', errors.join(' | '));
  return '<<<QUOTA_EXCEEDED>>>';
}
