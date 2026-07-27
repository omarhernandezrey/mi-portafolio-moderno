import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

function stripInternalMarkers(content: string): string {
  return content.replace(/<<<(LEAD|HANDOFF|CALCOM)>>>[\s\S]*?(<<<END>>>|$)/g, '').trim();
}

/**
 * Devuelve los últimos mensajes de la conversación para restaurar el widget
 * tras recargar página (el poll solo trae mensajes NUEVOS).
 */
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId');
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const { data: conv } = await supabaseServer
      .from('conversations')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (!conv) {
      return NextResponse.json({ messages: [] });
    }

    const { data: msgs, error } = await supabaseServer
      .from('messages')
      .select('role, content, created_at')
      .eq('conversation_id', conv.id)
      .neq('role', 'system')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('History fetch error:', error);
      return NextResponse.json({ messages: [] });
    }

    const messages = (msgs || []).reverse().map(m => ({
      role: m.role as 'user' | 'assistant',
      content: stripInternalMarkers(m.content),
      created_at: m.created_at,
    }));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('History API Error:', error);
    return NextResponse.json({ messages: [] });
  }
}
