import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { status } = await req.json();

    const validStatuses = ['new', 'contacted', 'paid', 'lost', 'archived'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Estado invalido. Validos: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const { error } = await supabaseServer
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('Lead status update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
