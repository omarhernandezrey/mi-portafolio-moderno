import { ProviderCall, ProviderError, buildMessages } from './types';
import { serverEnv, clientEnv } from '@/config/env';

// Lista de modelos gratuitos de mayor a menor capacidad
const FREE_MODELS = [
  'openai/gpt-oss-120b:free',
  'minimax/minimax-m2.5:free',
  'openai/gpt-oss-20b:free',
  'openrouter/free'
];

const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

export const call: ProviderCall = async (args) => {
  const apiKey = serverEnv.OPENROUTER_API_KEY;
  if (!apiKey) throw new ProviderError('openrouter', 'OPENROUTER_API_KEY missing', { retryable: false });

  let lastError: ProviderError | Error | null = null;

  // Intentar con cada modelo en orden (Fallback local para asegurar control)
  for (const model of FREE_MODELS) {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': clientEnv.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': 'Portafolio Omar Chatbot',
        },
        body: JSON.stringify({
          model: model,
          messages: buildMessages(args),
          temperature: 0.7,
          max_tokens: 800,
        }),
        signal: args.signal,
      });

      if (!res.ok) {
        const isAuth = res.status === 401 || res.status === 403;
        const errText = await res.text().catch(() => '');
        // Si es un error de auth, no reintentamos con otros modelos, detenemos inmediatamente
        if (isAuth) {
          throw new ProviderError('openrouter', `Auth Error HTTP ${res.status}: ${errText}`, { status: res.status, retryable: false });
        }
        // Para otros errores (429 rate limit, 502, etc), guardamos el error y probamos el siguiente modelo
        lastError = new ProviderError('openrouter', `HTTP ${res.status} on ${model}`, { status: res.status, retryable: true });
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[OpenRouter] Falló el modelo ${model} (HTTP ${res.status}), intentando el siguiente...`);
        }
        continue;
      }

      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = data.choices?.[0]?.message?.content?.trim() || '';
      
      if (!text) {
        lastError = new ProviderError('openrouter', `empty response from ${model}`);
        continue;
      }
      
      return text;
    } catch (error: unknown) {
      if (error instanceof ProviderError && !error.retryable) {
        throw error;
      }
      const err = error as Error;
      if (err.name === 'AbortError') {
        throw error; // Timeout general respetado
      }
      lastError = err;
    }
  }

  // Si todos los modelos fallaron
  throw lastError || new ProviderError('openrouter', 'All free models failed');
};
