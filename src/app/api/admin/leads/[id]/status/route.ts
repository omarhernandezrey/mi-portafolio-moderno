import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin('assistant');
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const { status } = await req.json();

    const validStatuses = ['new', 'contacted', 'paid', 'cold', 'lost', 'archived'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Estado inválido. Válidos: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('leads')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Error de base de datos', details: error.message, code: error.code },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Lead no encontrado', id },
        { status: 404 }
      );
    }

    await writeAuditLog(auth.actor, {
      action: 'lead.status_update',
      resourceType: 'lead',
      resourceId: id,
      metadata: { status },
    });

    return NextResponse.json({ success: true, status, data });
  } catch (error) {
    console.error('Lead status update error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
