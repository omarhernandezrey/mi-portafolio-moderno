/**
 * `writeContentVersion` (T-18): escribe en `content_versions`. Igual que
 * `writeAuditLog`, nunca lanza — un fallo aquí no debe tirar abajo el
 * guardado real que lo originó.
 */
const mockInsert = jest.fn();
jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: { from: jest.fn(() => ({ insert: mockInsert })) },
}));

import { writeContentVersion, RECURSOS_VERSIONABLES } from '@/lib/admin/versions';

const ACTOR = { userId: 'u1', email: 'owner@test.com', role: 'owner' as const };

beforeEach(() => {
  mockInsert.mockReset();
  mockInsert.mockResolvedValue({ error: null });
});

describe('writeContentVersion', () => {
  it('inserta con la foto completa de antes y después', async () => {
    await writeContentVersion(ACTOR, {
      action: 'update',
      resourceType: 'portfolio_project',
      resourceId: 'p1',
      before: { title: 'Antes' },
      after: { title: 'Después' },
    });

    expect(mockInsert).toHaveBeenCalledWith({
      resource_type: 'portfolio_project',
      resource_id: 'p1',
      action: 'update',
      before: { title: 'Antes' },
      after: { title: 'Después' },
      actor_id: 'u1',
      actor_email: 'owner@test.com',
    });
  });

  it('un alta se guarda con before: null', async () => {
    await writeContentVersion(ACTOR, {
      action: 'create',
      resourceType: 'portfolio_skill',
      resourceId: 's1',
      before: null,
      after: { slug: 'react' },
    });
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ before: null, after: { slug: 'react' } }));
  });

  it('un borrado se guarda con after: null', async () => {
    await writeContentVersion(ACTOR, {
      action: 'delete',
      resourceType: 'portfolio_skill',
      resourceId: 's1',
      before: { slug: 'react' },
      after: null,
    });
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ before: { slug: 'react' }, after: null }));
  });

  it('un fallo al insertar no lanza (se loguea y se traga, igual que writeAuditLog)', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'boom' } });
    await expect(
      writeContentVersion(ACTOR, {
        action: 'update',
        resourceType: 'portfolio_project',
        resourceId: 'p1',
        before: null,
        after: null,
      }),
    ).resolves.toBeUndefined();
  });

  it('un error inesperado (p. ej. el cliente lanza) tampoco se propaga', async () => {
    mockInsert.mockImplementation(() => {
      throw new Error('red caída');
    });
    await expect(
      writeContentVersion(ACTOR, {
        action: 'update',
        resourceType: 'portfolio_project',
        resourceId: 'p1',
        before: null,
        after: null,
      }),
    ).resolves.toBeUndefined();
  });
});

describe('RECURSOS_VERSIONABLES', () => {
  it('cubre los 8 recursos con id y el perfil con section', () => {
    const tipos = Object.keys(RECURSOS_VERSIONABLES);
    expect(tipos).toHaveLength(9);
    expect(RECURSOS_VERSIONABLES.portfolio_project).toEqual({ tabla: 'portfolio_projects', columnaId: 'id' });
    expect(RECURSOS_VERSIONABLES.portfolio_profile).toEqual({ tabla: 'portfolio_profile', columnaId: 'section' });
  });
});
