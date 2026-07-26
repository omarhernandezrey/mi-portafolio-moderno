import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/admin/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin('assistant');
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const { industry } = await req.json();

    if (!industry) {
      return NextResponse.json({ error: 'Industria requerida' }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from('leads')
      .update({ industry })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Error de base de datos', details: error.message, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Lead industry update error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
