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

// ─── Extracción de contacto ──────────────────────────────────────────────────

const EMAIL_RE = /[\w.+\-]+@[\w.\-]+\.[a-z]{2,}/i;
// Teléfonos colombianos (3XX XXX XXXX) e internacionales
const PHONE_RE = /(?:\+?57[\s-]?)?3[0-2]\d[\s-]?\d{3}[\s-]?\d{4}|\+?[1-9]\d{8,14}/;
// Nombres con frases comunes en ES/EN
const NAME_RE = /(?:soy|me llamo|mi nombre es|i['']?m|i am|my name is|llámame|pueden llamarme|me pueden llamar|me llaman)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){0,3})/i;

function extractContactData(texts: string[]): { name: string; email: string; phone: string } {
  let name = '', email = '', phone = '';
  for (const text of texts) {
    if (!email) { const m = text.match(EMAIL_RE); if (m) email = m[0]; }
    if (!phone) { const m = text.match(PHONE_RE); if (m) phone = m[0]; }
    if (!name)  { const m = text.match(NAME_RE);  if (m) name = m[1].trim(); }
  }
  return { name, email, phone };
}

// ─── Mensajes de cierre ──────────────────────────────────────────────────────

function buildClosingMessage(name: string, contact: string, need: string, lang: string): string {
  const needText = need ? `para ${need}` : 'para tu proyecto';
  if (lang === 'en') {
    return `Perfect ${name} — Omar will contact you soon at ${contact} ${needText}. He'll take it from here!`;
  }
  if (lang === 'pt') {
    return `Perfeito ${name} — Omar vai entrar em contato em breve pelo ${contact} ${needText}. Ele cuida de tudo!`;
  }
  return `Perfecto ${name} — Omar te contactará pronto al ${contact} ${needText}. ¡Él se encarga de todo desde aquí!`;
}

function buildContactRequest(name: string, hasEmail: boolean, hasPhone: boolean, lang: string): string {
  const greeting = name ? `${name}, ` : '';
  if (lang === 'en') {
    if (!hasEmail && !hasPhone) return `${greeting}to have Omar reach out — what's your name, email and phone/WhatsApp?`;
    if (!hasEmail) return `${greeting}what's your email so Omar can send you the details?`;
    return `${greeting}what's your WhatsApp so Omar can follow up quickly?`;
  }
  if (!hasEmail && !hasPhone) return `${greeting}para que Omar te contacte, ¿me das tu nombre completo, correo y teléfono/WhatsApp?`;
  if (!hasEmail) return `${greeting}¿cuál es tu correo para que Omar te envíe los detalles?`;
  return `${greeting}¿tienes WhatsApp para que Omar te escriba rápido?`;
}

// ─── Detección de intención de compra ───────────────────────────────────────

