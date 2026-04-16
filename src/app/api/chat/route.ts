import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';
import { generateReply } from '@/lib/chatbot/gemini';
import { buildSystemPrompt } from '@/lib/chatbot/systemPrompt';
import { cleanReply, extractLead, extractHandoff, extractCalcom } from '@/lib/chatbot/parser';

const chatSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1).max(2000),
  language: z.enum(['es', 'en']),
  visitorMeta: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = chatSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request data', details: result.error.format() }, { status: 400 });
    }

    const { sessionId, message, language, visitorMeta } = result.data;

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

    // 3. Generar respuesta con Gemini
    const systemPrompt = buildSystemPrompt(language, { 
      visitorName: conversation.visitor_name || visitorMeta?.name 
    });
    const rawReply = await generateReply(systemPrompt, history, message);

    // 4. Guardar mensaje del usuario y respuesta del asistente
    await supabaseServer.from('messages').insert([
      { conversation_id: conversationId, role: 'user', content: message },
      { conversation_id: conversationId, role: 'assistant', content: rawReply }
    ]);

    // 5. Procesar bloques estructurados
    const lead = extractLead(rawReply);
    const handoff = extractHandoff(rawReply);
    const calcom = extractCalcom(rawReply);
    const cleanText = cleanReply(rawReply);

    // Si hay un lead, lo insertamos
    if (lead) {
      await supabaseServer.from('leads').insert({
        conversation_id: conversationId,
        ...lead
      });
    }

    // Generar URLs si aplica
    let handoffUrl;
    if (handoff) {
      const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
      const text = encodeURIComponent(`Hola Omar, vengo del chat de tu portafolio.\nResumen: ${handoff.summary}`);
      handoffUrl = `https://wa.me/${whatsapp}?text=${text}`;
    }

    let calcomUrl;
    if (calcom) {
      calcomUrl = calcom.type === 'interview' 
        ? process.env.NEXT_PUBLIC_CALCOM_INTERVIEW_URL 
        : process.env.NEXT_PUBLIC_CALCOM_CONSULT_URL;
    }

    return NextResponse.json({
      reply: cleanText,
      handoffUrl,
      calcomUrl
    });

  } catch (error) {
    console.error('API Chat Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
