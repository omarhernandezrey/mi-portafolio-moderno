import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

interface ContractData {
  clientName: string;
  clientEmail: string;
  service: string;
  budget: string;
  timeline: string;
}

export async function generateContractPDF(data: ContractData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const page = pdfDoc.addPage([600, 800]);
  const { height } = page.getSize();
  const fontSize = 12;

  let currentY = height - 50;

  const drawText = (text: string, font = timesRomanFont, size = fontSize) => {
    page.drawText(text, {
      x: 50,
      y: currentY,
      size,
      font,
      color: rgb(0, 0, 0),
    });
    currentY -= size + 5;
  };

  drawText('CONTRATO DE PRESTACIÓN DE SERVICIOS DE DESARROLLO', timesRomanBoldFont, 16);
  currentY -= 20;

  drawText(`FECHA: ${new Date().toLocaleDateString('es-CO')}`);
  currentY -= 10;

  drawText('PARTES:', timesRomanBoldFont);
  drawText(`PRESTADOR: OMAR HERNÁNDEZ REY (en adelante "El Desarrollador")`);
  drawText(`CLIENTE: ${data.clientName} (${data.clientEmail}) (en adelante "El Cliente")`);
  currentY -= 15;

  drawText('CLÁUSULAS:', timesRomanBoldFont);
  drawText('1. OBJETO: El Desarrollador se compromete a realizar el servicio de:');
  drawText(`${data.service}`, timesRomanBoldFont);
  currentY -= 10;

  drawText(`2. INVERSIÓN: El valor total del proyecto es de ${data.budget}.`);
  drawText('Se requiere un anticipo del 50% para iniciar el desarrollo.');
  currentY -= 10;

  drawText(`3. PLAZO: El tiempo estimado de entrega es de ${data.timeline}.`);
  currentY -= 10;

  drawText('4. PROPIEDAD INTELECTUAL: Los derechos sobre el código final se transfieren');
  drawText('al Cliente una vez se complete el pago del 100%.');
  currentY -= 20;

  drawText('FIRMAS:', timesRomanBoldFont);
  currentY -= 40;

  page.drawLine({
    start: { x: 50, y: currentY },
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
  page.drawText('Por El Desarrollador', { x: 50, y: currentY, size: 10, font: timesRomanFont });
  page.drawText('Por El Cliente (Firma Digital)', { x: 350, y: currentY, size: 10, font: timesRomanFont });

  // Guardar PDF
  return await pdfDoc.save();
}
