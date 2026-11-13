/**
 * Insignias destacadas (carrusel de FeaturedCertificates).
 *
 * Estaban inline en `src/components/sections/EducationSection.tsx` como
 * `highlightedCoursesData`. Se extraen tal cual —mismo orden, mismos textos,
 * mismas rutas— para que el seed de `portfolio_badges` pueda importarlas sin
 * arrastrar el componente (ni "use client", ni framer-motion, ni next/image).
 *
 * Los textos NO se tocan: ni tildes, ni mayúsculas, ni redacción.
 *
 * OJO con el conteo: `CONTENIDO_ORIGINAL.insignias_destacadas` de
 * `src/lib/portfolio/types.ts` dice 15 y `PLAN_MAESTRO_DASHBOARD.md` también,
 * pero el array inline tenía 7 entradas. No se ha inventado ninguna: aquí están
 * las 7 que existían. Además, en runtime el componente antepone una entrada
 * sintética `latest-course` (el curso más reciente de `educationData`), así
 * que el carrusel muestra 8. Esa entrada se calcula, no es dato de origen, y por
 * eso no está en este módulo.
 */

/** Forma original del array, idéntica a la interfaz que tenía el componente. */
export interface HighlightedCourse {
  id: string;
  title: { es: string; en: string };
  institution: { es: string; en: string };
  summary: { es: string; en: string };
  logo: string;
  certificate?: string | null;
}

export const highlightedCoursesData: HighlightedCourse[] = [
  {
    id: 'universidad-ingenieria-software',
    title: {
      es: 'Ingeniería de Software',
      en: 'Software Engineering',
    },
    institution: {
      es: 'Politécnico Grancolombiano',
      en: 'Politécnico Grancolombiano',
    },
    summary: {
      es: 'Formación universitaria en arquitectura, metodologías ágiles y desarrollo.',
      en: 'University training in architecture, agile methodologies, and development.',
    },
    logo: '/images/education/politecnico/politecnico-logo.png',
    certificate: null,
  },
  {
    id: 'sena-tecnologo-adsi',
    title: {
      es: 'Tecnólogo ADSI',
      en: 'ADSI Technologist',
    },
    institution: {
      es: 'Servicio Nacional de Aprendizaje (SENA)',
      en: 'National Learning Service (SENA)',
    },
    summary: {
      es: 'Base sólida en análisis, desarrollo y mantenimiento de sistemas.',
      en: 'Solid foundation in analysis, development, and systems maintenance.',
    },
    logo: '/images/education/sena/sena-logo.png',
    certificate:
      '/images/education/sena/01tecnologoEnTituloAnalisisYDesarrolloDeSistemasDeInformacion.png',
  },
  {
    id: 'talento-tech-bootcamp',
    title: {
      es: 'Bootcamp en Desarrollo Web Full Stack',
      en: 'Full Stack Web Development Bootcamp',
    },
    institution: {
      es: 'Talento Tech Bogotá',
      en: 'Talento Tech Bogotá',
    },
    summary: {
      es: 'Entrenamiento intensivo práctico con tecnologías modernas.',
      en: 'Intensive, practical training with modern technologies.',
    },
    logo: '/images/education/talento-tech/talento-tech-logo.png',
    certificate:
      '/images/education/talento-tech/desarrolloWebFullStack_page-0001.jpg',
  },
  {
    id: 'itcertificate-fullstack',
    title: {
      es: 'Full Stack Developer Certified Specialist',
      en: 'Full Stack Developer Certified Specialist',
    },
    institution: {
      es: 'ITCertificate',
      en: 'ITCertificate',
    },
    summary: {
      es: 'Demuestra dominio integral en frontend y backend.',
      en: 'Demonstrates end-to-end mastery in frontend and backend.',
    },
    logo: '/images/education/ITCertificate/itcertificate-logo.png',
    certificate:
      '/images/education/ITCertificate/fullStackDeveloperCertifiedSpecialist_page-0001.jpg',
  },
  {
    id: 'itcertificate-backend-pro',
    title: {
      es: 'Back End Developer Certified Professional',
      en: 'Back End Developer Certified Professional',
    },
    institution: {
      es: 'ITCertificate',
      en: 'ITCertificate',
    },
    summary: {
      es: 'Habilidades avanzadas en servidores, bases de datos y lógica de aplicaciones.',
      en: 'Advanced skills in servers, databases, and application logic.',
    },
    logo: '/images/education/ITCertificate/itcertificate-logo.png',
    certificate: '/images/education/ITCertificate/backEndDeveloperCertifiedProfessional_page-0001.jpg',
  },
  {
    id: 'sena-mysql',
    title: {
      es: 'Construcción de Bases de Datos con MySQL',
      en: 'MySQL Database Construction',
    },
    institution: {
      es: 'Servicio Nacional de Aprendizaje (SENA)',
      en: 'National Learning Service (SENA)',
    },
    summary: {
      es: 'Diseño, implementación y gestión de bases de datos relacionales con MySQL.',
      en: 'Design, implementation, and management of relational databases with MySQL.',
    },
    logo: '/images/education/sena/sena-logo.png',
    certificate: '/images/education/sena/03certificadoAprobacionConstruccionDeBasesDeDatosConMysql.png',
  },
  {
    id: 'sena-metodologia-programacion',
    title: {
      es: 'Metodología de la Programación de Sistemas Informáticos',
      en: 'Methodology of Programming for Information Systems',
    },
    institution: {
      es: 'Servicio Nacional de Aprendizaje (SENA)',
      en: 'National Learning Service (SENA)',
    },
    summary: {
      es: 'Fundamentos de programación y análisis de sistemas.',
      en: 'Foundations of programming and systems analysis.',
    },
    logo: '/images/education/sena/sena-logo.png',
    certificate: '/images/education/sena/02certificadoAprobacionMetodologiaDeLaProgramacionDeSistemasInformaticos.png',
  },
];

/** Conteo real de insignias destacadas en el código original. */
export const HIGHLIGHTED_COURSES_COUNT: number = highlightedCoursesData.length;
