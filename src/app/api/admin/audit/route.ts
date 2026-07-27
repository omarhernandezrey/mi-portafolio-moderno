import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

/** Escapa metacaracteres de ILIKE sin tocar `.`/`+` (válidos en emails). */
function escapeIlike(raw: string): string {
  return raw.trim().replace(/[%_\\]/g, '\\$&').slice(0, 120);
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const actorRaw = searchParams.get('actor');
  const actor = actorRaw ? escapeIlike(actorRaw) : '';
  const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10) || 100, 500);

  let query = supabaseServer
    .from('admin_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (action) query = query.eq('action', action);
  if (actor) query = query.ilike('actor_email', `%${actor}%`);

  const { data, error } = await query;

  if (error) {
    // Tabla aún no migrada en el entorno
    if (error.message?.includes('admin_audit_logs') || error.code === '42P01') {
      return NextResponse.json([]);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
