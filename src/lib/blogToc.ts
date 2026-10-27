export interface BlogHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

const SKIPPED_HEADINGS = /^(tabla de contenidos|table of contents)$/i;

function cleanHeadingText(raw: string): string {
  return raw
    .replace(/\s*\{#[^}]+\}\s*$/, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

export function slugifyHeading(text: string): string {
  const slug = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return slug || 'seccion';
}

/**
 * Extrae los encabezados h2/h3 del MDX crudo para construir el índice del
 * artículo. Los IDs se calculan con la misma función que usan los componentes
 * de MDX, así que los enlaces del índice siempre apuntan al heading correcto.
 */
export function extractHeadings(content: string): BlogHeading[] {
  const headings: BlogHeading[] = [];
  const headingPattern = /^(#{2,3})\s+(.+?)\s*#*\s*$/gm;
  let match: RegExpExecArray | null;

  while ((match = headingPattern.exec(content)) !== null) {
    const level = match[1].length as 2 | 3;
    const text = cleanHeadingText(match[2]);
    if (!text || SKIPPED_HEADINGS.test(text)) continue;

    headings.push({
      id: slugifyHeading(text),
      text,
      level,
    });
  }

  return headings;
}
