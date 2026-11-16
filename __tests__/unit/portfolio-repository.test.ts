/**
 * Tests de la capa de lectura del portafolio (T-06).
 *
 * `unstable_cache` necesita el runtime de Next.js (etiquetas de caché,
 * `cacheLife`…), que no existe en Jest con `testEnvironment: 'node'` puro.
 * Por eso cada `getX()` público se mockea para que llame directamente a su
 * `leerX()` sin pasar por la caché: lo que se prueba es la lógica de lectura,
 * mapeo y respaldo, no el motor de caché de Next (eso lo cubre quien use la
 * función en una ruta real).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

jest.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

jest.mock('@/lib/supabase/public', () => ({
  crearClientePublico: jest.fn(),
}));

import { projectsData } from '@/lib/projectsData';
import { skillsData } from '@/lib/skillsData';
import { educationData } from '@/lib/educationData';
import { servicesData } from '@/lib/servicesData';
import { highlightedCoursesData } from '@/lib/portfolio/source/badges';
import { marqueeTechnologies } from '@/lib/portfolio/source/technologies';
import { timelineEs, timelineEn } from '@/lib/portfolio/source/timeline';
import { construirProyectos } from '@/lib/portfolio/seed/build';
import {
  getBadges,
  getEducation,
  getProjects,
  getServices,
  getSkills,
  getTechnologies,
  getTimeline,
  getProfileSection,
  leerEducacion,
  leerInsignias,
  leerProyectos,
  leerServicios,
  leerSeccionPerfil,
  leerSkills,
  leerTecnologias,
  leerTimeline,
  type ClientePortafolio,
} from '@/lib/portfolio/repository';

/** Cliente simulado: una tabla por respuesta, cada una con sus filas o su error. */
function clienteFalso(
  respuestas: Record<string, { data: unknown[] | unknown | null; error: { message: string } | null }>,
): { cliente: ClientePortafolio; llamadasOrder: Array<{ tabla: string; columna: string; opciones: unknown }> } {
  const llamadasOrder: Array<{ tabla: string; columna: string; opciones: unknown }> = [];
  const cliente = {
    from(tabla: string) {
      const resultado = respuestas[tabla] ?? { data: [], error: null };
      const encadenable = {
        select: () => encadenable,
        eq: () => encadenable,
        order: (columna: string, opciones: unknown) => {
          llamadasOrder.push({ tabla, columna, opciones });
          return Promise.resolve({ data: resultado.data, error: resultado.error });
        },
        maybeSingle: () =>
          Promise.resolve({
            data: Array.isArray(resultado.data) ? resultado.data[0] ?? null : resultado.data,
            error: resultado.error,
          }),
      };
      return encadenable;
    },
  };
  return { cliente: cliente as unknown as ClientePortafolio, llamadasOrder };
}

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('getX() públicas: sin variables de Supabase, el sitio no se queda en blanco', () => {
  // `crearClientePublico()` revienta de forma SÍNCRONA si faltan las variables
  // (así se comporta `createClient('', '')` de supabase-js). Esto es,
  // literalmente, "sin variables de Supabase": se mockea el módulo entero en
  // vez de borrar variables de entorno porque Jest ya corre con un
  // `.env.local` de pruebas cargado por `next/jest`.
  beforeEach(() => {
    const { crearClientePublico } = jest.requireMock('@/lib/supabase/public') as {
      crearClientePublico: jest.Mock;
    };
    crearClientePublico.mockImplementation(() => {
      throw new Error('supabaseUrl is required.');
    });
  });

  it('cada get* cae a su contenido de origen en vez de propagar el error', async () => {
    expect(await getProjects()).toBe(projectsData);
    expect(await getSkills()).toBe(skillsData);
    expect(await getServices()).toBe(servicesData);
    expect(await getBadges()).toBe(highlightedCoursesData);
    expect(await getTechnologies()).toBe(marqueeTechnologies);
    expect(await getEducation()).toBe(educationData);
    expect(await getTimeline()).toEqual({ es: timelineEs, en: timelineEn });
    expect(await getProfileSection('interests', 'respaldo')).toBe('respaldo');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('supabaseUrl is required'));
  });
});

