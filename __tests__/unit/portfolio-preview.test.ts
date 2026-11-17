/**
 * `leerProyectosConBorradores` (T-18): la única función del portafolio que
 * lee con `service_role` — deliberadamente fuera de `repository.ts`, que
 * tiene su propio guardarraíl contra justo eso (ver
 * `portfolio-repository.test.ts`, "el repositorio nunca usa service_role").
 */
const mockFrom = jest.fn();
jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: { from: (...args: unknown[]) => mockFrom(...args) },
}));

import { construirProyectos } from '@/lib/portfolio/seed/build';
import { leerProyectosConBorradores } from '@/lib/portfolio/preview';

function mockTabla(data: unknown[] | null, error: { message: string } | null = null) {
  const encadenable = {
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockResolvedValue({ data, error }),
  };
  mockFrom.mockReturnValue(encadenable);
  return encadenable;
}

beforeEach(() => {
  mockFrom.mockReset();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('leerProyectosConBorradores', () => {
  it('incluye proyectos sin publicar (es justo para lo que existe)', async () => {
    const [primera] = construirProyectos();
    const filaBorrador = {
      ...primera,
      id: 'borrador-1',
      is_published: false,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
      image_url: null,
      demo_embeddable: true,
      demo_checked_at: null,
    };
    mockTabla([filaBorrador]);

    const resultado = await leerProyectosConBorradores();
    expect(resultado).toHaveLength(1);
    expect(resultado[0].title).toEqual(primera.title);
  });

  it('pide la tabla ordenada por position ascendente', async () => {
    const encadenable = mockTabla([]);
    await leerProyectosConBorradores();
    expect(encadenable.order).toHaveBeenCalledWith('position', { ascending: true });
  });

  it('si la consulta falla: lista vacía, sin respaldo a projectsData (esto no es la vía pública)', async () => {
    mockTabla(null, { message: 'conexión rechazada' });
    expect(await leerProyectosConBorradores()).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('conexión rechazada'));
  });

  it('sin filas: lista vacía, no lanza', async () => {
    mockTabla([]);
    expect(await leerProyectosConBorradores()).toEqual([]);
  });
});
