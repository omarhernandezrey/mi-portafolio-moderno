import { serverEnv } from "@/config/env";

export async function notifyTelegram(text: string): Promise<void> {
  const token = serverEnv.TELEGRAM_BOT_TOKEN;
  const chatId = serverEnv.TELEGRAM_CHAT_ID;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
}