describe('leerProyectos', () => {
  const filaBase = (f: ReturnType<typeof construirProyectos>[number]) => ({
    ...f,
    id: `id-${f.position}`,
    is_published: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    image_url: null,
    demo_embeddable: true,
    demo_checked_at: null,
  });

  it('con la base poblada por el seed, la salida es idéntica a projectsData (los 22)', async () => {
    const filas = construirProyectos().map(filaBase);
    const { cliente } = clienteFalso({ portfolio_projects: { data: filas, error: null } });
    const resultado = await leerProyectos(cliente);
    expect(resultado).toHaveLength(22);
    expect(resultado).toEqual(projectsData);
  });

  it('una fila real se mapea a la forma de Project (campos opcionales incluidos)', async () => {
    const [primera] = construirProyectos();
    const { cliente } = clienteFalso({ portfolio_projects: { data: [filaBase(primera)], error: null } });
    const [proyecto] = await leerProyectos(cliente);
    expect(proyecto).toEqual(projectsData[0]);
    expect(proyecto.features).toEqual(projectsData[0].features);
  });

  it('pide la tabla ordenada por position ascendente', async () => {
    const { cliente, llamadasOrder } = clienteFalso({ portfolio_projects: { data: [], error: null } });
    await leerProyectos(cliente);
    expect(llamadasOrder).toEqual([
      { tabla: 'portfolio_projects', columna: 'position', opciones: { ascending: true } },
    ]);
  });

  it('si la consulta falla, devuelve projectsData y no inventa nada', async () => {
    const { cliente } = clienteFalso({
      portfolio_projects: { data: null, error: { message: 'conexión rechazada' } },
    });
    expect(await leerProyectos(cliente)).toBe(projectsData);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('conexión rechazada'));
  });

  it('si la consulta responde 0 filas, también cae al respaldo (y lo distingue del error)', async () => {
    const { cliente } = clienteFalso({ portfolio_projects: { data: [], error: null } });
    expect(await leerProyectos(cliente)).toBe(projectsData);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('0 filas'));
  });
});

describe('leerSkills', () => {
  const fila = {
    id: 'id-0',
    position: 0,
    is_published: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    slug: 'html5',
    name: { es: 'HTML5', en: 'HTML5' },
    percentage: 95,
    color_hex: '#FF6D00',
    icon: '/images/logos/html.svg',
    description: { es: 'Estructuras semánticas.', en: 'Semantic structures.' },
    category: { es: 'Frontend', en: 'Frontend' },
  };

  it('reconstruye el "%" a partir del entero de la columna', async () => {
    const { cliente } = clienteFalso({ portfolio_skills: { data: [fila], error: null } });
    const [skill] = await leerSkills(cliente);
    expect(skill.percentage).toBe('95%');
    expect(skill.colorHex).toBe('#FF6D00');
    expect(skill.icon).toBe('/images/logos/html.svg');
  });

  it('error → respaldo skillsData; 0 filas → también', async () => {
    const { cliente: conError } = clienteFalso({ portfolio_skills: { data: null, error: { message: 'x' } } });
    expect(await leerSkills(conError)).toBe(skillsData);
    const { cliente: vacio } = clienteFalso({ portfolio_skills: { data: [], error: null } });
    expect(await leerSkills(vacio)).toBe(skillsData);
  });
});

describe('leerServicios', () => {
  it('con precio nulo, priceRange queda undefined (no {min:null,...})', async () => {
    const fila = {
      id: 'id-0',
      position: 0,
      is_published: true,
      created_at: '',
      updated_at: '',
      slug: 'web',
      title: { es: 'Sitios Web', en: 'Websites' },
      description: { es: 'd', en: 'd' },
      icon: 'icon',
      badge: 'WEB',
      features: { es: ['uno'], en: ['one'] },
      gradient: 'g',
      price_min: null,
      price_max: null,
      price_currency: null,
    };
    const { cliente } = clienteFalso({ portfolio_services: { data: [fila], error: null } });
    const [servicio] = await leerServicios(cliente);
    expect(servicio.priceRange).toBeUndefined();
    expect(servicio.features).toEqual({ es: ['uno'], en: ['one'] });
  });

  it('error o 0 filas → servicesData', async () => {
    const { cliente } = clienteFalso({ portfolio_services: { data: [], error: null } });
    expect(await leerServicios(cliente)).toBe(servicesData);
  });
});

