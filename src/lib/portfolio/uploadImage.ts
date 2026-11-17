/**
 * Subida de imágenes del panel de contenido (T-11: logos y certificados de
 * educación e insignias). Mismo patrón que `uploadPostImage` en
 * `src/app/api/feed/posts/route.ts`: el cliente manda un data URL
 * (`data:image/png;base64,...`), aquí se decodifica, se valida y se sube al
 * bucket público `portfolio-media` con `supabaseServer` (service role,
 * bypassa RLS de storage.objects).
 */
import { supabaseServer } from '@/lib/supabaseServer';

const IMAGE_DATA_URL_RE = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export type ResultadoSubida = { ok: true; url: string } | { ok: false; error: string };

/** `carpeta` separa logos de certificados dentro del mismo bucket, solo para ordenar el listado. */
export async function subirImagenPortafolio(dataUrl: string, carpeta: 'logos' | 'certificados'): Promise<ResultadoSubida> {
  if (dataUrl.length > 3_000_000) {
    return { ok: false, error: 'La imagen es demasiado grande (máximo ~2MB).' };
  }

  const match = dataUrl.match(IMAGE_DATA_URL_RE);
  if (!match) {
    return { ok: false, error: 'Formato de imagen no admitido (solo JPEG, PNG o WebP).' };
  }

  const [, mime, base64] = match;
  const buffer = Buffer.from(base64, 'base64');
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_IMAGE_BYTES) {
    return { ok: false, error: 'La imagen es demasiado grande (máximo 2MB).' };
  }

  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
  const path = `${carpeta}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabaseServer.storage
    .from('portfolio-media')
    .upload(path, buffer, { contentType: mime, upsert: false });

  if (error) {
    return { ok: false, error: `No se pudo subir la imagen: ${error.message}` };
  }

  const { data } = supabaseServer.storage.from('portfolio-media').getPublicUrl(path);
  if (!data.publicUrl) {
    return { ok: false, error: 'La subida funcionó pero no se obtuvo una URL pública.' };
  }

  return { ok: true, url: data.publicUrl };
}
