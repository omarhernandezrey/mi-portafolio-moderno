import Groq from 'groq-sdk';
import type { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';
import { ProviderCall, ProviderError, buildMessages } from './types';

const MODEL = 'llama-3.3-70b-versatile';
const VISION_MODEL = 'llama-3.2-11b-vision-preview';

export const call: ProviderCall = async (args) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new ProviderError('groq', 'GROQ_API_KEY missing', { retryable: false });

  const groq = new Groq({ apiKey });
  const baseMessages = buildMessages(args);
  
  let messages: ChatCompletionMessageParam[];
  let modelToUse = MODEL;

  if (args.imageDataUrl) {
    modelToUse = VISION_MODEL;
    // Para vision, el último mensaje debe ser del usuario con el formato de imagen
    const userMsg = baseMessages[baseMessages.length - 1];
    messages = [
      ...baseMessages.slice(0, -1).map(m => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content
      })),
      {
        role: 'user',
        content: [
          { type: 'text', text: userMsg.content },
          {
            type: 'image_url',
            image_url: {
              url: args.imageDataUrl,
            },
          },
        ],
      } as ChatCompletionMessageParam
    ];
  } else {
    messages = baseMessages.map((m) => ({
      role: m.role === 'system' ? 'system' : (m.role as 'user' | 'assistant'),
      content: m.content,
    }));
  }

  try {
    const completion = await groq.chat.completions.create(
      { model: modelToUse, messages, temperature: 0.7, max_tokens: 1024 },
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
