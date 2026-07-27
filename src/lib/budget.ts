/**
 * Extrae un monto numérico razonable de un string de presupuesto libre.
 *
 * Maneja los formatos reales que genera el chatbot/admin:
 *   "$500", "$500 USD", "500", "$800-1200 USD", "$1.500", "$1,500", "1000-3000 USD"
 *
 * Reglas:
 * - Rango "A-B" → devuelve el valor MEDIO (ni inflado ni cero)
 * - Formato LATAM "1.500" (punto = miles) → 1500
 * - Formato US "1,500" (coma = miles) → 1500
 * - Sin número → 0
 */
export function parseBudgetAmount(raw: string | null | undefined): number {
  if (!raw) return 0;
  const text = String(raw).trim();
  if (!text) return 0;

  // Rangos: "800-1200", "$800 – $1.200"
  const rangeMatch = text.match(/([\d.,\s]+)[\-–—]\s*\$?\s*([\d.,\s]+)/);
  if (rangeMatch) {
    const a = parseNumber(rangeMatch[1]);
    const b = parseNumber(rangeMatch[2]);
    if (a > 0 && b > 0) return (a + b) / 2;
    return a || b || 0;
  }

  return parseNumber(text);
}

function parseNumber(fragment: string): number {
  const cleaned = fragment.replace(/[^\d.,]/g, '').trim();
  if (!cleaned) return 0;

  const lastDot = cleaned.lastIndexOf('.');
  const lastComma = cleaned.lastIndexOf(',');

  // Ambos separadores: el último es el decimal
  if (lastDot !== -1 && lastComma !== -1) {
    if (lastComma > lastDot) {
      // 1.234,56 (LATAM)
      return toFloat(cleaned.replace(/\./g, '').replace(',', '.'));
    }
    // 1,234.56 (US)
    return toFloat(cleaned.replace(/,/g, ''));
  }

  // Solo puntos
  if (lastDot !== -1) {
    const parts = cleaned.split('.');
    // Un solo punto con 3 dígitos tras él → separador de miles ("1.500")
    if (parts.length === 2 && parts[1].length === 3 && parts[0].length <= 3) {
      return toFloat(parts.join(''));
    }
    // Múltiples puntos → todos miles salvo el último si tiene 1-2 dígitos
    if (parts.length > 2) {
      return toFloat(parts.join(''));
    }
    return toFloat(cleaned);
  }

  // Solo comas: tratar como miles si hay exactamente 3 dígitos tras la última
  if (lastComma !== -1) {
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length === 3 && parts[0].length <= 3) {
      return toFloat(parts.join(''));
    }
    return toFloat(cleaned.replace(/,/g, ''));
  }

  return toFloat(cleaned);
}

function toFloat(s: string): number {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}
