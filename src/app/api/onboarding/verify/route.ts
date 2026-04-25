import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token faltante' }, { status: 400 });
  }

  try {
    const { data: lead, error } = await supabaseServer
      .from('leads')
      .select('*')
      .eq('onboarding_token', token)
      .single();

    if (error || !lead) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 404 });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('Onboarding verify error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
