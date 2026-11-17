/**
 * `subirImagenPortafolio` (T-11): valida el data URL antes de gastar una
 * llamada a Storage, y nunca deja pasar un error de Storage como si hubiera
 * ido bien.
 */
const mockUpload = jest.fn();
const mockGetPublicUrl = jest.fn();

jest.mock('@/lib/supabaseServer', () => ({
  supabaseServer: {
    storage: {
      from: jest.fn(() => ({
        upload: (...args: unknown[]) => mockUpload(...args),
        getPublicUrl: (...args: unknown[]) => mockGetPublicUrl(...args),
      })),
    },
  },
}));

import { subirImagenPortafolio } from '@/lib/portfolio/uploadImage';

const PIXEL_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

beforeEach(() => {
  jest.clearAllMocks();
  mockUpload.mockResolvedValue({ error: null });
  mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://ozftxfwkhomnbvicjtae.supabase.co/storage/v1/object/public/portfolio-media/logos/x.png' } });
});

describe('subirImagenPortafolio', () => {
  it('rechaza un data URL mal formado sin llamar a Storage', async () => {
    const resultado = await subirImagenPortafolio('no-es-un-data-url', 'logos');
    expect(resultado.ok).toBe(false);
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('rechaza un mime no admitido (p. ej. SVG, por riesgo de XSS) sin llamar a Storage', async () => {
    const resultado = await subirImagenPortafolio('data:image/svg+xml;base64,AAAA', 'logos');
    expect(resultado.ok).toBe(false);
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('sube un PNG válido y devuelve la URL pública', async () => {
    const resultado = await subirImagenPortafolio(`data:image/png;base64,${PIXEL_PNG_BASE64}`, 'logos');
    expect(resultado).toEqual({ ok: true, url: 'https://ozftxfwkhomnbvicjtae.supabase.co/storage/v1/object/public/portfolio-media/logos/x.png' });
    expect(mockUpload).toHaveBeenCalledTimes(1);
    const [path, , opciones] = mockUpload.mock.calls[0];
    expect(path).toMatch(/^logos\/.+\.png$/);
    expect(opciones).toEqual({ contentType: 'image/png', upsert: false });
  });

  it('si Storage devuelve error, no lo confunde con éxito', async () => {
    mockUpload.mockResolvedValue({ error: { message: 'bucket no existe' } });
    const resultado = await subirImagenPortafolio(`data:image/png;base64,${PIXEL_PNG_BASE64}`, 'certificados');
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.error).toMatch(/bucket no existe/);
  });

  it('rechaza un cuerpo demasiado grande antes de decodificar', async () => {
    const enorme = `data:image/png;base64,${'A'.repeat(3_500_000)}`;
    const resultado = await subirImagenPortafolio(enorme, 'logos');
    expect(resultado.ok).toBe(false);
    expect(mockUpload).not.toHaveBeenCalled();
  });
});
