/**
 * Tests del webhook entrante de Telegram (T-16).
 *
 * - Sin `TELEGRAM_WEBHOOK_SECRET`: error identificable, nunca 200 silencioso.
 * - Con un update real: responde al `chat.id` del update, no al
 *   `TELEGRAM_CHAT_ID` fijo (aunque en un chat privado sean el mismo valor).
 */
jest.mock('@/config/env', () => ({
  serverEnv: {
    TELEGRAM_BOT_TOKEN: 'token-de-prueba',
    TELEGRAM_CHAT_ID: '111',
    TELEGRAM_WEBHOOK_SECRET: 'el-secreto',
  },
}));

jest.mock('@/lib/chatbot/telegram', () => ({
  sendTelegramMessage: jest.fn().mockResolvedValue({ sent: true }),
}));

jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: { from: jest.fn() },
}));

import { serverEnv } from '@/config/env';
import { sendTelegramMessage } from '@/lib/chatbot/telegram';
import { POST } from '@/app/api/telegram/webhook/route';

const mockSend = sendTelegramMessage as jest.Mock;
const mockServerEnv = serverEnv as unknown as Record<string, string>;

function peticion(body: unknown, secretHeader?: string) {
  return new Request('http://localhost/api/telegram/webhook', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(secretHeader !== undefined ? { 'x-telegram-bot-api-secret-token': secretHeader } : {}),
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  mockSend.mockClear();
  mockServerEnv.TELEGRAM_WEBHOOK_SECRET = 'el-secreto';
});

describe('POST /api/telegram/webhook', () => {
  it('sin TELEGRAM_WEBHOOK_SECRET configurado: 503 con un error identificable', async () => {
    mockServerEnv.TELEGRAM_WEBHOOK_SECRET = '';
    const res = await POST(peticion({ message: { from: { id: 111 }, chat: { id: 111 }, text: '/help' } }, 'lo-que-sea'));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toBe('webhook-sin-secreto');
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('con el secreto equivocado: 401, no se confunde con "sin secreto"', async () => {
    const res = await POST(peticion({ message: {} }, 'secreto-falso'));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('webhook-secreto-invalido');
  });

  it('un comando responde al chat.id del update, no al TELEGRAM_CHAT_ID fijo', async () => {
    const res = await POST(
      peticion(
        { message: { from: { id: 111 }, chat: { id: 987654 }, text: '/help' } },
        'el-secreto',
      ),
    );
    expect(res.status).toBe(200);
    expect(mockSend).toHaveBeenCalledTimes(1);
    const [, chatId] = mockSend.mock.calls[0];
    expect(chatId).toBe(987654);
  });

  it('un remitente que no es Omar no recibe respuesta', async () => {
    const res = await POST(
      peticion(
        { message: { from: { id: 999 }, chat: { id: 999 }, text: '/help' } },
        'el-secreto',
      ),
    );
    expect(res.status).toBe(200);
    expect(mockSend).not.toHaveBeenCalled();
  });
});
