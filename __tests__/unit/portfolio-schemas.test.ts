/**
 * Validación compartida de los módulos de contenido (T-09 la establece).
 */
import {
  badgeCreateSchema,
  badgeUpdateSchema,
  educationCategoryCreateSchema,
  educationCategoryUpdateSchema,
  educationItemCreateSchema,
  educationItemUpdateSchema,
  interestsContentSchema,
  projectCreateSchema,
  projectUpdateSchema,
  reorderSchema,
  serviceCreateSchema,
  serviceUpdateSchema,
  skillCreateSchema,
  skillUpdateSchema,
  slugSchema,
  technologyCreateSchema,
  technologyUpdateSchema,
  timelineCreateSchema,
  timelineUpdateSchema,
} from '@/lib/portfolio/schemas';

const UUID_VALIDA = '123e4567-e89b-12d3-a456-426614174000';

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

describe('skillCreateSchema', () => {
  const base = { slug: 'react', name: { es: 'React' }, percentage: 90 };

  it('acepta el mínimo válido y rellena los valores por omisión', () => {
    const resultado = skillCreateSchema.safeParse(base);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.color_hex).toBe('');
      expect(resultado.data.icon).toBe('');
      expect(resultado.data.is_published).toBe(true);
    }
  });

  it('exige el nombre en español', () => {
    expect(skillCreateSchema.safeParse({ ...base, name: { es: '' } }).success).toBe(false);
  });

  it('percentage es obligatorio y entero entre 0 y 100', () => {
    expect(skillCreateSchema.safeParse({ slug: 'react', name: { es: 'React' } }).success).toBe(false);
    expect(skillCreateSchema.safeParse({ ...base, percentage: 101 }).success).toBe(false);
    expect(skillCreateSchema.safeParse({ ...base, percentage: -1 }).success).toBe(false);
    expect(skillCreateSchema.safeParse({ ...base, percentage: 50.5 }).success).toBe(false);
    expect(skillCreateSchema.safeParse({ ...base, percentage: 0 }).success).toBe(true);
    expect(skillCreateSchema.safeParse({ ...base, percentage: 100 }).success).toBe(true);
  });

  it('color_hex vacío es válido; si no está vacío, exige 6 dígitos hex', () => {
    expect(skillCreateSchema.safeParse({ ...base, color_hex: '' }).success).toBe(true);
    expect(skillCreateSchema.safeParse({ ...base, color_hex: '#00cba9' }).success).toBe(true);
    expect(skillCreateSchema.safeParse({ ...base, color_hex: 'teal' }).success).toBe(false);
    expect(skillCreateSchema.safeParse({ ...base, color_hex: '#fff' }).success).toBe(false);
  });

  it('icon acepta cualquier ruta, incluida vacía', () => {
    expect(skillCreateSchema.safeParse({ ...base, icon: '/images/logos/react.svg' }).success).toBe(true);
    expect(skillCreateSchema.safeParse({ ...base, icon: '' }).success).toBe(true);
  });
});

describe('skillUpdateSchema', () => {
  it('todo es opcional: un objeto vacío es válido', () => {
    expect(skillUpdateSchema.safeParse({}).success).toBe(true);
  });

  it('un objeto vacío se queda vacío: no rellena color_hex/icon/is_published con sus valores de creación', () => {
    const resultado = skillUpdateSchema.safeParse({ percentage: 75 });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(Object.keys(resultado.data)).toEqual(['percentage']);
      expect(resultado.data.color_hex).toBeUndefined();
      expect(resultado.data.icon).toBeUndefined();
      expect(resultado.data.is_published).toBeUndefined();
    }
  });

  it('un percentage presente sigue validándose con las mismas reglas', () => {
    expect(skillUpdateSchema.safeParse({ percentage: 150 }).success).toBe(false);
    expect(skillUpdateSchema.safeParse({ percentage: 42 }).success).toBe(true);
  });
});

