import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { clientEnv, serverEnv } from '@/config/env';

export const maxDuration = 30;
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
const NAME_RE = /(?:soy|me llamo|mi nombre es|i['']?m|i am|my name is|llámame|pueden llamarme|me pueden llamar|me llaman|habla[s]?\s+con)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){0,3})/i;

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

// Patrones reusables para detección de servicio y precio
const PRICE_RE = /\$\s*\d[\d.,]*(?:\s*[-–—]\s*\$?\s*\d[\d.,]*)?(?:\s*USD)?/i;
const SERVICE_PATTERNS: ReadonlyArray<readonly [RegExp, string]> = [
  [/E-?commerce/i,         'E-commerce'],
  [/Landing\s+page/i,      'Landing page'],
  [/\bLanding\b/i,         'Landing'],
  [/Web\s+corporativa/i,   'Web corporativa'],
  [/App\s*\/\s*MVP/i,      'App/MVP'],
  [/\bMVP\b/i,             'MVP'],
];

function findServiceMentions(text: string): string[] {
  const found = new Set<string>();
  for (const [re, name] of SERVICE_PATTERNS) {
    if (re.test(text)) {
      // Evitar contar variantes del mismo servicio (MVP cuando App/MVP ya entró, etc)
      if (name === 'MVP' && found.has('App/MVP')) continue;
      if (name === 'Landing' && found.has('Landing page')) continue;
      found.add(name);
    }
  }
  return Array.from(found);
}

// Extrae servicio y precio con múltiples estrategias en cascada
function extractServiceAndPrice(messages: Array<{ role: string; content: string }>): { service: string; price: string } {
  const reversed = [...messages].reverse();

  // Estrategia 1: Mensaje del bot que menciona EXACTAMENTE 1 servicio + precio (cotización específica)
  for (const msg of reversed) {
    if (msg.role !== 'assistant') continue;
    const services = findServiceMentions(msg.content);
    if (services.length === 1) {
      const priceMatch = msg.content.match(PRICE_RE);
      if (priceMatch) return { service: services[0], price: priceMatch[0].trim() };
    }
  }

  // Estrategia 2: Mensaje del usuario que menciona 1 servicio + precio (cliente eligió)
  for (const msg of reversed) {
    if (msg.role !== 'user') continue;
    const services = findServiceMentions(msg.content);
    if (services.length === 1) {
      const priceMatch = msg.content.match(PRICE_RE);
      if (priceMatch) return { service: services[0], price: priceMatch[0].trim() };
    }
  }

  // Estrategia 3: Encontrar servicio elegido por el cliente y buscar su precio en mensajes del bot
  let chosenService = '';
  for (const msg of reversed) {
    if (msg.role !== 'user') continue;
    const services = findServiceMentions(msg.content);
    if (services.length >= 1) { chosenService = services[0]; break; }
  }
  if (chosenService) {
    const svcRe = SERVICE_PATTERNS.find(([, n]) => n === chosenService)![0];
    for (const msg of reversed) {
      if (msg.role !== 'assistant') continue;
      if (svcRe.test(msg.content)) {
        const priceMatch = msg.content.match(PRICE_RE);
        if (priceMatch) return { service: chosenService, price: priceMatch[0].trim() };
      }
    }
    return { service: chosenService, price: '' };
  }

  return { service: '', price: '' };
}

