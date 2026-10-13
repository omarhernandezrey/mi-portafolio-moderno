import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseServer } from '../src/lib/supabaseServer';
import { educationData } from '../src/lib/educationData';

const OWNER_NAME = 'Omar Hernández Rey';

type Localized = { es: string; en: string } | string;

function loc(value: Localized, lang: 'es' | 'en'): string {
  return typeof value === 'string' ? value : value[lang];
}

async function main() {
  const newestCourse = educationData
    .flatMap((category) => category.items)
    .find((item) => item.isNew);

  if (!newestCourse) throw new Error('No hay ningún curso marcado como nuevo.');

  for (const lang of ['es', 'en'] as const) {
    const title = `${lang === 'en' ? 'Completed' : 'Completé'}: ${loc(newestCourse.title, lang)}`;
    const body = lang === 'en'
      ? `I completed "${loc(newestCourse.title, lang)}" with ${loc(newestCourse.institution, lang)} on October 13, 2026. ${loc(newestCourse.description, lang)}`
      : `Completé "${loc(newestCourse.title, lang)}" con ${loc(newestCourse.institution, lang)} el 13 de octubre de 2026. ${loc(newestCourse.description, lang)}`;

    const { data: existing, error: lookupError } = await supabaseServer
      .from('feed_posts')
      .select('id')
      .eq('author_role', 'owner')
      .eq('lang', lang)
      .eq('title', title)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (existing) {
      console.log(`Ya existe [${lang}]: ${title}`);
      continue;
    }

    const { error } = await supabaseServer.from('feed_posts').insert({
      author_role: 'owner',
      author_name: OWNER_NAME,
      lang,
      category: 'curso',
      title,
      body,
      image_urls: newestCourse.certificate ? [newestCourse.certificate] : [],
    });

    if (error) throw error;
    console.log(`Publicado [${lang}]: ${title}`);
  }
}

main().catch((error) => {
  console.error('No se pudo publicar el curso en la comunidad:', error);
  process.exit(1);
});
