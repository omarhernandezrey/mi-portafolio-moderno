/**
 * Validación compartida de los módulos de contenido (T-09 la establece).
 */
import { projectCreateSchema, projectUpdateSchema, reorderSchema, slugSchema } from '@/lib/portfolio/schemas';

describe('slugSchema', () => {
  it('acepta minúsculas, números y guiones', () => {
    expect(slugSchema.safeParse('mi-portafolio-moderno-2').success).toBe(true);
  });

  it('rechaza mayúsculas, espacios o guion bajo', () => {
    expect(slugSchema.safeParse('Mi-Proyecto').success).toBe(false);
    expect(slugSchema.safeParse('mi proyecto').success).toBe(false);
    expect(slugSchema.safeParse('mi_proyecto').success).toBe(false);
  });

  it('rechaza vacío', () => {
    expect(slugSchema.safeParse('').success).toBe(false);
  });
});

describe('projectCreateSchema', () => {
  const base = {
    slug: 'portafolio',
    title: { es: 'Portafolio' },
    description: { es: 'Mi sitio personal' },
  };

  it('acepta el mínimo válido y rellena los valores por omisión', () => {
    const resultado = projectCreateSchema.safeParse(base);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.technologies).toEqual([]);
      expect(resultado.data.repository).toBe('');
      expect(resultado.data.demo).toBe('');
      expect(resultado.data.is_published).toBe(true);
    }
  });

  it('exige el título y la descripción en español', () => {
    const sinTitulo = projectCreateSchema.safeParse({ ...base, title: { es: '' } });
    expect(sinTitulo.success).toBe(false);
  });

  it('el inglés es opcional en los campos bilingües', () => {
    const resultado = projectCreateSchema.safeParse({
      ...base,
      title: { es: 'Portafolio', en: 'Portfolio' },
    });
    expect(resultado.success).toBe(true);
  });

  it('rechaza un slug inválido', () => {
    expect(projectCreateSchema.safeParse({ ...base, slug: 'Con Espacios' }).success).toBe(false);
  });

  it('rechaza una URL de demo que no es http(s)', () => {
    expect(projectCreateSchema.safeParse({ ...base, demo: 'ftp://x.com' }).success).toBe(false);
  });

  it('acepta demo vacío (no todos los proyectos tienen demo en vivo)', () => {
    expect(projectCreateSchema.safeParse({ ...base, demo: '' }).success).toBe(true);
  });

  it('acepta una lista de tecnologías, con o sin icono conocido', () => {
    const resultado = projectCreateSchema.safeParse({ ...base, technologies: ['React', 'UnaLibreríaNueva'] });
    expect(resultado.success).toBe(true);
    if (resultado.success) expect(resultado.data.technologies).toEqual(['React', 'UnaLibreríaNueva']);
  });
});

describe('projectUpdateSchema', () => {
  it('todo es opcional: un objeto vacío es válido (el handler decide si hay algo que actualizar)', () => {
    expect(projectUpdateSchema.safeParse({}).success).toBe(true);
  });

  it('un objeto vacío se queda vacío: no rellena is_published/technologies/demo con sus valores de creación', () => {
    // Bug real atrapado por este test: `.partial()` sobre un campo con
    // `.default()` NO lo omite cuando falta en el cuerpo, lo rellena con el
    // valor por omisión igual. Si `projectUpdateSchema` heredara los
    // `.default()` de `projectCreateSchema`, un PATCH que solo toca el
    // título habría repoblicado el proyecto (is_published: true) y vaciado
    // su lista de tecnologías (technologies: []) sin que nadie lo pidiera.
    const resultado = projectUpdateSchema.safeParse({ title: { es: 'Nuevo título' } });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(Object.keys(resultado.data)).toEqual(['title']);
      expect(resultado.data.is_published).toBeUndefined();
      expect(resultado.data.technologies).toBeUndefined();
      expect(resultado.data.demo).toBeUndefined();
    }
  });

  it('un campo presente sigue validándose con las mismas reglas', () => {
    expect(projectUpdateSchema.safeParse({ slug: 'Inválido Slug' }).success).toBe(false);
    expect(projectUpdateSchema.safeParse({ slug: 'valido-123' }).success).toBe(true);
  });

  it('actualizar solo is_published no exige título ni descripción', () => {
    expect(projectUpdateSchema.safeParse({ is_published: false }).success).toBe(true);
  });
});

describe('reorderSchema', () => {
  it('acepta una lista de uuids', () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000';
    expect(reorderSchema.safeParse({ ids: [uuid] }).success).toBe(true);
  });

  it('rechaza la lista vacía', () => {
    expect(reorderSchema.safeParse({ ids: [] }).success).toBe(false);
  });

  it('rechaza ids que no son uuid', () => {
    expect(reorderSchema.safeParse({ ids: ['no-es-un-uuid'] }).success).toBe(false);
  });
});