function buildClosingMessage(name: string, contact: string, service: string, price: string, need: string, lang: string): string {
  const serviceTag = service ? (price ? `${service} (${price})` : service) : null;

  if (lang === 'en') {
    const prefix = name ? `All set, ${name}! ` : 'All set! ';
    const proj = serviceTag || (need ? `your project: ${need.substring(0, 60)}` : 'your project');
    return `${prefix}Your info is saved. Omar Hernández will reach out to you at ${contact} right away to kick off ${proj}. If you'd like to message him directly, tap the WhatsApp button below!`;
  }
  if (lang === 'pt') {
    const prefix = name ? `Tudo certo, ${name}! ` : 'Tudo certo! ';
    const proj = serviceTag || (need ? `seu projeto: ${need.substring(0, 60)}` : 'seu projeto');
    return `${prefix}Seus dados foram salvos. Omar Hernández vai entrar em contato pelo ${contact} agora mesmo para iniciar ${proj}. Se quiser falar com ele diretamente, use o botão do WhatsApp abaixo!`;
  }
  const prefix = name ? `¡Perfecto, ${name}! ` : '¡Perfecto! ';
  const proj = serviceTag || (need ? `proyecto: ${need.substring(0, 60)}` : 'proyecto');
  return `${prefix}Tus datos quedaron guardados. Omar Hernández te contactará inmediatamente al ${contact} para coordinar tu ${proj}. Si quieres escribirle ya, usa el botón de WhatsApp aquí abajo.`;
}

function buildContactRequest(name: string, hasEmail: boolean, hasPhone: boolean, lang: string): string {
  const greeting = name ? `${name}, ` : '';
  const hasName = !!name;
  if (lang === 'en') {
    if (!hasEmail && !hasPhone) {
      return hasName
        ? `${greeting}to get started with Omar — what's your email and WhatsApp?`
        : `to have Omar contact you — what's your full name, email and WhatsApp?`;
    }
    if (!hasEmail) return `${greeting}what's your email so Omar can send you the proposal?`;
    return `${greeting}and your WhatsApp so Omar can reach out?`;
  }
  if (lang === 'pt') {
    if (!hasEmail && !hasPhone) {
      return hasName
        ? `${greeting}para iniciar com Omar — qual é seu email e WhatsApp?`
        : `para Omar entrar em contato — qual é seu nome completo, email e WhatsApp?`;
    }
    if (!hasEmail) return `${greeting}qual é seu email para Omar enviar os detalhes?`;
    return `${greeting}e seu WhatsApp para Omar entrar em contato?`;
  }
  if (!hasEmail && !hasPhone) {
    return hasName
      ? `${greeting}para coordinar con Omar — ¿cuál es tu correo y tu WhatsApp?`
      : `para que Omar te contacte — ¿cuál es tu nombre completo, correo y WhatsApp?`;
  }
  if (!hasEmail) return `${greeting}¿cuál es tu correo para que Omar te envíe los detalles?`;
  return `${greeting}¿y tu WhatsApp para que Omar te escriba de inmediato?`;
}

// ─── Detección de intención de compra ───────────────────────────────────────

