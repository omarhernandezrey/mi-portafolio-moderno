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

const MD2_RESERVED = /([_*[\]()~`>#+\-=|{}.!\\])/g;
const escapeMd2 = (s: string) => s.replace(MD2_RESERVED, '\\$1');

export interface NotifyLeadInput {
  lead: {
    name?: string | null;
    email?: string | null;
    type?: string | null;
    service_requested?: string | null;
  };
  conversationId: string;
  leadId: string;
  siteUrl: string;
  botUsername?: string;
}

type InlineButton =
  | { text: string; url: string }
  | { text: string; callback_data: string };

export async function notifyLead(input: NotifyLeadInput): Promise<void> {
  const token = serverEnv.TELEGRAM_BOT_TOKEN;
  const chatId = serverEnv.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const { lead, conversationId, leadId, siteUrl, botUsername } = input;
  const cleanSite = siteUrl.replace(/\/$/, '');

  const text = [
    '🎯 *Nuevo lead capturado*',
    '',
    `👤 *Nombre:* ${escapeMd2(lead.name || 'Sin nombre')}`,
    `📧 *Email:* ${escapeMd2(lead.email || 'No proporcionado')}`,
    `🏷️ *Tipo:* ${escapeMd2(lead.type || 'consulta')}`,
    `💼 *Servicio:* ${escapeMd2(lead.service_requested || 'Sin especificar')}`,
    '',
    `_Responde en menos de 30 minutos para 9× más conversión\\._`,
  ].join('\n');

  const row1: InlineButton[] = [];
  if (botUsername) {
    row1.push({
      text: '💬 Responder ahora',
      url: `https://t.me/${botUsername}?start=reply_${conversationId}`,
    });
  }
  if (cleanSite) {
    row1.push({
      text: '📋 Ver conversación',
      url: `${cleanSite}/admin/leads/${leadId}`,
    });
  }
  const row2: InlineButton[] = [
    { text: '✅ Marcar contactado', callback_data: `mark_contacted_${leadId}` },
  ];
  const inline_keyboard: InlineButton[][] = [];
  if (row1.length) inline_keyboard.push(row1);
  inline_keyboard.push(row2);

  console.time(`[notifyLead] ${leadId}`);
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'MarkdownV2',
        disable_web_page_preview: true,
        reply_markup: { inline_keyboard },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram notifyLead error:', errorData);
    }
  } catch (error) {
    console.error('Error sending notifyLead:', error);
  } finally {
    console.timeEnd(`[notifyLead] ${leadId}`);
  }
}
