-- ════════════════════════════════════════════════════════════════════════════
-- Registro real de disponibilidad
-- Fecha: 2026-11-22
--
-- Nace para sustituir la gráfica inventada que `/status` publicaba: 70 barras
-- con altura `Math.random()` y un tooltip afirmando «100% Stability» por cada
-- una. Esa gráfica se quitó (rama `fix/status-sin-datos-inventados`) porque no
-- había NINGUNA fuente de histórico de disponibilidad en el proyecto:
-- `analytics_vitals` guarda LCP/INP/CLS —rendimiento, no caídas— y `api_logs`
-- guarda llamadas a proveedores de LLM. Esta tabla es esa fuente.
--
-- Una fila por comprobación. La escribe `/api/cron/uptime-record`, que un
-- workflow horario dispara con el `CRON_SECRET`; la comprobación en sí es la
-- misma que sirve `/api/health` (`src/lib/health/check.ts`), así que la página
-- pública y el registro no pueden discrepar.
--
-- LAS AUSENCIAS SON INFORMACIÓN, NO CEROS. Si el despliegue está caído o el
-- workflow falla, no se escribe fila: ese día tendrá menos comprobaciones (o
-- ninguna). El agregado lo representa como «sin datos», nunca como 100%.
-- Rellenar un hueco con un valor optimista sería volver a inventar, que es
-- justo lo que esta tabla existe para evitar.
--
-- Cero datos personales: ninguna columna guarda IP, user-agent ni nada de
-- visitantes. Son métricas de la propia infraestructura.

create table if not exists public.uptime_checks (
  id uuid primary key default gen_random_uuid(),
  checked_at timestamptz not null default now(),
  -- Los mismos tres valores que puede devolver `/api/health`.
  status text not null check (status in ('operational', 'degraded', 'down')),
  -- Duración total de la comprobación.
  latency_ms integer not null check (latency_ms >= 0),
  -- El único servicio que hoy se mide de verdad. Se guarda aparte del estado
  -- general para poder distinguir «la base respondió lenta» de «la base no
  -- respondió», sin tener que deducirlo del total.
  database_status text not null check (database_status in ('operational', 'degraded', 'down')),
  database_latency_ms integer not null check (database_latency_ms >= 0)
);

-- El agregado siempre pide una ventana reciente ordenada por fecha.
create index if not exists uptime_checks_checked_at_idx
  on public.uptime_checks (checked_at desc);

alter table public.uptime_checks enable row level security;

-- Igual que `analytics_vitals` y `github_metrics`: solo `service_role` lee y
-- escribe, desde `supabaseServer`. La ausencia de políticas para
-- anon/authenticated es DELIBERADA, no un olvido — `/status` es pública pero
-- no habla con Supabase: lee de `/api/uptime/history`, que agrega en el
-- servidor. Una política de insert para `anon` sobre esto permitiría a
-- cualquiera fabricar su propio historial de disponibilidad.
revoke all on public.uptime_checks from anon, authenticated;
