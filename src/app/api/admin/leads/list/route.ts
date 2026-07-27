import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/admin/auth';

export async function GET() {
  const auth = await requireAdmin('viewer');
  if (!auth.ok) return auth.response;

  try {
    const { data, error } = await supabaseServer
      .from('leads')
      .select('id, name, company')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Leads list API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
