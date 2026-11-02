import { supabaseServer } from '../supabaseServer';
import { notifyTelegram } from './telegram';
import { sendContactNotification } from './email';
import { Lead } from '@/lib/leads/types';
import { dispatchEvent } from '@/lib/events/dispatcher';

/**
 * Registra un lead proveniente del formulario de contacto tradicional.
 */
export async function registerContactFormLead(data: {
  name: string;
  email: string;
  message: string;
  source?: string;
  service?: string;
  /** Prefijado "cop:"/"usd:" — ver ContactForm.tsx y pricing-sources.ts. */
  budget?: string;
  timeline?: string;
}) {
  try {
    // 1. Crear una conversación ficticia para el registro
    const { data: conv, error: convError } = await supabaseServer
      .from('conversations')
      .insert({
        session_id: `form-${Date.now()}`,
        visitor_name: data.name,
        visitor_email: data.email,
        intent: 'contact_form',
        summary: `Mensaje desde formulario: ${data.message.substring(0, 100)}...`
      })
      .select()
      .single();

    if (convError) throw convError;

    // 2. Insertar en la tabla de leads
    const lead: Partial<Lead> = {
      type: 'other',
      name: data.name,
      email: data.email,
      service_requested: data.service || null,
      budget: data.budget || null,
      timeline: data.timeline || null,
      notes: data.message
    };

    const { data: insertedLead, error: leadError } = await supabaseServer
      .from('leads')
      .insert({
        conversation_id: conv.id,
        ...lead,
        status: 'new'
      })
      .select('id')
      .single();

    if (leadError) throw leadError;

    // 3. Notificar a Telegram
    const telegramMsg = `
📩 *Nuevo mensaje desde Formulario*
Nombre: ${data.name}
Email: ${data.email}${data.service ? `\nServicio: ${data.service}` : ''}${data.budget ? `\nPresupuesto: ${data.budget}` : ''}${data.timeline ? `\nPlazo: ${data.timeline}` : ''}
---
Mensaje: "${data.message}"
    `.trim();

    await notifyTelegram(telegramMsg);

    // 4. Notificar por email (si hay RESEND_API_KEY configurada)
    await sendContactNotification(data.name, data.email, data.message);

    // 5. Disparar webhooks del admin (best-effort)
    await dispatchEvent('lead.created', {
      id: insertedLead?.id,
      name: data.name,
      email: data.email,
      service: data.service ?? null,
      budget: data.budget ?? null,
      timeline: data.timeline ?? null,
      source: data.source ?? 'contact_form',
      status: 'new',
    }).catch((error) => console.error('dispatchEvent lead.created error:', error));

    return { success: true };
  } catch (error) {
    console.error('Error in contact bridge:', error);
    return { success: false, error };
  }
}
