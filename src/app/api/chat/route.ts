import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { clientEnv } from '@/config/env';
import { supabaseServer } from '../../../lib/supabaseServer';
import { generateReply } from '../../../lib/chatbot/gemini';
import { buildSystemPrompt } from '../../../lib/chatbot/systemPrompt';
import { cleanReply, extractLead, extractHandoff, extractCalcom } from '../../../lib/chatbot/parser';

const chatSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1).max(2000),
  language: z.enum(['es', 'en']),
  website: z.string().optional(), // Honeypot field
  visitorMeta: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }).optional(),
});

// Rate limiting in-memory
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest) {
  try {
    // Rate Limit Logic
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    const limit = 20;
    const windowMs = 10 * 60 * 1000; // 10 minutes

    const currentLimit = rateLimitMap.get(ip);

    if (currentLimit && now < currentLimit.resetAt) {
      if (currentLimit.count >= limit) {
        return NextResponse.json({ 
          reply: 'Has enviado muchos mensajes en poco tiempo. Por favor, espera unos minutos o contacta a Omar directamente por WhatsApp.',
          error: 'Rate limit exceeded' 
        }, { status: 429 });
      }
      currentLimit.count++;
    } else {
      rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    }

    const body = await req.json();
    const result = chatSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request data', details: result.error.format() }, { status: 400 });
    }

    const { sessionId, message, language, visitorMeta, website } = result.data;

    // Honeypot check
    if (website) {
      return NextResponse.json({ reply: 'Bot detected' }, { status: 200 });
    }

    // Validación extra anti-spam y prompt injection
    const forbiddenPatterns = [/ignore previous instructions/i, /system:/i, /<script/i, /you are now/i];
    if (forbiddenPatterns.some(pattern => pattern.test(message))) {
      return NextResponse.json({ 
        reply: 'Lo siento, no puedo procesar ese tipo de mensajes por motivos de seguridad.',
        error: 'Security validation failed' 
      }, { status: 400 });
    }

    // 1. Buscar o crear conversación
    const { data: existingConv, error: convError } = await supabaseServer
      .from('conversations')
      .select('id, visitor_name')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (convError) {
      console.error('Error fetching conversation:', convError);
    }

    let conversation;

    if (!existingConv) {
      const { data: newConv, error: createError } = await supabaseServer
        .from('conversations')
        .insert({
          session_id: sessionId,
          language,
          visitor_name: visitorMeta?.name,
          visitor_email: visitorMeta?.email,
          visitor_phone: visitorMeta?.phone,
        })
        .select()
        .single();

      if (createError) throw createError;
      if (!newConv) throw new Error('Failed to create conversation');
      conversation = newConv;
    } else {
      conversation = existingConv;
    }

    const conversationId = conversation.id;

    // 2. Cargar últimos 20 mensajes para el historial
    const { data: historyData } = await supabaseServer
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(20);

    const history = (historyData || []).map(m => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content
    }));

    // 3. Generar respuesta con Gemini (usando Groq)
    const systemPrompt = buildSystemPrompt(language, { 
      visitorName: conversation.visitor_name || visitorMeta?.name,
      intent: (conversation as any).intent // Pasamos la intención guardada si existe
    });

    // Inyectar hechos previos si existen
    const facts = (conversation as any).facts || {};
    const contextWithFacts = `
# LO QUE YA SÉ DEL VISITANTE:
${JSON.stringify(facts, null, 2)}
---
${systemPrompt}`;

    let rawReply = await generateReply(contextWithFacts, history, message);

    let handoffUrl;

    // Manejo de cuota agotada
    if (rawReply === '<<<QUOTA_EXCEEDED>>>') {
      const whatsapp = clientEnv.NEXT_PUBLIC_WHATSAPP_NUMBER;
      const text = encodeURIComponent(`Hola Omar, el chatbot parece estar muy ocupado.\nMi mensaje era: ${message}`);
      handoffUrl = `https://wa.me/${whatsapp}?text=${text}`;
      
      rawReply = language === 'es' 
        ? "Lo siento, mi 'cerebro' de IA ha alcanzado su límite de consultas gratuitas por hoy. Pero no te preocupes, puedes escribirme directamente a mi WhatsApp y te responderé enseguida."
        : "I'm sorry, my AI 'brain' has reached its free limit for today. But don't worry, you can message me directly on WhatsApp and I'll get back to you right away.";

      const { notifyTelegram } = await import('@/lib/chatbot/telegram');
      await notifyTelegram(`⚠️ *Cuota Gemini/Groq agotada*: El visitante ${sessionId} ha sido derivado a WhatsApp.`);
    }

    // 4. Guardar mensaje del usuario y respuesta del asistente
    await supabaseServer.from('messages').insert([
      { conversation_id: conversationId, role: 'user', content: message },
      { conversation_id: conversationId, role: 'assistant', content: rawReply }
    ]);

    // 5. Extraer nuevos hechos y actualizar memoria (Post-procesamiento)
    if (rawReply !== '<<<QUOTA_EXCEEDED>>>' && rawReply.length > 20) {
      // Llamada asíncrona rápida para extraer hechos sin bloquear el response
      (async () => {
        try {
          const extractionPrompt = `Extrae hechos clave de este mensaje del usuario: "${message}". Responde SOLO un objeto JSON con campos como: name, email, company, budget, timeline, service, stack. Si no hay nada nuevo, responde {}.`;
          const factsReply = await generateReply(extractionPrompt, [], "Extrae los hechos.");
          const newFacts = JSON.parse(factsReply.match(/\{[\s\S]*\}/)?.[0] || '{}');
          
          if (Object.keys(newFacts).length > 0) {
            const updatedFacts = { ...facts, ...newFacts };
            await supabaseServer
              .from('conversations')
              .update({ 
                facts: updatedFacts,
                visitor_name: updatedFacts.name || conversation.visitor_name,
                visitor_email: updatedFacts.email || (conversation as any).visitor_email,
                intent: updatedFacts.service || (conversation as any).intent
              })
              .eq('id', conversationId);
          }
        } catch (e) {
          console.error('Fact extraction failed:', e);
        }
      })();
    }

    // 6. Procesar bloques estructurados
    const lead = extractLead(rawReply);
    const handoff = extractHandoff(rawReply);
    const calcom = extractCalcom(rawReply);
    const cleanText = cleanReply(rawReply);

    // Si hay un lead, lo insertamos y notificamos
    if (lead) {
      await supabaseServer.from('leads').insert({
        conversation_id: conversationId,
        ...lead
      });

      const { notifyTelegram } = await import('@/lib/chatbot/telegram');
      const telegramMsg = `
🎯 *Nuevo lead detectado*
Tipo: ${lead.type}
Nombre: ${lead.name}
Email: ${lead.email}
Tel: ${lead.phone || 'N/A'}
Empresa: ${lead.company || 'N/A'}
Servicio: ${lead.service_requested || 'N/A'}
Presupuesto: ${lead.budget || 'N/A'}
Plazo: ${lead.timeline || 'N/A'}
Notas: ${lead.notes}
---
Última msg: "${message}"
      `.trim();
      await notifyTelegram(telegramMsg);
    }

    // Generar URLs si aplica y notificar handoff
    if (handoff) {
      const whatsapp = clientEnv.NEXT_PUBLIC_WHATSAPP_NUMBER;
      const text = encodeURIComponent(`Hola Omar, vengo del chat de tu portafolio.\nResumen: ${handoff.summary}`);
      handoffUrl = `https://wa.me/${whatsapp}?text=${text}`;

      const { notifyTelegram } = await import('@/lib/chatbot/telegram');
      const telegramMsg = `
🔔 *Handoff a WhatsApp solicitado*
Sesión: ${sessionId}
Resumen: ${handoff.summary}
Urgencia: ${handoff.urgency}
---
El visitante recibió el link directo a tu WhatsApp.
      `.trim();
      await notifyTelegram(telegramMsg);
    }

    let calcomUrl;
    if (calcom) {
      calcomUrl = calcom.type === 'interview' 
        ? clientEnv.NEXT_PUBLIC_CALCOM_INTERVIEW_URL 
        : clientEnv.NEXT_PUBLIC_CALCOM_CONSULT_URL;
    }

    return NextResponse.json({
      reply: cleanText,
      handoffUrl,
      calcomUrl
    });

  } catch (error: unknown) {
    console.error('API Chat Error Detailed:', error);
    const err = error as Error;
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: err.message,
      stack: err.stack 
    }, { status: 500 });
  }
}
