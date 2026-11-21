import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/admin/auth';
import { respuestaErrorBd } from '@/lib/admin/errorBd';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const provider = searchParams.get('provider');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '100');

  let query = supabaseServer
    .from('api_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (provider) query = query.eq('provider', provider);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;

  if (error) return respuestaErrorBd(error, 'admin/logs');
  return NextResponse.json(data || []);
}
