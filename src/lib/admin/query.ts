/** Escapa caracteres especiales de ILIKE / filtros PostgREST. */
export function sanitizeSearchTerm(raw: string): string {
  return raw
    .trim()
    .replace(/[%_,.()"'\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 120);
}

export function parsePage(value: string | undefined, fallback = 1): number {
  const n = parseInt(value || '', 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return n;
}

export function pageRange(page: number, pageSize: number): { from: number; to: number } {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}
