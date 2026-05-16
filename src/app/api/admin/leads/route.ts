import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  company: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  service_requested: z.string().optional(),
  notes: z.string().optional(),
  type: z.enum(['client', 'recruiter', 'other']).default('client'),
  status: z.enum(['new', 'contacted', 'paid', 'lost', 'cold', 'archived']).default('new'),
  industry: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
    }

    const { data: lead, error } = await supabaseServer
      .from('leads')
      .insert(result.data)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(lead, { status: 201 });
  } catch (err) {
    console.error('Error creating lead:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
