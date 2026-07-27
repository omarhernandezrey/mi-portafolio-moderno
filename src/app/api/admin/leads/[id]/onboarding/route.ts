import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';
import { clientEnv } from '@/config/env';
import crypto from 'crypto';

/**
 * Genera (o reutiliza) el token de onboarding de un lead y devuelve el link
 * para enviar al cliente. Solo roles assistant+.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin('assistant');
  if (!auth.ok) return auth.response;

  const { id } = await params;

  try {
    const { data: lead, error } = await supabaseServer
      .from('leads')
      .select('id, name, email, onboarding_token')
      .eq('id', id)
      .single();

    if (error || !lead) {
      return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 });
    }

    let token = lead.onboarding_token as string | null;
    if (!token) {
      token = crypto.randomBytes(24).toString('hex');
      const { error: updateError } = await supabaseServer
        .from('leads')
        .update({ onboarding_token: token, onboarding_step: 1 })
        .eq('id', id);

      if (updateError) throw updateError;
    }

    const baseUrl = clientEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
    const url = `${baseUrl}/onboarding/${token}`;

    await writeAuditLog(auth.actor, {
      action: 'lead.status_update',
      resourceType: 'lead',
      resourceId: id,
      metadata: { onboarding_link_generated: true },
    });

    return NextResponse.json({ token, url });
  } catch (error) {
    console.error('Onboarding link error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
