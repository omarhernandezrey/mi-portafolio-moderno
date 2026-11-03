const FORMULA_PREFIX = /^[=+\-@\t\r]/;

export function csvCell(value: unknown): string {
  const raw = String(value ?? '');
  const sanitized = FORMULA_PREFIX.test(raw) ? `'${raw}` : raw;
  return `"${sanitized.replace(/"/g, '""')}"`;
}

export function toCSV(rows: unknown[][], delimiter = ','): string {
  return rows
    .map((row) => row.map((value) => csvCell(value)).join(delimiter))
    .join('\n');
}
