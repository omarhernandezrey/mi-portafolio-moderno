import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { requireCronAuth } from '@/lib/cronAuth';
import { serverEnv } from '@/config/env';
import { hoyEnBogota, obtenerEventosDelUsuario, huboPushHoy } from '@/lib/github';
import { combinarActividadDiaria, calcularRachaDePortafolio, type FilaMetricasRepo } from '@/lib/metrics/github-summary';
import { debeAvisarRachaEnRiesgo, mensajeRachaEnRiesgo, UMBRAL_RACHA_EN_RIESGO } from '@/lib/notifications/events';
import { reclamarAviso } from '@/lib/notifications/dedupe';
import { notifyTelegram } from '@/lib/chatbot/telegram';

export const dynamic = 'force-dynamic';

/** `PRODUCT.md`: igual que el cron de ingesta (T-13). */
const GITHUB_USERNAME = 'omarhernandezrey';

/**
 * Aviso de "racha en riesgo" (T-17). Corre tarde en el día de Bogotá (ver
 * `.github/workflows/streak-check.yml`), después de que el cron de ingesta
 * de T-13 ya capturó la racha "tal como quedó anoche" en `github_metrics`.
 *
 * Solo pregunta a GitHub en vivo (`/users/{usuario}/events`, 1 petición) si
 * hay una racha que de verdad valga la pena proteger — si no, ni siquiera
 * gasta esa llamada.
 */
export async function GET(req: NextRequest) {
  const authError = requireCronAuth(req);
  if (authError) return authError;

  const token = serverEnv.GITHUB_TOKEN;
  if (!token) {
    console.error('[streak-check] GITHUB_TOKEN no configurado — cron deshabilitado');
    return NextResponse.json({ error: 'GITHUB_TOKEN no configurado' }, { status: 503 });
  }

  const hoy = hoyEnBogota();

  const { data, error } = await supabaseServer
    .from('github_metrics')
    .select('repo, daily_activity, languages_bytes, captured_at')
    .order('captured_at', { ascending: false });
  if (error) {
    console.error(`[streak-check] github_metrics: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const vistos = new Set<string>();
  const filas: FilaMetricasRepo[] = [];
  for (const fila of data ?? []) {
    if (vistos.has(fila.repo)) continue;
    vistos.add(fila.repo);
    filas.push({ repo: fila.repo, daily_activity: fila.daily_activity ?? [], languages_bytes: fila.languages_bytes ?? {} });
  }

  const combinada = combinarActividadDiaria(filas);
  const racha = calcularRachaDePortafolio(combinada, hoy).actual;

  if (racha < UMBRAL_RACHA_EN_RIESGO) {
    return NextResponse.json({ skipped: true, reason: 'racha-insuficiente', racha });
  }

  const eventos = await obtenerEventosDelUsuario(GITHUB_USERNAME, token);
  const huboCommitHoy = huboPushHoy(eventos, hoy);

  if (!debeAvisarRachaEnRiesgo({ racha, huboCommitHoy })) {
    return NextResponse.json({ skipped: true, reason: 'ya-hubo-commit-hoy', racha });
  }

  const puedeAvisar = await reclamarAviso('streak_warning', hoy);
  if (!puedeAvisar) {
    return NextResponse.json({ skipped: true, reason: 'ya-avisado-hoy', racha });
  }

  const resultado = await notifyTelegram(mensajeRachaEnRiesgo(racha));
  return NextResponse.json({ success: true, racha, telegram: resultado });
}
