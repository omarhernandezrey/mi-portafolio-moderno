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

    // Los `error` de estas dos consultas se descartaban. Si fallaban, `data`
    // venía null, los dos bucles se saltaban enteros y la ruta respondía
    // `{success:true, processed:0, sent:0}` con 200: el `curl -f` del
    // workflow pasaba y el follow-up quedaba muerto en silencio. Igual que
    // sus hermanos (cleanup-cold-leads, daily-summary, database-cleanup),
    // ahora un fallo de consulta es un fallo visible.
    // 1. Buscar leads con status 'cold' que tengan email
    const { data: coldLeads, error: errorLeads } = await supabaseServer
      .from('leads')
      .select('id, name, email, service_requested')
      .eq('status', 'cold')
      .not('email', 'is', null)
      .limit(50);
    if (errorLeads) throw errorLeads;

    // 2. Subscribers de LEAD MAGNET confirmados, sin followup y con > 24h
    const { data: subscribers, error: errorSubs } = await supabaseServer
      .from('subscribers')
      .select('*')
      .is('followup_sent_at', null)
      .eq('confirmed', true)
      .is('unsubscribed_at', null)
      .lt('created_at', oneDayAgo)
      .limit(50);
    if (errorSubs) throw errorSubs;

    const results = [];

    let skippedInvalid = 0;

    // Procesar Leads
    if (coldLeads) {
      for (const lead of coldLeads) {
        // Email ausente o mal formado: sacar de 'cold' para no reintentar en cada corrida
        if (!isEmail(lead.email)) {
          await supabaseServer.from('leads').update({ status: 'archived' }).eq('id', lead.id);
          skippedInvalid++;
          continue;
        }
        const sent = await sendFollowUpEmail(lead.email, lead.name || 'Hola', lead.service_requested || 'tu proyecto');
        if (sent) {
          // Este update es el ÚNICO freno contra reenviar: si falla y no se
          // mira, el lead sigue en 'cold', vuelve a entrar en la consulta de
          // mañana y recibe el mismo correo todos los días mientras dure el
          // fallo — y `results` seguiría diciendo que todo fue bien.
          const { error: errorUpd } = await supabaseServer
            .from('leads').update({ status: 'followed_up' }).eq('id', lead.id);
          if (errorUpd) {
            console.error('[email-followup] correo enviado pero no se pudo marcar el lead', lead.id, errorUpd);
            results.push({ type: 'lead', id: lead.id, status: 'sent_no_marcado' });
          } else {
            results.push({ type: 'lead', id: lead.id, status: 'sent' });
          }
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
          // Mismo caso que arriba: sin este marcador, el suscriptor recibe el
          // correo del lead magnet en cada corrida.
          const { error: errorUpd } = await supabaseServer
            .from('subscribers').update({ followup_sent_at: now.toISOString() }).eq('id', sub.id);
          if (errorUpd) {
            console.error('[email-followup] correo enviado pero no se pudo marcar el suscriptor', sub.id, errorUpd);
            results.push({ type: 'subscriber', id: sub.id, status: 'sent_no_marcado' });
          } else {
            results.push({ type: 'subscriber', id: sub.id, status: 'sent' });
          }
        }
      }
    }

    const sentCount = results.filter(r => r.status === 'sent').length;
    // Los 'sent_no_marcado' SÍ recibieron el correo: cuentan como enviados y
    // además se avisan aparte, porque son los que volverán a recibirlo si no
    // se arregla el motivo del fallo.
    const sinMarcar = results.filter(r => r.status === 'sent_no_marcado').length;
    const totalEnviados = sentCount + sinMarcar;

    if (totalEnviados > 0) {
      await notifyTelegram(
        `✉️ *Follow-up automático* enviado a ${totalEnviados} contactos (leads + recursos).` +
          (sinMarcar > 0
            ? `\n⚠️ ${sinMarcar} no se pudieron marcar como enviados: recibirán el correo otra vez en la próxima corrida si no se corrige.`
            : '')
      );
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      sent: totalEnviados,
      sinMarcar,
      skippedInvalid,
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Email follow-up cron error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

