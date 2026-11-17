-- ════════════════════════════════════════════════════════════════════════════
-- Notificaciones con sentido (T-17)
-- Fecha: 2026-11-17
--
-- Protección contra duplicados para los eventos que pueden volver a
-- evaluarse sin que haya novedad real (racha en riesgo, caída sostenida de
-- un Core Web Vital): antes de avisar, el cron intenta insertar una fila
-- (event, dedupe_key); si ya existe (23505, violación del unique), significa
-- "esto ya se avisó" y no se vuelve a mandar el mensaje. `src/lib/notifications/dedupe.ts`
-- es el único lugar que lee y escribe esta tabla.
--
-- El evento "proyecto publicado" no necesita esta tabla: su propia
-- protección contra duplicados es comprobar el `is_published` ANTERIOR en la
-- base antes de escribir el nuevo (ver la ruta PATCH de proyectos) — dos
-- PATCH seguidos con `is_published: true` solo notifican la primera vez.

create table if not exists public.notification_log (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  dedupe_key text not null,
  created_at timestamptz not null default now(),
  constraint notification_log_event_key_unico unique (event, dedupe_key)
);

create index if not exists notification_log_created_at_idx
  on public.notification_log (created_at desc);

alter table public.notification_log enable row level security;

-- Solo `service_role` lee y escribe (desde los cron con supabaseServer).
revoke all on public.notification_log from anon, authenticated;
