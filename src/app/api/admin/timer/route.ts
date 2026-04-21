import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) {
  try {
    const { action, entryId, projectId, description } = await req.json();

    if (action === 'start') {
      const { data, error } = await supabaseServer
        .from('time_entries')
        .insert({
          project_id: projectId,
          description,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }

    if (action === 'stop') {
      if (!entryId) return NextResponse.json({ error: 'Entry ID required' }, { status: 400 });

      // 1. Obtener la entrada para calcular duración
      const { data: entry, error: fetchError } = await supabaseServer
        .from('time_entries')
        .select('started_at')
        .eq('id', entryId)
        .single();

      if (fetchError || !entry) throw fetchError || new Error('Entry not found');

      const stoppedAt = new Date();
      const startedAt = new Date(entry.started_at);
      const durationSeconds = Math.floor((stoppedAt.getTime() - startedAt.getTime()) / 1000);

      const { data, error } = await supabaseServer
        .from('time_entries')
        .update({
          stopped_at: stoppedAt.toISOString(),
          duration_seconds: durationSeconds
        })
        .eq('id', entryId)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Timer API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data } = await supabaseServer
      .from('time_entries')
      .select('*, leads(name, company)')
      .is('stopped_at', null)
      .order('started_at', { ascending: false });

    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
