-- Actualiza el email de owner: hernandezreyomar@gmail.com -> omarhernandezrey@gmail.com

-- 1. Actualiza filas existentes en user_roles (si ya existía un registro con el email anterior)
update public.user_roles
set email = 'omarhernandezrey@gmail.com'
where email = 'hernandezreyomar@gmail.com';

-- 2. Redefine la función para que nuevos registros usen el email correcto
create or replace function public.handle_new_user_role()
returns trigger as $$
begin
  insert into public.user_roles (id, email, role)
  values (
    new.id,
    new.email,
    case
      when new.email = 'omarhernandezrey@gmail.com' then 'owner'::public.user_role
      else 'viewer'::public.user_role
    end
  );
  return new;
end;
$$ language plpgsql security definer;
