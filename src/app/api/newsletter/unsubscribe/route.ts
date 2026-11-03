import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { verifyUnsubscribeSignature } from '@/lib/newsletter/unsubscribe';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const signature = searchParams.get('sig');

  if (!id || !signature) {
    return NextResponse.json({ error: 'Enlace de baja inválido' }, { status: 400 });
  }

  if (!verifyUnsubscribeSignature(id, signature)) {
    return NextResponse.json({ error: 'Enlace de baja inválido' }, { status: 403 });
  }

  try {
    const { data, error: updateError } = await supabaseServer
      .from('subscribers')
      .update({ confirmed: false, unsubscribed_at: new Date().toISOString() })
      .eq('id', id)
      .select('id')
      .maybeSingle();

    if (updateError) {
      return NextResponse.json({ error: 'Error al procesar baja' }, { status: 500 });
    }

    // Respuesta genérica: no revelamos si el id existía.
    if (!data) {
      const successUrl = new URL('/', req.url);
      successUrl.searchParams.set('newsletter', 'unsubscribed');
      return NextResponse.redirect(successUrl);
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
