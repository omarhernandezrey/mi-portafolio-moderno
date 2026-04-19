import { ProviderCall, ProviderError, buildMessages } from './types';

const MODEL = 'llama3.1-70b';
const ENDPOINT = 'https://api.cerebras.ai/v1/chat/completions';

export const call: ProviderCall = async (args) => {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) throw new ProviderError('cerebras', 'CEREBRAS_API_KEY missing', { retryable: false });

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: buildMessages(args),
      temperature: 0.7,
      max_tokens: 800,
    }),
    signal: args.signal,
  });

  if (!res.ok) {
    const isAuth = res.status === 401 || res.status === 403;
    throw new ProviderError('cerebras', `HTTP ${res.status}`, { status: res.status, retryable: !isAuth });
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content?.trim() || '';
  if (!text) throw new ProviderError('cerebras', 'empty response');
  return text;
};
