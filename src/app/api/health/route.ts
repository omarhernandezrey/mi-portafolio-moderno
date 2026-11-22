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

    // 2. LLM gateway: NO se comprueba — a propósito, para no gastar tokens en
    //    cada health check (este endpoint lo pingea un cron cada hora).
    //
    //    Antes este stub devolvía 'operational', y `/status` lo publicaba como
    //    un servicio verde: decía que el gateway estaba sano aunque Groq y
    //    DeepSeek estuvieran caídos, porque nadie lo medía. Ahora dice
    //    'unknown', que es la verdad.
    //
    //    El campo se mantiene en la respuesta (no se borra) porque cambiar la
    //    forma de un endpoint público podría romper un monitor externo que no
    //    se ve desde el repositorio. El `status` general NO depende de él: lo
    //    decide solo la comprobación de la base, y así sigue — meter 'unknown'
    //    en el estado general dispararía la alerta de Telegram cada hora.
    //
    //    Para que vuelva a `/status` hace falta medirlo de verdad: una llamada
    //    barata al proveedor (sin consumir tokens) o leer su propio endpoint
    //    de estado.
    results.services.llm_gateway.status = 'unknown';

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
