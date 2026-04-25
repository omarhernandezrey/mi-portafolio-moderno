import { serverEnv } from '@/config/env';
import { ProviderCall, ProviderError, buildMessages } from './types';

export const call: ProviderCall = async (args) => {
  const MODEL = serverEnv.OLLAMA_MODEL || 'llama3.2:3b';
  const baseUrl = serverEnv.OLLAMA_BASE_URL || 'http://localhost:11434';

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: buildMessages(args),
        stream: false,
        options: { temperature: 0.7, num_predict: 800 },
      }),
      signal: args.signal,
    });
  } catch (err) {
    throw new ProviderError('ollama', `network: ${(err as Error).message}`, { retryable: true });
  }

  if (!res.ok) {
    throw new ProviderError('ollama', `HTTP ${res.status}`, { status: res.status, retryable: true });
  }

  const data = (await res.json()) as { message?: { content?: string } };
  const text = data.message?.content?.trim() || '';
  if (!text) throw new ProviderError('ollama', 'empty response');
  return text;
};
