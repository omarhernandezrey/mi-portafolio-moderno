import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();

  const results = {
    status: 'operational',
    timestamp: new Date().toISOString(),
    latency_ms: 0,
    services: {
      database: { status: 'loading', latency: 0 },
      llm_gateway: { status: 'loading' }
    }
  };

  try {
    // 1. Check Database (Supabase)
    const dbStart = Date.now();
    const { error } = await supabaseServer.from('conversations').select('id').limit(1);
    results.services.database.latency = Date.now() - dbStart;

    if (error) {
      console.error('Health check DB error:', error);
      results.services.database.status = 'degraded';
      results.status = 'degraded';
    } else {
      results.services.database.status = 'operational';
    }

    // 2. LLM gateway: stub (no gastamos tokens en health checks)
    results.services.llm_gateway.status = 'operational';

    results.latency_ms = Date.now() - start;

    return NextResponse.json(results);
  } catch (err) {
    // No exponer detalles internos (paths, SQL) al público
    console.error('Health check fatal:', err);
    return NextResponse.json({
      status: 'down',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
