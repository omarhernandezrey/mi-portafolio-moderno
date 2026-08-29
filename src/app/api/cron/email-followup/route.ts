import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { sendFollowUpEmail, sendLeadMagnetFollowUp } from '@/lib/chatbot/email';
import { requireCronAuth } from '@/lib/cronAuth';
import { notifyTelegram } from '@/lib/chatbot/telegram';

export const dynamic = 'force-dynamic';

// Fuentes de subscribers que SÍ descargaron un recurso (lead magnet)
const LEAD_MAGNET_SOURCES = ['checklist', 'guia-precios', 'plantilla-brief', 'leadmagnet'];

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const isEmail = (v: unknown): v is string =>
  typeof v === 'string' && EMAIL_RE.test(v.trim());

export async function GET(req: NextRequest) {
  const authError = requireCronAuth(req);
  if (authError) return authError;

  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    // 1. Buscar leads con status 'cold' que tengan email
    const { data: coldLeads } = await supabaseServer
      .from('leads')
      .select('id, name, email, service_requested')
      .eq('status', 'cold')
      .not('email', 'is', null)
      .limit(50);

    // 2. Subscribers de LEAD MAGNET confirmados, sin followup y con > 24h
    const { data: subscribers } = await supabaseServer
      .from('subscribers')
      .select('*')
      .is('followup_sent_at', null)
      .eq('confirmed', true)
      .lt('created_at', oneDayAgo)
      .limit(50);

    const results = [];

    let skippedInvalid = 0;

    // Procesar Leads
    if (coldLeads) {
      for (const lead of coldLeads) {
        // Email ausente o mal formado: sacar de 'cold' para no reintentar en cada corrida
        if (!isEmail(lead.email)) {
          await supabaseServer.from('leads').update({ status: 'invalid_email' }).eq('id', lead.id);
          skippedInvalid++;
          continue;
        }
        const sent = await sendFollowUpEmail(lead.email, lead.name || 'Hola', lead.service_requested || 'tu proyecto');
        if (sent) {
          await supabaseServer.from('leads').update({ status: 'followed_up' }).eq('id', lead.id);
          results.push({ type: 'lead', id: lead.id, status: 'sent' });
        }
      }
    }

    // Procesar Subscribers — solo los que descargaron un recurso
    if (subscribers) {
      for (const sub of subscribers) {
        if (!LEAD_MAGNET_SOURCES.some(s => (sub.source || '').includes(s))) continue;
        if (!isEmail(sub.email)) { skippedInvalid++; continue; }
        const sent = await sendLeadMagnetFollowUp(sub.email, sub.source);
        if (sent) {
          await supabaseServer.from('subscribers').update({ followup_sent_at: now.toISOString() }).eq('id', sub.id);
          results.push({ type: 'subscriber', id: sub.id, status: 'sent' });
        }
      }
    }

    const sentCount = results.filter(r => r.status === 'sent').length;
    if (sentCount > 0) {
      await notifyTelegram(`✉️ *Follow-up automático* enviado a ${sentCount} contactos (leads + recursos).`);
    }

    return NextResponse.json({ success: true, processed: results.length, sent: sentCount, skippedInvalid });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Email follow-up cron error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