describe('educationCategoryCreateSchema / educationCategoryUpdateSchema', () => {
  it('acepta el mínimo válido y publica por omisión', () => {
    const resultado = educationCategoryCreateSchema.safeParse({ slug: 'certificaciones', name: { es: 'Certificaciones' } });
    expect(resultado.success).toBe(true);
    if (resultado.success) expect(resultado.data.is_published).toBe(true);
  });

  it('exige el nombre en español', () => {
    expect(educationCategoryCreateSchema.safeParse({ slug: 'x', name: { es: '' } }).success).toBe(false);
  });

  it('actualizar vacío se queda vacío (no rellena is_published)', () => {
    const resultado = educationCategoryUpdateSchema.safeParse({ slug: 'otro-slug' });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(Object.keys(resultado.data)).toEqual(['slug']);
      expect(resultado.data.is_published).toBeUndefined();
    }
  });
});

describe('educationItemCreateSchema / educationItemUpdateSchema', () => {
  const base = { category_id: UUID_VALIDA, slug: 'curso-1', title: { es: 'Curso 1' } };

  it('acepta el mínimo válido y rellena los valores por omisión', () => {
    const resultado = educationItemCreateSchema.safeParse(base);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.logo).toBe('');
      expect(resultado.data.certificate_url).toBe('');
      expect(resultado.data.is_new).toBe(false);
      expect(resultado.data.is_published).toBe(true);
    }
  });

  it('category_id debe ser un uuid', () => {
    expect(educationItemCreateSchema.safeParse({ ...base, category_id: 'no-es-uuid' }).success).toBe(false);
  });

  it('logo/certificate_url vacíos son válidos', () => {
    expect(educationItemCreateSchema.safeParse({ ...base, logo: '', certificate_url: '' }).success).toBe(true);
  });

  it('logo/certificate_url de un dominio permitido son válidos', () => {
    const resultado = educationItemCreateSchema.safeParse({
      ...base,
      logo: 'https://images.unsplash.com/foto.jpg',
      certificate_url: 'https://ozftxfwkhomnbvicjtae.supabase.co/storage/v1/object/public/portfolio-media/x.png',
    });
    expect(resultado.success).toBe(true);
  });

  it('logo/certificate_url de un dominio NO permitido se rechazan', () => {
    expect(educationItemCreateSchema.safeParse({ ...base, logo: 'https://un-sitio-cualquiera.com/logo.png' }).success).toBe(false);
  });

  it('acepta logo_data_url/certificate_data_url como campos de transporte', () => {
    const resultado = educationItemCreateSchema.safeParse({ ...base, logo_data_url: 'data:image/png;base64,AAAA' });
    expect(resultado.success).toBe(true);
  });

  it('actualizar vacío se queda vacío (no rellena is_new/is_published/logo con los valores de creación)', () => {
    const resultado = educationItemUpdateSchema.safeParse({ title: { es: 'Nuevo título' } });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(Object.keys(resultado.data)).toEqual(['title']);
      expect(resultado.data.is_new).toBeUndefined();
      expect(resultado.data.is_published).toBeUndefined();
      expect(resultado.data.logo).toBeUndefined();
    }
  });
});

describe('badgeCreateSchema / badgeUpdateSchema', () => {
  const base = { slug: 'credly-badge', title: { es: 'Badge de Credly' } };

  it('acepta el mínimo válido y rellena los valores por omisión', () => {
    const resultado = badgeCreateSchema.safeParse(base);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.is_new).toBe(false);
      expect(resultado.data.is_published).toBe(true);
    }
  });

  it('no exige category_id (las insignias no tienen categoría, a diferencia de los cursos)', () => {
    expect(badgeCreateSchema.safeParse(base).success).toBe(true);
  });

  it('logo de un dominio no permitido se rechaza', () => {
    expect(badgeCreateSchema.safeParse({ ...base, logo: 'https://otro-dominio.net/x.png' }).success).toBe(false);
  });

  it('actualizar vacío se queda vacío', () => {
    const resultado = badgeUpdateSchema.safeParse({ is_new: true });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(Object.keys(resultado.data)).toEqual(['is_new']);
      expect(resultado.data.is_published).toBeUndefined();
    }
  });
});

