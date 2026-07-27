import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

/** Identidad + rol del admin autenticado. Usado por componentes cliente para UI condicional. */
export async function GET() {
  const auth = await requireAdmin('viewer');
  if (!auth.ok) return auth.response;

  return NextResponse.json({ role: auth.role, email: auth.email });
}
