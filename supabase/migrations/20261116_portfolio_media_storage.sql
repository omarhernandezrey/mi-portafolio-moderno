-- Bucket público de lectura para logos y certificados subidos desde el panel
-- de Educación e Insignias (T-11). Mismo patrón que feed-images
-- (20260826_feed_storage.sql): sin policies de insert/update/delete para
-- anon/authenticated — la subida siempre es server-mediated vía
-- supabaseServer (service role bypassa RLS de storage.objects).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-media', 'portfolio-media', true, 4194304, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
