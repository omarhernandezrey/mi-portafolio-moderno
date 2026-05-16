import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { z } from 'zod';
import crypto from 'crypto';

const schema = z.object({
  url: z.string().url('URL inválida'),
  events: z.array(z.string()).min(1, 'Selecciona al menos un evento'),
  secret: z.string().optional(),
});

export async function GET() {
  const { data, error } = await supabaseServer
    .from('webhooks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const { url, events, secret } = result.data;
  const finalSecret = secret || crypto.randomBytes(32).toString('hex');

  const { data, error } = await supabaseServer
    .from('webhooks')
    .insert({ url, events, secret: finalSecret, active: true })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
