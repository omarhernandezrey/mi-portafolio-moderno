import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data: conversations, error } = await supabaseServer
    .from('conversations')
    .select(`
      *,
      messages:messages(count)
    `)
    .order('updated_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!conversations || conversations.length === 0) {
    return NextResponse.json([]);
  }

  const convIds = conversations.map(c => c.id);
  const { data: leads } = await supabaseServer
    .from('leads')
    .select('id, conversation_id')
    .in('conversation_id', convIds);

  const leadMap = new Map<string, string>();
  (leads || []).forEach(l => {
    if (l.conversation_id) leadMap.set(l.conversation_id, l.id);
  });

  const enriched = conversations.map(conv => ({
    ...conv,
    lead_id: leadMap.get(conv.id) || null,
  }));

  return NextResponse.json(enriched);
}
