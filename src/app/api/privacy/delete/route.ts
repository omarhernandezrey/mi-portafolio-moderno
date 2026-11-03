import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { notifyTelegram } from '@/lib/chatbot/telegram';
import { requireAdmin } from '@/lib/admin/auth';
import { z } from 'zod';

const deleteSchema = z.object({
  email: z.string().email(),
  reason: z.string().optional(),
});

/**
 * Derecho al olvido (GDPR).
 * PROTEGIDA: solo el admin (owner/assistant) ejecuta el borrado, tras verificar
 * la identidad del solicitante por email. Nunca expuesta al público: un endpoint
 * de borrado sin verificación de identidad es un vector de destrucción de datos.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin('assistant');
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const result = deleteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const { email, reason } = result.data;

    // 1. Conversaciones asociadas: por visitor_email O por email dentro de facts
    const { data: convsByVisitor, error: convsVisitorError } = await supabaseServer
      .from('conversations')
      .select('id')
      .eq('visitor_email', email);
    if (convsVisitorError) throw convsVisitorError;

    const { data: convsByFacts, error: convsFactsError } = await supabaseServer
      .from('conversations')
      .select('id')
      .filter('facts->>email', 'eq', email);
    if (convsFactsError) throw convsFactsError;

    const convIds = Array.from(new Set([
      ...(convsByVisitor || []).map(c => c.id),
      ...(convsByFacts || []).map(c => c.id),
    ]));

    // 2. Leads: por conversation_id O directamente por email (localizar antes de borrar,
    // para poder limpiar también sus tickets de soporte).
    const { data: leadsByConv, error: leadsConvError } = convIds.length > 0
      ? await supabaseServer.from('leads').select('id').in('conversation_id', convIds)
      : { data: [] as { id: string }[], error: null };
    if (leadsConvError) throw leadsConvError;

    const { data: leadsByEmail, error: leadsEmailError } = await supabaseServer
      .from('leads')
      .select('id')
      .eq('email', email);
    if (leadsEmailError) throw leadsEmailError;

    const leadIds = Array.from(new Set([
      ...(leadsByConv || []).map(l => l.id),
      ...(leadsByEmail || []).map(l => l.id),
    ]));

    // 2b. Tickets de soporte del lead — GDPR exige borrarlos también (no solo
    // desvincularlos): título y mensajes pueden contener datos personales.
    // ticket_messages tiene ON DELETE CASCADE sobre tickets, un solo delete basta.
    let deletedTickets = 0;
    if (leadIds.length > 0) {
      const { data: delTickets, error: ticketsError } = await supabaseServer
        .from('tickets')
        .delete()
        .in('lead_id', leadIds)
        .select('id');
      if (ticketsError) throw ticketsError;
      deletedTickets = delTickets?.length || 0;
    }

    const deletedLeads = leadIds.length;
    if (leadIds.length > 0) {
      const { error: delLeadsError } = await supabaseServer
        .from('leads')
        .delete()
        .in('id', leadIds);
      if (delLeadsError) throw delLeadsError;
    }

    // 3. Mensajes y conversaciones
    if (convIds.length > 0) {
      const { error: messagesError } = await supabaseServer
        .from('messages')
        .delete()
        .in('conversation_id', convIds);
      if (messagesError) throw messagesError;

      const { error: delError } = await supabaseServer
        .from('conversations')
        .delete()
        .in('id', convIds);
      if (delError) throw delError;
    }

    // 4. Suscriptores (newsletter + lead magnets) — GDPR exige borrar TODOS los datos
    const { error: subscribersError } = await supabaseServer
      .from('subscribers')
      .delete()
      .eq('email', email);
    if (subscribersError) throw subscribersError;

    if (convIds.length === 0 && deletedLeads === 0) {
      // Respuesta genérica: no revelamos si el email existe en la DB
      return NextResponse.json({
        success: true,
        message: 'Solicitud procesada. No se encontraron datos adicionales asociados.',
      });
    }

    await notifyTelegram(
      `🗑️ *Derecho al olvido ejecutado*\nEmail: ${email}\nMotivo: ${reason || 'No especificado'}\nEjecutado por: ${auth.email}\nAcción: ${convIds.length} conversaciones, ${deletedLeads} leads, ${deletedTickets} tickets y suscripciones eliminadas.`
    );

    return NextResponse.json({
      success: true,
      message: `Se han eliminado todos los datos asociados a ${email} correctamente.`,
    });

  } catch (error) {
    console.error('Privacy Delete Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
