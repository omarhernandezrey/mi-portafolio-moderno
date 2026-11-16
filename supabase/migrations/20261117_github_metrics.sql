-- ════════════════════════════════════════════════════════════════════════════
-- Métricas reales de GitHub (T-13)
-- Fecha: 2026-11-17
--
-- Una fila por repositorio y fecha de captura: histórico acumulable, nunca se
-- sobrescribe el pasado. La ingesta la hace el cron de
-- src/app/api/cron/github-metrics/route.ts con supabaseServer; el panel
-- (T-14) solo lee de aquí, nunca en vivo de la API de GitHub.
--
-- `languages` guarda porcentajes ya calculados (bytes → %, suman 100), no los
-- bytes crudos: así T-14 no repite ese cálculo. `daily_activity` guarda los
-- últimos ~365 días (lo que da /stats/commit_activity) como
-- [{"fecha": "YYYY-MM-DD", "commits": N}, …], ya convertidos a días de Bogotá.

create table if not exists public.github_metrics (
  id uuid primary key default gen_random_uuid(),
  -- "owner/repo", igual que `full_name` de la API.
  repo text not null,
  captured_at date not null,
  commits integer not null default 0,
  additions integer not null default 0,
  deletions integer not null default 0,
  languages jsonb not null default '{}',
  stars integer not null default 0,
  forks integer not null default 0,
  open_prs integer not null default 0,
  closed_prs integer not null default 0,
  daily_activity jsonb not null default '[]',
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  created_at timestamptz not null default now(),
  constraint github_metrics_repo_fecha_unico unique (repo, captured_at)
);

create index if not exists github_metrics_repo_fecha_idx
  on public.github_metrics (repo, captured_at desc);

alter table public.github_metrics enable row level security;

drop policy if exists "Lectura publica de metricas de GitHub" on public.github_metrics;
create policy "Lectura publica de metricas de GitHub"
  on public.github_metrics
  for select
  to anon, authenticated
  using (true);

-- Solo `service_role` escribe (desde supabaseServer, en el cron). Igual que
-- las tablas de T-04: la ausencia de política de escritura es deliberada.
revoke insert, update, delete, truncate on public.github_metrics from anon, authenticated;
