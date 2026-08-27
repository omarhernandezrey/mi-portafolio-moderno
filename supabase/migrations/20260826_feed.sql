-- Feed "Comunidad": posts públicos + comentarios + likes.
-- Igual que tickets/admin_audit_logs: RLS enabled SIN policies públicas de
-- insert/select. Todo acceso (público y admin) pasa por supabaseServer
-- (service role) en los API routes de src/app/api/feed/* y
-- src/app/api/admin/feed/*.

create table if not exists public.feed_posts (
  id uuid primary key default gen_random_uuid(),
  author_role text not null default 'visitor' check (author_role in ('owner','visitor')),
  author_name text not null check (char_length(author_name) between 2 and 80),
  author_email text,
  lang text not null check (lang in ('es','en')),
  category text not null default 'general' check (category in ('general','status','curso','skill','proyecto','postulacion')),
  title text check (char_length(title) <= 120),
  body text not null check (char_length(body) between 1 and 5000),
  image_url text,
  link_url text,
  status text not null default 'published' check (status in ('published','hidden')),
  pinned boolean not null default false,
  likes_count int not null default 0,
  comments_count int not null default 0,
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feed_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 2 and 80),
  author_email text not null,
  body text not null check (char_length(body) between 1 and 1000),
  status text not null default 'published' check (status in ('published','hidden')),
  ip_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.feed_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  fingerprint text not null,
  created_at timestamptz not null default now(),
  unique (post_id, fingerprint)
);

create index if not exists feed_posts_created_at_idx on public.feed_posts (created_at desc) where status = 'published';
create index if not exists feed_posts_status_idx on public.feed_posts (status);
create index if not exists feed_comments_post_id_idx on public.feed_comments (post_id, created_at desc);
create index if not exists feed_likes_post_id_idx on public.feed_likes (post_id);

-- updated_at automático (reutiliza public.set_updated_at() de 20260726_audit_gap_closure.sql)
drop trigger if exists trg_feed_posts_updated_at on public.feed_posts;
create trigger trg_feed_posts_updated_at
  before update on public.feed_posts
  for each row execute procedure public.set_updated_at();

-- Contadores denormalizados vía trigger — evita condiciones de carrera de un
-- "UPDATE ... SET x = x + 1" hecho desde la API en vez de en la propia BD.
create or replace function public.feed_bump_comments_count() returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update public.feed_posts set comments_count = comments_count + 1 where id = new.post_id;
  elsif (tg_op = 'DELETE') then
    update public.feed_posts set comments_count = greatest(comments_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql;

drop trigger if exists trg_feed_comments_count on public.feed_comments;
create trigger trg_feed_comments_count
  after insert or delete on public.feed_comments
  for each row execute procedure public.feed_bump_comments_count();

create or replace function public.feed_bump_likes_count() returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update public.feed_posts set likes_count = likes_count + 1 where id = new.post_id;
  elsif (tg_op = 'DELETE') then
    update public.feed_posts set likes_count = greatest(likes_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql;

drop trigger if exists trg_feed_likes_count on public.feed_likes;
create trigger trg_feed_likes_count
  after insert or delete on public.feed_likes
  for each row execute procedure public.feed_bump_likes_count();

alter table public.feed_posts enable row level security;
alter table public.feed_comments enable row level security;
alter table public.feed_likes enable row level security;
