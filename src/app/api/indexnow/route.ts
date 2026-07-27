import { NextRequest, NextResponse } from 'next/server';
import { serverEnv } from '@/config/env';
import { requireCronAuth } from '@/lib/cronAuth';

const SITE_URL = 'https://omarhernandezrey.com';
const SITE_HOST = 'omarhernandezrey.com';
const INDEXNOW_KEY = serverEnv.INDEXNOW_API_KEY;

/**
 * Endpoint para enviar URLs a Bing via IndexNow.
 * PROTEGIDO: requiere Bearer CRON_SECRET — un POST abierto permitía a cualquiera
 * quemar la reputación de la key enviando URLs arbitrarias.
 */
export async function POST(req: NextRequest) {
  const authError = requireCronAuth(req);
  if (authError) return authError;

  if (!INDEXNOW_KEY) {
    return NextResponse.json(
      { error: 'INDEXNOW_API_KEY no configurada' },
      { status: 500 }
    );
  }

  try {
    const { urls } = await req.json() as { urls: unknown };

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'Debe proporcionar un array de URLs' },
        { status: 400 }
      );
    }

    if (urls.length > 100) {
      return NextResponse.json({ error: 'Máximo 100 URLs por llamada' }, { status: 400 });
    }

    // Solo URLs del propio sitio: nunca se envían dominios ajenos bajo nuestra key
    const normalizedUrls: string[] = [];
    for (const u of urls) {
      if (typeof u !== 'string') {
        return NextResponse.json({ error: 'Todas las URLs deben ser strings' }, { status: 400 });
      }
      const full = u.startsWith('http') ? u : `${SITE_URL}${u.startsWith('/') ? u : `/${u}`}`;
      try {
        const parsed = new URL(full);
        if (parsed.host !== SITE_HOST) continue; // descarta dominios ajenos
        normalizedUrls.push(parsed.toString());
      } catch {
        return NextResponse.json({ error: `URL inválida: ${u.slice(0, 80)}` }, { status: 400 });
      }
    }

    if (normalizedUrls.length === 0) {
      return NextResponse.json({ error: 'Ninguna URL pertenece a este sitio' }, { status: 400 });
    }

    const body = {
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: normalizedUrls,
    };

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(body),
    });

    return NextResponse.json({
      status: response.status,
      message: response.status === 200 || response.status === 202
        ? 'URLs enviadas exitosamente a IndexNow'
        : 'Error al enviar URLs',
      urlsSubmitted: normalizedUrls.length,
    });

  } catch (error) {
    console.error('IndexNow error:', error);
    return NextResponse.json(
      { error: 'Error procesando la solicitud' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/indexnow
 * Estado público mínimo (no revela key ni su ubicación).
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    keyConfigured: !!INDEXNOW_KEY,
  });
}
