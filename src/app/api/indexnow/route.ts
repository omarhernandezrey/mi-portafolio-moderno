import { NextRequest, NextResponse } from 'next/server';
import { serverEnv } from '@/config/env';

const SITE_URL = 'https://omarhernandezrey.com';
const INDEXNOW_KEY = serverEnv.INDEXNOW_API_KEY;

/**
 * Endpoint para enviar URLs a Bing via IndexNow
 * POST /api/indexnow
 * Body: { urls: string[] }
 */
export async function POST(req: NextRequest) {
  // Verificar que existe la API key
  if (!INDEXNOW_KEY) {
    return NextResponse.json(
      { error: 'INDEXNOW_API_KEY no configurada' },
      { status: 500 }
    );
  }

  try {
    const { urls } = await req.json() as { urls: string[] };

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'Debe proporcionar un array de URLs' },
        { status: 400 }
      );
    }

    // Normalizar URLs (asegurar que tengan el dominio completo)
    const normalizedUrls = urls.map(u => 
      u.startsWith('http') ? u : `${SITE_URL}${u.startsWith('/') ? u : `/${u}`}`
    );

    // Preparar payload para IndexNow
    const body = {
      host: 'omarhernandezrey.com',
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: normalizedUrls,
    };

    // Enviar a IndexNow
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json; charset=utf-8' 
      },
      body: JSON.stringify(body),
    });

    const responseData = await response.text();

    return NextResponse.json({
      status: response.status,
      message: response.status === 200 || response.status === 202 
        ? 'URLs enviadas exitosamente a IndexNow' 
        : 'Error al enviar URLs',
      details: responseData,
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
 * Devuelve información sobre el estado de IndexNow
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    site: SITE_URL,
    keyConfigured: !!INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY ? `${SITE_URL}/${INDEXNOW_KEY}.txt` : null,
    documentation: 'https://www.indexnow.org/documentation',
  });
}
