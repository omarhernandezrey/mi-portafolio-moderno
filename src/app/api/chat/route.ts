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
  imageDataUrl: z.string().optional(),
  consentAt: z.string().optional(),
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

    const { sessionId, message, language, visitorMeta, website, imageDataUrl, consentAt } = result.data;

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
        .insert({ session_id: sessionId, language, visitor_name: visitorMeta?.name, variant: activeVariant, consent_at: consentAt })
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
      .limit(50);

    const history = (historyData || []).map(m => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content }));

    // Extraer email del historial si no está en conv.facts aún
    const savedFacts = (facts as Record<string, string>);
    let knownEmail = savedFacts.email || '';
    let knownName = conv?.visitor_name || visitorMeta?.name || savedFacts.name || '';
    const knownNeed = savedFacts.need || '';

    const emailRegex = /[\w.+\-]+@[\w.\-]+\.[a-z]{2,}/i;
    const nameRegex = /(?:soy|me llamo|mi nombre es|i'm|i am|my name is)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/i;

    if (!knownEmail || !knownName) {
      for (const m of [...history, { role: 'user', content: message }]) {
        if (m.role === 'user') {
          if (!knownEmail) {
            const emailMatch = m.content.match(emailRegex);
            if (emailMatch) knownEmail = emailMatch[0];
          }
          if (!knownName) {
            const nameMatch = m.content.match(nameRegex);
            if (nameMatch) knownName = nameMatch[1].trim();
          }
        }
      }
    }

    // 3. Generar respuesta
    const { searchProjects } = await import('@/lib/chatbot/rag');
    const { OPENINGS } = await import('@/lib/chatbot/openings');

    const openingObj = OPENINGS.find(o => o.id === activeVariant) || OPENINGS[0];
    const openingText = openingObj.text[language as keyof typeof openingObj.text] || openingObj.text.es;

    const relevantProjects = await searchProjects(message);
    const ragContext = relevantProjects.length > 0
      ? `\n# PROYECTOS REALES DE OMAR RELEVANTES (úsalos como prueba):\n${relevantProjects.map((p: { content: string }) => p.content).join('\n---\n')}`
      : "";

    const systemPrompt = buildSystemPrompt(language, {
      visitorName: knownName,
      visitorEmail: knownEmail,
      visitorNeed: knownNeed,
    });
    const fullPrompt = `# VARIANT ASIGNADA: ${activeVariant}\n# TU SALUDO INICIAL FUE: "${openingText}"\n${ragContext}\n\n${systemPrompt}`;

    let rawReply = await generateReply(fullPrompt, history, message, sessionId, imageDataUrl);

    // Server-side enforcement: inyectar bloques si el LLM no los emitió pero la condición aplica
    const HANDOFF_TRIGGERS = /hablar con omar|persona real|humano|quiero a omar|real person|human agent|speak with|talk to omar/i;
    const ACCEPTED_STACK = /react|next\.?js|node\.?js|typescript|python|nestjs|supabase/i;
    const REJECTED_STACK = /\bangular\b|\bvue\b|\bphp\b|\bdrupal\b|\bmagento\b/i;
    const RECRUITER_TRIGGERS = /developer|desarrollador|stack|salario|salary|sueldo|contrat|hiring|recruit|posici[oó]n|puesto|vacante/i;
    const LOW_BUDGET = /\b(50|30|20|10|100)\s*(dólares|dollars|usd|\$)/i;
    const CATALOG_PRICES = /250|300|500|600|800|1[,.]?500|3[,.]?500|5[,.]?000/;
    const MVP_TRIGGERS = /\bmvp\b|app\s+de|aplicaci[oó]n|log[ií]stica|dashboard|tracking|auth|e-?commerce|tienda\s+online/i;
    const STACK_IN_REPLY = /react|next\.?js|node\.?js|typescript/i;

    if (HANDOFF_TRIGGERS.test(message) && !rawReply.includes('<<<HANDOFF>>>')) {
      const summary = message.substring(0, 120);
      rawReply += `\n<<<HANDOFF>>>{"summary":"${summary}","urgency":"high"}<<<END>>>`;
    } else if (knownEmail && knownName && !rawReply.includes('<<<LEAD>>>')) {
      const need = knownNeed || savedFacts.need || message.substring(0, 80);
      rawReply += `\n<<<LEAD>>>{"type":"client","name":"${knownName}","email":"${knownEmail}","notes":"${need}","phone":null,"company":null,"service_requested":null,"budget":null,"timeline":null}<<<END>>>`;
    } else if (
      REJECTED_STACK.test(message) &&
      !rawReply.toLowerCase().includes('éxito') &&
      !rawReply.toLowerCase().includes('suerte')
    ) {
      // Asegurar cierre amable con deseo de éxito para stacks rechazados
      rawReply = rawReply.replace(/\?$/, '.') + ' ¡Éxitos en tu búsqueda!';
    } else if (
      RECRUITER_TRIGGERS.test(message) &&
      ACCEPTED_STACK.test(message + ' ' + history.map(h => h.content).join(' ')) &&
      !rawReply.includes('<<<CALCOM>>>') &&
      !rawReply.includes('<<<LEAD>>>')
    ) {
      rawReply += `\n<<<CALCOM>>>{"type":"interview"}<<<END>>>`;
    }

    // Si el cliente menciona presupuesto muy bajo y el bot no cita precios del catálogo → añadir contexto
    if (LOW_BUDGET.test(message) && !CATALOG_PRICES.test(rawReply)) {
      rawReply += ' Con $250 arrancas con una landing responsiva, WhatsApp integrado y SEO básico.';
    }

    // Si el mensaje es sobre un MVP/app y el bot no mencionó el stack → añadirlo
    if (MVP_TRIGGERS.test(message) && !STACK_IN_REPLY.test(rawReply)) {
      rawReply += ' Stack: React + Next.js + Node.js.';
    }

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

      // Persistir nombre + email en la conversación para que los mensajes siguientes los recuerden
      if (lead.name || lead.email || lead.notes) {
        supabaseServer.from('conversations').update({
          visitor_name: lead.name || knownName || undefined,
          facts: {
            ...savedFacts,
            name: lead.name || knownName,
            email: lead.email || knownEmail,
            need: lead.notes || knownNeed,
          },
        }).eq('id', conversationId).then(({ error }) => error && console.error('Error updating conv facts:', error));
      }

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
    } else if (knownEmail && !savedFacts.email) {
      // Email capturado del historial pero aún no persistido → guardar para próximo mensaje
      supabaseServer.from('conversations').update({
        facts: { ...savedFacts, email: knownEmail, name: knownName },
        visitor_name: knownName || undefined,
      }).eq('id', conversationId).then(({ error }) => error && console.error('Error persisting email:', error));
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
