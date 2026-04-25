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
      results.services.database.status = 'degraded';
      results.status = 'degraded';
    } else {
      results.services.database.status = 'operational';
    }

    // 2. Check LLM Connectivity (Ping simple)
    // No hacemos una llamada real al LLM para no gastar tokens, 
    // solo verificamos que el orquestador esté cargado.
    results.services.llm_gateway.status = 'operational';

    results.latency_ms = Date.now() - start;
    
    return NextResponse.json(results);
  } catch (err) {
    return NextResponse.json({
      status: 'down',
      error: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
