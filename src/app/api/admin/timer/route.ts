import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/admin/auth';
import { writeAuditLog } from '@/lib/admin/audit';

/**
 * Era de las tres únicas rutas con cuerpo y sin zod: `action`, `entryId`,
 * `projectId` y `description` se desestructuraban en crudo. `projectId`
 * entraba directo al insert (FK a `leads`), `description` sin tope de
 * longitud y `entryId` sin forma de UUID — un id mal formado daba 500 por
 * `22P02` en vez de 400.
 */
const esquemaInicio = z.object({
  action: z.literal('start'),
  projectId: z.string().uuid('projectId debe ser un UUID'),
  description: z.string().trim().max(500).optional(),
});

const esquemaParada = z.object({
  action: z.literal('stop'),
  entryId: z.string().uuid('entryId debe ser un UUID'),
});

const esquemaTimer = z.discriminatedUnion('action', [esquemaInicio, esquemaParada]);

export async function POST(req: NextRequest) {
  const auth = await requireAdmin('assistant');
  if (!auth.ok) return auth.response;

  try {
    const cuerpo = await req.json().catch(() => null);
    const parseado = esquemaTimer.safeParse(cuerpo);
    if (!parseado.success) {
      return NextResponse.json(
        { error: parseado.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const datos = parseado.data;

    if (datos.action === 'start') {
      const { projectId, description } = datos;
      const { data, error } = await supabaseServer
        .from('time_entries')
        .insert({
          project_id: projectId,
          description,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      await writeAuditLog(auth.actor, {
        action: 'timer.start',
        resourceType: 'time_entry',
        resourceId: data.id,
        metadata: { projectId, description },
      });

      return NextResponse.json(data);
    }

    if (datos.action === 'stop') {
      const { entryId } = datos;

      const { data: entry, error: fetchError } = await supabaseServer
        .from('time_entries')
        .select('started_at, stopped_at, duration_seconds')
        .eq('id', entryId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!entry) {
        return NextResponse.json({ error: 'Cronómetro no encontrado' }, { status: 404 });
      }

      // Parar algo ya parado recalculaba la duración desde `started_at`
      // hasta AHORA y la sobrescribía: un cronómetro de 2 h parado ayer y
      // re-parado hoy pasaba a marcar 26 h. Las horas facturables del
      // informe salen de esta columna.
      if (entry.stopped_at) {
        return NextResponse.json(
          {
            error: 'Este cronómetro ya estaba parado',
            stoppedAt: entry.stopped_at,
            durationSeconds: entry.duration_seconds,
          },
          { status: 409 },
        );
      }

      const stoppedAt = new Date();
      const startedAt = new Date(entry.started_at);
      const durationSeconds = Math.floor((stoppedAt.getTime() - startedAt.getTime()) / 1000);

      const { data, error } = await supabaseServer
        .from('time_entries')
        .update({
          stopped_at: stoppedAt.toISOString(),
          duration_seconds: durationSeconds
        })
        .eq('id', entryId)
        // Seguro contra dos paradas simultáneas: si otra petición llegó
        // primero, esta no encuentra fila que actualizar.
        .is('stopped_at', null)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return NextResponse.json({ error: 'Este cronómetro ya estaba parado' }, { status: 409 });
      }

      await writeAuditLog(auth.actor, {
        action: 'timer.stop',
        resourceType: 'time_entry',
        resourceId: entryId,
        metadata: { durationSeconds },
      });

      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Timer API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  const auth = await requireAdmin('assistant');
  if (!auth.ok) return auth.response;

  try {
    // `error` se descartaba: el cliente de Supabase no lanza, devuelve
    // `{data: null, error}`, así que el catch de abajo nunca saltaba y un
    // fallo de BD se presentaba en el panel como «no hay cronómetros
    // corriendo». El operador abría otro para un trabajo ya en curso.
    const { data, error } = await supabaseServer
      .from('time_entries')
      .select('*, leads(name, company)')
      .is('stopped_at', null)
      .order('started_at', { ascending: false })
      // Los cronómetros activos son pocos por naturaleza, pero una entrada
      // que nunca se paró se queda aquí para siempre: sin tope, un bug de
      // hace meses se arrastra en cada carga del panel.
      .limit(200);

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('[timer] no se pudieron leer los cronómetros activos:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
