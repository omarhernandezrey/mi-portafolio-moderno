import { NextRequest, NextResponse } from 'next/server';
import { gatherCvData, type Idioma } from '@/lib/cv/gatherCvData';
import { buildCvPdf } from '@/lib/cv/buildCvPdf';

export const dynamic = 'force-dynamic';

/**
 * CV generado desde los datos reales del portafolio (T-22): a diferencia de
 * un PDF estático, siempre refleja los proyectos y skills que de verdad
 * están publicados ahora mismo. Pública a propósito — un reclutador no
 * tiene sesión, y ese es justo el objetivo de `PRODUCT.md`.
 */
export async function GET(req: NextRequest) {
  const lang = req.nextUrl.searchParams.get('lang') === 'en' ? 'en' : 'es';

  try {
    const datos = await gatherCvData(lang as Idioma);
    const pdfBytes = await buildCvPdf(datos);

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Omar-Hernandez-Rey-CV.pdf"',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[cv] error generando el PDF:', error);
    return NextResponse.json({ error: 'No se pudo generar el CV' }, { status: 500 });
  }
}
