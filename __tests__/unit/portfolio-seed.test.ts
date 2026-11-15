/**
 * Tests del seed del portafolio (T-05b).
 *
 * El seed existe para trasladar el contenido a la base **sin perder nada**, así
 * que lo que se comprueba aquí es justamente eso: conteos exactos, slugs únicos
 * y deterministas, y que el SQL generado no se rompa con los textos reales.
 *
 * La prueba de ida y vuelta completa (insertar en PostgreSQL y reconstruir la
 * forma original) se ejecutó fuera de Jest, contra una base real, porque
 * necesita un servidor. Resultado registrado en §6 del plan maestro.
 */
import {
  bilingue,
  conteosDelSeed,
  construirFilasDelSeed,
  construirHitos,
  creadorDeSlugs,
  porcentajeAEntero,
  slugificar,
} from '@/lib/portfolio/seed/build';
import {
  arrayLiteral,
  jsonbLiteral,
  literal,
  sqlDelSeed,
} from '@/lib/portfolio/seed/sql';
import { CONTENIDO_ORIGINAL } from '@/lib/portfolio/types';

describe('utilidades de transformación', () => {
  describe('bilingue', () => {
    it('normaliza una cadena plana a los dos idiomas', () => {
      // educationData mezcla `{es,en}` con cadenas planas.
      expect(bilingue('SENA')).toEqual({ es: 'SENA', en: 'SENA' });
    });

    it('conserva un objeto ya bilingüe', () => {
      expect(bilingue({ es: 'Hola', en: 'Hi' })).toEqual({ es: 'Hola', en: 'Hi' });
    });

    it('cae al español cuando falta el inglés', () => {
      expect(bilingue({ es: 'Solo español' })).toEqual({
        es: 'Solo español',
        en: 'Solo español',
      });
    });

    it('no reventa con valores vacíos', () => {
      expect(bilingue(null)).toEqual({ es: '', en: '' });
      expect(bilingue(undefined)).toEqual({ es: '', en: '' });
    });
  });

  describe('slugificar', () => {
    it('quita tildes, baja a minúsculas y une con guiones', () => {
      expect(slugificar('Ingeniería de Software')).toBe('ingenieria-de-software');
    });

    it('limpia signos y guiones sobrantes', () => {
      expect(slugificar('  ¿Qué es React? / Guía  ')).toBe('que-es-react-guia');
    });

    it('nunca devuelve una cadena vacía', () => {
      expect(slugificar('')).toBe('sin-titulo');
      expect(slugificar('¡!¿?')).toBe('sin-titulo');
    });

    it('es determinista', () => {
      expect(slugificar('Tienda Lizz')).toBe(slugificar('Tienda Lizz'));
    });
  });

  describe('creadorDeSlugs', () => {
    it('desambigua repetidos con sufijo numérico', () => {
      // Entre 172 ítems de educación hay títulos repetidos.
      const slug = creadorDeSlugs();
      expect(slug('Curso de React')).toBe('curso-de-react');
      expect(slug('Curso de React')).toBe('curso-de-react-2');
      expect(slug('Curso de React')).toBe('curso-de-react-3');
    });

    it('cada creador lleva su propia cuenta', () => {
      const a = creadorDeSlugs();
      const b = creadorDeSlugs();
      expect(a('X')).toBe('x');
      expect(b('X')).toBe('x');
    });
  });

  describe('porcentajeAEntero', () => {
    it('quita el símbolo', () => {
      expect(porcentajeAEntero('95%')).toBe(95);
    });

    it('acota al rango que exige el check de la columna', () => {
      expect(porcentajeAEntero('150%')).toBe(100);
      expect(porcentajeAEntero('-10')).toBe(0);
    });

    it('devuelve 0 ante basura', () => {
      expect(porcentajeAEntero('abc')).toBe(0);
    });
  });
});

describe('escapado de SQL', () => {
  it('duplica la comilla simple: hay textos con apóstrofos', () => {
    expect(literal("Guía de l'API")).toBe("'Guía de l''API'");
  });

  it('usa la forma E cuando hay barras invertidas', () => {
    expect(literal('ruta\\archivo')).toBe("E'ruta\\\\archivo'");
  });

  it('serializa jsonb y escapa su contenido', () => {
    expect(jsonbLiteral({ es: "l'été" })).toBe(`'{"es":"l''été"}'::jsonb`);
  });

  it('null va como null, no como la cadena "null"', () => {
    expect(jsonbLiteral(null)).toBe('null');
    expect(jsonbLiteral(undefined)).toBe('null');
  });

  it('construye text[] con array[...] y escapa cada elemento', () => {
    expect(arrayLiteral(['Next.js', "O'Reilly"])).toBe(
      `array['Next.js', 'O''Reilly']::text[]`,
    );
  });

  it('un array vacío es un literal válido', () => {
    expect(arrayLiteral([])).toBe(`'{}'::text[]`);
  });
});

