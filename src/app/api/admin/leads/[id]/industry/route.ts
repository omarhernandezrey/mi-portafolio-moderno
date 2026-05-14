import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { industry } = await req.json();

    if (!industry) {
      return NextResponse.json({ error: 'Industria requerida' }, { status: 400 });
    }

    console.log(`Updating lead ${id} with industry: ${industry}`);

    const { data, error } = await supabaseServer
      .from('leads')
      .update({ industry })
      .eq('id', id)
      .select(); // Añadimos .select() para obtener los datos actualizados

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Error de base de datos', details: error.message, code: error.code },
        { status: 500 }
      );
    }

    console.log('Update successful:', data);

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
