import { supabaseServer } from '../supabaseServer';
import { notifyTelegram } from './telegram';
import { Lead } from './parser';

/**
 * Registra un lead proveniente del formulario de contacto tradicional.
 */
export async function registerContactFormLead(data: {
  name: string;
  email: string;
  message: string;
  source?: string;
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
      notes: data.message
    };

    const { error: leadError } = await supabaseServer
      .from('leads')
      .insert({
        conversation_id: conv.id,
        ...lead,
        status: 'new'
      });

    if (leadError) throw leadError;

    // 3. Notificar a Telegram
    const telegramMsg = `
📩 *Nuevo mensaje desde Formulario*
Nombre: ${data.name}
Email: ${data.email}
---
Mensaje: "${data.message}"
    `.trim();

    await notifyTelegram(telegramMsg);

    return { success: true };
  } catch (error) {
    console.error('Error in contact bridge:', error);
    return { success: false, error };
  }
}
