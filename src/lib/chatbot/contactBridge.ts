import { supabaseServer } from '../supabaseServer';
import { notifyTelegram } from './telegram';
import { sendContactNotification } from './email';
import { Lead } from '@/lib/leads/types';
import { dispatchEvent } from '@/lib/events/dispatcher';

const ORIGEN = 'contact_form';

/**
 * Registra un lead proveniente del formulario de contacto tradicional.
 *
 * T-25: ya no crea una `conversations` ficticia solo para colgar el lead de
 * algo — eso dejaba el origen escondido en `conversations.intent` (una
 * tabla del chatbot que ya no existe) y ensuciaba esa tabla sin necesidad.
 * El origen ahora es la propia columna `leads.source`.
 */
export async function registerContactFormLead(data: {
  name: string;
  email: string;
  message: string;
  service?: string;
  /** Prefijado "cop:"/"usd:" — ver ContactForm.tsx y pricing-sources.ts. */
  budget?: string;
  timeline?: string;
}) {
  try {
    const lead: Partial<Lead> = {
      type: 'other',
      name: data.name,
      email: data.email,
      service_requested: data.service || null,
      budget: data.budget || null,
      timeline: data.timeline || null,
      notes: data.message,
    };

    const { data: insertedLead, error: leadError } = await supabaseServer
      .from('leads')
      .insert({
        ...lead,
        source: ORIGEN,
        status: 'new',
      })
      .select('id')
      .single();

    if (leadError) throw leadError;

    // Notificar a Telegram — nombre, correo, servicio y origen (T-25).
    const telegramMsg = `
📩 *Nuevo mensaje desde Formulario*
Nombre: ${data.name}
Email: ${data.email}${data.service ? `\nServicio: ${data.service}` : ''}${data.budget ? `\nPresupuesto: ${data.budget}` : ''}${data.timeline ? `\nPlazo: ${data.timeline}` : ''}
Origen: ${ORIGEN}
---
Mensaje: "${data.message}"
    `.trim();

    await notifyTelegram(telegramMsg);

    // Notificar por email (si hay RESEND_API_KEY configurada)
    await sendContactNotification(data.name, data.email, data.message);

    // Disparar webhooks del admin (best-effort)
    await dispatchEvent('lead.created', {
      id: insertedLead?.id,
      name: data.name,
      email: data.email,
      service: data.service ?? null,
      budget: data.budget ?? null,
      timeline: data.timeline ?? null,
      source: ORIGEN,
      status: 'new',
    }).catch((error) => console.error('dispatchEvent lead.created error:', error));

    return { success: true };
  } catch (error) {
    console.error('Error in contact bridge:', error);
    return { success: false, error };
  }
}
