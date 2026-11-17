import { supabaseServer } from '@/lib/supabaseServer';

/**
 * Protección contra duplicados de T-17, apoyada en `notification_log`
 * (migración `20261117_notification_log.sql`): un `insert` con `(event,
 * dedupe_key)` único. Si ya existe, Postgres responde 23505 — eso significa
 * "esto ya se avisó", no un error a propagar.
 *
 * Devuelve `true` solo la primera vez que se reclama esa combinación: el
 * llamador manda el mensaje solo cuando esto da `true`.
 */
export async function reclamarAviso(event: string, dedupeKey: string): Promise<boolean> {
  const { error } = await supabaseServer.from('notification_log').insert({ event, dedupe_key: dedupeKey });
  if (!error) return true;
  if (error.code === '23505') return false;
  throw new Error(`[notifications/dedupe] ${event}:${dedupeKey}: ${error.message}`);
}

/**
 * Libera una combinación ya avisada (p. ej. un Core Web Vital que se
 * recuperó): la próxima vez que vuelva a estar mal, `reclamarAviso` podrá
 * avisar de nuevo en vez de quedarse callado para siempre.
 */
export async function liberarAviso(event: string, dedupeKey: string): Promise<void> {
  const { error } = await supabaseServer.from('notification_log').delete().eq('event', event).eq('dedupe_key', dedupeKey);
  if (error) throw new Error(`[notifications/dedupe] liberar ${event}:${dedupeKey}: ${error.message}`);
}
