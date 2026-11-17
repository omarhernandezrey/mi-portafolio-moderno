-- ════════════════════════════════════════════════════════════════════════════
-- Rendimiento real (T-15)
-- Fecha: 2026-11-17
--
-- Una fila por métrica capturada en el navegador (LCP, INP o CLS), separada
-- por dispositivo. Decisión tomada en la ficha de T-15
-- (PLAN_MAESTRO_DASHBOARD.md): nada escribe aquí directo desde el navegador.
-- Una política de `insert` para `anon` sobre una tabla pública es abusable
-- sin límite (cualquiera puede mandar miles de filas falsas); en vez de eso,
-- `src/app/api/analytics/vitals/route.ts` valida la carga útil con zod y
-- aplica límite de tasa (`src/lib/rateLimit.ts`, el mismo de T-19) antes de
-- insertar con `supabaseServer`. Igual que `github_metrics` (T-13): la
-- ausencia de política de escritura es deliberada, no un olvido.
--
-- Cero datos personales: ninguna fila guarda IP, user-agent completo ni
-- ningún identificador de visitante. `path` es solo el pathname (sin query
-- ni hash, limpiado en la propia ruta antes de insertar).

create table if not exists public.analytics_vitals (
  id uuid primary key default gen_random_uuid(),
  captured_at timestamptz not null default now(),
  path text not null,
  device text not null check (device in ('mobile', 'desktop')),
  metric text not null check (metric in ('LCP', 'INP', 'CLS')),
  value numeric not null check (value >= 0)
);

create index if not exists analytics_vitals_captured_at_idx
  on public.analytics_vitals (captured_at desc);

create index if not exists analytics_vitals_metric_device_idx
  on public.analytics_vitals (metric, device);

alter table public.analytics_vitals enable row level security;

-- Solo `service_role` lee y escribe (desde supabaseServer). Sin política de
-- select ni de insert para anon/authenticated: el panel admin que lea esto
-- lo hará con supabaseServer, igual que admin_audit_logs.
revoke all on public.analytics_vitals from anon, authenticated;
