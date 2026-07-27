import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  try {
    const { data: conv } = await supabaseServer
      .from('conversations')
      .select('visitor_name, intent, updated_at, facts')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (!conv || !conv.visitor_name) {
      return NextResponse.json({ reengage: false });
    }

    // Si ya se reenganchó antes, no repetir en cada carga de página
    const facts = (conv.facts as Record<string, string> | null) || {};
    if (facts.reengaged_at) {
      return NextResponse.json({ reengage: false });
    }

    // Verificar si han pasado más de 24h (updated_at puede ser null → tratar como viejo)
    const lastSeen = conv.updated_at ? new Date(conv.updated_at).getTime() : 0;
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (!Number.isFinite(lastSeen) || now - lastSeen < twentyFourHours) {
      return NextResponse.json({ reengage: false });
    }

    // Marcar como reenganchado para no disparar de nuevo
    await supabaseServer
      .from('conversations')
      .update({ facts: { ...facts, reengaged_at: new Date().toISOString() } })
      .eq('session_id', sessionId);

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