describe('el seed no pierde contenido', () => {
  const filas = construirFilasDelSeed();

  it('los conteos coinciden exactamente con CONTENIDO_ORIGINAL', () => {
    // Es la garantía central de la tarea. Si esto falla, el seed perdió o
    // duplicó algo: no se toca el número esperado sin averiguar por qué.
    expect(conteosDelSeed(filas)).toEqual(CONTENIDO_ORIGINAL);
  });

  it('cada tabla tiene slugs únicos', () => {
    const unicos = (slugs: string[]) => expect(new Set(slugs).size).toBe(slugs.length);
    unicos(filas.proyectos.map((p) => p.slug));
    unicos(filas.skills.map((s) => s.slug));
    unicos(filas.categoriasEducacion.map((c) => c.slug));
    unicos(filas.itemsEducacion.map((i) => i.slug));
    unicos(filas.insignias.map((b) => b.slug));
    unicos(filas.servicios.map((s) => s.slug));
    unicos(filas.hitos.map((h) => h.slug));
    unicos(filas.tecnologias.map((t) => t.name));
    unicos(filas.perfil.map((p) => p.section));
  });

  it('es determinista: dos construcciones dan lo mismo', () => {
    // Sin esto el `on conflict (slug)` no serviría: un slug que cambia entre
    // ejecuciones insertaría filas duplicadas en vez de actualizar.
    expect(construirFilasDelSeed()).toEqual(filas);
  });

  it('cada ítem de educación apunta a una categoría existente', () => {
    const categorias = new Set(filas.categoriasEducacion.map((c) => c.slug));
    const huerfanos = filas.itemsEducacion
      .filter((i) => !categorias.has(i.category_slug))
      .map((i) => i.slug);
    expect(huerfanos).toEqual([]);
  });

  it('las posiciones de cada tabla arrancan en 0 y no se repiten', () => {
    expect(filas.proyectos.map((p) => p.position)).toEqual(
      filas.proyectos.map((_, i) => i),
    );
    expect(filas.skills.map((s) => s.position)).toEqual(filas.skills.map((_, i) => i));
  });

  it('conserva los nombres de tecnología sin normalizar', () => {
    // Los ~105 iconos de technologyIcons.tsx se resuelven por coincidencia
    // literal: si el seed los pasara a minúsculas, desaparecerían.
    const nombres = filas.tecnologias.map((t) => t.name);
    expect(nombres.some((n) => /[A-Z]/.test(n))).toBe(true);
    expect(nombres.some((n) => n.includes('.'))).toBe(true);
  });

  it('conserva las rutas de certificado tal cual', () => {
    const conCertificado = filas.itemsEducacion.filter((i) => i.certificate);
    expect(conCertificado).toHaveLength(CONTENIDO_ORIGINAL.educacion_certificados);
    for (const item of conCertificado) {
      expect(item.certificate).toMatch(/^\//); // ruta relativa dentro de public/
    }
  });

  it('el porcentaje de cada skill entra en el rango del check', () => {
    for (const s of filas.skills) {
      expect(Number.isInteger(s.percentage)).toBe(true);
      expect(s.percentage).toBeGreaterThanOrEqual(0);
      expect(s.percentage).toBeLessThanOrEqual(100);
    }
  });

  it('el año del timeline es bilingüe y el último está traducido', () => {
    // La razón de que la columna sea jsonb y no text.
    const ultimo = filas.hitos.at(-1)!;
    expect(ultimo.year.es).not.toBe(ultimo.year.en);
  });

  it('falla en voz alta si el timeline se desalinea entre idiomas', () => {
    expect(() =>
      construirHitos(
        [{ year: '2020', title: 'A', description: 'd', iconKey: 'Code2' }],
        [],
      ),
    ).toThrow(/no está alineado/);
  });
});

describe('SQL generado', () => {
  const sql = sqlDelSeed(construirFilasDelSeed());

  it('va en una transacción', () => {
    expect(sql).toMatch(/^-- /);
    expect(sql).toContain('\nbegin;\n');
    expect(sql.trimEnd().endsWith('commit;')).toBe(true);
  });

  it('todo es upsert: ninguna sentencia borra filas', () => {
    expect(sql).not.toMatch(/\bdelete\s+from\b/i);
    expect(sql).not.toMatch(/\btruncate\b/i);
    expect(sql).not.toMatch(/\bdrop\s+table\b/i);
  });

  it('cada tabla usa su clave de conflicto real', () => {
    expect(sql).toMatch(/insert into public\.portfolio_projects[\s\S]*?on conflict \(slug\)/);
    expect(sql).toMatch(/insert into public\.portfolio_technologies[\s\S]*?on conflict \(name\)/);
    expect(sql).toMatch(/insert into public\.portfolio_profile[\s\S]*?on conflict \(section\)/);
  });

  it('las categorías de educación van antes que sus ítems', () => {
    // Los ítems resuelven su category_id con un subselect por slug: si el
    // orden se invirtiera, insertarían null y violarían el not null.
    expect(sql.indexOf('portfolio_education_categories')).toBeLessThan(
      sql.indexOf('insert into public.portfolio_education_items'),
    );
  });

  it('los ítems resuelven la categoría en SQL, no con un UUID inventado', () => {
    expect(sql).toContain(
      'select id from public.portfolio_education_categories where slug =',
    );
  });

  it('no deja ninguna comilla simple sin escapar', () => {
    // Cada línea de valores debe tener un número par de comillas simples.
    const lineas = sql.split('\n').filter((l) => l.startsWith('  ('));
    const impares = lineas.filter((l) => (l.match(/'/g) ?? []).length % 2 !== 0);
    expect(impares).toEqual([]);
  });
});
