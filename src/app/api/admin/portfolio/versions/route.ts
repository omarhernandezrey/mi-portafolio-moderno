import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { supabaseServer } from '@/lib/supabaseServer';

/**
 * Historial de un recurso (T-18). Solo `owner`: a diferencia de
 * `admin_audit_logs` (que cualquier rol admin puede leer), una versión
 * puede llevar el texto completo de un borrador sin publicar.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  const resourceType = req.nextUrl.searchParams.get('resourceType');
  const resourceId = req.nextUrl.searchParams.get('resourceId');
  if (!resourceType || !resourceId) {
    return NextResponse.json({ error: 'Faltan resourceType y resourceId' }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from('content_versions')
    .select('*')
    .eq('resource_type', resourceType)
    .eq('resource_id', resourceId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
