import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token faltante' }, { status: 400 });
  }

  try {
    // Buscar suscriptor con ese token
    const { data: subscriber, error: fetchError } = await supabaseServer
      .from('subscribers')
      .select('id')
      .eq('confirmation_token', token)
      .single();

    if (fetchError || !subscriber) {
      return NextResponse.json({ error: 'Suscripción no encontrada o token inválido' }, { status: 404 });
    }

    // Confirmar suscripción
    const { error: updateError } = await supabaseServer
      .from('subscribers')
      .update({ confirmed: true, confirmation_token: null })
      .eq('id', subscriber.id);

    if (updateError) {
      return NextResponse.json({ error: 'Error al confirmar suscripción' }, { status: 500 });
    }

    // Redirigir a una página de éxito (usaremos la home con un param por ahora)
    const successUrl = new URL('/', req.url);
    successUrl.searchParams.set('newsletter', 'confirmed');
    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('Confirmation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
