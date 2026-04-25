import { serverEnv } from '@/config/env';
import { ProviderCall, ProviderError, buildMessages } from './types';

const MODEL = '@cf/meta/llama-3.1-8b-instruct';

export const call: ProviderCall = async (args) => {
  const accountId = serverEnv.CLOUDFLARE_ACCOUNT_ID;
  const token = serverEnv.CLOUDFLARE_API_TOKEN;
  if (!accountId || !token) {
    throw new ProviderError('cloudflare', 'CLOUDFLARE_* missing', { retryable: false });
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${MODEL}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: buildMessages(args),
      temperature: 0.7,
      max_tokens: 800,
    }),
    signal: args.signal,
  });

  if (!res.ok) {
    const isAuth = res.status === 401 || res.status === 403;
    throw new ProviderError('cloudflare', `HTTP ${res.status}`, { status: res.status, retryable: !isAuth });
  }

  const data = (await res.json()) as { result?: { response?: string }; success?: boolean };
  const text = data.result?.response?.trim() || '';
  if (!text) throw new ProviderError('cloudflare', 'empty response');
  return text;
};
