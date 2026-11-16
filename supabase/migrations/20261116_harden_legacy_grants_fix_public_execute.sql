-- Complemento de 20261116_harden_legacy_grants.sql: esa migración revocó
-- EXECUTE de anon/authenticated sobre get_auth_role()/handle_new_user_role(),
-- pero PostgreSQL concede EXECUTE a PUBLIC por defecto a toda función nueva,
-- y anon/authenticated heredan de PUBLIC. Medido tras aplicarla: ambos roles
-- seguían pudiendo ejecutar las dos funciones (has_function_privilege daba
-- true). Separado en su propio archivo, en vez de corregir el anterior, para
-- que el historial de migraciones de Supabase coincida con el del repo: la
-- primera ya quedó aplicada tal cual en la base real antes de notar el fallo.
revoke execute on function public.get_auth_role() from public, anon, authenticated;
revoke execute on function public.handle_new_user_role() from public, anon, authenticated;
