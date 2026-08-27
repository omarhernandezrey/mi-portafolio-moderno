import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseServer } from '../src/lib/supabaseServer';
import { educationData } from '../src/lib/educationData';

const OWNER_NAME = 'Omar Hernández Rey';

// Misma lógica de parseo de fecha que usa la línea de tiempo real
// (src/components/sections/EducationSection.tsx) — reutilizada aquí para que
// el orden de publicación coincida exactamente con el orden que ya ve
// cualquier visitante en la sección Educación.
const spanishMonths: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, setiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};

const normalizeSpanish = (text: string): string =>
  text.normalize('NFD').replace(/[^\w\s]/g, '').replace(/[̀-ͯ]/g, '').toLowerCase();

const parseSpanishDate = (duration?: string): number | null => {
  if (!duration) return null;
  const match = duration.match(/(?:Aprobado|Finalizado|Completado|Terminado) el ([0-9]{1,2}) de ([a-zA-ZÀ-ſ]+) de ([0-9]{4})/i);
  if (!match) return null;
  const [, dayStr, monthRaw, yearStr] = match;
  const monthKey = normalizeSpanish(monthRaw).replace(/\s+/g, '');
  const month = spanishMonths[monthKey];
  if (typeof month !== 'number') return null;
  const day = Number(dayStr);
  const year = Number(yearStr);
  const date = new Date(year, month, day);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
};

const parseEnglishDate = (duration?: string): number | null => {
  if (!duration) return null;
  const match = duration.match(/(?:Approved|Completed|Finished|Issued|Earned) on ([A-Za-z]+ \d{1,2}, \d{4})/i);
  if (!match) return null;
  const parsed = new Date(match[1]);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
};

type Localized<T> = { es: T; en: T } | T;

function loc(value: Localized<string> | undefined, lang: 'es' | 'en' = 'es'): string {
  if (!value) return '';
  return typeof value === 'string' ? value : value[lang] || value.es;
}

function getCompletionTimestamp(duration: Localized<string> | undefined): number | null {
  if (typeof duration === 'string') return parseEnglishDate(duration) ?? parseSpanishDate(duration);
  return parseEnglishDate(duration?.en) ?? parseSpanishDate(duration?.es) ?? null;
}

interface CourseEntry {
  title: string;
  institution: string;
  duration: string;
  description: string;
  certificate: string;
  ts: number | null;
}

const entries: CourseEntry[] = [];

for (const cat of educationData) {
  for (const item of cat.items) {
    if (!item.certificate) continue; // solo cursos con certificado visible
    entries.push({
      title: loc(item.title),
      institution: loc(item.institution),
      duration: loc(item.duration),
      description: loc(item.description),
      certificate: item.certificate,
      ts: getCompletionTimestamp(item.duration),
    });
  }
}

// Cursos con fecha real parseada, orden ascendente (más viejo primero).
const dated = entries.filter((e) => e.ts !== null).sort((a, b) => (a.ts as number) - (b.ts as number));

// Cursos sin fecha explícita (Platzi, sin sentencia de finalización) — son
// los cursos fundacionales más antiguos, se conserva su orden original del
// archivo (que ya sigue una progresión lógica de aprendizaje) y se ubican
// antes que el primer curso con fecha real conocida.
const undated = entries.filter((e) => e.ts === null);

const earliestDated = dated[0]?.ts ?? Date.now();
const DAY_MS = 24 * 60 * 60 * 1000;
const undatedWithSynthetic: (CourseEntry & { finalTs: number })[] = undated.map((e, i) => ({
  ...e,
  // Espaciados 10 días entre sí, terminando justo antes del primer curso con fecha real.
  finalTs: earliestDated - (undated.length - i) * 10 * DAY_MS,
}));

const datedWithFinal = dated.map((e) => ({ ...e, finalTs: e.ts as number }));

const orderedCourses = [...undatedWithSynthetic, ...datedWithFinal];

async function main() {
  console.log(`Publicando ${orderedCourses.length} cursos, del más viejo al más nuevo...`);

  for (const course of orderedCourses) {
    const body = `${course.institution} — ${course.duration}. ${course.description}`.trim();

    const { error } = await supabaseServer.from('feed_posts').insert({
      author_role: 'owner',
      author_name: OWNER_NAME,
      lang: 'es',
      category: 'curso',
      title: course.title,
      body: body.slice(0, 5000),
      image_urls: [course.certificate],
      created_at: new Date(course.finalTs).toISOString(),
    });

    if (error) {
      console.error(`✗ Error insertando "${course.title}":`, error.message);
    } else {
      console.log(`✓ ${new Date(course.finalTs).toISOString().slice(0, 10)} — ${course.title}`);
    }
  }

  console.log('Listo.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
