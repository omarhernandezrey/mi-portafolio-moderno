import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

// Defensa extra: nunca exponer bloques de marcadores internos al widget
function stripInternalMarkers(content: string): string {
  return content.replace(/<<<(LEAD|HANDOFF|CALCOM)>>>[\s\S]*?(<<<END>>>|$)/g, '').trim();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const since = searchParams.get('since'); // ISO timestamp

    if (!sessionId || !since) {
      return NextResponse.json({ error: 'Missing required parameters (sessionId, since)' }, { status: 400 });
    }

    // Validar formato de fecha: un timestamp inválido rompe el filtro PostgREST
    const sinceDate = new Date(since);
    if (isNaN(sinceDate.getTime())) {
      return NextResponse.json({ error: 'Invalid since parameter' }, { status: 400 });
    }

    // 1. Encontrar la conversación
    const { data: conv, error: convErr } = await supabaseServer
      .from('conversations')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (convErr || !conv) {
      return NextResponse.json({ messages: [] });
    }

    // 2. Buscar mensajes del asistente posteriores al timestamp 'since'
    const { data: msgs, error: msgsErr } = await supabaseServer
      .from('messages')
      .select('role, content, created_at')
      .eq('conversation_id', conv.id)
      .eq('role', 'assistant')
      .gt('created_at', sinceDate.toISOString())
      .order('created_at', { ascending: true });

    if (msgsErr) {
      console.error('Error fetching messages during poll:', msgsErr);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({
      messages: (msgs || []).map(m => ({ ...m, content: stripInternalMarkers(m.content) }))
    });

  } catch (error) {
    console.error('Polling API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
