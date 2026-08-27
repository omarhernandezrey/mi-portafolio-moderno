import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseServer } from '../src/lib/supabaseServer';
import { educationData } from '../src/lib/educationData';
import { skillsData } from '../src/lib/skillsData';
import { projectsData } from '../src/lib/projectsData';

const OWNER_NAME = 'Omar Hernández Rey';

type Localized<T> = { es: T; en: T } | T;

function loc(value: Localized<string>, lang: 'es' | 'en'): string {
  return typeof value === 'string' ? value : value[lang];
}

interface SeedPost {
  lang: 'es' | 'en';
  category: 'general' | 'status' | 'curso' | 'skill' | 'proyecto' | 'postulacion';
  title?: string;
  body: string;
  link_url?: string;
  image_urls?: string[];
}

function buildSeedPosts(): SeedPost[] {
  const posts: SeedPost[] = [];

  // Bienvenida
  posts.push({
    lang: 'es',
    category: 'status',
    title: 'Bienvenidos a la comunidad',
    body: 'Abro este espacio para compartir en tiempo real mis cursos, skills nuevas, proyectos y postulaciones laborales. Cualquiera puede comentar — sin necesidad de crear cuenta. ¡Gracias por pasar!',
  });
  posts.push({
    lang: 'en',
    category: 'status',
    title: 'Welcome to the community',
    body: "I'm opening this space to share courses, new skills, projects, and job applications in real time. Anyone can comment — no account needed. Thanks for stopping by!",
  });

  // Cursos — el más reciente y uno anterior representativo
  const newestCourse = educationData
    .flatMap((cat) => cat.items)
    .find((item) => item.isNew);
  if (newestCourse) {
    posts.push({
      lang: 'es',
      category: 'curso',
      title: `Completé: ${loc(newestCourse.title, 'es')}`,
      body: `Acabo de terminar "${loc(newestCourse.title, 'es')}" con ${loc(newestCourse.institution, 'es')}. ${loc(newestCourse.description, 'es')}`,
      image_urls: newestCourse.certificate ? [newestCourse.certificate] : undefined,
    });
    posts.push({
      lang: 'en',
      category: 'curso',
      title: `Completed: ${loc(newestCourse.title, 'en')}`,
      body: `I just finished "${loc(newestCourse.title, 'en')}" with ${loc(newestCourse.institution, 'en')}. ${loc(newestCourse.description, 'en')}`,
      image_urls: newestCourse.certificate ? [newestCourse.certificate] : undefined,
    });
  }

  // Skills — resumen del stack principal
  const topSkills = skillsData.slice(0, 6).map((s) => loc(s.name, 'es')).join(', ');
  const topSkillsEn = skillsData.slice(0, 6).map((s) => loc(s.name, 'en')).join(', ');
  posts.push({
    lang: 'es',
    category: 'skill',
    title: 'Mi stack principal',
    body: `Estas son las tecnologías con las que trabajo día a día: ${topSkills}. Sigo sumando skills constantemente — la sección de Skills en mi portafolio tiene el detalle completo.`,
  });
  posts.push({
    lang: 'en',
    category: 'skill',
    title: 'My core stack',
    body: `These are the technologies I work with daily: ${topSkillsEn}. I keep adding skills constantly — the Skills section on my portfolio has the full breakdown.`,
  });

  // Proyectos — 2 destacados
  for (const project of projectsData.slice(0, 2)) {
    posts.push({
      lang: 'es',
      category: 'proyecto',
      title: loc(project.title, 'es'),
      body: `${loc(project.description, 'es')} Stack: ${project.technologies.join(', ')}.`,
      link_url: project.demo || project.repository || undefined,
    });
    posts.push({
      lang: 'en',
      category: 'proyecto',
      title: loc(project.title, 'en'),
      body: `${loc(project.description, 'en')} Stack: ${project.technologies.join(', ')}.`,
      link_url: project.demo || project.repository || undefined,
    });
  }

  return posts;
}

async function main() {
  const posts = buildSeedPosts();
  console.log(`Insertando ${posts.length} posts curados...`);

  for (const post of posts) {
    const { error } = await supabaseServer.from('feed_posts').insert({
      author_role: 'owner',
      author_name: OWNER_NAME,
      lang: post.lang,
      category: post.category,
      title: post.title ?? null,
      body: post.body,
      link_url: post.link_url ?? null,
      image_urls: post.image_urls ?? [],
    });

    if (error) {
      console.error(`Error insertando post "${post.title}":`, error.message);
    } else {
      console.log(`✓ [${post.lang}] ${post.title ?? post.body.slice(0, 40)}`);
    }
  }

  console.log('Listo.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
