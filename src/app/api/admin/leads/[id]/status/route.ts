import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { dispatchEvent } from '@/lib/events/dispatcher';
import { respuestaErrorBd } from '@/lib/admin/errorBd';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin('assistant');
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const { status } = await req.json();

    const validStatuses = [
      'new',
      'contacted',
      'followed_up',
      'paid',
      'cold',
      'lost',
      'archived',
    ];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Estado inválido. Válidos: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const { data: existing } = await supabaseServer
      .from('leads')
      .select('status')
      .eq('id', id)
      .maybeSingle();

    const { data, error } = await supabaseServer
      .from('leads')
      .update({ status })
      .eq('id', id)
      .select();

    // Iba más lejos que el resto: además del mensaje crudo devolvía el
    // `code` de Postgres. El helper registra todo en el servidor y responde
    // con el estado correcto (409 en un choque de unicidad, 400 en un id
    // mal formado…) sin describir el esquema.
    if (error) return respuestaErrorBd(error, 'admin/leads/[id]/status');

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

    const lead = data[0];
    const payload = {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      status,
      previous_status: existing?.status ?? null,
    };

    await dispatchEvent('lead.updated', payload).catch((error) =>
      console.error('dispatchEvent lead.updated error:', error)
    );

    if (status === 'paid') {
      await dispatchEvent('lead.paid', payload).catch((error) =>
        console.error('dispatchEvent lead.paid error:', error)
      );
    }

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
