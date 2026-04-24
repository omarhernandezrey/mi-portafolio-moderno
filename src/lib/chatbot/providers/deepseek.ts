import { ProviderCall, ProviderError, buildMessages } from './types';
import { serverEnv } from '@/config/env';

const MODEL = 'deepseek-chat';
const ENDPOINT = 'https://api.deepseek.com/chat/completions';

export const call: ProviderCall = async (args) => {
  const apiKey = serverEnv.DEEPSEEK_API_KEY;
  if (!apiKey) throw new ProviderError('deepseek', 'DEEPSEEK_API_KEY missing', { retryable: false });

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
    const errText = await res.text().catch(() => '');
    throw new ProviderError('deepseek', `HTTP ${res.status}: ${errText}`, { status: res.status, retryable: !isAuth });
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content?.trim() || '';
  if (!text) throw new ProviderError('deepseek', 'empty response');
  return text;
};
