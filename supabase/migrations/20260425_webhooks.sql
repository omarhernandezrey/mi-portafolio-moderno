-- Migración para Tarea 30.7: Sistema de Webhooks

-- Crear tabla de webhooks
create table if not exists public.webhooks (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  events text[] not null default '{}',
  secret text not null,
  active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Habilitar RLS
alter table public.webhooks enable row level security;

-- Solo el service_role (servidor) puede gestionar webhooks (o el admin vía API segura)
-- Añadimos política para que el owner pueda verlos
create policy "Owners can manage webhooks"
  on public.webhooks
  for all
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.id = auth.uid()
      and user_roles.role = 'owner'
    )
  );

-- Tabla de logs de webhooks para monitorear entregas
create table if not exists public.webhook_logs (
  id uuid primary key default gen_random_uuid(),
  webhook_id uuid references public.webhooks(id) on delete cascade,
  event_type text not null,
  payload jsonb not null,
  response_status int,
  response_body text,
  error text,
  attempt int not null default 1,
  created_at timestamptz default now()
);

alter table public.webhook_logs enable row level security;

create policy "Owners can view webhook logs"
  on public.webhook_logs
  for select
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.id = auth.uid()
      and user_roles.role = 'owner'
    )
  );
