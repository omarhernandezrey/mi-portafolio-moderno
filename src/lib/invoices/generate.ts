import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

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

export async function generateInvoicePDF(data: InvoiceData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([600, 800]);
  const { height } = page.getSize();
  let y = height - 50;

  interface DrawOptions {
    x?: number;
    size?: number;
    font?: unknown;
    color?: unknown;
  }

  const drawText = (text: string, options: DrawOptions = {}) => {
    const { x = 50, size = 10, font: f = font, color = rgb(0, 0, 0) } = options;
    page.drawText(text, { 
      x, 
      y, 
      size, 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      font: f as any, 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      color: color as any 
    });
  };

  // Header - Branding
  drawText('OMAR HERNÁNDEZ REY', { size: 20, font: boldFont, color: rgb(0, 0.5, 0.5) });
  y -= 25;
  drawText('Full Stack Web Developer / NIT: 123456789-0', { size: 10 });
  y -= 15;
  drawText('Bogotá, Colombia | hernandezreyomar@gmail.com', { size: 10 });
  y -= 40;

  // Invoice Title & Info
  drawText('FACTURA DE COBRO', { x: 400, size: 16, font: boldFont });
  y -= 20;
  drawText(`Nro: ${data.number}`, { x: 400, size: 12, font: boldFont });
  y -= 15;
  drawText(`Fecha: ${data.issueDate}`, { x: 400 });
  y -= 15;
  drawText(`Vencimiento: ${data.dueDate}`, { x: 400 });
  y -= 50;

  // Client Info
  drawText('FACTURADO A:', { font: boldFont });
  y -= 15;
  drawText(data.clientName);
  y -= 15;
  if (data.clientCompany) {
    drawText(data.clientCompany);
    y -= 15;
  }
  drawText(data.clientEmail);
  y -= 40;

  // Items Table Header
  page.drawRectangle({ x: 50, y: y - 5, width: 500, height: 20, color: rgb(0.95, 0.95, 0.95) });
  drawText('DESCRIPCIÓN', { x: 60, font: boldFont });
  drawText('CANT', { x: 350, font: boldFont });
  drawText('PRECIO', { x: 410, font: boldFont });
  drawText('TOTAL', { x: 500, font: boldFont });
  y -= 30;

  // Items List
  data.items.forEach((item) => {
    drawText(item.description, { x: 60 });
    drawText(item.quantity.toString(), { x: 350 });
    drawText(`${item.price.toFixed(2)}`, { x: 410 });
    drawText(`${item.total.toFixed(2)}`, { x: 500 });
    y -= 20;
  });

  y -= 20;
  page.drawLine({ start: { x: 50, y }, end: { x: 550, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
  y -= 30;

  // Totals
  const totalX = 400;
  drawText('Subtotal:', { x: totalX });
  drawText(`${data.subtotal.toFixed(2)} ${data.currency}`, { x: 500 });
  y -= 20;
  drawText('Impuestos (0%):', { x: totalX });
  drawText('0.00', { x: 500 });
  y -= 25;
  drawText('TOTAL:', { x: totalX, size: 14, font: boldFont });
  drawText(`${data.total.toFixed(2)} ${data.currency}`, { x: 500, size: 14, font: boldFont });
  y -= 50;

  // Footer / Legal
  if (data.notes) {
    drawText('NOTAS:', { font: boldFont });
    y -= 15;
    drawText(data.notes);
    y -= 40;
  }

  drawText('Formas de Pago:', { font: boldFont });
  y -= 15;
  drawText('PayPal / Binance / Nequi / Transferencia Bancaria');
  y -= 40;

  drawText('Esta factura no es una factura electrónica de venta según los términos del Decreto 2242 de 2015.', { size: 8, color: rgb(0.5, 0.5, 0.5) });
  y -= 10;
  drawText('Régimen Simplificado. Actividad económica: Desarrollo de sistemas informáticos.', { size: 8, color: rgb(0.5, 0.5, 0.5) });

  return await pdfDoc.save();
}
