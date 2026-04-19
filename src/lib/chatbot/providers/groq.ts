import Groq from 'groq-sdk';
import type { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';
import { ProviderCall, ProviderError, buildMessages } from './types';

const MODEL = 'llama-3.3-70b-versatile';

export const call: ProviderCall = async (args) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new ProviderError('groq', 'GROQ_API_KEY missing', { retryable: false });

  const groq = new Groq({ apiKey });
  const messages: ChatCompletionMessageParam[] = buildMessages(args).map((m) => ({
    role: m.role === 'system' ? 'system' : (m.role as 'user' | 'assistant'),
    content: m.content,
  }));

  try {
    const completion = await groq.chat.completions.create(
      { model: MODEL, messages, temperature: 0.7, max_tokens: 800 },
      { signal: args.signal }
    );
    const text = completion.choices[0]?.message?.content?.trim() || '';
    if (!text) throw new ProviderError('groq', 'empty response');
    return text;
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    const status = e?.status;
    const isAuth = status === 401 || status === 403;
    throw new ProviderError('groq', e?.message || 'request failed', {
      status,
      retryable: !isAuth,
    });
  }
};
