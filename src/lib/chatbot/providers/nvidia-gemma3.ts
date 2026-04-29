import { ProviderCall, ProviderError, buildMessages } from './types';
import { serverEnv } from '@/config/env';

const MODEL = 'google/gemma-3-27b-it';
const ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions';

export const call: ProviderCall = async (args) => {
  const apiKey = serverEnv.NVIDIA_GEMMA3_API_KEY || serverEnv.NVIDIA_API_KEY;
  if (!apiKey) throw new ProviderError('nvidia-gemma3', 'NVIDIA_GEMMA3_API_KEY missing', { retryable: false });

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: buildMessages(args),
      temperature: 0.2,
      top_p: 0.7,
      max_tokens: 800,
    }),
    signal: args.signal,
  });

  if (!res.ok) {
    const isAuth = res.status === 401 || res.status === 403;
    const errText = await res.text().catch(() => '');
    throw new ProviderError('nvidia-gemma3', `HTTP ${res.status}: ${errText}`, { status: res.status, retryable: !isAuth });
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content?.trim() || '';
  if (!text) throw new ProviderError('nvidia-gemma3', 'empty response');
  return text;
};
