-- ════════════════════════════════════════════════════════════════════════════
-- Contenido del portafolio en base de datos
-- Fecha: 2026-11-12 · Tarea T-04 del PLAN_MAESTRO_DASHBOARD.md
--
-- Hasta ahora cada proyecto, skill, insignia y servicio vivía hardcodeado en
-- archivos TypeScript (src/lib/projectsData.ts, educationData.ts, skillsData.ts,
-- servicesData.ts y arrays inline en varias secciones). Añadir una insignia
-- exigía programar y desplegar. Estas tablas son el sustrato para que el
-- dashboard sea el motor real del portafolio.
--
-- DECISIONES DE MODELADO, para que no se deshagan por descuido:
--
-- 1. Los campos bilingües se guardan como jsonb {"es": ..., "en": ...}, que es
--    exactamente la forma que ya tenían los archivos. Así el adaptador puede
--    reproducir el fallback a `es` de getLocalizedProjectsData sin inventar
--    nada, y añadir un idioma no obliga a migrar columnas.
--
-- 2. `position` existe porque el orden lo daba la posición en el array y eso se
--    pierde al pasar a filas. Sin él, la home reordenaría los proyectos sola.
--
-- 3. `slug` existe porque hoy el componente Card usa el TÍTULO como clave de
--    React. Dos títulos iguales rompían el render. El slug da identidad estable
--    e independiente del idioma.
--
-- 4. `technologies` es text[] y guarda los nombres TAL CUAL se escribieron. Los
--    iconos de src/config/technologyIcons.tsx se resuelven por coincidencia
--    literal de cadena: si aquí se normalizara a minúsculas o a slugs, los ~105
--    iconos dejarían de aparecer.
--
-- 5. Los iconos que eran JSX (timeline y marquee de tecnologías usaban
--    componentes de lucide-react) se guardan como `icon_key`: una cadena que el
--    código resuelve contra su registro. JSX no es serializable y no se guarda.
--
-- 6. `percentage` de las skills pasa de la cadena "95%" a un entero 0..100. El
--    símbolo es presentación y lo vuelve a poner el adaptador.
--
-- 7. `demo_embeddable` y `demo_checked_at`: el visor de proyectos incrusta la
--    URL de `demo` en tres iframes. Un sitio con X-Frame-Options o
--    frame-ancestors deja el "computador" en blanco SIN error visible. Estas
--    columnas permiten detectarlo y avisar en el dashboard en vez de publicar
--    una tarjeta rota.
--
-- 8. RLS con políticas DE VERDAD, a diferencia de schema.sql (que habilita RLS
--    sin crear ninguna y deja todo a merced de service_role): aquí anon y
--    authenticated solo pueden LEER lo publicado. No hay política de escritura,
--    así que insertar, editar o borrar solo es posible con service_role, que es
--    lo que usa el panel desde el servidor.
-- ════════════════════════════════════════════════════════════════════════════

-- ── Utilidad compartida: updated_at automático ──────────────────────────────
create or replace function public.portfolio_touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ── Proyectos ───────────────────────────────────────────────────────────────
create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null,
  description jsonb not null,
  technologies text[] not null default '{}',
  repository text not null default '',
  demo text not null default '',
  category jsonb,
  -- Estructuras anidadas por idioma: {"es": {...}, "en": {...}}. Son jsonb y no
  -- columnas porque `architecture` lleva description + layers[] por idioma.
  features jsonb,
  highlights jsonb,
  architecture jsonb,
  image_url text,
  demo_embeddable boolean not null default true,
  demo_checked_at timestamptz,
  position integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Skills ──────────────────────────────────────────────────────────────────
