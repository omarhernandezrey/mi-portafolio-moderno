import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { clientEnv, serverEnv } from '@/config/env';
import { supabaseServer } from '@/lib/supabaseServer';
import { generateReply } from '@/lib/chatbot/llm';
import { buildSystemPrompt } from '@/lib/chatbot/systemPrompt';
import { cleanReply, extractLead, extractHandoff, extractCalcom } from '@/lib/chatbot/parser';

export const dynamic = 'force-dynamic';

const chatSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1).max(2000),
  language: z.enum(['es', 'en', 'pt']),
  website: z.string().optional(),
  visitorMeta: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }).optional(),
});

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = chatSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const { sessionId, message, language, visitorMeta, website } = result.data;

    // Rate Limit para evaluaciones y usuarios
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const isEval = sessionId.startsWith('eval-');
    const now = Date.now();
    const limit = isEval ? 1000 : 20;
    const windowMs = 10 * 60 * 1000;

    const currentLimit = rateLimitMap.get(ip);
    if (currentLimit && now < currentLimit.resetAt) {
      if (currentLimit.count >= limit) {
        return NextResponse.json({ reply: 'Rate limit exceeded' }, { status: 429 });
      }
      currentLimit.count++;
    } else {
      rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    }

    if (website) return NextResponse.json({ reply: 'Bot detected' }, { status: 200 });

    // 1. Buscar o crear conversación
    const { data: conv } = await supabaseServer
      .from('conversations')
      .select('id, visitor_name, facts, human_takeover, variant')
      .eq('session_id', sessionId)
      .maybeSingle();

    let conversationId: string;
    let facts = {};
    let activeVariant: string;

    if (!conv) {
      const { getRandomVariant } = await import('@/lib/chatbot/openings');
      activeVariant = getRandomVariant();
      const { data: newConv } = await supabaseServer
        .from('conversations')
        .insert({ session_id: sessionId, language, visitor_name: visitorMeta?.name, variant: activeVariant })
        .select('id')
        .single();
      conversationId = newConv!.id;
    } else {
      conversationId = conv.id;
      facts = conv.facts || {};
      activeVariant = conv.variant || 'A';
      if (conv.human_takeover) {
        await supabaseServer.from('messages').insert([{ conversation_id: conversationId, role: 'user', content: message }]);
        const fallbackMsg = {
          es: "Omar está revisando tu mensaje...",
          en: "Omar is reviewing your message...",
          pt: "Omar está revisando sua mensagem..."
        };
        return NextResponse.json({ reply: fallbackMsg[language] || fallbackMsg.es });
      }
    }

    // 2. Cargar historial
    const { data: historyData } = await supabaseServer
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(10);

    const history = (historyData || []).map(m => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content }));

    // 3. Generar respuesta
    const { searchProjects } = await import('@/lib/chatbot/rag');
    const { OPENINGS } = await import('@/lib/chatbot/openings');
    
    const openingObj = OPENINGS.find(o => o.id === activeVariant) || OPENINGS[0];
    const openingText = openingObj.text[language as keyof typeof openingObj.text] || openingObj.text.es;

    const relevantProjects = await searchProjects(message);
    const ragContext = relevantProjects.length > 0 
      ? `\n# PROYECTOS REALES DE OMAR RELEVANTES PARA ESTA CONSULTA (úsales como prueba):\n${relevantProjects.map((p: { content: string }) => p.content).join('\n---\n')}`
      : "";

    const systemPrompt = buildSystemPrompt(language, { visitorName: conv?.visitor_name || visitorMeta?.name });
    const fullPrompt = `# VARIANT ASIGNADA: ${activeVariant}\n# TU SALUDO INICIAL FUE: "${openingText}"\n# LO QUE SÉ DEL VISITANTE: ${JSON.stringify(facts)}\n${ragContext}\n\n${systemPrompt}`;

    const rawReply = await generateReply(fullPrompt, history, message, sessionId);
    const cleanText = cleanReply(rawReply);

    // 4. Guardar mensajes
    await supabaseServer.from('messages').insert([
      { conversation_id: conversationId, role: 'user', content: message },
      { conversation_id: conversationId, role: 'assistant', content: rawReply }
    ]);

    // 5. Procesar eventos (Lead, Calcom, Handoff)
    const lead = extractLead(rawReply);
    if (lead) {
      console.time(`[lead] insert+notify ${conversationId}`);
      const { data: insertedLead, error: leadErr } = await supabaseServer
        .from('leads')
        .insert({ conversation_id: conversationId, ...lead })
        .select('id')
        .single();

      if (leadErr) {
        console.error('Error inserting lead:', leadErr);
      } else if (insertedLead?.id) {
        const { notifyLead } = await import('@/lib/chatbot/telegram');
        await notifyLead({
          lead,
          conversationId,
          leadId: insertedLead.id,
          siteUrl: clientEnv.NEXT_PUBLIC_SITE_URL,
          botUsername: serverEnv.TELEGRAM_BOT_USERNAME,
        });

        // 5b. Push a Notion (opcional, no bloqueante)
        const { pushLeadToNotion } = await import('@/lib/chatbot/notion');
        pushLeadToNotion(lead, insertedLead.id, clientEnv.NEXT_PUBLIC_SITE_URL).catch(console.error);
      }
      console.timeEnd(`[lead] insert+notify ${conversationId}`);
    }

    const handoff = extractHandoff(rawReply);
    let handoffUrl;
    if (handoff) {
      handoffUrl = `https://wa.me/${clientEnv.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(handoff.summary)}`;
    }

    const calcom = extractCalcom(rawReply);
    let calcomUrl;
    if (calcom) {
      calcomUrl = calcom.type === 'interview' ? clientEnv.NEXT_PUBLIC_CALCOM_INTERVIEW_URL : clientEnv.NEXT_PUBLIC_CALCOM_CONSULT_URL;
    }

    return NextResponse.json({ 
      reply: cleanText, 
      handoffUrl, 
      calcomUrl,
      visitorMeta: lead ? { name: lead.name, email: lead.email } : undefined
    });

  } catch (error) {
    console.error('API Chat Error:', error);
    return NextResponse.json({ reply: "Error procesando tu mensaje." }, { status: 500 });
  }
}
