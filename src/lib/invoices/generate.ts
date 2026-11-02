import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type RGB,
} from 'pdf-lib';
import { pdfSafe } from '@/lib/pdf/sanitize';
import { wrapText } from '@/lib/pdf/layout';

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface InvoiceData {
  number: string;
  issueDate: string;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  notes?: string;
}

const PAGE_WIDTH = 600;
const PAGE_HEIGHT = 800;
const MARGIN = 50;

function formatAmount(value: number): string {
  return value.toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  interface DrawOptions {
    x?: number;
    y?: number;
    size?: number;
    font?: PDFFont;
    color?: RGB;
  }

  const drawText = (text: string, options: DrawOptions = {}) => {
    const { x = MARGIN, y: yOverride = y, size = 10, font: f = font, color = rgb(0, 0, 0) } = options;
    page.drawText(pdfSafe(text, 500), { x, y: yOverride, size, font: f, color });
  };

  const drawRight = (text: string, xRight: number, options: DrawOptions = {}) => {
    const { y: yOverride = y, size = 10, font: f = font, color = rgb(0, 0, 0) } = options;
    const safe = pdfSafe(text, 500);
    const width = f.widthOfTextAtSize(safe, size);
    page.drawText(safe, { x: xRight - width, y: yOverride, size, font: f, color });
  };

  const addPage = () => {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
    page.drawText(pdfSafe(`Factura ${data.number}`, 60), {
      x: MARGIN,
      y,
      size: 10,
      font: boldFont,
      color: rgb(0.4, 0.4, 0.4),
    });
    y -= 25;
  };

  const ensureSpace = (needed: number) => {
    if (y - needed < 60) addPage();
  };

  const drawWrapped = (
    text: string,
    options: DrawOptions & { maxWidth?: number; after?: number } = {}
  ) => {
    const {
      x = MARGIN,
      size = 10,
      font: f = font,
      color = rgb(0, 0, 0),
      maxWidth = PAGE_WIDTH - MARGIN * 2,
      after = 5,
    } = options;
    const lines = wrapText(pdfSafe(text), maxWidth, f, size);

    for (const line of lines) {
      ensureSpace(size + after);
      page.drawText(line, { x, y, size, font: f, color });
      y -= size + after;
    }
  };

  // Header - Branding
  drawText('OMAR HERNÁNDEZ REY', { size: 20, font: boldFont, color: rgb(0, 0.5, 0.5) });
  y -= 25;
  drawText('Full Stack Web Developer / NIT: 123456789-0', { size: 10 });
  y -= 15;
  drawText('Bogotá, Colombia | omarhernandezrey@gmail.com', { size: 10 });
  y -= 40;

  // Invoice Title & Info
  drawText('FACTURA DE COBRO', { x: 400, size: 16, font: boldFont });
  y -= 20;
  drawText(`Nro: ${data.number}`, { x: 400, size: 12, font: boldFont });
  y -= 15;
  drawText(`Fecha: ${data.issueDate}`, { x: 400 });
  y -= 15;
  drawText(`Vencimiento: ${data.dueDate}`, { x: 400 });
  y -= 45;

  // Client Info
  drawWrapped('FACTURADO A:', { font: boldFont });
  drawWrapped(pdfSafe(data.clientName, 200), { maxWidth: 300 });
  if (data.clientCompany) {
    drawWrapped(pdfSafe(data.clientCompany, 200), { maxWidth: 300 });
  }
  drawWrapped(pdfSafe(data.clientEmail, 254), { maxWidth: 300, after: 12 });

  // Items Table
  const drawTableHeader = () => {
    page.drawRectangle({
      x: MARGIN,
      y: y - 5,
      width: PAGE_WIDTH - MARGIN * 2,
      height: 20,
      color: rgb(0.95, 0.95, 0.95),
    });
    drawText('DESCRIPCIÓN', { x: 60, font: boldFont });
    drawText('CANT', { x: 350, font: boldFont });
    drawText('PRECIO', { x: 410, font: boldFont });
    drawText('TOTAL', { x: 500, font: boldFont });
    y -= 30;
  };

  drawTableHeader();

  // Items List
  for (const item of data.items) {
    const descriptionLines = wrapText(
      pdfSafe(item.description, 500),
      270,
      font,
      10
    );
    const rowHeight = Math.max(descriptionLines.length, 1) * 14 + 6;

    if (y - rowHeight < 70) {
      addPage();
      drawTableHeader();
    }

    const firstLineY = y;
    descriptionLines.forEach((line, index) => {
      if (index > 0) y -= 14;
      page.drawText(line, { x: 60, y, size: 10, font });
    });
    drawRight(item.quantity.toString(), 380, { x: 350, y: firstLineY });
    drawRight(formatAmount(item.price), 470, { x: 410, y: firstLineY });
    drawRight(formatAmount(item.total), 550, { x: 500, y: firstLineY });

    y -= rowHeight;
  }

  y -= 10;
  ensureSpace(40);
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: 550, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= 25;

  // Totals
  ensureSpace(80);
  drawText('Subtotal:', { x: 400 });
  drawRight(`${formatAmount(data.subtotal)} ${data.currency}`, 550, { x: 500 });
  y -= 20;
  drawText('Impuestos (0%):', { x: 400 });
  drawRight('0.00', 550, { x: 500 });
  y -= 25;
  drawText('TOTAL:', { x: 400, size: 14, font: boldFont });
  drawRight(`${formatAmount(data.total)} ${data.currency}`, 550, {
    x: 500,
    size: 14,
    font: boldFont,
  });
  y -= 45;

  // Footer / Legal
  if (data.notes) {
    drawWrapped('NOTAS:', { font: boldFont });
    drawWrapped(data.notes, { maxWidth: PAGE_WIDTH - MARGIN * 2 });
    y -= 20;
  }

  ensureSpace(80);
  drawText('Formas de Pago:', { font: boldFont });
  y -= 15;
  drawText('PayPal / Wompi / Nequi / Transferencia Bancaria');
  y -= 40;

  drawWrapped(
    'Esta factura no es una factura electrónica de venta según los términos del Decreto 2242 de 2015.',
    { size: 8, color: rgb(0.5, 0.5, 0.5), after: 2 }
  );
  drawWrapped(
    'Régimen Simplificado. Actividad económica: Desarrollo de sistemas informáticos.',
    { size: 8, color: rgb(0.5, 0.5, 0.5), after: 2 }
  );

  return await pdfDoc.save();
}