create table if not exists public.portfolio_skills (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null,
  -- Entero 0..100. El "%" lo añade la vista, no la base de datos.
  percentage integer not null default 0
    constraint portfolio_skills_percentage_range check (percentage between 0 and 100),
  color_hex text,
  icon text,
  description jsonb,
  category jsonb,
  position integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Educación: categorías e ítems ───────────────────────────────────────────
create table if not exists public.portfolio_education_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null,
  position integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_education_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null
    references public.portfolio_education_categories (id) on delete cascade,
  slug text not null unique,
  title jsonb not null,
  institution jsonb,
  duration jsonb,
  description jsonb,
  -- `logo` y `certificate` son rutas relativas dentro de public/ (hay 179
  -- archivos bajo public/images/education/). Se guardan tal cual para no tener
  -- que reescribir 163 rutas ni añadir remotePatterns a next.config.mjs.
  logo text,
  certificate text,
  -- Alternativa a `certificate` cuando la imagen vive fuera (Supabase Storage o
  -- una URL externa). Es lo que permite añadir insignias desde el dashboard sin
  -- subir archivos al repositorio.
  certificate_url text,
  is_new boolean not null default false,
  position integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Insignias destacadas (el carrusel de FeaturedCertificates) ──────────────
create table if not exists public.portfolio_badges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null,
  institution jsonb,
  summary jsonb,
  logo text,
  certificate text,
  certificate_url text,
  is_new boolean not null default false,
  position integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Servicios ───────────────────────────────────────────────────────────────
create table if not exists public.portfolio_services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null,
  description jsonb,
  icon text,
  badge text,
  features jsonb,
  gradient text,
  price_min numeric(12, 2),
  price_max numeric(12, 2),
  price_currency text,
  position integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Tecnologías del marquee ─────────────────────────────────────────────────
create table if not exists public.portfolio_technologies (
  id uuid primary key default gen_random_uuid(),
  -- El nombre es la identidad y debe coincidir literalmente con la clave del
  -- registro de iconos. De ahí el unique sobre `name` y no sobre un slug.
  name text not null unique,
  -- Clave en src/config/technologyIcons.tsx. El icono era JSX y no se guarda.
  icon_key text,
  color text,
  category text,
  position integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Timeline / experiencia ──────────────────────────────────────────────────
create table if not exists public.portfolio_timeline (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  year text not null,
  title jsonb not null,
  description jsonb,
  -- Era un componente de lucide-react embebido en el array. Ahora, su nombre.
  icon_key text,
  position integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Perfil y textos sueltos (hero, sobre mí, intereses, datos personales) ───
-- Clave/valor en vez de una columna por texto: estos bloques cambian de forma
-- con el diseño, y una tabla ancha obligaría a una migración por cada ajuste.
create table if not exists public.portfolio_profile (
  id uuid primary key default gen_random_uuid(),
  section text not null unique,
  content jsonb not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Índices ─────────────────────────────────────────────────────────────────
-- Todas las lecturas públicas son "lo publicado, en orden": índices compuestos
-- sobre (is_published, position) para que la home no haga sort en memoria.
create index if not exists portfolio_projects_pub_pos_idx
  on public.portfolio_projects (is_published, position);
create index if not exists portfolio_skills_pub_pos_idx
  on public.portfolio_skills (is_published, position);
create index if not exists portfolio_education_categories_pub_pos_idx
  on public.portfolio_education_categories (is_published, position);
create index if not exists portfolio_education_items_cat_pos_idx
  on public.portfolio_education_items (category_id, is_published, position);
create index if not exists portfolio_badges_pub_pos_idx
  on public.portfolio_badges (is_published, position);
create index if not exists portfolio_services_pub_pos_idx
  on public.portfolio_services (is_published, position);
create index if not exists portfolio_technologies_pub_pos_idx
  on public.portfolio_technologies (is_published, position);
create index if not exists portfolio_timeline_pub_pos_idx
  on public.portfolio_timeline (is_published, position);

-- ── Triggers de updated_at ──────────────────────────────────────────────────
do $$
declare
  t text;
begin
  foreach t in array array[
    'portfolio_projects',
    'portfolio_skills',
    'portfolio_education_categories',
    'portfolio_education_items',
    'portfolio_badges',
    'portfolio_services',
    'portfolio_technologies',
    'portfolio_timeline',
    'portfolio_profile'
  ]
  loop
    execute format('drop trigger if exists %I on public.%I', t || '_touch', t);
    execute format(
      'create trigger %I before update on public.%I
         for each row execute function public.portfolio_touch_updated_at()',
      t || '_touch', t
    );
  end loop;
end $$;

-- ── RLS: lectura pública de lo publicado, escritura solo service_role ───────
-- A diferencia de schema.sql, aquí sí se crean políticas. La ausencia de
-- política de INSERT/UPDATE/DELETE es deliberada: niega esas operaciones a
-- anon y authenticated, y solo service_role (que salta RLS) puede escribir.
do $$
declare
  t text;
begin
  foreach t in array array[
    'portfolio_projects',
    'portfolio_skills',
    'portfolio_education_categories',
    'portfolio_education_items',
    'portfolio_badges',
    'portfolio_services',
    'portfolio_technologies',
    'portfolio_timeline',
    'portfolio_profile'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'drop policy if exists "Lectura publica de contenido publicado" on public.%I', t
    );
    execute format(
      'create policy "Lectura publica de contenido publicado"
         on public.%I for select
         to anon, authenticated
         using ( is_published = true )',
      t
    );
  end loop;
end $$;

-- ── Comentarios de documentación en la propia base de datos ─────────────────
comment on table public.portfolio_projects is
  'Proyectos del portafolio. `demo` alimenta los tres iframes del visor de '
  'src/components/shared/Card.tsx; si el sitio bloquea el embebido, '
  'demo_embeddable queda en false y el dashboard debe avisarlo.';
comment on column public.portfolio_projects.technologies is
  'Nombres TAL CUAL. Coinciden literalmente con las claves de '
  'src/config/technologyIcons.tsx: normalizarlos borra los iconos.';
comment on column public.portfolio_skills.percentage is
  'Entero 0..100. El símbolo "%" lo añade la vista.';
comment on column public.portfolio_technologies.icon_key is
  'Clave del registro de iconos. El icono original era JSX y no se persiste.';
comment on column public.portfolio_timeline.icon_key is
  'Clave del registro de iconos. El icono original era JSX y no se persiste.';
