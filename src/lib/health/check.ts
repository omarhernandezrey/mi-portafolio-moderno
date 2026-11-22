/**
 * La comprobación de salud, en UN solo sitio.
 *
 * Antes vivía dentro de `/api/health`. Se extrae porque ahora tiene dos
 * consumidores —ese endpoint y `/api/cron/uptime-record`, que escribe el
 * histórico— y si cada uno comprobara a su manera, la página pública y el
 * registro podrían contar cosas distintas sobre el mismo momento.
 *
 * Qué se mide y qué NO:
 *
 *  - La base de datos SÍ: una consulta real (`conversations`, limit 1). Si
 *    falla, el estado general baja a `degraded`.
 *  - El gateway de LLM NO. Nunca se midió: el código tenía un stub que
 *    devolvía 'operational' sin llamar a nadie, y `/status` lo publicaba como
 *    un servicio verde aunque Groq y DeepSeek estuvieran caídos. Ahora
 *    devuelve 'unknown', que es la verdad. Para medirlo de verdad hace falta
 *    una llamada barata al proveedor (sin gastar tokens) o leer su propio
 *    endpoint de estado; mientras no exista, 'unknown'.
 *
 * `status` nunca se degrada por un servicio 'unknown': lo desconocido no es
 * una caída, y además el workflow `check-health.yml` alerta por Telegram en
 * cuanto `status` deja de ser 'operational' — meter 'unknown' ahí dispararía
 * la alarma cada hora para siempre.
 */
import { supabaseServer } from '@/lib/supabaseServer';

export type EstadoServicio = 'operational' | 'degraded' | 'down';
/** Lo que un servicio sin instrumentar reporta. Nunca degrada el total. */
export type EstadoConocido = EstadoServicio | 'unknown';

export interface ResultadoDeSalud {
  status: EstadoServicio;
  timestamp: string;
  latency_ms: number;
  services: {
    database: { status: EstadoServicio; latency: number };
    llm_gateway: { status: EstadoConocido };
  };
}

export async function comprobarSalud(): Promise<ResultadoDeSalud> {
  const inicio = Date.now();

  const inicioBd = Date.now();
  const { error } = await supabaseServer
    .from('conversations')
    .select('id')
    .limit(1);
  const latenciaBd = Date.now() - inicioBd;

  if (error) {
    console.error('Health check DB error:', error.message);
  }

  const estadoBd: EstadoServicio = error ? 'degraded' : 'operational';

  return {
    status: estadoBd,
    timestamp: new Date().toISOString(),
    latency_ms: Date.now() - inicio,
    services: {
      database: { status: estadoBd, latency: latenciaBd },
      llm_gateway: { status: 'unknown' },
    },
  };
}
