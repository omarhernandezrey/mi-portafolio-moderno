import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID faltante' }, { status: 400 });
  }

  try {
    const { error: updateError } = await supabaseServer
      .from('subscribers')
      .update({ confirmed: false, unsubscribed_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Error al procesar baja' }, { status: 500 });
    }

    // Redirigir a una página de éxito
    const successUrl = new URL('/', req.url);
    successUrl.searchParams.set('newsletter', 'unsubscribed');
    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
