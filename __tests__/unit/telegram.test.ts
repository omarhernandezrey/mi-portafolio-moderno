/**
 * Tests de `src/lib/chatbot/telegram.ts` (T-16).
 *
 * Nunca se llama a la API real de Telegram: `global.fetch` se sustituye por
 * un mock en cada test.
 */
jest.mock('@/config/env', () => ({
  serverEnv: {
    TELEGRAM_BOT_TOKEN: 'token-de-prueba',
    TELEGRAM_CHAT_ID: '12345',
  },
}));

import { serverEnv } from '@/config/env';
import { notifyTelegram, sendTelegramMessage, TELEGRAM_REASON } from '@/lib/chatbot/telegram';

const envFalseable = serverEnv as { TELEGRAM_BOT_TOKEN: string; TELEGRAM_CHAT_ID: string };

function respuestaFetch(ok: boolean, status = 200, body: unknown = {}) {
  return { ok, status, json: async () => body } as Response;
}

describe('sendTelegramMessage', () => {
  const originalToken = envFalseable.TELEGRAM_BOT_TOKEN;
  const originalChat = envFalseable.TELEGRAM_CHAT_ID;

  afterEach(() => {
    envFalseable.TELEGRAM_BOT_TOKEN = originalToken;
    envFalseable.TELEGRAM_CHAT_ID = originalChat;
    jest.restoreAllMocks();
  });

  it('sin TELEGRAM_BOT_TOKEN: sent=false con motivo, nunca lanza', async () => {
    envFalseable.TELEGRAM_BOT_TOKEN = '';
    const fetchSpy = jest.spyOn(global, 'fetch');
    const resultado = await sendTelegramMessage('hola');
    expect(resultado.sent).toBe(false);
    expect(resultado.reason).toContain(TELEGRAM_REASON.NOT_CONFIGURED);
    expect(resultado.reason).toContain('TELEGRAM_BOT_TOKEN');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('sin ninguna credencial: nombra las dos variables que faltan', async () => {
    envFalseable.TELEGRAM_BOT_TOKEN = '';
    envFalseable.TELEGRAM_CHAT_ID = '';
    const resultado = await sendTelegramMessage('hola');
    expect(resultado.reason).toContain('TELEGRAM_BOT_TOKEN');
    expect(resultado.reason).toContain('TELEGRAM_CHAT_ID');
  });

  it('envío exitoso: sent=true, sin reintento', async () => {
    const fetchMock = jest.fn().mockResolvedValue(respuestaFetch(true));
    global.fetch = fetchMock as unknown as typeof fetch;
    const resultado = await sendTelegramMessage('hola');
    expect(resultado).toEqual({ sent: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('400 de la API: reintenta en texto plano y lo marca en el motivo', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(respuestaFetch(false, 400, { description: 'markdown roto' }))
      .mockResolvedValueOnce(respuestaFetch(true));
    global.fetch = fetchMock as unknown as typeof fetch;

    const resultado = await sendTelegramMessage('texto con _guiones_ raros');

    expect(resultado).toEqual({ sent: true, reason: TELEGRAM_REASON.PLAIN_TEXT_FALLBACK });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    // segundo intento: sin parse_mode
    const segundoCuerpo = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(segundoCuerpo.parse_mode).toBeUndefined();
  });

  it('400 también en el reintento: sent=false con el código de estado', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(respuestaFetch(false, 400, {}))
      .mockResolvedValueOnce(respuestaFetch(false, 400, {}));
    global.fetch = fetchMock as unknown as typeof fetch;

    const resultado = await sendTelegramMessage('x');
    expect(resultado).toEqual({ sent: false, reason: 'telegram-api-400' });
  });

  it('un error distinto de 400 no reintenta', async () => {
    const fetchMock = jest.fn().mockResolvedValue(respuestaFetch(false, 500, {}));
    global.fetch = fetchMock as unknown as typeof fetch;
    const resultado = await sendTelegramMessage('x');
    expect(resultado).toEqual({ sent: false, reason: 'telegram-api-500' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('error de red: sent=false, no lanza', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('ECONNRESET')) as unknown as typeof fetch;
    const resultado = await sendTelegramMessage('x');
    expect(resultado.sent).toBe(false);
    expect(resultado.reason).toBe(TELEGRAM_REASON.NETWORK_ERROR);
  });

  it('con chatId explícito, escribe a ese chat y no al de TELEGRAM_CHAT_ID', async () => {
    const fetchMock = jest.fn().mockResolvedValue(respuestaFetch(true));
    global.fetch = fetchMock as unknown as typeof fetch;
    await sendTelegramMessage('hola', 999);
    const cuerpo = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(cuerpo.chat_id).toBe('999');
  });

  it('notifyTelegram es sendTelegramMessage al chat por omisión', async () => {
    const fetchMock = jest.fn().mockResolvedValue(respuestaFetch(true));
    global.fetch = fetchMock as unknown as typeof fetch;
    await notifyTelegram('hola');
    const cuerpo = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(cuerpo.chat_id).toBe('12345');
  });
});
