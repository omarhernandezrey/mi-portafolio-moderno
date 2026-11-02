import { serverEnv } from "@/config/env";

export async function notifyTelegram(text: string): Promise<void> {
  const token = serverEnv.TELEGRAM_BOT_TOKEN;
  const chatId = serverEnv.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('Telegram no configurado: TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID vacío.');
    return;
  }

  const send = (parseMode?: 'Markdown') =>
    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        ...(parseMode ? { parse_mode: parseMode } : {}),
      }),
      signal: AbortSignal.timeout(10000),
    });

  try {
    let response = await send('Markdown');

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Telegram API error:', errorData);

      // Si el Markdown del mensaje está roto (datos del usuario con _ * [ etc.),
      // reenviar en texto plano para no perder la notificación.
      if (response.status === 400) {
        response = await send();
        if (!response.ok) {
          const retryError = await response.json().catch(() => null);
          console.error('Telegram API error (plain text):', retryError);
        }
      }
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
}
