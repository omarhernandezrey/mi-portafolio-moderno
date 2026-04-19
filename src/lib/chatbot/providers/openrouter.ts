import { ProviderCall, ProviderError, buildMessages } from './types';

const MODEL = 'meta-llama/llama-3.3-70b-instruct:free';
const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

export const call: ProviderCall = async (args) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new ProviderError('openrouter', 'OPENROUTER_API_KEY missing', { retryable: false });

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      'X-Title': 'Portafolio Omar Chatbot',
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
    throw new ProviderError('openrouter', `HTTP ${res.status}`, { status: res.status, retryable: !isAuth });
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content?.trim() || '';
  if (!text) throw new ProviderError('openrouter', 'empty response');
  return text;
};
