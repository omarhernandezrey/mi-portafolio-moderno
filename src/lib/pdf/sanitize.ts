// page.drawText() de pdf-lib falla con caracteres fuera de WinAnsi
// (emojis, la mayoría de Unicode) cuando se usa una StandardFont no incrustada.
// Sanear cualquier texto de origen externo (leads, formularios) antes de dibujarlo.

const WIN_ANSI_REPLACEMENTS: Record<string, string> = {
  '\u2018': "'",
  '\u2019': "'",
  '\u201A': "'",
  '\u201B': "'",
  '\u201C': '"',
  '\u201D': '"',
  '\u201E': '"',
  '\u2013': '-',
  '\u2014': '-',
  '\u2212': '-',
  '\u2026': '...',
  '\u2022': '-',
  '\u00A0': ' ',
  '\u20AC': 'EUR',
};

export function pdfSafe(text: string, maxLength = 2000): string {
  const replaced = Array.from(text.normalize('NFC'))
    .map((char) => WIN_ANSI_REPLACEMENTS[char] ?? char)
    .join('');

  return replaced
    .replace(/[^\x20-\x7E\xA1-\xFF]/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, maxLength)
    .trim();
}
