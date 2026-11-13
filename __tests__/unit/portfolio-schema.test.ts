/**
 * Guardarraíl contra la deriva entre el SQL y los tipos TypeScript.
 *
 * El repo no tiene tipos generados (`supabase gen types` nunca se configuró:
 * las migraciones se aplican a mano en el SQL Editor), así que los tipos de
 * `src/lib/portfolio/types.ts` están escritos a mano. Eso se desincroniza en
 * silencio: alguien añade una columna en la migración, se olvida del tipo, y el
 * código sigue compilando mientras la lectura devuelve un campo que nadie usa
 * —o peor, escribe uno que no existe.
 *
 * Este test parsea el SQL de la migración y compara columna por columna.
 *
 * La migración se ejecutó además contra un PostgreSQL 16 real durante T-04:
 * dos pasadas sin error (idempotente), 9 tablas, 8 índices, 9 triggers de
 * `updated_at`, 9 políticas, RLS activo en las 9. Verificado con el rol `anon`:
 * ve solo lo publicado (1 de 2 filas), su INSERT es rechazado por la política y
 * su UPDATE/DELETE afectan 0 filas.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CONTENIDO_ORIGINAL,
  PORTFOLIO_TABLES,
  type PortfolioTableName,
} from '@/lib/portfolio/types';

const sql = readFileSync(
  join(
    __dirname,
    '..',
    '..',
    'supabase/migrations/20261112_portfolio_content.sql',
  ),
  'utf8',
);

/** Extrae los nombres de columna del `create table` de una tabla. */
function columnasEnSql(tabla: string): string[] {
  const inicio = sql.indexOf(`create table if not exists public.${tabla} (`);
  if (inicio === -1) {
    throw new Error(`No se encontró el create table de ${tabla}`);
  }
  const cuerpoInicio = sql.indexOf('(', inicio) + 1;

  // Recorre equilibrando paréntesis: `numeric(12, 2)` y los `check (...)`
  // llevan paréntesis anidados, así que no vale buscar el primer ')'.
  let profundidad = 1;
  let i = cuerpoInicio;
  while (i < sql.length && profundidad > 0) {
    if (sql[i] === '(') profundidad += 1;
    else if (sql[i] === ')') profundidad -= 1;
    i += 1;
  }
  // Los comentarios se quitan ANTES de partir por comas: varios llevan comas
  // y llaves dentro ({"es": ..., "en": ...}) y romperían el recuento.
  const cuerpo = sql
    .slice(cuerpoInicio, i - 1)
    .split('\n')
    .map((l) => l.replace(/--.*$/, ''))
    .join('\n');

  // Parte por comas de nivel 0 y toma el primer identificador de cada línea.
  const columnas: string[] = [];
  let nivel = 0;
  let actual = '';
  for (const ch of cuerpo) {
    if (ch === '(') nivel += 1;
    if (ch === ')') nivel -= 1;
    if (ch === ',' && nivel === 0) {
      columnas.push(actual);
      actual = '';
    } else {
      actual += ch;
    }
  }
  columnas.push(actual);

  return columnas
    .map((linea) =>
      linea
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .join(' '),
    )
    .filter(Boolean)
    // Descarta restricciones de tabla; aquí solo interesan columnas.
    .filter((l) => !/^(constraint|primary key|unique|foreign key|check)\b/i.test(l))
    .map((l) => l.split(/\s+/)[0])
    .filter(Boolean);
}

const tablas = Object.keys(PORTFOLIO_TABLES) as PortfolioTableName[];

describe('el SQL y los tipos TypeScript describen lo mismo', () => {
  it('declara las 9 tablas de contenido', () => {
    expect(tablas).toHaveLength(9);
    for (const t of tablas) {
      expect(sql).toContain(`create table if not exists public.${t} (`);
    }
  });

  it.each(tablas)('%s: mismas columnas en SQL y en TS', (tabla) => {
    const enSql = columnasEnSql(tabla).sort();
    const enTs = [...PORTFOLIO_TABLES[tabla]].sort();
    expect(enTs).toEqual(enSql);
  });
});