describe('leerInsignias', () => {
  it('usa certificate_url como alternativa cuando no hay certificate', async () => {
    const fila = {
      id: 'id-0',
      position: 0,
      is_published: true,
      created_at: '',
      updated_at: '',
      slug: 'curso-x',
      title: { es: 'Curso X', en: 'Course X' },
      institution: { es: 'Inst', en: 'Inst' },
      summary: { es: 's', en: 's' },
      logo: '/logo.svg',
      certificate: null,
      certificate_url: 'https://storage.example/cert.pdf',
      is_new: false,
    };
    const { cliente } = clienteFalso({ portfolio_badges: { data: [fila], error: null } });
    const [insignia] = await leerInsignias(cliente);
    expect(insignia.certificate).toBe('https://storage.example/cert.pdf');
    expect(insignia.id).toBe('curso-x');
  });

  it('error o 0 filas → highlightedCoursesData', async () => {
    const { cliente } = clienteFalso({ portfolio_badges: { data: null, error: { message: 'x' } } });
    expect(await leerInsignias(cliente)).toBe(highlightedCoursesData);
  });
});

describe('leerTecnologias', () => {
  it('conserva el nombre literal (identidad de los iconos)', async () => {
    const fila = {
      id: 'id-0',
      position: 0,
      is_published: true,
      created_at: '',
      updated_at: '',
      name: 'Swagger / OpenAPI',
      icon_key: 'FileJson',
      color: '#85EA2D',
      category: 'Backend',
    };
    const { cliente } = clienteFalso({ portfolio_technologies: { data: [fila], error: null } });
    const [tech] = await leerTecnologias(cliente);
    expect(tech.name).toBe('Swagger / OpenAPI');
    expect(tech.iconKey).toBe('FileJson');
  });

  it('error o 0 filas → marqueeTechnologies', async () => {
    const { cliente } = clienteFalso({ portfolio_technologies: { data: [], error: null } });
    expect(await leerTecnologias(cliente)).toBe(marqueeTechnologies);
  });
});

describe('leerEducacion', () => {
  it('agrupa los ítems bajo su categoría por category_id, en el orden de position', async () => {
    const categorias = [
      { id: 'cat-1', position: 0, is_published: true, created_at: '', updated_at: '', slug: 'universidad', name: { es: 'Universidad', en: 'University' } },
      { id: 'cat-2', position: 1, is_published: true, created_at: '', updated_at: '', slug: 'sena', name: { es: 'SENA', en: 'SENA' } },
    ];
    const items = [
      {
        id: 'it-1', position: 0, is_published: true, created_at: '', updated_at: '',
        category_id: 'cat-2', slug: 'curso-sena', title: { es: 'Curso SENA', en: 'SENA course' },
        institution: { es: 'SENA', en: 'SENA' }, duration: { es: '2022', en: '2022' },
        description: { es: 'd', en: 'd' }, logo: '', certificate: '/cert.png', certificate_url: null, is_new: false,
      },
      {
        id: 'it-0', position: 0, is_published: true, created_at: '', updated_at: '',
        category_id: 'cat-1', slug: 'ingenieria', title: { es: 'Ingeniería', en: 'Engineering' },
        institution: { es: 'Poli', en: 'Poli' }, duration: { es: '2026', en: '2026' },
        description: { es: 'd', en: 'd' }, logo: '', certificate: null, certificate_url: null, is_new: false,
      },
    ];
    const { cliente } = clienteFalso({
      portfolio_education_categories: { data: categorias, error: null },
      portfolio_education_items: { data: items, error: null },
    });
    const resultado = await leerEducacion(cliente);
    expect(resultado).toHaveLength(2);
    expect(resultado[0].category.es).toBe('Universidad');
    expect(resultado[0].items).toHaveLength(1);
    expect(resultado[0].items[0].title.es).toBe('Ingeniería');
    expect(resultado[1].items[0].title.es).toBe('Curso SENA');
  });

  it('error en cualquiera de las dos tablas → educationData', async () => {
    const { cliente } = clienteFalso({
      portfolio_education_categories: { data: null, error: { message: 'x' } },
      portfolio_education_items: { data: [], error: null },
    });
    expect(await leerEducacion(cliente)).toBe(educationData);
  });

  it('0 filas en cualquiera de las dos → educationData', async () => {
    const { cliente } = clienteFalso({
      portfolio_education_categories: { data: [{ id: 'c', position: 0 }], error: null },
      portfolio_education_items: { data: [], error: null },
    });
    expect(await leerEducacion(cliente)).toBe(educationData);
  });
});

