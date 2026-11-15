/**
 * Generación del SQL del seed.
 *
 * El seed se entrega como un archivo `.sql` que se puede pegar en el SQL
 * Editor de Supabase o aplicar con el conector, igual que las migraciones. Eso
 * lo hace revisable antes de ejecutarlo y reproducible después.
 *
 * Todo sentencia `insert ... on conflict (clave) do update`, así que ejecutarlo
 * dos veces deja la base igual: el seed es idempotente.
 */

import type {
  FilaCategoriaEducacion,
  FilaHito,
  FilaInsignia,
  FilaItemEducacion,
  FilaPerfil,
  FilaProyecto,
  FilaServicio,
  FilaSkill,
  FilaTecnologia,
  FilasDelSeed,
} from './build';

/**
 * Literal de texto para PostgreSQL.
 *
 * Duplicar la comilla simple es obligatorio: hay títulos y descripciones con
 * apóstrofos, y sin escaparlos el SQL se rompe a mitad de la cadena. Se usa
 * `E'...'` solo cuando hay barras invertidas, para que no se interpreten.
 */
export function literal(valor: string): string {
  const escapado = valor.replace(/'/g, "''");
  return valor.includes('\\')
    ? `E'${escapado.replace(/\\/g, '\\\\')}'`
    : `'${escapado}'`;
}

/** Literal para una columna jsonb. */
export function jsonbLiteral(valor: unknown): string {
  if (valor === null || valor === undefined) return 'null';
  return `${literal(JSON.stringify(valor))}::jsonb`;
}

/** Literal para `text[]`, construido con `array[...]` para no pelear con comas. */
export function arrayLiteral(valores: readonly string[]): string {
  if (valores.length === 0) return `'{}'::text[]`;
  return `array[${valores.map(literal).join(', ')}]::text[]`;
}

function nulo(valor: string | null | undefined): string {
  return valor === null || valor === undefined ? 'null' : literal(valor);
}

function numeroNulo(valor: number | null | undefined): string {
  return valor === null || valor === undefined ? 'null' : String(valor);
}

/**
 * Arma un `insert ... on conflict do update` para una tabla.
 *
 * `do update` y no `do nothing`: el seed también sirve para re-sincronizar
 * contenido que cambió en los módulos. Las columnas de la cláusula de
 * actualización son las mismas del insert menos la clave de conflicto.
 */
function upsert(
  tabla: string,
  columnas: readonly string[],
  claveConflicto: string,
  filas: readonly string[][],
): string {
  if (filas.length === 0) return `-- ${tabla}: nada que insertar\n`;

  const actualizables = columnas.filter((c) => c !== claveConflicto);
  const valores = filas.map((f) => `  (${f.join(', ')})`).join(',\n');
  const set = actualizables
    .map((c) => `    ${c} = excluded.${c}`)
    .join(',\n');

  return [
    `-- ${tabla}: ${filas.length} fila(s)`,
    `insert into public.${tabla} (${columnas.join(', ')})`,
    `values`,
    valores,
    `on conflict (${claveConflicto}) do update set`,
    set,
    `;`,
    '',
  ].join('\n');
}

// ── Una función por tabla ───────────────────────────────────────────────────

export function sqlProyectos(filas: readonly FilaProyecto[]): string {
  return upsert(
    'portfolio_projects',
    ['slug', 'title', 'description', 'technologies', 'repository', 'demo',
     'category', 'features', 'highlights', 'architecture', 'position'],
    'slug',
    filas.map((p) => [
      literal(p.slug),
      jsonbLiteral(p.title),
      jsonbLiteral(p.description),
      arrayLiteral(p.technologies),
      literal(p.repository),
      literal(p.demo),
      jsonbLiteral(p.category),
      jsonbLiteral(p.features),
      jsonbLiteral(p.highlights),
      jsonbLiteral(p.architecture),
      String(p.position),
    ]),
  );
}

export function sqlSkills(filas: readonly FilaSkill[]): string {
  return upsert(
    'portfolio_skills',
    ['slug', 'name', 'percentage', 'color_hex', 'icon', 'description', 'category', 'position'],
    'slug',
    filas.map((s) => [
      literal(s.slug),
      jsonbLiteral(s.name),
      String(s.percentage),
      nulo(s.color_hex),
      nulo(s.icon),
      jsonbLiteral(s.description),
      jsonbLiteral(s.category),
      String(s.position),
    ]),
  );
}

export function sqlCategoriasEducacion(filas: readonly FilaCategoriaEducacion[]): string {
  return upsert(
    'portfolio_education_categories',
    ['slug', 'name', 'position'],
    'slug',
    filas.map((c) => [literal(c.slug), jsonbLiteral(c.name), String(c.position)]),
  );
}

/**
 * Los ítems necesitan el `id` de su categoría, que lo genera la base. Se
 * resuelve **dentro del SQL** con un subselect por slug, nunca inventando un
 * UUID en TypeScript: así el seed funciona sobre una base donde las categorías
 * ya existen con otros ids.
 */
export function sqlItemsEducacion(filas: readonly FilaItemEducacion[]): string {
  if (filas.length === 0) return '-- portfolio_education_items: nada que insertar\n';

  const columnas = ['category_id', 'slug', 'title', 'institution', 'duration',
    'description', 'logo', 'certificate', 'is_new', 'position'];
  const valores = filas
    .map((i) => [
      `(select id from public.portfolio_education_categories where slug = ${literal(i.category_slug)})`,
      literal(i.slug),
      jsonbLiteral(i.title),
      jsonbLiteral(i.institution),
      jsonbLiteral(i.duration),
      jsonbLiteral(i.description),
      nulo(i.logo),
      nulo(i.certificate),
      String(i.is_new),
      String(i.position),
    ])
    .map((f) => `  (${f.join(', ')})`)
    .join(',\n');
  const set = columnas
    .filter((c) => c !== 'slug')
    .map((c) => `    ${c} = excluded.${c}`)
    .join(',\n');

  return [
    `-- portfolio_education_items: ${filas.length} fila(s)`,
    `insert into public.portfolio_education_items (${columnas.join(', ')})`,
    `values`,
    valores,
    `on conflict (slug) do update set`,
    set,
    `;`,
    '',
  ].join('\n');
}

export function sqlInsignias(filas: readonly FilaInsignia[]): string {
  return upsert(
    'portfolio_badges',
    ['slug', 'title', 'institution', 'summary', 'logo', 'certificate', 'is_new', 'position'],
    'slug',
    filas.map((b) => [
      literal(b.slug),
      jsonbLiteral(b.title),
      jsonbLiteral(b.institution),
      jsonbLiteral(b.summary),
      nulo(b.logo),
      nulo(b.certificate),
      String(b.is_new),
      String(b.position),
    ]),
  );
}

export function sqlServicios(filas: readonly FilaServicio[]): string {
  return upsert(
    'portfolio_services',
    ['slug', 'title', 'description', 'icon', 'badge', 'features', 'gradient',
     'price_min', 'price_max', 'price_currency', 'position'],
    'slug',
    filas.map((s) => [
      literal(s.slug),
      jsonbLiteral(s.title),
      jsonbLiteral(s.description),
      nulo(s.icon),
      nulo(s.badge),
      jsonbLiteral(s.features),
      nulo(s.gradient),
      numeroNulo(s.price_min),
      numeroNulo(s.price_max),
      nulo(s.price_currency),
      String(s.position),
    ]),
  );
}

export function sqlTecnologias(filas: readonly FilaTecnologia[]): string {
  return upsert(
    'portfolio_technologies',
    ['name', 'icon_key', 'color', 'category', 'position'],
    'name',
    filas.map((t) => [
      literal(t.name),
      nulo(t.icon_key),
      nulo(t.color),
      nulo(t.category),
      String(t.position),
    ]),
  );
}

export function sqlHitos(filas: readonly FilaHito[]): string {
  return upsert(
    'portfolio_timeline',
    ['slug', 'year', 'title', 'description', 'icon_key', 'position'],
    'slug',
    filas.map((h) => [
      literal(h.slug),
      jsonbLiteral(h.year),
      jsonbLiteral(h.title),
      jsonbLiteral(h.description),
      nulo(h.icon_key),
      String(h.position),
    ]),
  );
}

export function sqlPerfil(filas: readonly FilaPerfil[]): string {
  return upsert(
    'portfolio_profile',
    ['section', 'content'],
    'section',
    filas.map((p) => [literal(p.section), jsonbLiteral(p.content)]),
  );
}

/**
 * SQL completo del seed. El orden importa: las categorías de educación van
 * antes que sus ítems, porque el subselect por slug las necesita ya insertadas.
 */
export function sqlDelSeed(filas: FilasDelSeed): string {
  const cabecera = [
    '-- ════════════════════════════════════════════════════════════════════════',
    '-- Seed del contenido del portafolio · Tarea T-05b',
    '--',
    '-- GENERADO AUTOMÁTICAMENTE por scripts/seed-portfolio.ts. No se edita a',
    '-- mano: se regenera con `npm run seed:portfolio`.',
    '--',
    '-- Traslada el contenido de los módulos TypeScript a las tablas portfolio_*.',
    '-- Todo es `insert ... on conflict do update`, así que es idempotente y',
    '-- sirve también para re-sincronizar contenido que cambió en los módulos.',
    '-- No borra ninguna fila.',
    '-- ════════════════════════════════════════════════════════════════════════',
    '',
    'begin;',
    '',
  ].join('\n');

  const cuerpo = [
    sqlProyectos(filas.proyectos),
    sqlSkills(filas.skills),
    sqlCategoriasEducacion(filas.categoriasEducacion),
    sqlItemsEducacion(filas.itemsEducacion),
    sqlInsignias(filas.insignias),
    sqlServicios(filas.servicios),
    sqlTecnologias(filas.tecnologias),
    sqlHitos(filas.hitos),
    sqlPerfil(filas.perfil),
  ].join('\n');

  return `${cabecera}${cuerpo}\ncommit;\n`;
}
