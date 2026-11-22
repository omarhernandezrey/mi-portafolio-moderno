import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireCronAuth } from '@/lib/cronAuth';
import { comprobarSalud } from '@/lib/health/check';
import { respuestaErrorBd } from '@/lib/admin/errorBd';

export const dynamic = 'force-dynamic';

/**
 * Escribe UNA fila de `uptime_checks` por ejecución. El workflow
 * `uptime-record.yml` lo dispara cada hora; con eso, 90 días son ~2160 filas.
 *
 * Usa `comprobarSalud()`, el mismo código que sirve `/api/health`, en vez de
 * pedirse su propia URL por HTTP: una llamada a sí mismo añade un salto de red
 * que puede fallar por motivos ajenos a la salud real y ensuciaría el
 * registro con caídas que no lo son.
 *
 * Lo que esto NO detecta, dicho para que nadie lo lea mal: si el despliegue
 * entero está caído, esta ruta no corre y no se escribe fila. Eso deja un
 * HUECO, y el hueco es la señal — `agregarUptimePorDia` lo representa como
 * «sin datos», nunca como 100%. De la alerta inmediata en ese caso se encarga
 * `check-health.yml`, que pingea desde fuera y avisa por Telegram.
 */
export async function GET(req: NextRequest) {
  const authError = requireCronAuth(req);
  if (authError) return authError;

  const salud = await comprobarSalud();

  const { error } = await supabaseServer.from('uptime_checks').insert({
    checked_at: salud.timestamp,
    status: salud.status,
    latency_ms: salud.latency_ms,
    database_status: salud.services.database.status,
    database_latency_ms: salud.services.database.latency,
  });

  // Si la base está caída, el insert falla igual que falló la comprobación.
  // Se responde con error para que el workflow lo marque en rojo en vez de
  // dar por registrado algo que no se guardó.
  if (error) {
    console.error(`[uptime-record] insert: ${error.message}`);
    return respuestaErrorBd(error, 'cron/uptime-record');
  }

  return NextResponse.json({ success: true, registrado: salud });
}
