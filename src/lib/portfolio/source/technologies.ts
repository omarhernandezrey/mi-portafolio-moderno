/**
 * Tecnologías del marquee (cintilla del stack en la home).
 *
 * Estaban inline en `src/components/sections/TechMarquee.tsx` como `allTech`,
 * con el icono en JSX (`icon: <FaReact />`). JSX no se serializa, así que el
 * icono pasa a ser `iconKey`: el NOMBRE DEL COMPONENTE, que
 * `./icon-registry` resuelve. El render no cambia: `TechMarquee` sigue
 * pintando el icono sin props, dentro del mismo `div` con `color` y tamaño.
 *
 * Destino: tabla `portfolio_technologies` (name unique + icon_key + color +
 * category). `name` es la identidad y se conserva LITERAL —"Swagger /
 * OpenAPI", "React Native (Expo)", "Vue.js"—: normalizarlo a minúsculas o a
 * slug rompería la resolución por cadena.
 *
 * El orden del array es el orden de la cintilla: se mapea a `position`.
 * Los comentarios "Verificado en este repo" vienen del original y se conservan.
 */
import type { PortfolioIconKey } from './icon-registry';

export interface MarqueeTechnology {
  /** Nombre tal cual. Es la identidad (unique en la tabla). */
  readonly name: string;
  /** Clave del registro de iconos = nombre del componente original. */
  readonly iconKey: PortfolioIconKey;
  /** Hex de marca, con las mayúsculas del original. */
  readonly color: string;
  /** Agrupación visual: Frontend, Backend, Base de datos, CI/CD… */
  readonly category: string;
}

// Stack completo: una sola cintilla con todas las tecnologías que uso
// (frontend, backend, bases de datos, DevOps, mobile, herramientas, etc.).
export const marqueeTechnologies: MarqueeTechnology[] = [
  { name: "React", iconKey: "FaReact", color: "#61DAFB", category: "Frontend" },
  { name: "Next.js", iconKey: "SiNextdotjs", color: "#000000", category: "Frontend" },
  { name: "TypeScript", iconKey: "SiTypescript", color: "#3178C6", category: "Frontend" },
  { name: "JavaScript", iconKey: "FaJs", color: "#F7DF1E", category: "Frontend" },
  { name: "HTML5", iconKey: "FaHtml5", color: "#E34F26", category: "Frontend" },
  { name: "CSS3", iconKey: "FaCss3Alt", color: "#1572B6", category: "Frontend" },
  { name: "Tailwind", iconKey: "SiTailwindcss", color: "#06B6D4", category: "Frontend" },
  { name: "Angular", iconKey: "SiAngular", color: "#DD0031", category: "Frontend" },
  { name: "Vue.js", iconKey: "SiVuedotjs", color: "#4FC08D", category: "Frontend" },

  { name: "Node.js", iconKey: "FaNodeJs", color: "#339933", category: "Backend" },
  { name: "Express", iconKey: "SiExpress", color: "#000000", category: "Backend" },
  { name: "NestJS", iconKey: "SiNestjs", color: "#E0234E", category: "Backend" },
  { name: "Swagger / OpenAPI", iconKey: "SiSwagger", color: "#85EA2D", category: "Backend" },
  { name: "Java", iconKey: "FaJava", color: "#007396", category: "Backend" },
  { name: "Spring Boot", iconKey: "SiSpringboot", color: "#6DB33F", category: "Backend" },
  { name: "Python", iconKey: "FaPython", color: "#3776AB", category: "Backend" },

  { name: "PostgreSQL", iconKey: "SiPostgresql", color: "#4169E1", category: "Base de datos" },
  { name: "MongoDB", iconKey: "SiMongodb", color: "#47A248", category: "Base de datos" },
  { name: "Redis", iconKey: "SiRedis", color: "#DC382D", category: "Base de datos" },
  { name: "Prisma", iconKey: "SiPrisma", color: "#2D3748", category: "Base de datos" },
  { name: "TypeORM", iconKey: "SiTypeorm", color: "#E83524", category: "Base de datos" },

  { name: "Docker", iconKey: "FaDocker", color: "#2496ED", category: "DevOps" },
  { name: "GitHub Actions", iconKey: "SiGithubactions", color: "#2088FF", category: "CI/CD" },
  { name: "Jenkins", iconKey: "SiJenkins", color: "#D24939", category: "CI/CD" },
  { name: "CircleCI", iconKey: "SiCircleci", color: "#343434", category: "CI/CD" },
  { name: "GitLab CI", iconKey: "SiGitlab", color: "#FC6D26", category: "CI/CD" },
  { name: "Vercel", iconKey: "SiVercel", color: "#000000", category: "Cloud" },
  { name: "Railway", iconKey: "SiRailway", color: "#0B0D0E", category: "Cloud" },
  // Verificado en este repo: backend real de auth/admin/leads de este mismo sitio
  { name: "Supabase", iconKey: "SiSupabase", color: "#3ECF8E", category: "Cloud" },
  { name: "Firebase", iconKey: "SiFirebase", color: "#FFCA28", category: "Cloud" },
  { name: "Nginx", iconKey: "SiNginx", color: "#009639", category: "Servidor" },

  { name: "Kotlin", iconKey: "SiKotlin", color: "#7F52FF", category: "Mobile" },
  { name: "Jetpack Compose", iconKey: "SiJetpackcompose", color: "#4285F4", category: "Mobile" },
  { name: "React Native (Expo)", iconKey: "SiExpo", color: "#000020", category: "Mobile" },
  { name: "Flutter", iconKey: "SiFlutter", color: "#02569B", category: "Mobile" },

  // Verificado en este repo: componente 3D "Lanyard" (github.com/omarhernandezrey/lanyard-project)
  { name: "Three.js", iconKey: "TbBrandThreejs", color: "#000000", category: "3D" },

  { name: "Jest", iconKey: "SiJest", color: "#C21325", category: "Testing" },
  { name: "Git", iconKey: "FaGitAlt", color: "#F05032", category: "Herramientas" },
  { name: "Vite", iconKey: "SiVite", color: "#646CFF", category: "Herramientas" },
  { name: "Webpack", iconKey: "SiWebpack", color: "#8DD6F9", category: "Herramientas" },
  { name: "Storybook", iconKey: "SiStorybook", color: "#FF4785", category: "Herramientas" },
  { name: "Figma", iconKey: "SiFigma", color: "#F24E1E", category: "Diseño" },
];

/** Conteo de tecnologías del marquee. Debe coincidir con CONTENIDO_ORIGINAL.tecnologias (42). */
export const MARQUEE_TECHNOLOGIES_COUNT: number = marqueeTechnologies.length;
