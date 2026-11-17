/**
 * Protección contra duplicados de T-17 (`notification_log`). `reclamarAviso`
 * distingue "primera vez" (insert ok) de "ya avisado" (23505) de un error
 * real (que sí debe propagarse, no tratarse como "ya avisado").
 */
const mockInsert = jest.fn();
const mockDeleteEq1 = jest.fn();
const mockDeleteEq2 = jest.fn();

jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: {
    from: jest.fn(() => ({
      insert: mockInsert,
      delete: () => ({ eq: mockDeleteEq1 }),
    })),
  },
}));

import { liberarAviso, reclamarAviso } from '@/lib/notifications/dedupe';

beforeEach(() => {
  mockInsert.mockReset();
  mockDeleteEq1.mockReset();
  mockDeleteEq2.mockReset();
  mockDeleteEq1.mockReturnValue({ eq: mockDeleteEq2 });
  mockDeleteEq2.mockResolvedValue({ error: null });
});

describe('reclamarAviso', () => {
  it('primera vez (insert ok): true, hay que avisar', async () => {
    mockInsert.mockResolvedValue({ error: null });
    expect(await reclamarAviso('streak_warning', '2026-11-16')).toBe(true);
  });

  it('ya existía (23505): false, no se vuelve a avisar', async () => {
    mockInsert.mockResolvedValue({ error: { code: '23505', message: 'duplicate key' } });
    expect(await reclamarAviso('streak_warning', '2026-11-16')).toBe(false);
  });

  it('un error real (no 23505) se propaga, no se trata como "ya avisado"', async () => {
    mockInsert.mockResolvedValue({ error: { code: '42501', message: 'permission denied' } });
    await expect(reclamarAviso('streak_warning', '2026-11-16')).rejects.toThrow('permission denied');
  });
});

describe('liberarAviso', () => {
  it('borra por event + dedupe_key', async () => {
    await liberarAviso('vitals_regression', 'LCP:mobile');
    expect(mockDeleteEq1).toHaveBeenCalledWith('event', 'vitals_regression');
    expect(mockDeleteEq2).toHaveBeenCalledWith('dedupe_key', 'LCP:mobile');
  });

  it('un error al borrar se propaga', async () => {
    mockDeleteEq2.mockResolvedValueOnce({ error: { message: 'boom' } });
    await expect(liberarAviso('vitals_regression', 'LCP:mobile')).rejects.toThrow('boom');
  });
});
