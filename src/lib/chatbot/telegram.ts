import { serverEnv } from "@/config/env";

/**
 * Resultado de un intento de envío a Telegram.
 *
 * Antes la función devolvía `void` y se comía los fallos con `console.warn`:
 * si faltaban credenciales, el llamador creía haber notificado y nadie se
 * enteraba. Ahora el fallo es un valor que se puede inspeccionar y registrar.
 */
export interface TelegramSendResult {
  /** `true` solo si Telegram aceptó el mensaje. */
  sent: boolean;
  /** Motivo legible cuando no se envió (o matiz cuando sí, p. ej. reintento en texto plano). */
  reason?: string;
}

/** Motivos estables, para que un llamador pueda distinguirlos sin parsear texto. */
export const TELEGRAM_REASON = {
  NOT_CONFIGURED: 'telegram-no-configurado',
  PLAIN_TEXT_FALLBACK: 'enviado-en-texto-plano',
  NETWORK_ERROR: 'error-de-red',
} as const;

const TELEGRAM_TIMEOUT_MS = 10000;

/**
 * Envía un mensaje a un chat concreto de Telegram.
 *
 * `chatId` permite responder al chat del update entrante en vez de escribir
 * siempre al `TELEGRAM_CHAT_ID` fijo. Si se omite, cae al chat por omisión.
 *
 * Nunca lanza: devuelve `{ sent: false, reason }`.
 */
export async function sendTelegramMessage(
  text: string,
  chatId?: string | number
): Promise<TelegramSendResult> {
  const token = serverEnv.TELEGRAM_BOT_TOKEN;
  const targetChatId =
    chatId === undefined || chatId === null || chatId === ''
      ? serverEnv.TELEGRAM_CHAT_ID
      : String(chatId);

  if (!token || !targetChatId) {
    const missing = [
      !token ? 'TELEGRAM_BOT_TOKEN' : null,
      !targetChatId ? 'TELEGRAM_CHAT_ID' : null,
    ]
      .filter(Boolean)
      .join(' y ');
    const reason = `${TELEGRAM_REASON.NOT_CONFIGURED}: falta ${missing}`;
    // console.error y no console.warn: esto no es un aviso, es una
    // notificación perdida. Accionable: dice exactamente qué configurar.
    console.error(
      `[telegram] Mensaje NO enviado — ${reason}. Define la variable en el entorno (Vercel o .env.local) para recuperar las notificaciones.`
    );
    return { sent: false, reason };
  }

  const send = (parseMode?: 'Markdown') =>
    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChatId,
        text,
        ...(parseMode ? { parse_mode: parseMode } : {}),
      }),
      signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
    });

  try {
    const response = await send('Markdown');
    if (response.ok) return { sent: true };

    const errorData = await response.json().catch(() => null);
    console.error('[telegram] Error de la API de Telegram:', errorData);

    // Si el Markdown del mensaje está roto (datos del usuario con _ * [ etc.),
    // reenviar en texto plano para no perder la notificación.
    if (response.status === 400) {
      const retry = await send();
      if (retry.ok) {
        return { sent: true, reason: TELEGRAM_REASON.PLAIN_TEXT_FALLBACK };
      }
      const retryError = await retry.json().catch(() => null);
      console.error('[telegram] Error de la API de Telegram (texto plano):', retryError);
      return { sent: false, reason: `telegram-api-${retry.status}` };
    }

    return { sent: false, reason: `telegram-api-${response.status}` };
  } catch (error) {
    console.error('[telegram] Error de red enviando notificación:', error);
    return { sent: false, reason: TELEGRAM_REASON.NETWORK_ERROR };
  }
}

/**
 * Notifica al chat por omisión (`TELEGRAM_CHAT_ID`, el chat de Omar).
 *
 * La firma pasó de `Promise<void>` a `Promise<TelegramSendResult>`: los
 * llamadores que ignoran el valor de retorno siguen funcionando igual.
 */
export async function notifyTelegram(text: string): Promise<TelegramSendResult> {
  return sendTelegramMessage(text);
}
