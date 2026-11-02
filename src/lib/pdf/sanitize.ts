// page.drawText() de pdf-lib falla con caracteres fuera de WinAnsi
// (emojis, la mayoría de Unicode) cuando se usa una StandardFont no incrustada.
// Sanear cualquier texto de origen externo (leads, formularios) antes de dibujarlo.
export function pdfSafe(text: string, maxLength = 80): string {
  return text
    .replace(/[^\x20-\x7EáéíóúÁÉÍÓÚñÑüÜ¿¡]/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, maxLength)
    .trim();
}
