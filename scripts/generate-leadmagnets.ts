import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function generatePDF(title: string, filename: string) {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const page = pdfDoc.addPage([600, 800]);
  const { width, height } = page.getSize();

  page.drawText(title, {
    x: 50,
    y: height - 100,
    size: 30,
    font: timesRomanFont,
    color: rgb(0, 0.5, 0.5),
  });

  page.drawText('Este es un lead magnet de Omar Hernández Rey.', {
    x: 50,
    y: height - 150,
    size: 15,
    font: timesRomanFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText('En una implementación real, este PDF contendría 10-15 páginas de contenido valioso.', {
    x: 50,
    y: height - 180,
    size: 12,
    font: timesRomanFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  const pdfBytes = await pdfDoc.save();
  const dir = path.join(process.cwd(), 'public', 'leadmagnets');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(path.join(dir, filename), pdfBytes);
  console.log(`Generated ${filename}`);
}

async function main() {
  await generatePDF('Checklist: ¿Qué pedirle a un desarrollador?', 'checklist.pdf');
  await generatePDF('Guía: Precios reales Desarrollo Web LATAM 2026', 'guia-precios.pdf');
  await generatePDF('Plantilla: Brief de proyecto digital', 'plantilla-brief.pdf');
}

main().catch(console.error);
