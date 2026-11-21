import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/admin/auth';

/**
 * Horas por proyecto. Traía TODAS las `time_entries` cerradas de la
 * historia, sin ventana ni tope, para sumarlas en JS — y después metía
 * todos los `project_id` en un `.in()`, que PostgREST serializa en el query
 * string (con unos cientos de UUID se pasa el límite de longitud de URL).
 *
 * Ahora: ventana temporal con tope, lista acotada, y las horas de proyectos
 * ya borrados se informan en vez de desaparecer — antes el `.map` sobre
 * `leads` las descartaba en silencio y el total no cuadraba con lo
 * registrado.
 *
 * Si algún día esta tabla crece de verdad, lo siguiente es agregar en SQL
 * (`sum(duration_seconds) group by project_id`) en vez de en JS, igual que
 * se hizo con el reorden.
 */
const DIAS_POR_DEFECTO = 90;
const DIAS_MAXIMO = 730;
const LIMITE_ENTRADAS = 5000;

export async function GET(req: NextRequest) {
  const auth = await requireAdmin('owner');
  if (!auth.ok) return auth.response;

  try {
    const diasPedidos = Number(req.nextUrl.searchParams.get('dias'));
    const dias = Number.isFinite(diasPedidos) && diasPedidos > 0
      ? Math.min(Math.floor(diasPedidos), DIAS_MAXIMO)
      : DIAS_POR_DEFECTO;

    const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();

    const { data: rawReport, error } = await supabaseServer
      .from('time_entries')
      .select('project_id, duration_seconds')
      .not('stopped_at', 'is', null)
      .gte('stopped_at', desde)
      .order('stopped_at', { ascending: false })
      .limit(LIMITE_ENTRADAS);

    if (error) throw error;

    const entradas = rawReport ?? [];
    const grouped: Record<string, number> = {};
    for (const row of entradas) {
      if (!row.project_id) continue;
      grouped[row.project_id] = (grouped[row.project_id] || 0) + (row.duration_seconds || 0);
    }

    const projectIds = Object.keys(grouped);
    if (projectIds.length === 0) {
      return NextResponse.json([], {
        headers: { 'X-Dias': String(dias), 'X-Entradas': String(entradas.length) },
      });
    }

    const { data: leads, error: leadsError } = await supabaseServer
      .from('leads')
      .select('id, name, company, budget')
      .in('id', projectIds);

    if (leadsError) throw leadsError;

    const encontrados = leads ?? [];
    const report = encontrados.map(lead => ({
      ...lead,
      total_seconds: grouped[lead.id] || 0,
    }));

    // Horas registradas contra un lead que ya no existe: se suman aparte en
    // vez de evaporarse, para que el total del informe cuadre con lo que de
    // verdad se cronometró.
    const idsEncontrados = new Set(encontrados.map(l => l.id));
    const huerfanas = projectIds
      .filter(id => !idsEncontrados.has(id))
      .reduce((suma, id) => suma + grouped[id], 0);

    if (huerfanas > 0) {
      report.push({
        id: 'sin-proyecto',
        name: 'Proyectos eliminados',
        company: null,
        budget: null,
        total_seconds: huerfanas,
      } as (typeof report)[number]);
    }

    const truncado = entradas.length === LIMITE_ENTRADAS;
    if (truncado) {
      console.warn(
        `[timer/report] se alcanzó el tope de ${LIMITE_ENTRADAS} entradas en ${dias} días: ` +
          'el informe puede quedarse corto, toca agregar en SQL.'
      );
    }

    return NextResponse.json(report, {
      headers: {
        'X-Dias': String(dias),
        'X-Entradas': String(entradas.length),
        'X-Truncated': String(truncado),
      },
    });
  } catch (error) {
    console.error('Report API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
