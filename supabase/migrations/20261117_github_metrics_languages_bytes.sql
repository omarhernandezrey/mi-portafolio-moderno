-- T-14: `languages` ya guardaba solo PORCENTAJES por repo. Agregar
-- porcentajes de repos de tamaños distintos para un "lenguaje principal"
-- del portafolio completo no es correcto (un repo de 200 líneas pesaría
-- igual que uno de 20.000 en la suma). Se añade la columna de bytes crudos;
-- `languages` se deja intacta para no romper nada que ya la lea.
--
-- Columna aditiva con default: las filas existentes quedan con '{}', que el
-- código ya trata como "sin dato todavía" (estado vacío honesto, no un cero
-- inventado) hasta que el cron vuelva a correr con este cambio.
alter table public.github_metrics
  add column if not exists languages_bytes jsonb not null default '{}';