describe('serviceCreateSchema / serviceUpdateSchema', () => {
  const base = { slug: 'sitios-web', title: { es: 'Sitios Web' } };

  it('acepta el mínimo válido y rellena los valores por omisión', () => {
    const resultado = serviceCreateSchema.safeParse(base);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.icon).toBe('');
      expect(resultado.data.price_min).toBeNull();
      expect(resultado.data.is_published).toBe(true);
    }
  });

  it('acepta features bilingües', () => {
    const resultado = serviceCreateSchema.safeParse({ ...base, features: { es: ['Rápido', 'SEO'], en: ['Fast', 'SEO'] } });
    expect(resultado.success).toBe(true);
  });

  it('price_min negativo se rechaza', () => {
    expect(serviceCreateSchema.safeParse({ ...base, price_min: -5 }).success).toBe(false);
  });

  it('actualizar vacío se queda vacío (no rellena price_min/is_published con los valores de creación)', () => {
    const resultado = serviceUpdateSchema.safeParse({ badge: 'WEB' });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(Object.keys(resultado.data)).toEqual(['badge']);
      expect(resultado.data.price_min).toBeUndefined();
      expect(resultado.data.is_published).toBeUndefined();
    }
  });
});

describe('technologyCreateSchema / technologyUpdateSchema', () => {
  it('acepta el mínimo válido (solo name es obligatorio)', () => {
    const resultado = technologyCreateSchema.safeParse({ name: 'React' });
    expect(resultado.success).toBe(true);
    if (resultado.success) expect(resultado.data.is_published).toBe(true);
  });

  it('icon_key debe existir en el registro', () => {
    expect(technologyCreateSchema.safeParse({ name: 'React', icon_key: 'FaReact' }).success).toBe(true);
    expect(technologyCreateSchema.safeParse({ name: 'React', icon_key: 'NoExiste123' }).success).toBe(false);
  });

  it('no tiene slug: name es la identidad', () => {
    const resultado = technologyCreateSchema.safeParse({ name: 'Vue.js' });
    expect(resultado.success).toBe(true);
    if (resultado.success) expect('slug' in resultado.data).toBe(false);
  });

  it('actualizar vacío se queda vacío', () => {
    const resultado = technologyUpdateSchema.safeParse({ category: 'Frontend' });
    expect(resultado.success).toBe(true);
    if (resultado.success) expect(Object.keys(resultado.data)).toEqual(['category']);
  });
});

describe('timelineCreateSchema / timelineUpdateSchema', () => {
  const base = { slug: 'hito-1', year: { es: '2024' }, title: { es: 'Primer hito' } };

  it('acepta el mínimo válido', () => {
    expect(timelineCreateSchema.safeParse(base).success).toBe(true);
  });

  it('year es bilingüe igual que title (el hito "Presente" traduce el año)', () => {
    const resultado = timelineCreateSchema.safeParse({ ...base, year: { es: '2025 - Presente', en: '2025 - Present' } });
    expect(resultado.success).toBe(true);
  });

  it('icon_key inválido se rechaza', () => {
    expect(timelineCreateSchema.safeParse({ ...base, icon_key: 'NoExiste' }).success).toBe(false);
    expect(timelineCreateSchema.safeParse({ ...base, icon_key: 'Sparkles' }).success).toBe(true);
  });
});

describe('interestsContentSchema (perfil → solo `interests`)', () => {
  it('acepta una lista de intereses válida', () => {
    const resultado = interestsContentSchema.safeParse({
      content: [{ title: 'Open Source', href: 'https://opensource.org/', iconKey: 'Globe' }],
    });
    expect(resultado.success).toBe(true);
    if (resultado.success) expect(resultado.data.is_published).toBe(true);
  });

  it('rechaza un href que no es una URL', () => {
    const resultado = interestsContentSchema.safeParse({
      content: [{ title: 'x', href: 'no-es-una-url', iconKey: 'Globe' }],
    });
    expect(resultado.success).toBe(false);
  });

  it('rechaza un iconKey que no existe en el registro', () => {
    const resultado = interestsContentSchema.safeParse({
      content: [{ title: 'x', href: 'https://x.com', iconKey: 'NoExiste' }],
    });
    expect(resultado.success).toBe(false);
  });

  it('una lista vacía es válida (quitar todos los intereses es una operación legítima)', () => {
    expect(interestsContentSchema.safeParse({ content: [] }).success).toBe(true);
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
