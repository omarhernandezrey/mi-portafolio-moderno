-- T-19 ítem 6: deuda de seguridad medida en §1.6 del plan maestro, sobre las
-- 16 tablas del CRM/chatbot que arrastraban los permisos por defecto de
-- Supabase (anon/authenticated con INSERT/UPDATE/DELETE/TRUNCATE) aunque
-- ninguna tenga una política de escritura — solo `service_role` escribe,
-- desde `supabaseServer`. Todo lo que no sea REVOKE/ALTER es, por su propia
-- naturaleza en PostgreSQL, idempotente (revocar algo ya revocado no es un
-- error). Comprobado antes de escribir este archivo: `grep` de
-- `supabase/server` y `supabase/client` en `src/` — los únicos usos son
-- `auth.getUser()`, `auth.signOut()`, `auth.mfa.*` y un SELECT a
-- `user_roles`; ninguna de estas 16 tablas se escribe con la clave anónima.

-- 1) Revocar escritura a anon/authenticated en las 16 tablas antiguas.
revoke insert, update, delete, truncate on table
  public.admin_audit_logs,
  public.api_logs,
  public.conversations,
  public.feed_comments,
  public.feed_likes,
  public.feed_posts,
  public.invoices,
  public.leads,
  public.messages,
  public.subscribers,
  public.ticket_messages,
  public.tickets,
  public.time_entries,
  public.user_roles,
  public.webhook_logs,
  public.webhooks
from anon, authenticated;

-- 2) get_auth_role() y handle_new_user_role() son SECURITY DEFINER y no
-- están enganchadas a ningún trigger ni política (comprobado contra
-- information_schema.triggers y pg_policies): su único efecto hoy es quedar
-- expuestas como RPC pública (`/rest/v1/rpc/...`), que es justo lo que marca
-- el linter de seguridad.
--
-- Incompleto a propósito: falta revocar también de PUBLIC. Se completa en
-- 20261116_harden_legacy_grants_fix_public_execute.sql — ver ese archivo
-- para el porqué. Se deja así, en dos migraciones, para que el historial del
-- repositorio coincida con el de Supabase: esta ya quedó aplicada tal cual
-- en la base real antes de notar el fallo.
revoke execute on function public.get_auth_role() from anon, authenticated;
revoke execute on function public.handle_new_user_role() from anon, authenticated;

-- 3) `search_path` mutable en las 6 funciones que señala el linter: sin esto,
-- una función SECURITY DEFINER puede ser engañada por un `search_path` del
-- llamador que anteponga un esquema con un objeto del mismo nombre.
alter function public.get_auth_role() set search_path = '';
alter function public.handle_new_user_role() set search_path = '';
alter function public.set_updated_at() set search_path = '';
alter function public.feed_bump_comments_count() set search_path = '';
alter function public.feed_bump_likes_count() set search_path = '';
alter function public.feed_bump_reaction_counts() set search_path = '';