// Solo dispara cuando el cliente CONFIRMA interés — no en el primer mensaje de necesidad
const INTENT_RE = /\b(sí|si\b|me interesa|me sirve|de acuerdo|arrancamos|empezamos|contratar|perfecto|listo|ok\b|okay|dale|adelante|procedemos|me conviene|me animo|quiero (empezar|arrancar|contratar)|cu[aá]ndo empezamos)\b/i;
const HANDOFF_RE = /hablar con omar|persona real|humano|quiero a omar|real person|human agent|speak with|talk to omar/i;
const RECRUITER_RE = /developer|desarrollador|stack|salario|salary|sueldo|contrat|hiring|recruit|posici[oó]n|puesto|vacante/i;
const ACCEPTED_STACK_RE = /react|next\.?js|node\.?js|typescript|python|nestjs|supabase/i;
const REJECTED_STACK_RE = /\bangular\b|\bvue\b|\bphp\b|\bdrupal\b|\bmagento\b/i;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = chatSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const { sessionId, message, language, visitorMeta, website, imageDataUrl, consentAt } = result.data;

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

    // ── 1. Buscar o crear conversación ────────────────────────────────────────
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

    // ── 2. Historial: los N mensajes MÁS RECIENTES en orden cronológico ───────
    const { data: historyData } = await supabaseServer
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(40);

    const history = [...(historyData || [])].reverse().map(m => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    // ── 3. Extraer y persistir datos de contacto ──────────────────────────────
    const savedFacts = facts as Record<string, string>;

    // Prioridad: facts guardados > visitor_name de DB > datos extraídos del historial
    const userTexts = [...history.filter(m => m.role === 'user').map(m => m.content), message];
    const extracted = extractContactData(userTexts);

    const knownName  = savedFacts.name  || conv?.visitor_name || visitorMeta?.name  || extracted.name  || '';
    const knownEmail = savedFacts.email || visitorMeta?.email || extracted.email || '';
    const knownPhone = savedFacts.phone || visitorMeta?.phone || extracted.phone || '';
    const knownNeed  = savedFacts.need  || '';

    // Persistir inmediatamente si encontramos algo nuevo
    const hasNewData = (knownName  && knownName  !== savedFacts.name)  ||
                       (knownEmail && knownEmail !== savedFacts.email) ||
                       (knownPhone && knownPhone !== savedFacts.phone);

    if (hasNewData) {
      supabaseServer.from('conversations').update({
        visitor_name: knownName || undefined,
        facts: { ...savedFacts, name: knownName, email: knownEmail, phone: knownPhone, need: knownNeed },
      }).eq('id', conversationId).then(({ error }) => error && console.error('persist facts error:', error));
    }

    // ── 4. CIERRE AUTOMÁTICO: si tenemos nombre + contacto, cerramos sin LLM ──
    const hasContact = !!(knownEmail || knownPhone);
    const canClose = !!(knownName && hasContact);

    if (canClose && !isEval) {
      const contact = knownEmail || knownPhone;
      const closingMsg = buildClosingMessage(knownName, contact, knownNeed, language);

      await supabaseServer.from('messages').insert([
        { conversation_id: conversationId, role: 'user',      content: message },
        { conversation_id: conversationId, role: 'assistant', content: closingMsg },
      ]);

      // Crear lead y notificar
      const lead = {
        type: 'client' as const,
        name: knownName,
        email: knownEmail || '',
        phone: knownPhone || null,
        notes: knownNeed || message.substring(0, 120),
        company: null,
        service_requested: null,
        budget: null,
        timeline: null,
      };

      supabaseServer.from('conversations').update({
        visitor_name: knownName,
        facts: { ...savedFacts, name: knownName, email: knownEmail, phone: knownPhone, need: knownNeed || message.substring(0, 120) },
      }).eq('id', conversationId).then(() => {});

      const { data: insertedLead } = await supabaseServer
        .from('leads')
        .insert({ conversation_id: conversationId, ...lead })
        .select('id')
        .single();

      if (insertedLead?.id) {
        const { notifyLead } = await import('@/lib/chatbot/telegram');
        notifyLead({ lead, conversationId, leadId: insertedLead.id, siteUrl: clientEnv.NEXT_PUBLIC_SITE_URL, botUsername: serverEnv.TELEGRAM_BOT_USERNAME }).catch(console.error);
        const { pushLeadToNotion } = await import('@/lib/chatbot/notion');
        pushLeadToNotion(lead, insertedLead.id, clientEnv.NEXT_PUBLIC_SITE_URL).catch(console.error);
      }

      return NextResponse.json({ reply: closingMsg });
    }

    // ── 5. Generar respuesta con el LLM ──────────────────────────────────────
    const { searchProjects } = await import('@/lib/chatbot/rag');
    const { OPENINGS } = await import('@/lib/chatbot/openings');

    const openingObj = OPENINGS.find(o => o.id === activeVariant) || OPENINGS[0];
    const openingText = openingObj.text[language as keyof typeof openingObj.text] || openingObj.text.es;

    const relevantProjects = await searchProjects(message);
    const ragContext = relevantProjects.length > 0
      ? `\n# PROYECTOS REALES DE OMAR RELEVANTES:\n${relevantProjects.map((p: { content: string }) => p.content).join('\n---\n')}`
      : "";

    const systemPrompt = buildSystemPrompt(language, {
      visitorName: knownName,
      visitorEmail: knownEmail,
      visitorPhone: knownPhone,
      visitorNeed: knownNeed,
    });
    const fullPrompt = `# VARIANT: ${activeVariant}\n# SALUDO INICIAL: "${openingText}"\n${ragContext}\n\n${systemPrompt}`;

    let rawReply = await generateReply(fullPrompt, history, message, sessionId, imageDataUrl);

    // ── 6. Enforcement server-side ────────────────────────────────────────────

    // HANDOFF: usuario quiere hablar con Omar directamente
    if (HANDOFF_RE.test(message) && !rawReply.includes('<<<HANDOFF>>>')) {
      rawReply += `\n<<<HANDOFF>>>{"summary":"${message.substring(0, 120)}","urgency":"high"}<<<END>>>`;
    }

    // CALCOM: reclutador con stack aceptado
    else if (
      RECRUITER_RE.test(message) &&
      ACCEPTED_STACK_RE.test(message + ' ' + history.map(h => h.content).join(' ')) &&
      !rawReply.includes('<<<CALCOM>>>') && !rawReply.includes('<<<LEAD>>>')
    ) {
      rawReply += `\n<<<CALCOM>>>{"type":"interview"}<<<END>>>`;
    }

    // Stack rechazado: asegurar cierre amable
    else if (REJECTED_STACK_RE.test(message) && !rawReply.toLowerCase().includes('éxito') && !rawReply.toLowerCase().includes('suerte')) {
      rawReply = rawReply.replace(/\?$/, '.') + ' ¡Éxitos en tu búsqueda!';
    }

    // INYECTAR solicitud de contacto: cliente confirma interés y ya hubo intercambio previo
    if (!canClose && INTENT_RE.test(message) && !HANDOFF_RE.test(message) && history.length > 0) {
      const replyLower = rawReply.toLowerCase();
      const llmAlreadyAsks = replyLower.includes('correo') || replyLower.includes('email') || replyLower.includes('nombre') || replyLower.includes('whatsapp') || replyLower.includes('teléfono') || replyLower.includes('telefono') || replyLower.includes('name') || replyLower.includes('phone');

      if (!llmAlreadyAsks) {
        const contactAsk = buildContactRequest(knownName, !!knownEmail, !!knownPhone, language);
        rawReply = rawReply.trimEnd() + `\n\n${contactAsk}`;
      }
    }

    const cleanText = cleanReply(rawReply);

    // ── 7. Guardar mensajes ───────────────────────────────────────────────────
    await supabaseServer.from('messages').insert([
      { conversation_id: conversationId, role: 'user',      content: message },
      { conversation_id: conversationId, role: 'assistant', content: rawReply },
    ]);

    // ── 8. Procesar bloques estructurados del LLM (LEAD, HANDOFF, CALCOM) ────
    const lead = extractLead(rawReply);
    if (lead) {
      if (lead.name || lead.email || lead.notes) {
        supabaseServer.from('conversations').update({
          visitor_name: lead.name || knownName || undefined,
          facts: { ...savedFacts, name: lead.name || knownName, email: lead.email || knownEmail, phone: lead.phone || knownPhone, need: lead.notes || knownNeed },
        }).eq('id', conversationId).then(({ error }) => error && console.error('Error updating conv facts:', error));
      }

      const { data: insertedLead, error: leadErr } = await supabaseServer
        .from('leads')
        .insert({ conversation_id: conversationId, ...lead })
        .select('id')
        .single();

      if (!leadErr && insertedLead?.id) {
        const { notifyLead } = await import('@/lib/chatbot/telegram');
        await notifyLead({ lead, conversationId, leadId: insertedLead.id, siteUrl: clientEnv.NEXT_PUBLIC_SITE_URL, botUsername: serverEnv.TELEGRAM_BOT_USERNAME });
        const { pushLeadToNotion } = await import('@/lib/chatbot/notion');
        pushLeadToNotion(lead, insertedLead.id, clientEnv.NEXT_PUBLIC_SITE_URL).catch(console.error);
      }
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
      visitorMeta: lead ? { name: lead.name, email: lead.email } : undefined,
    });

  } catch (error) {
    console.error('API Chat Error:', error);
    return NextResponse.json({ reply: "Error procesando tu mensaje." }, { status: 500 });
  }
}
