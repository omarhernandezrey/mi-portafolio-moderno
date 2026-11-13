/**
 * Hitos del timeline de /sobre-mi ("Mi Camino en el Desarrollo").
 *
 * Estaban inline en `src/app/[locale]/sobre-mi/page.tsx` como `timelineEs` y
 * `timelineEn`, con el icono en JSX (`icon: <GraduationCap size={20} />`).
 * Ahora es `iconKey` y lo resuelve `./icon-registry`.
 *
 * DATO QUE CONVIENE SABER: la página NUNCA renderizaba ese icono. El `.map`
 * del timeline pinta `year`, `title` y `description`, y el punto de la línea
 * es un `div` redondo, no el icono. El campo estaba ahí sin usarse, así que
 * pasarlo a `iconKey` no cambia un pixel. Se conserva porque la tabla
 * `portfolio_timeline` tiene `icon_key` y el dato describe el hito.
 *
 * Los dos idiomas van por separado, como en el original. El seed los unirá en
 * el jsonb `{"es": …, "en": …}` emparejando por posición: los cuatro hitos
 * están en el mismo orden y con el mismo `iconKey`.
 *
 * PERO el `year` NO es idéntico en los dos idiomas: el cuarto hito dice
 * '2025 - Presente' en español y '2025 - Present' en inglés. La columna
 * `portfolio_timeline.year` es `text`, sin idioma, así que el seed tendrá que
 * elegir cuál guarda (o pasar el año a jsonb como el resto). Aquí se conservan
 * las dos cadenas tal cual estaban; no se ha unificado nada.
 */
import type { PortfolioIconKey } from './icon-registry';

export interface TimelineMilestone {
  /** Rango o año, tal cual: '2020 - 2022', '2025 - Presente'. */
  readonly year: string;
  readonly title: string;
  readonly description: string;
  /** Clave del registro de iconos = nombre del componente original. */
  readonly iconKey: PortfolioIconKey;
}

export const timelineEs: TimelineMilestone[] = [
  {
    year: '2020 - 2022',
    title: 'Fundamentos y Formación Técnica',
    description: 'Inicié mi camino en desarrollo con el SENA. Cursé y aprobé el tecnólogo en Análisis y Desarrollo de Sistemas de Información (ADSI), construyendo bases sólidas en análisis, diseño y desarrollo de software. Comencé a ofrecer servicios de desarrollo web.',
    iconKey: 'GraduationCap',
  },
  {
    year: '2023',
    title: 'Expansión a Desarrollo Web Moderno',
    description: 'Ingresé al Politécnico Grancolombiano para estudiar Ingeniería de Software. Inicié formación intensiva en React.js, Vite.js, TailwindCSS y JavaScript avanzado. Comencé a construir proyectos full stack con tecnologías modernas.',
    iconKey: 'Code2',
  },
  {
    year: '2024',
    title: 'Certificaciones y Bootcamps',
    description: 'Completé el Bootcamp Full Stack de Talento Tech (159 horas, Ministerio TIC). Obtuve certificación ITCertificate como Full Stack Developer Certified Specialist. Desarrollé proyectos complejos como Shopi (e-commerce full stack) y Diccionario Dev (plataforma de aprendizaje con 200+ términos, PostgreSQL y Redis).',
    iconKey: 'Sparkles',
  },
  {
    year: '2025 - Presente',
    title: 'Especialización Full Stack y Automatización',
    description: 'Enfoque en automatización de procesos empresariales y arquitecturas escalables. Próximo a graduarme como Ingeniero de Software. Desarrollo de soluciones full stack para clientes en Colombia y remoto USA, con stack React, Next.js, Node.js y PostgreSQL.',
    iconKey: 'Briefcase',
  },
];

export const timelineEn: TimelineMilestone[] = [
  {
    year: '2020 - 2022',
    title: 'Foundations & Technical Training',
    description: 'Started my development path with SENA. Completed the ADSI (Information Systems Analysis and Development) technologist program, building solid foundations in analysis, design, and software development. Began offering web development services.',
    iconKey: 'GraduationCap',
  },
  {
    year: '2023',
    title: 'Expansion into Modern Web Development',
    description: 'Enrolled at Politécnico Grancolombiano to study Software Engineering. Started intensive training in React.js, Vite.js, TailwindCSS, and advanced JavaScript. Began building full stack projects with modern technologies.',
    iconKey: 'Code2',
  },
  {
    year: '2024',
    title: 'Certifications & Bootcamps',
    description: 'Completed the Talento Tech Full Stack Bootcamp (159 hours, Ministerio TIC). Earned ITCertificate certification as a Full Stack Developer Certified Specialist. Built complex projects like Shopi (full stack e-commerce) and Diccionario Dev (a learning platform with 200+ terms, PostgreSQL, and Redis).',
    iconKey: 'Sparkles',
  },
  {
    year: '2025 - Present',
    title: 'Full Stack Specialization & Automation',
    description: 'Focused on business process automation and scalable architectures. About to graduate as a Software Engineer. Building full stack solutions for clients in Colombia and remote in the US, with a React, Next.js, Node.js, and PostgreSQL stack.',
    iconKey: 'Briefcase',
  },
];

/** Conteo de hitos en español. */
export const TIMELINE_ES_COUNT: number = timelineEs.length;

/** Conteo de hitos en inglés. Debe ser igual al español: el seed empareja por posición. */
export const TIMELINE_EN_COUNT: number = timelineEn.length;
