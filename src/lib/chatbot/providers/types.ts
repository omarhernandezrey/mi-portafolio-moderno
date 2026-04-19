export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ProviderCallArgs {
  systemPrompt: string;
  history: ChatMessage[];
  userMessage: string;
  signal?: AbortSignal;
}

export type ProviderCall = (args: ProviderCallArgs) => Promise<string>;

export class ProviderError extends Error {
  status?: number;
  retryable: boolean;
  provider: string;

  constructor(provider: string, message: string, opts: { status?: number; retryable?: boolean } = {}) {
    super(`[${provider}] ${message}`);
    this.provider = provider;
    this.status = opts.status;
    this.retryable = opts.retryable ?? true;
  }
}

export function buildMessages(args: ProviderCallArgs): ChatMessage[] {
  return [
    { role: 'system', content: args.systemPrompt },
    ...args.history,
    { role: 'user', content: args.userMessage },
  ];
}