describe('invariantes del esquema', () => {
  it('toda tabla en lista tiene position, y todas is_published', () => {
    // Sin `position` el orden del array original se pierde y la home
    // reordenaría sola; sin `is_published` no hay borrador posible.
    // portfolio_profile es la excepción: se lee por `section`, de una en una.
    for (const t of tablas) {
      const cols = columnasEnSql(t);
      expect(cols).toContain('is_published');
      if (t !== 'portfolio_profile') expect(cols).toContain('position');
      else expect(cols).not.toContain('position');
    }
  });

  it('toda tabla lleva su índice (is_published, position) salvo el perfil', () => {
    // portfolio_profile se lee por `section`, no en lista ordenada.
    for (const t of tablas.filter((x) => x !== 'portfolio_profile')) {
      const patron = new RegExp(`create index if not exists \\S+\\s+on public\\.${t} \\(`);
      expect(sql).toMatch(patron);
    }
  });

  it('toda tabla tiene RLS activo y política de lectura de lo publicado', () => {
    // El bucle de la migración recorre el array de tablas: se comprueba que
    // las 9 estén dentro de ese array y que la política use is_published.
    const bloqueRls = sql.slice(sql.indexOf('-- ── RLS:'));
    for (const t of tablas) {
      expect(bloqueRls).toContain(`'${t}'`);
    }
    expect(bloqueRls).toContain('enable row level security');
    expect(bloqueRls).toContain('using ( is_published = true )');
    expect(bloqueRls).toContain('to anon, authenticated');
  });

  it('no concede escritura a anon ni authenticated', () => {
    // La ausencia de política de escritura es deliberada: solo service_role.
    expect(sql).not.toMatch(/create policy[^;]*for (insert|update|delete)/is);
  });

  it('las skills acotan el porcentaje a 0..100', () => {
    expect(sql).toContain('percentage between 0 and 100');
  });

  it('los proyectos pueden marcar un demo que no se puede embeber', () => {
    // El visor incrusta `demo` en tres iframes; un sitio con X-Frame-Options
    // deja el "computador" en blanco sin error visible.
    const cols = columnasEnSql('portfolio_projects');
    expect(cols).toContain('demo_embeddable');
    expect(cols).toContain('demo_checked_at');
  });

  it('las tecnologías y el timeline guardan clave de icono, no JSX', () => {
    expect(columnasEnSql('portfolio_technologies')).toContain('icon_key');
    expect(columnasEnSql('portfolio_timeline')).toContain('icon_key');
  });

  it('los ítems de educación soportan ruta local y URL externa', () => {
    const cols = columnasEnSql('portfolio_education_items');
    expect(cols).toContain('certificate'); // las 163 rutas en public/
    expect(cols).toContain('certificate_url'); // lo que añade el panel
  });

  it('borrar una categoría arrastra sus ítems', () => {
    expect(sql).toMatch(
      /references public\.portfolio_education_categories \(id\) on delete cascade/,
    );
  });

  it('cada slug es único: el título ya no puede servir de clave', () => {
    // src/components/shared/Card.tsx usaba el título como key de React, así
    // que dos títulos iguales rompían el render.
    for (const t of tablas.filter(
      (x) => x !== 'portfolio_technologies' && x !== 'portfolio_profile',
    )) {
      const cuerpo = sql.slice(
        sql.indexOf(`create table if not exists public.${t} (`),
      );
      expect(cuerpo.slice(0, 1200)).toMatch(/slug text not null unique/);
    }
    // Estas dos tienen su propia identidad natural.
    expect(sql).toMatch(/name text not null unique/); // technologies
    expect(sql).toMatch(/section text not null unique/); // profile
  });
});

describe('conteos del contenido original', () => {
  it('quedan registrados para que el seed verifique que no se pierde nada', () => {
    // Medidos importando los módulos y leyendo .length, no contando a ojo
    // sobre el archivo: el `interface` de cabecera y los objetos anidados
    // inflan cualquier grep. Ver la nota en src/lib/portfolio/types.ts.
    expect(CONTENIDO_ORIGINAL).toEqual({
      proyectos: 22,
      educacion_categorias: 7,
      educacion_items: 172,
      educacion_certificados: 171,
      insignias_destacadas: 7,
      skills: 8,
      servicios: 4,
      tecnologias: 42,
      timeline: 4,
    });
  });
});
