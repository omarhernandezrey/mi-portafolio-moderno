import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { serverEnv } from '@/config/env';
import { notifyTelegram } from '@/lib/chatbot/telegram';

async function answerCallback(callbackId: string, text: string) {
  try {
    await fetch(
      `https://api.telegram.org/bot${serverEnv.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callbackId, text, show_alert: false }),
      }
    );
  } catch (err) {
    console.error('answerCallback error:', err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, callback_query } = body;

    // --- BOTONES INLINE (Tarea 28.1) ---
    if (callback_query) {
      const fromId = callback_query.from.id.toString();
      if (fromId !== serverEnv.TELEGRAM_CHAT_ID) {
        await answerCallback(callback_query.id, '⛔ No autorizado');
        return NextResponse.json({ ok: true });
      }
      const data: string = callback_query.data ?? '';
      if (data.startsWith('mark_contacted_')) {
        const leadId = data.replace('mark_contacted_', '');
        const { error } = await supabaseServer
          .from('leads')
          .update({ status: 'contacted' })
          .eq('id', leadId);
        await answerCallback(
          callback_query.id,
          error ? `❌ Error: ${error.message}` : '✅ Marcado como contactado'
        );
        return NextResponse.json({ ok: true });
      }
      await answerCallback(callback_query.id, '⚠️ Acción desconocida');
      return NextResponse.json({ ok: true });
    }

    // Si no es un mensaje de texto, ignoramos (ej: stickers, fotos)
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const fromId = message.from.id.toString();
    const text = message.text;

    // REGLA: Solo Omar (su chat_id) puede mandar comandos al bot
    if (fromId !== serverEnv.TELEGRAM_CHAT_ID) {
      console.log(`Unauthorized message from: ${fromId}`);
      return NextResponse.json({ ok: true });
    }

    // --- COMANDO /leads ---
    if (text === '/leads') {
      const { data: leads, error } = await supabaseServer
        .from('leads')
        .select('name, service_requested, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (!leads || leads.length === 0) {
        await notifyTelegram("📭 No hay leads registrados todavía.");
      } else {
        let reply = "🎯 *Últimos 5 Leads:*\n\n";
        leads.forEach((l, i) => {
          reply += `${i+1}. *${l.name}*\nServicio: ${l.service_requested || 'N/A'}\nEstado: \`${l.status}\`\nFecha: ${new Date(l.created_at).toLocaleDateString()}\n\n`;
        });
        await notifyTelegram(reply);
      }
    }

    // --- COMANDO /conv {sessionId} ---
    else if (text.startsWith('/conv')) {
      const sessionId = text.split(' ')[1];
      if (!sessionId) {
        await notifyTelegram("⚠️ Uso: `/conv <sessionId>`");
        return NextResponse.json({ ok: true });
      }

      const { data: conv, error: convErr } = await supabaseServer
        .from('conversations')
        .select('id, visitor_name')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (convErr || !conv) {
        await notifyTelegram(`❌ No se encontró la sesión \`${sessionId}\`.`);
        return NextResponse.json({ ok: true });
      }

      const { data: msgs, error: msgsErr } = await supabaseServer
        .from('messages')
        .select('role, content, created_at')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (msgsErr) throw msgsErr;

      let reply = `💬 *Últimos 10 msgs (Sesión: ${sessionId})*\nVisitante: *${conv.visitor_name || 'Desconocido'}*\n\n`;
      msgs?.reverse().forEach(m => {
        const roleIcon = m.role === 'user' ? '👤' : '🤖';
        reply += `${roleIcon} *${m.role}:* ${m.content}\n\n`;
      });
      await notifyTelegram(reply);
    }

    // --- COMANDO /reply {sessionId} {mensaje} ---
    else if (text.startsWith('/reply')) {
      const parts = text.split(' ');
      const sessionId = parts[1];
      const replyMsg = parts.slice(2).join(' ');

      if (!sessionId || !replyMsg) {
        await notifyTelegram("⚠️ Uso: `/reply <sessionId> <mensaje>`");
        return NextResponse.json({ ok: true });
      }

      const { data: conv, error: convErr } = await supabaseServer
        .from('conversations')
        .select('id')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (convErr || !conv) {
        await notifyTelegram(`❌ No se encontró la sesión \`${sessionId}\`.`);
        return NextResponse.json({ ok: true });
      }

      // 1. Guardar mensaje como assistant
      const { error: msgErr } = await supabaseServer
        .from('messages')
        .insert({
          conversation_id: conv.id,
          role: 'assistant',
          content: replyMsg
        });

      if (msgErr) throw msgErr;

      // 2. Marcar como human_takeover (requiere que la columna exista)
      await supabaseServer
        .from('conversations')
        .update({ human_takeover: true })
        .eq('id', conv.id);

      await notifyTelegram(`✅ Mensaje enviado a \`${sessionId}\`. AI desactivada para este chat.`);
    }

    // --- COMANDO /auto {sessionId} ---
    else if (text.startsWith('/auto')) {
      const sessionId = text.split(' ')[1];
      if (!sessionId) {
        await notifyTelegram("⚠️ Uso: `/auto <sessionId>`");
        return NextResponse.json({ ok: true });
      }

      const { data: conv } = await supabaseServer
        .from('conversations')
        .select('id')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (conv) {
        await supabaseServer
          .from('conversations')
          .update({ human_takeover: false })
          .eq('id', conv.id);
        await notifyTelegram(`🤖 AI reactivada para la sesión \`${sessionId}\`.`);
      }
    }

    // --- COMANDO /help ---
    else if (text === '/help' || text === '/start') {
      const help = `
🤖 *Asistente Admin - Comandos:*
-------------------------
/leads - Ver últimos 5 leads capturados.
/conv <id> - Ver últimos 10 msgs de una sesión.
/reply <id> <msg> - Responder y bloquear AI.
/auto <id> - Desbloquear AI para esa sesión.
/help - Mostrar este mensaje.
      `.trim();
      await notifyTelegram(help);
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('Telegram Webhook Error:', error);
    // Siempre respondemos OK a Telegram para evitar reintentos infinitos si falla
    return NextResponse.json({ ok: true });
  }
}
