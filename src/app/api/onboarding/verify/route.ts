import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

// Solo los campos que el wizard necesita (minimización de datos)
const LEAD_FIELDS = 'id, name, email, company, service_requested, budget, timeline, industry, onboarding_step, brief_data, contract_signed_at, paid_at';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token faltante' }, { status: 400 });
  }

  try {
    const { data: lead, error } = await supabaseServer
      .from('leads')
      .select(LEAD_FIELDS)
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
