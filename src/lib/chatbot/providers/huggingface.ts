import { ProviderCall, ProviderError, buildMessages } from './types';
import { serverEnv } from '@/config/env';
import { HfInference } from '@huggingface/inference';

// Lista de modelos recomendados en Hugging Face
const FREE_MODELS = [
  'Qwen/Qwen2.5-72B-Instruct',
  'NousResearch/Hermes-3-Llama-3.1-8B',
  'microsoft/Phi-3-mini-4k-instruct',
  'meta-llama/Meta-Llama-3-8B-Instruct'
];

export const call: ProviderCall = async (args) => {
  const apiKey = serverEnv.HF_TOKEN;
  if (!apiKey) throw new ProviderError('huggingface', 'HF_TOKEN missing', { retryable: false });

  const hf = new HfInference(apiKey);
  let lastError: ProviderError | null = null;

  for (const model of FREE_MODELS) {
    try {
      const messages = buildMessages(args).map(m => ({
        role: m.role,
        content: m.content
      }));
      
      const res = await hf.chatCompletion({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 800
      }, {
        signal: args.signal
      });

      const text = res.choices?.[0]?.message?.content?.trim() || '';
      
      if (!text) {
        lastError = new ProviderError('huggingface', `empty response from ${model}`);
        continue;
      }
      
      return text;
    } catch (error: unknown) {
      const err = error as { statusCode?: number; status?: number; message?: string };
      const status = err.statusCode || err.status || 500;
      const isAuth = status === 401 || status === 403;
      
      if (isAuth) {
        throw new ProviderError('huggingface', `Auth Error: ${err.message}`, { status, retryable: false });
      }
      
      lastError = new ProviderError('huggingface', `Error on ${model}: ${err.message}`, { status, retryable: true });
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[HuggingFace] Falló el modelo ${model} (${err.message}), intentando el siguiente...`);
      }
    }
  }

  throw lastError || new ProviderError('huggingface', 'All HF models failed');
};
