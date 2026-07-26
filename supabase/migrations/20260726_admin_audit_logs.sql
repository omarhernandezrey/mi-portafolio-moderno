-- Fase 2: audit log de acciones del panel admin

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text not null,
  actor_role text not null,
  action text not null,
  resource_type text not null,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_logs_created_at_idx
  on public.admin_audit_logs (created_at desc);

create index if not exists admin_audit_logs_action_idx
  on public.admin_audit_logs (action);

create index if not exists admin_audit_logs_actor_email_idx
  on public.admin_audit_logs (actor_email);

alter table public.admin_audit_logs enable row level security;

drop policy if exists "Owners can read audit logs" on public.admin_audit_logs;
create policy "Owners can read audit logs"
  on public.admin_audit_logs
  for select
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.id = auth.uid()
      and user_roles.role = 'owner'
    )
  );

-- Inserts solo vía service_role (bypass RLS); no policy de insert para authenticated.
