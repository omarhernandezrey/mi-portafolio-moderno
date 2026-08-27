-- Álbum de imágenes por post (antes: una sola image_url) y reacciones tipo
-- Facebook (antes: like binario) para el feed de Comunidad.

alter table public.feed_posts
  add column if not exists image_urls text[] not null default '{}';

update public.feed_posts
  set image_urls = array[image_url]
  where image_url is not null and image_urls = '{}';

alter table public.feed_posts
  add column if not exists reaction_counts jsonb not null default '{}'::jsonb;

alter table public.feed_likes
  add column if not exists reaction text not null default 'like'
    check (reaction in ('like', 'love', 'haha', 'wow', 'sad', 'angry'));

-- Backfill: los likes existentes (todos con reaction='like' por default) se
-- reflejan en el contador agregado del post.
update public.feed_posts p
  set reaction_counts = jsonb_build_object('like', sub.count)
  from (
    select post_id, count(*) as count from public.feed_likes group by post_id
  ) sub
  where p.id = sub.post_id;

-- image_url queda reemplazada por image_urls — se elimina para no dejar dos
-- fuentes de verdad para la misma información.
alter table public.feed_posts drop column if exists image_url;

create or replace function public.feed_bump_reaction_counts() returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update public.feed_posts
      set reaction_counts = jsonb_set(
        reaction_counts, array[new.reaction],
        to_jsonb(coalesce((reaction_counts->>new.reaction)::int, 0) + 1)
      )
      where id = new.post_id;
  elsif (tg_op = 'DELETE') then
    update public.feed_posts
      set reaction_counts = jsonb_set(
        reaction_counts, array[old.reaction],
        to_jsonb(greatest(coalesce((reaction_counts->>old.reaction)::int, 0) - 1, 0))
      )
      where id = old.post_id;
  elsif (tg_op = 'UPDATE' and old.reaction is distinct from new.reaction) then
    update public.feed_posts
      set reaction_counts = jsonb_set(
        jsonb_set(reaction_counts, array[old.reaction], to_jsonb(greatest(coalesce((reaction_counts->>old.reaction)::int, 0) - 1, 0))),
        array[new.reaction],
        to_jsonb(coalesce((reaction_counts->>new.reaction)::int, 0) + 1)
      )
      where id = new.post_id;
  end if;
  return null;
end; $$ language plpgsql;

drop trigger if exists trg_feed_reaction_counts on public.feed_likes;
create trigger trg_feed_reaction_counts
  after insert or update or delete on public.feed_likes
  for each row execute function public.feed_bump_reaction_counts();
