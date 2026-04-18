import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  try {
    // Buscar la última conversación y el interés
    const { data: conv } = await supabaseServer
      .from('conversations')
      .select('visitor_name, intent, updated_at')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (!conv || !conv.visitor_name) {
      return NextResponse.json({ reengage: false });
    }

    // Verificar si han pasado más de 24h
    const lastSeen = new Date(conv.updated_at).getTime();
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (now - lastSeen < twentyFourHours) {
      return NextResponse.json({ reengage: false });
    }

    return NextResponse.json({
      reengage: true,
      name: conv.visitor_name,
      intent: conv.intent
    });

  } catch (error) {
    console.error('Re-engage API Error:', error);
    return NextResponse.json({ reengage: false });
  }
}
