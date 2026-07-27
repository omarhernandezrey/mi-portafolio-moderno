-- Auditoría de lógica de negocio (S3): cierre de brechas de esquema
-- Hace el set de migraciones autosuficiente para rebuilds limpios.

-- ─── 1. Tabla time_entries (Timer del admin) ────────────────────────────────
create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.leads(id) on delete cascade,
  description text,
  started_at timestamptz not null default now(),
  stopped_at timestamptz,
  duration_seconds integer,
  created_at timestamptz default now()
);

create index if not exists idx_time_entries_project on public.time_entries(project_id);
create index if not exists idx_time_entries_started on public.time_entries(started_at desc);

alter table public.time_entries enable row level security;
-- Sin políticas: acceso solo vía service_role (APIs admin autenticadas)

-- ─── 2. Columnas que el chat usa pero no estaban en migraciones ─────────────
alter table public.conversations
  add column if not exists facts jsonb default '{}'::jsonb;

alter table public.conversations
  add column if not exists human_takeover boolean default false;

-- ─── 3. session_id único (el código asume 1 conversación por sesión) ────────
-- Nota: si ya existen duplicados, hay que deduplicar antes de aplicar el unique.
do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public' and indexname = 'idx_conversations_session_unique'
  ) then
    -- Reasignar leads/mensajes de conversaciones duplicadas a la más antigua
    -- de cada sesión, y luego borrar los duplicados huérfanos.
    create temp table _dup_map on commit drop as
    select c.id as dup_id,
           (array_agg(c2.id order by c2.created_at asc))[1] as keep_id
    from public.conversations c
    join public.conversations c2 on c2.session_id = c.session_id
    group by c.id
    having count(*) > 1 and c.id <> (array_agg(c2.id order by c2.created_at asc))[1];

    update public.leads l set conversation_id = m.keep_id
    from _dup_map m where l.conversation_id = m.dup_id;

    update public.messages msg set conversation_id = m.keep_id
    from _dup_map m where msg.conversation_id = m.dup_id;

    delete from public.conversations c
    using _dup_map m where c.id = m.dup_id;

    create unique index idx_conversations_session_unique
      on public.conversations(session_id);
  end if;
end $$;

-- ─── 4. Índices faltantes (queries reales del código) ───────────────────────
create index if not exists idx_leads_conversation on public.leads(conversation_id);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_created on public.leads(created_at desc);
create index if not exists idx_conversations_updated on public.conversations(updated_at desc);
create index if not exists idx_api_logs_created on public.api_logs(created_at desc);
create index if not exists idx_api_logs_provider on public.api_logs(provider);
create index if not exists idx_messages_created on public.messages(created_at);
create index if not exists idx_webhook_logs_webhook on public.webhook_logs(webhook_id);

-- ─── 5. Columna de checkpoint para newsletter por edición ───────────────────
alter table public.subscribers
  add column if not exists last_edition_slug text;

-- ─── 6. updated_at auto-update (estaba comentado en migraciones previas) ────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at
  before update on public.leads
  for each row execute procedure public.set_updated_at();

drop trigger if exists trg_conversations_updated_at on public.conversations;
create trigger trg_conversations_updated_at
  before update on public.conversations
  for each row execute procedure public.set_updated_at();

-- ─── 7. CHECK de status en leads (valores que el código usa realmente) ──────
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'leads_status_check'
  ) then
    alter table public.leads
      add constraint leads_status_check
      check (status in ('new', 'contacted', 'paid', 'cold', 'lost', 'archived', 'followed_up', 'in_progress'));
  end if;
end $$;