// Solo dispara cuando el cliente CONFIRMA interés — no en el primer mensaje de necesidad
const INTENT_RE = /\b(sí|si\b|me interesa|me sirve|de acuerdo|arrancamos|empezamos|contratar|perfecto|listo|ok\b|okay|dale|adelante|procedemos|me conviene|me animo|quiero (empezar|arrancar|contratar|esa|ese)|cu[aá]ndo empezamos|me quedo con esa|esa opci[oó]n|esa misma|quiero la landing|quiero el e-?commerce|quiero el sitio|quiero el mvp|la primera|la segunda)\b/i;
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

    // Detectar email y teléfono en el mensaje ACTUAL (antes de todo el resto)
    const EMAIL_IN_CURRENT = EMAIL_RE.test(message);
    const PHONE_IN_CURRENT = PHONE_RE.test(message);

    // Prioridad: facts guardados > visitor_name de DB > datos extraídos del historial + mensaje actual
    const userTexts = [...history.filter(m => m.role === 'user').map(m => m.content), message];
    const extracted = extractContactData(userTexts);

    // Extraer directamente del mensaje actual como fallback adicional
    const emailInMsg  = (message.match(EMAIL_RE) || [])[0] || '';
    const phoneInMsg  = (message.match(PHONE_RE) || [])[0] || '';

    const knownName  = savedFacts.name  || conv?.visitor_name || visitorMeta?.name  || extracted.name  || '';
    const knownEmail = savedFacts.email || visitorMeta?.email || extracted.email || emailInMsg || '';
    const knownPhone = savedFacts.phone || visitorMeta?.phone || extracted.phone || phoneInMsg || '';
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

    // ── 4. CIERRE AUTOMÁTICO ──────────────────────────────────────────────────
    const hasContact = !!(knownEmail || knownPhone);

    // Detecta si el bot acaba de pedir datos de contacto (últimos 8 mensajes)
    const recentHistory = history.slice(-8);
    const botRecentlyAskedContact = recentHistory.some(m =>
      m.role === 'assistant' && (
        m.content.toLowerCase().includes('correo') ||
        m.content.toLowerCase().includes('whatsapp') ||
        m.content.toLowerCase().includes('coordinar') ||
        m.content.toLowerCase().includes('nombre completo') ||
        m.content.toLowerCase().includes('full name') ||
        m.content.toLowerCase().includes('email') ||
        (m.content.toLowerCase().includes('phone') && m.content.includes('?'))
      )
    );

    // Extracción de nombre con múltiples estrategias
    let contextName = '';

    const alreadyRequestedName = savedFacts.name_requested === 'true';

    // Estrategia 1: bot pidió "nombre completo" / "tu nombre" y el mensaje es solo un nombre
    const botAskedForName = recentHistory.some(m =>
      m.role === 'assistant' && (
        m.content.toLowerCase().includes('nombre completo') ||
        m.content.toLowerCase().includes('full name') ||
        m.content.toLowerCase().includes('cómo te llamas') ||
        m.content.toLowerCase().includes('como te llamas') ||
        m.content.toLowerCase().includes('tu nombre para que omar') ||
        m.content.toLowerCase().includes('your full name so omar')
      )
    );
    if (!knownName && botAskedForName) {
      // Acepta nombre de una o más palabras (cambio: {1,3} → {0,3})
      const plainMatch = message.trim().match(/^([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){0,3})$/i);
      if (plainMatch) contextName = plainMatch[1].trim();
    }

    // Estrategia 2: mensaje tiene formato "Nombre email teléfono" o "Nombre teléfono"
    if (!knownName && !contextName && (EMAIL_IN_CURRENT || PHONE_IN_CURRENT)) {
      const nameBeforeContact = message.match(
        /^([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,4})\s+(?:[\w.+\-]+@|(?:\+?57\s*)?3[0-9])/i
      );
      if (nameBeforeContact) contextName = nameBeforeContact[1].trim();
    }

    const effectiveName = knownName || contextName;

    // Extraer necesidad del cliente del historial si no está en facts
    const needFromHistory = knownNeed || history
      .filter(m => m.role === 'user')
      .find(m => /quiero|necesito|busco|página|web|app|tienda|landing|sitio|peluquer|restauran|clínica|clinic|shop|store|negocio/i.test(m.content))
      ?.content?.substring(0, 120) || '';

    // Si hay contacto pero no nombre y aún no lo hemos pedido por separado → pedir nombre antes de cerrar
    if (hasContact && botRecentlyAskedContact && !effectiveName && !alreadyRequestedName && !isEval) {
      const nameAsk = language === 'en'
        ? `And what's your full name so Omar can reach you personally?`
        : language === 'pt'
        ? `E qual é o seu nome completo para Omar entrar em contato com você?`
        : `¿Y cuál es tu nombre completo para que Omar pueda contactarte?`;

      await supabaseServer.from('messages').insert([
        { conversation_id: conversationId, role: 'user',      content: message },
        { conversation_id: conversationId, role: 'assistant', content: nameAsk },
      ]);

      supabaseServer.from('conversations').update({
        facts: { ...savedFacts, name_requested: 'true', email: knownEmail, phone: knownPhone },
      }).eq('id', conversationId).then(({ error }) => error && console.error('name_requested persist error:', error));

      return NextResponse.json({ reply: nameAsk });
    }

    // CIERRE: dispara cuando hay datos de contacto Y alguna de estas condiciones:
    // 1. El mensaje actual tiene email+teléfono juntos (señal 100% inequívoca)
    // 2. Tenemos contacto + bot pidió datos + ya tenemos nombre
    // 3. Tenemos contacto + nombre (capturado en cualquier momento)
    // 4. Tenemos contacto + ya pedimos el nombre por separado (aunque el cliente no lo dé)
    const canClose = !!(
      (EMAIL_IN_CURRENT && PHONE_IN_CURRENT) ||
      (hasContact && botRecentlyAskedContact && effectiveName) ||
      (hasContact && effectiveName) ||
      (hasContact && alreadyRequestedName)
    );

    if (canClose && !isEval) {
      const contact = knownEmail || knownPhone;
      // Derivar SIEMPRE del historial completo (más confiable que savedFacts cuyo update podría no haber commiteado)
      const fullHistory = [...history, { role: 'user', content: message }];
      const { service: histSvc, price: histPrice } = extractServiceAndPrice(fullHistory);
      const quotedService = histSvc || savedFacts.service || '';
      const quotedPrice   = histPrice || savedFacts.price || '';
      const closingMsg = buildClosingMessage(effectiveName, contact, quotedService, quotedPrice, needFromHistory, language);

      await supabaseServer.from('messages').insert([
        { conversation_id: conversationId, role: 'user',      content: message },
        { conversation_id: conversationId, role: 'assistant', content: closingMsg },
      ]);

      // Crear lead y notificar
      const lead = {
        type: 'client' as const,
        name: effectiveName || '(sin nombre)',
        email: knownEmail || '',
        phone: knownPhone || null,
        notes: needFromHistory || message.substring(0, 120),
        company: null,
        service_requested: quotedService || null,
        budget: quotedPrice || null,
        timeline: null,
      };

      supabaseServer.from('conversations').update({
        visitor_name: effectiveName || undefined,
        facts: { ...savedFacts, name: effectiveName, email: knownEmail, phone: knownPhone, need: needFromHistory, service: quotedService, price: quotedPrice },
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

      const whatsappSummary = encodeURIComponent(
        `Hola Omar, chatbot de tu portafolio. Nuevo lead: ${effectiveName || 'Sin nombre'} | ${knownEmail || ''} | ${knownPhone || ''} | ${quotedService ? `${quotedService} ${quotedPrice}` : needFromHistory || 'proyecto'}`
      );
      const handoffUrl = clientEnv.NEXT_PUBLIC_WHATSAPP_NUMBER
        ? `https://wa.me/${clientEnv.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${whatsappSummary}`
        : undefined;

      return NextResponse.json({
        reply: closingMsg,
        handoffUrl,
        visitorMeta: { name: effectiveName, email: knownEmail },
      });
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
      visitorName: effectiveName,
      visitorEmail: knownEmail,
      visitorPhone: knownPhone,
      visitorNeed: needFromHistory,
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

    // SOLICITUD DE CONTACTO: cuando el cliente confirma interés, el servidor genera
    // la respuesta completa (nombre correcto garantizado — el LLM puede equivocarse)
    if (!canClose && INTENT_RE.test(message) && !HANDOFF_RE.test(message)) {
      const contactAsk = buildContactRequest(effectiveName, !!knownEmail, !!knownPhone, language);
      rawReply = contactAsk; // Reemplaza completamente — no depender del LLM para el nombre
    }

    const cleanText = cleanReply(rawReply);

    // ── 7. Guardar mensajes ───────────────────────────────────────────────────
    await supabaseServer.from('messages').insert([
      { conversation_id: conversationId, role: 'user',      content: message },
      { conversation_id: conversationId, role: 'assistant', content: rawReply },
    ]);

    // Persistir servicio/precio en facts (await para garantizar que esté antes del próximo request)
    if (!savedFacts.service) {
      const { service: detectedSvc, price: detectedPrice } = extractServiceAndPrice([
        ...history,
        { role: 'assistant', content: rawReply },
      ]);
      if (detectedSvc) {
        await supabaseServer.from('conversations').update({
          facts: { ...savedFacts, service: detectedSvc, price: detectedPrice, need: needFromHistory || savedFacts.need },
        }).eq('id', conversationId);
      }
    }

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
