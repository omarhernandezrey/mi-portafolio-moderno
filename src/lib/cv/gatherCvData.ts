/**
 * Datos del CV generado (T-22): todo real, nada inventado. Las funciones
 * `getX()` de `repository.ts` ya tienen su propio respaldo a los módulos de
 * origen si la base no responde (T-06) — aquí no se duplica esa red de
 * seguridad, se reutiliza.
 */
import { getBadges, getProjects, getSkills } from '@/lib/portfolio/repository';
import { OMAR_PROFILE } from '@/data/omarProfile';

export type Idioma = 'es' | 'en';

export interface CvSkill {
  nombre: string;
  porcentaje: number;
}

export interface CvProyecto {
  titulo: string;
  descripcion: string;
  tecnologias: string[];
}

export interface CvCurso {
  titulo: string;
  institucion: string;
}

export interface DatosCv {
  nombre: string;
  /** "Ingeniero de Software": el titular que pide la ficha, no el `jobTitle` SEO de otros contextos. */
  titular: string;
  resumen: string;
  contacto: { email: string; github: string; linkedin: string; ubicacion: string; sitio: string };
  skills: CvSkill[];
  proyectos: CvProyecto[];
  cursos: CvCurso[];
}

/** Top N por porcentaje real, de mayor a menor. Nunca inventa una habilidad que no esté en los datos. */
const MAX_SKILLS = 10;
/** Los primeros N en el orden que Omar ya cura desde el panel (`position`), no una selección aparte. */
const MAX_PROYECTOS = 6;

const TITULAR = 'Ingeniero de Software';

function extraerEmail(): string {
  // El `mailto:` que ya usa ProfileCard — una sola fuente de verdad del correo público.
  return 'omarhernandezrey@gmail.com';
}

export async function gatherCvData(lang: Idioma = 'es'): Promise<DatosCv> {
  const [skills, proyectos, cursos] = await Promise.all([getSkills(), getProjects(), getBadges()]);

  const skillsOrdenadas: CvSkill[] = skills
    .map((s) => ({ nombre: s.name[lang] ?? s.name.es, porcentaje: parseInt(s.percentage, 10) || 0 }))
    .sort((a, b) => b.porcentaje - a.porcentaje)
    .slice(0, MAX_SKILLS);

  const proyectosDestacados: CvProyecto[] = proyectos.slice(0, MAX_PROYECTOS).map((p) => ({
    titulo: p.title[lang] ?? p.title.es,
    descripcion: p.description[lang] ?? p.description.es,
    tecnologias: p.technologies,
  }));

  const cursosDestacados: CvCurso[] = cursos.map((c) => ({
    titulo: c.title[lang] ?? c.title.es,
    institucion: c.institution[lang] ?? c.institution.es,
  }));

  return {
    nombre: OMAR_PROFILE.name,
    titular: TITULAR,
    resumen: OMAR_PROFILE.description,
    contacto: {
      email: extraerEmail(),
      github: 'https://github.com/omarhernandezrey',
      linkedin: 'https://www.linkedin.com/in/omarhernandezrey/',
      ubicacion: `${OMAR_PROFILE.addressLocality}, ${OMAR_PROFILE.addressCountry}`,
      sitio: OMAR_PROFILE.url,
    },
    skills: skillsOrdenadas,
    proyectos: proyectosDestacados,
    cursos: cursosDestacados,
  };
}
