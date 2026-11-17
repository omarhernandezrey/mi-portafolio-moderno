/**
 * `gatherCvData` (T-22): arma el CV solo con datos ya reales de
 * `repository.ts` — nada se inventa aquí, solo se selecciona y ordena.
 */
const mockGetSkills = jest.fn();
const mockGetProjects = jest.fn();
const mockGetBadges = jest.fn();
jest.mock('@/lib/portfolio/repository', () => ({
  getSkills: () => mockGetSkills(),
  getProjects: () => mockGetProjects(),
  getBadges: () => mockGetBadges(),
}));

import { gatherCvData } from '@/lib/cv/gatherCvData';

function skill(nombreEs: string, porcentaje: string) {
  return {
    name: { es: nombreEs, en: `${nombreEs}-en` },
    percentage: porcentaje,
    colorHex: '#000',
    icon: '',
    description: { es: '', en: '' },
    category: { es: '', en: '' },
  };
}

function proyecto(n: number) {
  return {
    title: { es: `Proyecto ${n}`, en: `Project ${n}` },
    description: { es: `Descripción ${n}`, en: `Description ${n}` },
    technologies: ['React'],
    repository: '',
    demo: '',
    category: { es: '', en: '' },
  };
}

function curso(n: number) {
  return {
    id: `c${n}`,
    title: { es: `Curso ${n}`, en: `Course ${n}` },
    institution: { es: `Institución ${n}`, en: `Institution ${n}` },
    summary: { es: '', en: '' },
    logo: '',
  };
}

beforeEach(() => {
  mockGetSkills.mockReset();
  mockGetProjects.mockReset();
  mockGetBadges.mockReset();
  mockGetSkills.mockResolvedValue([]);
  mockGetProjects.mockResolvedValue([]);
  mockGetBadges.mockResolvedValue([]);
});

describe('gatherCvData', () => {
  it('el titular siempre es "Ingeniero de Software" (lo exige la ficha de T-22, no el jobTitle SEO)', async () => {
    const datos = await gatherCvData();
    expect(datos.titular).toBe('Ingeniero de Software');
  });

  it('ordena las skills de mayor a menor porcentaje real', async () => {
    mockGetSkills.mockResolvedValue([skill('CSS', '60%'), skill('React', '95%'), skill('Node', '80%')]);
    const datos = await gatherCvData();
    expect(datos.skills.map((s) => s.nombre)).toEqual(['React', 'Node', 'CSS']);
    expect(datos.skills[0].porcentaje).toBe(95);
  });

  it('nunca manda más de 10 skills, aunque haya más', async () => {
    mockGetSkills.mockResolvedValue(Array.from({ length: 15 }, (_, i) => skill(`S${i}`, `${50 + i}%`)));
    const datos = await gatherCvData();
    expect(datos.skills.length).toBeLessThanOrEqual(10);
  });

  it('nunca manda más de 6 proyectos, y respeta el orden real (position) sin reordenar', async () => {
    mockGetProjects.mockResolvedValue(Array.from({ length: 22 }, (_, i) => proyecto(i)));
    const datos = await gatherCvData();
    expect(datos.proyectos).toHaveLength(6);
    expect(datos.proyectos[0].titulo).toBe('Proyecto 0');
    expect(datos.proyectos[5].titulo).toBe('Proyecto 5');
  });

  it('los cursos destacados pasan todos (ya son un conjunto curado y pequeño)', async () => {
    mockGetBadges.mockResolvedValue(Array.from({ length: 8 }, (_, i) => curso(i)));
    const datos = await gatherCvData();
    expect(datos.cursos).toHaveLength(8);
  });

  it('en inglés usa el campo "en" de cada dato bilingüe', async () => {
    mockGetSkills.mockResolvedValue([skill('React', '90%')]);
    mockGetProjects.mockResolvedValue([proyecto(1)]);
    const datos = await gatherCvData('en');
    expect(datos.skills[0].nombre).toBe('React-en');
    expect(datos.proyectos[0].titulo).toBe('Project 1');
  });

  it('sin datos: listas vacías, no lanza', async () => {
    const datos = await gatherCvData();
    expect(datos.skills).toEqual([]);
    expect(datos.proyectos).toEqual([]);
    expect(datos.cursos).toEqual([]);
  });
});
