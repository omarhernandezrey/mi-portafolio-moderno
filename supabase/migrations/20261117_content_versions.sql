-- ════════════════════════════════════════════════════════════════════════════
-- Borradores, vista previa e historial (T-18)
-- Fecha: 2026-11-17
--
-- Una fila por cada alta/edición/borrado/restauración de un recurso de
-- contenido (`src/lib/admin/versions.ts` es el único punto que escribe
-- aquí). `before`/`after` son la foto completa de la fila (o `null`: un
-- alta no tiene `before`, un borrado no tiene `after`), así que restaurar es
-- aplicar de nuevo ese jsonb — no hace falta reconstruir nada.
--
-- Igual que `admin_audit_logs`: solo `service_role` escribe. A diferencia de
-- `admin_audit_logs`, que CUALQUIER rol admin puede leer, el historial de
-- contenido (que puede llevar el texto completo de un borrador sin publicar)
-- solo lo lee `owner` — de ahí la política de `select` explícita en vez de
-- dejarlo sin ninguna.

create table if not exists public.content_versions (
  id uuid primary key default gen_random_uuid(),
  -- Mismo valor que `resource_type` en `admin_audit_logs` (p. ej.
  -- "portfolio_project"): una sola taxonomía entre las dos tablas.
  resource_type text not null,
  resource_id text not null,
  action text not null check (action in ('create', 'update', 'delete', 'restore')),
  before jsonb,
  after jsonb,
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text not null,
  created_at timestamptz not null default now()
);

create index if not exists content_versions_resource_idx
  on public.content_versions (resource_type, resource_id, created_at desc);

alter table public.content_versions enable row level security;

drop policy if exists "Owners pueden leer el historial de contenido" on public.content_versions;
create policy "Owners pueden leer el historial de contenido"
  on public.content_versions
  for select
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.id = auth.uid()
      and user_roles.role = 'owner'
    )
  );

-- Inserts solo vía service_role (bypass RLS); sin policy de insert para
-- authenticated, igual que admin_audit_logs.
revoke insert, update, delete, truncate on public.content_versions from anon, authenticated;
