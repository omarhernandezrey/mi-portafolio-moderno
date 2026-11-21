/**
 * Topes de las consultas que crecían sin límite (auditoría de backend,
 * grupo "escala"). Hoy ninguna duele —41 leads, 1 versión, 0 cronómetros—,
 * así que esto es prevención: lo que se fija aquí es que el tope EXISTE y
 * que una lista recortada no se presenta como si fuera completa.
 *
 * El caso con más fondo es `portfolio/versions`: cada fila de
 * `content_versions` lleva dos fotos completas de la fila versionada
 * (`before` y `after`), y la tabla crece con cada alta, edición y borrado
 * de los 9 recursos del portafolio. La lista ya no devuelve esas fotos: la
 * ruta de restaurar lee la fila entera por su id cuando de verdad hace
 * falta.
 */
const mockFrom = jest.fn();
jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: { from: (...a: unknown[]) => mockFrom(...a) },
}));

const mockRequireAdmin = jest.fn();
jest.mock('@/lib/admin/auth', () => ({
  requireAdmin: (...a: unknown[]) => mockRequireAdmin(...a),
}));

import { NextRequest } from 'next/server';
import { GET as listarVersiones } from '@/app/api/admin/portfolio/versions/route';
import { GET as listarLeads } from '@/app/api/admin/leads/list/route';

/** Registra con qué argumentos se llamó cada eslabón de la cadena. */
function cadena(resultado: { data: unknown[]; error: unknown; count?: number }) {
  const llamadas: Record<string, unknown[]> = {};
  const self: Record<string, unknown> = {};
  for (const m of ['select', 'eq', 'order', 'gte', 'not', 'is', 'in']) {
    self[m] = jest.fn((...args: unknown[]) => {
      llamadas[m] = args;
      return self;
    });
  }
  self.limit = jest.fn((...args: unknown[]) => {
    llamadas.limit = args;
    return Promise.resolve(resultado);
  });
  self.then = (resolve: (v: unknown) => unknown) => Promise.resolve(resultado).then(resolve);
  return { self, llamadas };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockRequireAdmin.mockResolvedValue({
    ok: true, user: { id: 'u1' }, role: 'owner', email: 'o@test.com', actor: { userId: 'u1' },
  });
});

describe('GET /api/admin/portfolio/versions', () => {
  function pedir(qs = '?resourceType=portfolio_project&resourceId=p1') {
    return new NextRequest(`http://localhost/api/admin/portfolio/versions${qs}`);
  }

  it('acota la consulta con un límite por defecto', async () => {
    const { self, llamadas } = cadena({ data: [], error: null, count: 0 });
    mockFrom.mockReturnValue(self);

    await listarVersiones(pedir());

    expect(llamadas.limit).toEqual([50]);
  });

  it('NO devuelve las fotos before/after: eran el grueso de los bytes', async () => {
    const { self, llamadas } = cadena({ data: [], error: null, count: 0 });
    mockFrom.mockReturnValue(self);

    await listarVersiones(pedir());

    const columnas = String(llamadas.select?.[0]);
    expect(columnas).not.toContain('*');
    expect(columnas).not.toContain('before');
    expect(columnas).not.toContain('after');
    // Pero sí lo necesario para pintar "qué pasó y cuándo".
    expect(columnas).toContain('action');
    expect(columnas).toContain('created_at');
    expect(columnas).toContain('actor_email');
  });

  it('respeta un límite menor pedido por el cliente', async () => {
    const { self, llamadas } = cadena({ data: [], error: null, count: 0 });
    mockFrom.mockReturnValue(self);

    await listarVersiones(pedir('?resourceType=portfolio_project&resourceId=p1&limit=10'));

    expect(llamadas.limit).toEqual([10]);
  });

  it('no deja que el cliente se salte el tope pidiendo un límite enorme', async () => {
    const { self, llamadas } = cadena({ data: [], error: null, count: 0 });
    mockFrom.mockReturnValue(self);

    await listarVersiones(pedir('?resourceType=portfolio_project&resourceId=p1&limit=999999'));

    expect(llamadas.limit).toEqual([200]);
  });

  it('un límite absurdo cae al valor por defecto en vez de romper', async () => {
    const { self, llamadas } = cadena({ data: [], error: null, count: 0 });
    mockFrom.mockReturnValue(self);

    await listarVersiones(pedir('?resourceType=portfolio_project&resourceId=p1&limit=abc'));

    expect(llamadas.limit).toEqual([50]);
  });

  it('avisa de que la lista va truncada en vez de hacerla pasar por completa', async () => {
    const { self } = cadena({ data: [{ id: 'v1' }], error: null, count: 87 });
    mockFrom.mockReturnValue(self);

    const res = await listarVersiones(pedir());

    expect(res.headers.get('X-Total-Count')).toBe('87');
    expect(res.headers.get('X-Truncated')).toBe('true');
  });

  it('cuando cabe entera, no dice que esté truncada', async () => {
    const { self } = cadena({ data: [{ id: 'v1' }, { id: 'v2' }], error: null, count: 2 });
    mockFrom.mockReturnValue(self);

    const res = await listarVersiones(pedir());

    expect(res.headers.get('X-Truncated')).toBe('false');
  });
});

describe('GET /api/admin/leads/list', () => {
  it('acota la lista del desplegable', async () => {
    const { self, llamadas } = cadena({ data: [], error: null, count: 0 });
    mockFrom.mockReturnValue(self);

    await listarLeads();

    expect(llamadas.limit).toEqual([500]);
  });

  it('sigue devolviendo un ARRAY: tres desplegables hacen Array.isArray()', async () => {
    // Envolverlo en un objeto los dejaría vacíos sin ningún error visible.
    const { self } = cadena({ data: [{ id: 'l1', name: 'Ana' }], error: null, count: 1 });
    mockFrom.mockReturnValue(self);

    const res = await listarLeads();
    const cuerpo = await res.json();

    expect(Array.isArray(cuerpo)).toBe(true);
    expect(cuerpo).toHaveLength(1);
  });

  it('cuando hay más de los que caben, lo dice en las cabeceras y avisa en consola', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { self } = cadena({ data: [{ id: 'l1' }], error: null, count: 900 });
    mockFrom.mockReturnValue(self);

    const res = await listarLeads();

    expect(res.headers.get('X-Total-Count')).toBe('900');
    expect(res.headers.get('X-Truncated')).toBe('true');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('buscador'));
    warn.mockRestore();
  });
});
