import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/admin/auth';
import { respuestaErrorBd } from '@/lib/admin/errorBd';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const { data, error } = await supabaseServer
    .from('webhook_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) return respuestaErrorBd(error, 'admin/webhook-logs');
  return NextResponse.json(data || []);
}