describe('leerTimeline', () => {
  it('separa es/en y usa el idioma correcto en cada hito', async () => {
    const fila = {
      id: 'id-0', position: 0, is_published: true, created_at: '', updated_at: '',
      slug: 'presente', year: { es: '2025 - Presente', en: '2025 - Present' },
      title: { es: 'Hoy', en: 'Today' }, description: { es: 'd', en: 'd' }, icon_key: 'Rocket',
    };
    const { cliente } = clienteFalso({ portfolio_timeline: { data: [fila], error: null } });
    const resultado = await leerTimeline(cliente);
    expect(resultado.es[0].year).toBe('2025 - Presente');
    expect(resultado.en[0].year).toBe('2025 - Present');
  });

  it('error o 0 filas → timelineEs/timelineEn originales', async () => {
    const { cliente } = clienteFalso({ portfolio_timeline: { data: [], error: null } });
    const resultado = await leerTimeline(cliente);
    expect(resultado.es).toBe(timelineEs);
    expect(resultado.en).toBe(timelineEn);
  });
});

describe('leerSeccionPerfil', () => {
  it('devuelve el content de la fila publicada', async () => {
    const { cliente } = clienteFalso({
      portfolio_profile: { data: { id: 'p1', is_published: true, content: { a: 1 } }, error: null },
    });
    expect(await leerSeccionPerfil(cliente, 'interests', 'respaldo')).toEqual({ a: 1 });
  });

  it('sin fila, con error, o con content nulo → el respaldo recibido', async () => {
    const { cliente: sinFila } = clienteFalso({ portfolio_profile: { data: null, error: null } });
    expect(await leerSeccionPerfil(sinFila, 'interests', 'respaldo-1')).toBe('respaldo-1');

    const { cliente: conError } = clienteFalso({ portfolio_profile: { data: null, error: { message: 'x' } } });
    expect(await leerSeccionPerfil(conError, 'interests', 'respaldo-2')).toBe('respaldo-2');

    const { cliente: contentNulo } = clienteFalso({
      portfolio_profile: { data: { id: 'p', is_published: true, content: null }, error: null },
    });
    expect(await leerSeccionPerfil(contentNulo, 'interests', 'respaldo-3')).toBe('respaldo-3');
  });
});

describe('guardarraíl: el repositorio nunca usa service_role para leer contenido público', () => {
  it('no importa supabaseServer ni la clave de servicio (los comentarios que la nombran para explicar que no se usa no cuentan)', () => {
    const texto = readFileSync(join(process.cwd(), 'src/lib/portfolio/repository.ts'), 'utf8');
    const sinComentarios = texto.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    expect(sinComentarios).not.toMatch(/supabaseServer|SERVICE_ROLE/);
  });

  it('el cliente público se construye con la clave anon, no con la de servicio', () => {
    const texto = readFileSync(join(process.cwd(), 'src/lib/supabase/public.ts'), 'utf8');
    expect(texto).toMatch(/NEXT_PUBLIC_SUPABASE_ANON_KEY/);
    expect(texto).not.toMatch(/SERVICE_ROLE/);
  });
});
