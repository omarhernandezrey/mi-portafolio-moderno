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
        { error: `Estado inválido. Válidos: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    console.log(`Updating lead ${id} status to: ${status}`);

    const { data, error } = await supabaseServer
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Error de base de datos', details: error.message },
        { status: 500 }
      );
    }

    console.log('Status update successful:', data);

    return NextResponse.json({ success: true, status, data });
  } catch (error) {
    console.error('Lead status update error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
