import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireAdmin } from '@/lib/admin/auth';

/**
 * Lista ligera de leads para los desplegables de "nuevo ticket", "nueva
 * factura" y el cronómetro. No tenía `.limit()`: traía todos los leads
 * históricos en cada carga de esas tres pantallas.
 *
 * Sigue devolviendo un ARRAY a secas, a propósito: los tres consumidores
 * hacen `Array.isArray(data) ? data : []`, así que envolverlo en un objeto
 * les dejaría el desplegable vacío sin ningún error visible. El total y el
 * truncado viajan en cabeceras, y el servidor avisa por consola cuando se
 * alcanza el tope — que es la señal de que este desplegable se quedó
 * pequeño y toca cambiarlo por un buscador, no de subir el número.
 */
const LIMITE = 500;

export async function GET() {
  const auth = await requireAdmin('viewer');
  if (!auth.ok) return auth.response;

  try {
    const { data, error, count } = await supabaseServer
      .from('leads')
      .select('id, name, company', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(LIMITE);

    if (error) throw error;

    const leads = data ?? [];
    const total = count ?? leads.length;
    const truncado = total > leads.length;

    if (truncado) {
      console.warn(
        `[leads/list] ${total} leads y solo se envían ${leads.length}: ` +
          'el desplegable ya no los muestra todos, hace falta un buscador.'
      );
    }

    return NextResponse.json(leads, {
      headers: { 'X-Total-Count': String(total), 'X-Truncated': String(truncado) },
    });
  } catch (error) {
    console.error('Leads list API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
