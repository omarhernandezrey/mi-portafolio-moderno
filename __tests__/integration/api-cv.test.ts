/**
 * `GET /api/cv` (T-22): pública a propósito — un reclutador no tiene
 * sesión. `gatherCvData` y `buildCvPdf` se simulan: no hace falta tocar la
 * base real ni pdf-lib de verdad para probar la ruta.
 */
const mockGatherCvData = jest.fn();
jest.mock('@/lib/cv/gatherCvData', () => ({
  gatherCvData: (...args: unknown[]) => mockGatherCvData(...args),
}));

const mockBuildCvPdf = jest.fn();
jest.mock('@/lib/cv/buildCvPdf', () => ({
  buildCvPdf: (...args: unknown[]) => mockBuildCvPdf(...args),
}));

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/cv/route';

function req(url: string) {
  return new NextRequest(`http://localhost${url}`);
}

beforeEach(() => {
  mockGatherCvData.mockReset();
  mockBuildCvPdf.mockReset();
  mockGatherCvData.mockResolvedValue({ nombre: 'Omar' });
  mockBuildCvPdf.mockResolvedValue(new Uint8Array([1, 2, 3]));
});

describe('GET /api/cv', () => {
  it('responde el PDF con content-type y content-disposition de descarga', async () => {
    const res = await GET(req('/api/cv'));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/pdf');
    expect(res.headers.get('content-disposition')).toContain('attachment');
  });

  it('sin "lang": pide los datos en español', async () => {
    await GET(req('/api/cv'));
    expect(mockGatherCvData).toHaveBeenCalledWith('es');
  });

  it('con "lang=en": pide los datos en inglés', async () => {
    await GET(req('/api/cv?lang=en'));
    expect(mockGatherCvData).toHaveBeenCalledWith('en');
  });

  it('un "lang" que no es "en" ni "es" cae a español, no rompe', async () => {
    await GET(req('/api/cv?lang=fr'));
    expect(mockGatherCvData).toHaveBeenCalledWith('es');
  });

  it('si falla la generación: 500, no deja la respuesta a medias', async () => {
    mockBuildCvPdf.mockRejectedValue(new Error('boom'));
    const res = await GET(req('/api/cv'));
    expect(res.status).toBe(500);
  });

  it('no exige sesión: un recruiter sin login puede descargarlo', async () => {
    // Ausencia de cualquier mock/llamada a requireAdmin es la prueba: la
    // ruta ni siquiera lo importa (ver su propio archivo).
    const res = await GET(req('/api/cv'));
    expect(res.status).toBe(200);
  });
});
