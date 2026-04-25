-- Migración para Tarea 30.6: Roles y permisos (RBAC)

-- Crear tipo enum para roles si no existe
do $$ begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('owner', 'assistant', 'viewer');
  end if;
end $$;

-- Crear tabla de roles de usuario
create table if not exists public.user_roles (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  role public.user_role not null default 'viewer',
  created_at timestamptz default now()
);

-- Habilitar RLS
alter table public.user_roles enable row level security;

-- Políticas
-- Eliminar políticas existentes para evitar errores en re-ejecución
drop policy if exists "Users can view own role" on public.user_roles;
drop policy if exists "Service role can manage all roles" on public.user_roles;

-- Los usuarios pueden leer su propio rol
create policy "Users can view own role"
  on public.user_roles
  for select
  using ( auth.uid() = id );

-- El service_role (que usa nuestra app en el servidor) puede hacer todo
-- Nota: En Supabase, el service_role se salta RLS por defecto, pero lo documentamos.

-- Función para obtener el rol del usuario actual (útil para políticas en otras tablas)
create or replace function public.get_auth_role()
returns public.user_role as $$
  select role from public.user_roles where id = auth.uid();
$$ language sql stable security definer;

-- Función para asignar rol automáticamente al registrarse
create or replace function public.handle_new_user_role()
returns trigger as $$
begin
  insert into public.user_roles (id, email, role)
  values (
    new.id, 
    new.email, 
    case 
      when new.email = 'hernandezreyomar@gmail.com' then 'owner'::public.user_role
      else 'viewer'::public.user_role
    end
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger para ejecutar la función tras el insert en auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user_role();
