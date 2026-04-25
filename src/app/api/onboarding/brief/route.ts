import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { z } from 'zod';

const briefSchema = z.object({
  token: z.string().min(1),
  brief: z.object({
    objectives: z.string().min(10),
    targetAudience: z.string().min(10),
    references: z.string().optional(),
    functionalities: z.string().min(10),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = briefSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Datos de brief inválidos' }, { status: 400 });
    }

    const { token, brief } = result.data;

    const { data: lead, error: fetchError } = await supabaseServer
      .from('leads')
      .select('id')
      .eq('onboarding_token', token)
      .single();

    if (fetchError || !lead) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 404 });
    }

    const { error: updateError } = await supabaseServer
      .from('leads')
      .update({ 
        brief_data: brief,
        onboarding_step: 2 
      })
      .eq('id', lead.id);

    if (updateError) {
      return NextResponse.json({ error: 'Error al actualizar el lead' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding brief error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
