import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { sendFollowUpEmail } from '@/lib/chatbot/email';
import { serverEnv } from '@/config/env';
import { notifyTelegram } from '@/lib/chatbot/telegram';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${serverEnv.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Buscar leads con status 'cold' que tengan email
    const { data: coldLeads, error: fetchError } = await supabaseServer
      .from('leads')
      .select('id, name, email, service_requested')
      .eq('status', 'cold')
      .not('email', 'is', null);

    if (fetchError) throw fetchError;

    if (!coldLeads || coldLeads.length === 0) {
      return NextResponse.json({ message: 'No cold leads to follow up.' });
    }

    const results = [];

    for (const lead of coldLeads) {
      console.log(`Sending follow-up to ${lead.email}...`);
      const sent = await sendFollowUpEmail(lead.email, lead.name, lead.service_requested || 'tu proyecto');

      if (sent) {
        // 2. Marcar como 'followed_up'
        const { error: updateError } = await supabaseServer
          .from('leads')
          .update({ status: 'followed_up' })
          .eq('id', lead.id);

        if (updateError) {
          console.error(`Error updating lead ${lead.id} status:`, updateError);
        }

        results.push({ id: lead.id, status: 'sent' });
      } else {
        results.push({ id: lead.id, status: 'failed' });
      }
    }

    const sentCount = results.filter(r => r.status === 'sent').length;
    if (sentCount > 0) {
      await notifyTelegram(`✉️ *Follow-up enviado* a ${sentCount} leads fríos.`);
    }

    return NextResponse.json({ success: true, results });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Email follow-up cron error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
