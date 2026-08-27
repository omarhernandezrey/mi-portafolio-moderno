-- Bucket público de lectura para imágenes del feed "Comunidad".
-- Sin policies de insert/update/delete para anon/authenticated: la subida
-- SIEMPRE es server-mediated vía supabaseServer (service role bypassa RLS
-- de storage.objects igual que en las tablas normales del feed).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('feed-images', 'feed-images', true, 4194304, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
