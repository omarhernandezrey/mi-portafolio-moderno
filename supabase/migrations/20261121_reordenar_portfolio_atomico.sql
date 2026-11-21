-- ════════════════════════════════════════════════════════════════════════════
-- Reordenar contenido del portafolio en UNA transacción
-- Fecha: 2026-11-21 · Auditoría de backend (grupo "corrección de datos")
--
-- PROBLEMA QUE RESUELVE
--
-- Las 8 rutas `/api/admin/portfolio/*/reorder` hacían N updates sueltos:
--
--     Promise.all(ids.map((id, index) =>
--       supabase.from(TABLA).update({ position: index }).eq('id', id)))
--
-- Dos defectos medidos en la auditoría:
--
-- 1. NO ES ATÓMICO. Si falla el update nº3, los dos primeros ya se
--    aplicaron y la ruta devuelve 500. El orden queda reescrito a medias,
--    sin rollback, y nadie sabe en qué estado quedó: el panel muestra un
--    orden y la home pública otro.
--
-- 2. LA INVARIANTE NO SE DEFIENDE. El comentario de esas rutas promete que
--    "el cliente manda la lista COMPLETA ... así nunca hay huecos ni
--    posiciones repetidas", pero el servidor nunca lo comprobaba. Un `ids`
--    parcial reindexa ese subconjunto a 0..k-1 y crea posiciones duplicadas
--    con las filas que no se tocaron. Una promesa escrita en un comentario
--    no es una garantía; esta función la convierte en una.
--
-- DECISIONES
--
-- · `security invoker` + `search_path = ''`: mismo endurecimiento que el
--   resto de funciones del esquema desde T-19. Invoker (no definer) porque
--   quien llama ya es `service_role` desde `supabaseServer`; no hace falta
--   —ni conviene— elevar privilegios dentro de la función.
--
-- · El nombre de tabla llega como parámetro, así que se valida contra una
--   lista blanca DENTRO de la función además de en TypeScript. Defensa en
--   profundidad: aunque alguien llamara al RPC a mano, no puede apuntarlo a
--   `user_roles`. El `format %I` cita el identificador, pero la lista blanca
--   es la que de verdad acota el alcance.
--
-- · Devuelve el número de filas reordenadas para que la ruta pueda
--   registrarlo en la auditoría en vez de suponerlo.
--
-- Idempotente: `create or replace` + `revoke/grant` (revocar algo ya
-- revocado no es error en PostgreSQL).
-- ════════════════════════════════════════════════════════════════════════════

create or replace function public.reordenar_portfolio(
  p_tabla text,
  p_ids uuid[]
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_total_tabla integer;
  v_total_ids integer := array_length(p_ids, 1);
  v_distintos integer;
  v_encontrados integer;
begin
  -- Lista blanca: solo las 8 tablas de contenido ordenable.
  if p_tabla not in (
    'portfolio_projects',
    'portfolio_skills',
    'portfolio_education_categories',
    'portfolio_education_items',
    'portfolio_badges',
    'portfolio_services',
    'portfolio_technologies',
    'portfolio_timeline'
  ) then
    raise exception 'Tabla no reordenable: %', p_tabla
      using errcode = '42501'; -- insufficient_privilege
  end if;

  if v_total_ids is null or v_total_ids = 0 then
    raise exception 'La lista de ids está vacía'
      using errcode = '22023'; -- invalid_parameter_value
  end if;

  -- Sin ids repetidos: dos veces el mismo id dejaría una posición sin usar.
  select count(distinct id) into v_distintos from unnest(p_ids) as id;
  if v_distintos <> v_total_ids then
    raise exception 'La lista de ids tiene duplicados'
      using errcode = '22023';
  end if;

  -- La lista debe ser EXACTAMENTE el contenido de la tabla: ni de más
  -- (un id inventado) ni de menos (reindexaría un subconjunto y dejaría
  -- posiciones duplicadas con las filas no tocadas).
  execute format('select count(*) from public.%I', p_tabla) into v_total_tabla;
  execute format(
    'select count(*) from public.%I where id = any($1)', p_tabla
  ) into v_encontrados using p_ids;

  if v_encontrados <> v_total_ids then
    raise exception 'Hay ids que no existen en %: % de %',
      p_tabla, v_encontrados, v_total_ids
      using errcode = '23503'; -- foreign_key_violation
  end if;

  if v_total_tabla <> v_total_ids then
    raise exception 'La lista debe traer las % filas de %, llegaron %',
      v_total_tabla, p_tabla, v_total_ids
      using errcode = '22023';
  end if;

  -- Un solo UPDATE para todas las filas: o se aplica entero o no se aplica.
  -- `with ordinality` da la posición dentro del array (1..n) y se guarda
  -- 0-based para respetar el contrato que ya tenían las rutas.
  execute format(
    'update public.%I as t
        set position = u.orden - 1
       from unnest($1) with ordinality as u(id, orden)
      where t.id = u.id',
    p_tabla
  ) using p_ids;

  return v_total_ids;
end;
$$;

-- Solo el backend reordena. `anon`/`authenticated` no tienen por qué poder
-- invocarla: el panel escribe con `service_role` desde `supabaseServer`.
revoke all on function public.reordenar_portfolio(text, uuid[]) from public;
revoke all on function public.reordenar_portfolio(text, uuid[]) from anon, authenticated;
grant execute on function public.reordenar_portfolio(text, uuid[]) to service_role;
