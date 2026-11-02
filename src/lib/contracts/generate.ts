import { PDFDocument, StandardFonts, rgb, type PDFFont } from 'pdf-lib';
import { pdfSafe } from '@/lib/pdf/sanitize';
import { wrapText } from '@/lib/pdf/layout';

interface ContractData {
  clientName: string;
  clientEmail: string;
  service: string;
  budget: string;
  timeline: string;
}

const PAGE_WIDTH = 600;
const PAGE_HEIGHT = 800;
const MARGIN = 50;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

export async function generateContractPDF(data: ContractData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let currentY = PAGE_HEIGHT - MARGIN;

  const addPage = () => {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    currentY = PAGE_HEIGHT - MARGIN;
  };

  const ensureSpace = (needed: number) => {
    if (currentY - needed < MARGIN) addPage();
  };

  const drawParagraph = (
    text: string,
    font: PDFFont = timesRomanFont,
    size = 12,
    after = 5
  ) => {
    const lines = wrapText(pdfSafe(text), CONTENT_WIDTH, font, size);
    const lineHeight = size + after;

    for (const line of lines) {
      ensureSpace(lineHeight);
      page.drawText(line, {
        x: MARGIN,
        y: currentY,
        size,
        font,
        color: rgb(0, 0, 0),
      });
      currentY -= lineHeight;
    }
  };

  drawParagraph(
    'CONTRATO DE PRESTACIÓN DE SERVICIOS DE DESARROLLO',
    timesRomanBoldFont,
    16,
    8
  );
  currentY -= 15;

  drawParagraph(`FECHA: ${new Date().toLocaleDateString('es-CO')}`);
  currentY -= 5;

  const clientName = pdfSafe(data.clientName, 100);
  const clientEmail = pdfSafe(data.clientEmail, 254);
  const service = pdfSafe(data.service, 200);
  const budget = pdfSafe(data.budget, 100);
  const timeline = pdfSafe(data.timeline, 100);

  drawParagraph('PARTES:', timesRomanBoldFont);
  drawParagraph('PRESTADOR: OMAR HERNÁNDEZ REY (en adelante "El Desarrollador")');
  drawParagraph(`CLIENTE: ${clientName} (${clientEmail}) (en adelante "El Cliente")`);
  currentY -= 10;

  drawParagraph('CLÁUSULAS:', timesRomanBoldFont);
  drawParagraph('1. OBJETO: El Desarrollador se compromete a realizar el servicio de:');
  drawParagraph(service, timesRomanBoldFont);
  currentY -= 5;

  drawParagraph(`2. INVERSIÓN: El valor total del proyecto es de ${budget}.`);
  drawParagraph('Se requiere un anticipo del 50% para iniciar el desarrollo.');
  currentY -= 5;

  drawParagraph(`3. PLAZO: El tiempo estimado de entrega es de ${timeline}.`);
  currentY -= 5;

  drawParagraph(
    '4. PROPIEDAD INTELECTUAL: Los derechos sobre el código final se transfieren al Cliente una vez se complete el pago del 100%.'
  );
  currentY -= 15;

  ensureSpace(110);
  drawParagraph('FIRMAS:', timesRomanBoldFont);
  currentY -= 30;

  page.drawLine({
    start: { x: MARGIN, y: currentY },
    end: { x: 250, y: currentY },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  page.drawLine({
    start: { x: 350, y: currentY },
    end: { x: 550, y: currentY },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  currentY -= 15;
  page.drawText('Por El Desarrollador', {
    x: MARGIN,
    y: currentY,
    size: 10,
    font: timesRomanFont,
  });
  page.drawText('Por El Cliente (Firma Digital)', {
    x: 350,
    y: currentY,
    size: 10,
    font: timesRomanFont,
  });

  return await pdfDoc.save();
}
