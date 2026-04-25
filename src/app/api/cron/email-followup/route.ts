import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { sendFollowUpEmail, sendLeadMagnetFollowUp } from '@/lib/chatbot/email';
import { serverEnv } from '@/config/env';
import { notifyTelegram } from '@/lib/chatbot/telegram';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${serverEnv.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    // 1. Buscar leads con status 'cold' que tengan email
    const { data: coldLeads } = await supabaseServer
      .from('leads')
      .select('id, name, email, service_requested')
      .eq('status', 'cold')
      .not('email', 'is', null);

    // 2. Buscar subscribers sin followup y con > 24h
    const { data: subscribers } = await supabaseServer
      .from('subscribers')
      .select('*')
      .is('followup_sent_at', null)
      .lt('created_at', oneDayAgo);

    const results = [];

    // Procesar Leads
    if (coldLeads) {
      for (const lead of coldLeads) {
        const sent = await sendFollowUpEmail(lead.email!, lead.name!, lead.service_requested || 'tu proyecto');
        if (sent) {
          await supabaseServer.from('leads').update({ status: 'followed_up' }).eq('id', lead.id);
          results.push({ type: 'lead', id: lead.id, status: 'sent' });
        }
      }
    }

    // Procesar Subscribers
    if (subscribers) {
      for (const sub of subscribers) {
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

    return NextResponse.json({ success: true, processed: results.length, sent: sentCount });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Email follow-up cron error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
