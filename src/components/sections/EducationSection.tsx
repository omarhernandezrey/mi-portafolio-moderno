"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { educationData } from "../../lib/educationData";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import EducationModal from "../ui/EducationModal";
import FeaturedCertificates from "./FeaturedCertificates";
import { useTranslation } from "@/hooks/useTranslation";

// Icono de graduación personalizado
const GraduationCapIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
  </svg>
);

// Tipado para los ítems de educación
interface EducationItem {
  category: string;
  title: string;
  institution: string;
  duration: string;
  description: string;
  logo: string;
  certificate?: string | null;
  completionTimestamp?: number | null;
  isNew?: boolean;
}

const INITIAL_VISIBLE_ITEMS = 7;
const LOAD_MORE_STEP = 1;

const prefetchImageCache = new Set<string>();

const prefetchCertificate = (url?: string | null) => {
  if (!url || typeof window === "undefined") return;
  if (prefetchImageCache.has(url)) return;
  prefetchImageCache.add(url);
  const img = new window.Image();
  img.decoding = "async";
  img.loading = "eager";
  img.src = url;
};

interface HighlightedCourse {
  id: string;
  title: { es: string; en: string };
  institution: { es: string; en: string };
  summary: { es: string; en: string };
  logo: string;
  certificate?: string | null;
}

const highlightedCoursesData: HighlightedCourse[] = [
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
  {
    id: 'platzi-backend-intro',
    title: {
      es: 'Introducción al Desarrollo Backend',
      en: 'Introduction to Backend Development',
    },
    institution: {
      es: 'Platzi',
      en: 'Platzi',
    },
    summary: {
      es: 'Conceptos fundamentales sobre servidores, APIs y bases de datos.',
      en: 'Fundamental concepts of servers, APIs, and databases.',
    },
    logo: '/images/education/platzi/platzi-logo.png',
    certificate: '/images/education/platzi/26DiplomaDelCursoDeIntroduccinAlDesarrolloBackend.png',
  },
  {
    id: 'platzi-sql',
    title: {
      es: 'Curso de Base de Datos con SQL',
      en: 'Database Course with SQL',
    },
    institution: {
      es: 'Platzi',
      en: 'Platzi',
    },
    summary: {
      es: 'Diseño, consultas y gestión eficiente de bases de datos relacionales.',
      en: 'Design, querying, and efficient management of relational databases.',
    },
    logo: '/images/education/platzi/platzi-logo.png',
    certificate: '/images/education/platzi/27DiplomaDelCursoDeBasesDeDatosConSql.png',
  },
  {
    id: 'platzi-audiocurso-arquitecturas-frontend',
    title: {
      es: 'Audiocurso de Frameworks y Arquitecturas Frontend: Casos de Estudio',
      en: 'Audio Course: Frontend Frameworks and Architectures – Case Studies',
    },
    institution: {
      es: 'Platzi',
      en: 'Platzi',
    },
    summary: {
      es: 'Análisis de arquitecturas y frameworks modernos de frontend.',
      en: 'Analysis of modern frontend architectures and frameworks.',
    },
    logo: '/images/education/platzi/platzi-logo.png',
    certificate: '/images/education/platzi/53%20diploma-arquitectura-frontend.jpg',
  },
  {
    id: 'platzi-frameworks-librerias-js',
    title: {
      es: 'Curso de Frameworks y Librerías de JavaScript',
      en: 'JavaScript Frameworks and Libraries Course',
    },
    institution: {
      es: 'Platzi',
      en: 'Platzi',
    },
    summary: {
      es: 'Comprensión de frameworks y librerías del ecosistema JavaScript.',
      en: 'Understanding frameworks and libraries in the JavaScript ecosystem.',
    },
    logo: '/images/education/platzi/platzi-logo.png',
    certificate: '/images/education/platzi/52%20diploma-frameworks-javascript.jpg',
  },
  {
    id: 'platzi-curso-react-2023',
    title: {
      es: 'Curso de React.js',
      en: 'React.js Course',
    },
    institution: {
      es: 'Platzi',
      en: 'Platzi',
    },
    summary: {
      es: 'Construcción de interfaces dinámicas con hooks, estado y buenas prácticas en React.',
      en: 'Building dynamic interfaces with hooks, state, and React best practices.',
    },
    logo: '/images/education/platzi/platzi-logo.png',
    certificate: '/images/education/platzi/54 diploma-react.jpg',
  },
  {
    id: 'platzi-git-github',
    title: {
      es: 'Curso Profesional de Git y GitHub',
      en: 'Professional Git and GitHub Course',
    },
    institution: {
      es: 'Platzi',
      en: 'Platzi',
    },
    summary: {
      es: 'Control de versiones, repositorios y colaboración profesional.',
      en: 'Version control, repositories, and professional collaboration.',
    },
    logo: '/images/education/platzi/platzi-logo.png',
    certificate: '/images/education/platzi/09DiplomaGitGithub.png',
  },
];

const spanishMonths: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  setiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

const normalizeSpanish = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[^\w\s]/g, '')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

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

const getCompletionTimestamp = (duration: string | { es?: string; en?: string }): number | null => {
  if (typeof duration === 'string') {
    return parseEnglishDate(duration) ?? parseSpanishDate(duration);
  }

  return (
    parseEnglishDate(duration.en) ??
    parseSpanishDate(duration.es) ??
    null
  );
};

// Función para obtener datos internacionalizados
const getLocalizedEducationData = (data: typeof educationData, language: string): EducationItem[] => {
  const lang = language as 'es' | 'en';
  
  return data
    .flatMap((category) =>
      category.items.map((item) => {
        const localizedDuration =
          typeof item.duration === 'string'
            ? item.duration
            : item.duration?.[lang] || item.duration?.es || '';
        const completionTimestamp = getCompletionTimestamp(item.duration ?? localizedDuration);

        return {
          category:
            typeof category.category === 'string'
              ? category.category
              : category.category[lang] || category.category.es,
          title:
            typeof item.title === 'string'
              ? item.title
              : item.title[lang] || item.title.es,
          institution:
            typeof item.institution === 'string'
              ? item.institution
              : item.institution[lang] || item.institution.es,
          duration: localizedDuration,
          description:
            typeof item.description === 'string'
              ? item.description
              : item.description[lang] || item.description.es,
          logo: item.logo,
          certificate: item.certificate,
          completionTimestamp,
          isNew: Boolean(item.isNew),
        };
      }),
    )
    .sort((a, b) => {
      const aDate = a.completionTimestamp ?? Number.NEGATIVE_INFINITY;
      const bDate = b.completionTimestamp ?? Number.NEGATIVE_INFINITY;
      if (aDate === bDate) return 0;
      return bDate - aDate;
    });
};

// Componente para mostrar el logo en la línea de tiempo con fallback seguro
function TimelineLogo({
  logo,
  institution,
}: {
  logo: string;
  institution: string;
}) {
  const [imgError, setImgError] = useState(false);

  if (!logo || imgError) {
    return (
      <div className="timeline-inner-circle" style={{ display: "flex" }}>
        <GraduationCapIcon size={16} />
      </div>
    );
  }

  return (
    <Image
      src={logo}
      alt={`${institution} logo`}
      width={80}
      height={80}
      className="timeline-logo"
      onError={() => setImgError(true)}
    />
  );
}

// Función para aplanar los datos (deprecada, ahora usamos getLocalizedEducationData)
// const flattenEducationData = (data: typeof educationData): EducationItem[] => {
//   return data.flatMap((category) =>
//     category.items.map((item) => ({
//       category: category.category,
//       ...item,
//     })),
//   );
// };

// Defino la interfaz FloatingElement antes de su uso
interface FloatingElement {
  id: number;
  size: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  opacity: number;
}

const createFloatingElements = (count = 12) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 4,
    duration: Math.random() * 10 + 15,
    opacity: Math.random() * 0.4 + 0.1,
  }));

const EducationSection = () => {
  const { t, language, isHydrated } = useTranslation();
  const allItems = useMemo<EducationItem[]>(
    () => getLocalizedEducationData(educationData, language),
    [language],
  );
  const totalItems = allItems.length;
  const latestItem = allItems.find((item) => item.isNew) ?? allItems[0] ?? null;
  const currentLanguage = language === 'en' ? 'en' : 'es';
  const fallbackTotalLabel = currentLanguage === 'en'
    ? `${totalItems} courses completed`
    : `${totalItems} cursos completados`;
  const highlightedCourses = useMemo(() =>
    highlightedCoursesData.map((course) => ({
      id: course.id,
      title: course.title[currentLanguage],
      institution: course.institution[currentLanguage],
      summary: course.summary[currentLanguage],
      logo: course.logo,
      certificate: course.certificate ?? null,
    })),
    [currentLanguage],
  );
  const highlightCount = highlightedCourses.length;

  const [visibleCount, setVisibleCount] = useState<number>(0);
  const [visibleItems, setVisibleItems] = useState<EducationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<EducationItem | null>(null);
  const loadMoreTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>(
    [],
  );
  const sectionRef = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  useEffect(() => {
    if (loadMoreTimeout.current) {
      clearTimeout(loadMoreTimeout.current);
      loadMoreTimeout.current = null;
    }
    const initialBatch = Math.min(INITIAL_VISIBLE_ITEMS, allItems.length);
    setVisibleItems(allItems.slice(0, initialBatch));
    setVisibleCount(initialBatch);
    setHasMore(initialBatch < allItems.length);
    setIsLoading(false);
  }, [allItems]);

  const loadMoreItems = useCallback(() => {
    if (visibleCount >= allItems.length) {
      setHasMore(false);
      return;
    }

    setIsLoading(true);

    const nextCount = Math.min(visibleCount + LOAD_MORE_STEP, allItems.length);
    const updatedItems = allItems.slice(0, nextCount);

    if (loadMoreTimeout.current) {
      clearTimeout(loadMoreTimeout.current);
    }

    loadMoreTimeout.current = setTimeout(() => {
      setVisibleItems(updatedItems);
      setVisibleCount(nextCount);
      setHasMore(nextCount < allItems.length);
      setIsLoading(false);
      loadMoreTimeout.current = null;
    }, 250);
  }, [visibleCount, allItems]);

  useEffect(() => {
    setFloatingElements(createFloatingElements());
  }, []);

  useEffect(() => {
    return () => {
      if (loadMoreTimeout.current) {
        clearTimeout(loadMoreTimeout.current);
      }
    };
  }, []);

  const openModal = (item: EducationItem) => {
    setSelectedItem(item);
  };

  const closeModal = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.stopPropagation?.();
    setSelectedItem(null);
  };

  return (
    <>
      <style>{`
        .education-section {
          min-height: 100vh;
          padding: 10rem 1rem 3rem 1rem;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, var(--background-color) 0%, var(--secondary-background-color) 50%, var(--background-color) 100%);
        }

        .bg-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent, var(--accent-color, rgba(147, 51, 234, 0.05)), transparent);
          pointer-events: none;
        }

        .bg-blob-1 {
          position: absolute;
          top: 5rem;
          left: 2.5rem;
          width: 10rem;
          height: 10rem;
          background-color: var(--primary-color, rgba(168, 85, 247, 0.1));
          border-radius: 50%;
          filter: blur(48px);
        }

        .bg-blob-2 {
          position: absolute;
          bottom: 5rem;
          right: 2.5rem;
          width: 15rem;
          height: 15rem;
          background-color: var(--accent-color, rgba(243, 156, 18, 0.1));
          border-radius: 50%;
          filter: blur(48px);
        }

        .wave-top {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          transform: rotate(180deg);
          overflow: hidden;
          line-height: 0;
          z-index: 0;
        }

        .container {
          position: relative;
          z-index: 10;
          max-width: 80rem;
          margin: 0 auto;
        }

        .title-wrapper {
          text-align: center;
          margin-bottom: 2.5rem;
          padding: 0 1rem;
        }

        .title {
          font-size: 1.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
          background-image: linear-gradient(to right, var(--primary-color), var(--accent-color));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .title-underline {
          width: 4rem;
          height: 0.2rem;
          background: linear-gradient(to right, var(--primary-color), var(--accent-color));
          margin: 0 auto;
          border-radius: 0.25rem;
        }

        .timeline-meta {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--muted-color);
          letter-spacing: 0.02em;
        }

        .timeline-meta .total-count {
          padding: 0.4rem 1rem;
          border-radius: 9999px;
          background-color: color-mix(in srgb, var(--accent-color) 12%, transparent);
          border: 1px solid color-mix(in srgb, var(--accent-color) 35%, transparent);
          box-shadow: 0 8px 20px color-mix(in srgb, var(--accent-color) 15%, transparent);
          color: color-mix(in srgb, var(--accent-color) 70%, white 30%);
        }

        .timeline {
          position: relative;
          max-width: 100%;
          margin: 0 auto;
          padding: 1rem 0 3rem 0;
        }

        .timeline-line {
          position: absolute;
          width: 3px;
          height: 100%;
          background-color: var(--accent-color);
          top: 0;
          left: 50%;
          transform: translateX(-50%);
        }

        .cap-icon {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          background-color: var(--accent-color);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          color: var(--background-color);
          box-shadow: 0 0 10px var(--accent-color, rgba(243, 156, 18, 0.5));
          z-index: 2;
        }

        .timeline-item {
          position: relative;
          width: 50%;
          padding: 10px 15px;
          cursor: pointer;
          margin-bottom: 10px;
        }

        .timeline-item.left {
          left: 0;
          text-align: right;
          padding-right: 20px;
        }

        .timeline-item.right {
          left: 50%;
          text-align: left;
          padding-left: 20px;
        }

        .timeline-icon {
          position: absolute;
          top: 15px;
          width: 35px;
          height: 35px;
          background-color: var(--card-bg-color);
          border: 2px solid var(--accent-color);
          border-radius: 50%;
          z-index: 2;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .timeline-item.left .timeline-icon {
          right: -17.5px;
        }

        .timeline-item.right .timeline-icon {
          left: -17.5px;
        }

        .timeline-logo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          display: block;
        }

        .timeline-inner-circle {
          width: 100%;
          height: 100%;
          background-color: var(--accent-color);
          color: var(--card-bg-color);
          border-radius: 50%;
          font-size: 1rem;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .timeline-content {
          background-color: var(--card-bg-color);
          padding: 10px 12px;
          border-radius: 8px;
          position: relative;
          box-shadow: 0 3px 5px var(--accent-color, rgba(0, 0, 0, 0.1));
          transition: all 0.3s ease;
          border: 1px solid var(--accent-color, rgba(243, 156, 18, 0.2));
        }

        .timeline-item.left .timeline-content::after {
          content: "";
          position: absolute;
          top: 15px;
          right: -8px;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 8px 0 8px 8px;
          border-color: transparent transparent transparent var(--card-bg-color);
        }

        .timeline-item.right .timeline-content::after {
          content: "";
          position: absolute;
          top: 15px;
          left: -8px;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 8px 8px 8px 0;
          border-color: transparent var(--card-bg-color) transparent transparent;
        }

        .timeline-item.load-more .timeline-content {
          border-style: dashed;
          border-width: 2px;
          border-color: color-mix(in srgb, var(--accent-color) 50%, transparent);
          background-color: color-mix(in srgb, var(--accent-color) 10%, transparent);
          text-align: center;
          cursor: pointer;
        }

        .timeline-item.load-more .timeline-inner-circle {
          background-color: color-mix(in srgb, var(--accent-color) 65%, transparent);
          color: var(--background-color);
          font-weight: 700;
        }

        .timeline-item.load-more:hover .timeline-content {
          transform: scale(1.05);
          box-shadow: 0 12px 26px color-mix(in srgb, var(--accent-color) 25%, transparent);
        }

        .timeline-item.load-more.loading .timeline-content,
        .timeline-item.load-more[aria-disabled="true"] .timeline-content {
          opacity: 0.6;
          cursor: wait;
          box-shadow: none;
        }

        .item-index {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
          min-width: 2.5rem;
          height: 2.5rem;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 0.9rem;
          background-color: color-mix(in srgb, var(--accent-color) 12%, transparent);
          color: color-mix(in srgb, var(--accent-color) 70%, white 30%);
          border: 2px solid color-mix(in srgb, var(--accent-color) 55%, transparent);
          box-shadow: 0 6px 16px color-mix(in srgb, var(--accent-color) 20%, transparent);
        }

        .item-title {
          font-size: 0.9rem;
          color: var(--primary-color);
          margin-bottom: 4px;
          font-weight: 600;
          word-wrap: break-word;
          line-height: 1.2;
        }

        .item-institution {
          font-size: 0.75rem;
          color: var(--text-color);
          margin-bottom: 3px;
          word-wrap: break-word;
          opacity: 0.9;
        }

        .item-duration {
          font-size: 0.7rem;
          color: var(--muted-color);
          word-wrap: break-word;
          opacity: 0.7;
        }

        .timeline-end-point {
          width: 15px;
          height: 15px;
          background-color: var(--accent-color);
          border-radius: 50%;
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
        }

        .loading-text {
          color: var(--muted-color);
          margin-top: 20px;
          font-size: 0.8rem;
          padding: 0 15px;
        }

        /* Animaciones */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .timeline-item {
          opacity: 0;
          animation: fadeInUp 0.6s forwards;
        }

        .timeline-item:nth-child(1) { animation-delay: 0.1s; }
        .timeline-item:nth-child(2) { animation-delay: 0.2s; }
        .timeline-item:nth-child(3) { animation-delay: 0.3s; }
        .timeline-item:nth-child(4) { animation-delay: 0.4s; }
        .timeline-item:nth-child(5) { animation-delay: 0.5s; }
        .timeline-item:nth-child(6) { animation-delay: 0.6s; }
        .timeline-item.latest-item .timeline-content {
          border-color: color-mix(in srgb, var(--accent-color) 70%, transparent);
          box-shadow: 0 12px 30px color-mix(in srgb, var(--accent-color) 35%, transparent);
        }

        .timeline-item.latest-item .timeline-icon {
          background-color: var(--accent-color);
          color: var(--background-color);
        }

        .timeline-item.latest-item .item-index {
          background: linear-gradient(135deg, var(--accent-color), color-mix(in srgb, var(--accent-color) 70%, white 30%));
          color: var(--background-color);
          border-color: transparent;
          box-shadow: 0 10px 24px color-mix(in srgb, var(--accent-color) 35%, transparent);
        }

        .latest-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-left: 0.75rem;
          padding: 0.25rem 0.65rem;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border-radius: 9999px;
          background: linear-gradient(135deg, var(--accent-color), color-mix(in srgb, var(--accent-color) 70%, white 30%));
          color: var(--background-color);
          box-shadow: 0 4px 14px color-mix(in srgb, var(--accent-color) 35%, transparent);
        }

        .timeline-item:nth-child(7) { animation-delay: 0.7s; }

        /* Hover effects */
        .timeline-item:hover .timeline-content {
          transform: scale(1.02);
          box-shadow: 0 5px 10px var(--accent-color, rgba(243, 156, 18, 0.2));
          border-color: var(--accent-color, rgba(243, 156, 18, 0.5));
        }

        .timeline-item:hover .timeline-icon {
          background-color: var(--accent-color);
          transform: scale(1.1);
        }

        /* Tablet and Desktop styles */
        @media (min-width: 768px) {
          .education-section {
            padding: 10rem 1.5rem 4rem 1.5rem;
          }

          .title {
            font-size: 2.5rem;
          }

          .timeline-line {
            width: 5px;
          }

          .cap-icon {
            width: 40px;
            height: 40px;
          }

          .timeline-icon {
            width: 45px;
            height: 45px;
          }

          .timeline-item.left .timeline-icon {
            right: -22.5px;
          }

          .timeline-item.right .timeline-icon {
            left: -22.5px;
          }

          .timeline-content {
            padding: 15px 20px;
          }

          .item-title {
            font-size: 1.2rem;
          }

          .item-institution {
            font-size: 0.95rem;
          }

          .item-duration {
            font-size: 0.85rem;
          }
        }

        @media (min-width: 1024px) {
          .title {
            font-size: 3rem;
          }

          .timeline-line {
            width: 6px;
          }

          .timeline-icon {
            width: 50px;
            height: 50px;
          }

          .timeline-item.left .timeline-icon {
            right: -25px;
          }

          .timeline-item.right .timeline-icon {
            left: -25px;
          }

          .item-title {
            font-size: 1.4rem;
          }

          .item-institution {
            font-size: 1.1rem;
          }

          .item-duration {
            font-size: 0.95rem;
          }
        }
      `}</style>

      <section
        ref={sectionRef}
        id="education"
        className="education-section relative min-h-screen py-32 px-4 overflow-hidden"
        aria-labelledby="education-title"
      >
        {/* Fondo parallax moderno (igual que AboutSection) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {/* Círculo grande blur */}
          <motion.div
            style={{ y: y1 }}
            className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] rounded-full bg-[var(--primary-color)] opacity-30 blur-3xl"
          />
          {/* Blob acento */}
          <motion.div
            style={{ y: y2 }}
            className="absolute top-[30%] right-[-100px] w-[280px] h-[280px] rounded-[60%_40%_30%_70%/_60%_30%_70%_40%] bg-[var(--accent-color)] opacity-40 blur-2xl rotate-12"
          />
          {/* Círculo degradado */}
          <motion.div
            style={{ y: y3 }}
            className="absolute bottom-[-100px] left-[20%] w-[220px] h-[220px] rounded-full bg-gradient-to-tr from-[var(--primary-color)] via-[var(--accent-color)] to-transparent opacity-30 blur-2xl"
          />
          {/* Línea diagonal luminosa */}
          <motion.div
            style={{ y: y4 }}
            className="absolute top-[60%] left-[-80px] w-[400px] h-[8px] bg-gradient-to-r from-[var(--accent-color)]/60 via-white/10 to-transparent opacity-40 rotate-[-20deg] blur-md"
          />
          {/* Círculo blanco suave */}
          <motion.div
            style={{ y: y2 }}
            className="absolute bottom-[-60px] right-[10%] w-[120px] h-[120px] rounded-full bg-white opacity-10 blur-2xl"
          />
        </div>
        {/* Partículas animadas tipo AboutSection */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {floatingElements.map((el) => (
            <motion.div
              key={el.id}
              className="absolute rounded-full"
              style={{
                width: el.size,
                height: el.size,
                left: `${el.x}%`,
                top: `${el.y}%`,
                backgroundColor: "var(--accent-color)",
                opacity: el.opacity,
              }}
              animate={{
                y: [-40, 40, -40],
                x: [-20, 20, -20],
                opacity: [el.opacity * 0.3, el.opacity, el.opacity * 0.3],
                scale: [1, 1.8, 1],
              }}
              transition={{
                duration: el.duration,
                repeat: Infinity,
                delay: el.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        {/* Wave superior */}
        <div className="absolute top-0 left-0 w-full rotate-180 overflow-hidden leading-[0] z-0">
          <Image
            src="/images/wave-top.svg"
            alt="Wave Top"
            className="w-full h-auto"
            width={1920}
            height={200}
          />
        </div>
        {/* Header Seccion - Consistente y Estable */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <motion.span
            className="inline-block px-4 py-2 mb-6 text-sm font-semibold tracking-wider uppercase rounded-full border"
            style={{
              color: "var(--accent-color)",
              backgroundColor: `color-mix(in srgb, var(--accent-color) 10%, transparent)`,
              borderColor: `color-mix(in srgb, var(--accent-color) 30%, transparent)`,
            }}
            whileHover={{ scale: 1.05 }}
          >
            {isHydrated ? t('education.badge') : 'Educación'}
          </motion.span>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            style={{
              backgroundImage:
                "linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {isHydrated ? t('education.headerTitle') : 'Mi Trayectoria Académica'}
          </h2>
        </motion.div>

        <div className="container">
          <div className="title-wrapper">
            <h2 id="education-title" className="title">
              {isHydrated ? t('education.title') : 'Educación'}
            </h2>
            <div className="title-underline" />
          </div>

          <div className="timeline-meta">
            <span className="total-count">
              {isHydrated
                ? t('education.totalCount', { count: totalItems })
                : fallbackTotalLabel}
            </span>
          </div>

          <div className="timeline">
            <div className="timeline-line" />
            <div className="cap-icon">
              <GraduationCapIcon size={16} />
            </div>

            {visibleItems.map((item, index) => {
              const alignment = index % 2 === 0 ? "right" : "left";
              const isLatest = Boolean(item.isNew || (latestItem && item === latestItem));
              const itemNumber = Math.max(totalItems - index, 1);

              return (
                <div
                  key={index}
                  className={`timeline-item ${alignment}${isLatest ? ' latest-item' : ''}`}
                  onClick={() => openModal(item)}
                  onKeyPress={(e) => e.key === "Enter" && openModal(item)}
                  onMouseEnter={() => prefetchCertificate(item.certificate)}
                  onFocus={() => prefetchCertificate(item.certificate)}
                  onTouchStart={() => prefetchCertificate(item.certificate)}
                  tabIndex={0}
                  role="button"
                  aria-pressed="false"
                  aria-labelledby={`education-item-title-${index}`}
                >
                  <div className="timeline-icon">
                    <TimelineLogo
                      logo={item.logo}
                      institution={item.institution}
                    />
                  </div>
                  <div className="timeline-content">
                    <span className="item-index">{itemNumber.toString().padStart(2, '0')}</span>
                    <h3
                      id={`education-item-title-${index}`}
                      className="item-title"
                    >
                      {item.title}
                      {isLatest && (
                        <span className="latest-badge">
                          {isHydrated ? t('education.latestBadge') : 'Nuevo'}
                        </span>
                      )}
                    </h3>
                    <p className="item-institution">{item.institution}</p>
                    <p className="item-duration">{item.duration}</p>
                  </div>
                </div>
              );
            })}

            {hasMore && (
              <div
                className={`timeline-item load-more left${isLoading ? ' loading' : ''}`}
                onClick={() => !isLoading && loadMoreItems()}
                onKeyPress={(e) => e.key === "Enter" && !isLoading && loadMoreItems()}
                tabIndex={0}
                role="button"
                aria-pressed="false"
                aria-disabled={isLoading}
                aria-label={isHydrated ? t('education.loadMoreEducation') : 'Cargar más educación'}
              >
                <div className="timeline-icon">
                  <div className="timeline-inner-circle">+</div>
                </div>
                <div className="timeline-content">
                  <h3 className="item-title">{isHydrated ? t('education.loadMore') : 'Cargar Más'}</h3>
                </div>
              </div>
            )}

            <div
              id="infinite-scroll-sentinel"
              className="timeline-end-point"
            ></div>
          </div>

          {highlightCount > 0 && <FeaturedCertificates courses={highlightedCourses} />}

          {isLoading && (
            <p className="loading-text">{isHydrated ? t('education.loading') : 'Cargando más...'}</p>
          )}

          {selectedItem && (
            <EducationModal
              isOpen={true}
              onClose={closeModal}
              title={selectedItem.title}
              institution={selectedItem.institution}
              duration={selectedItem.duration}
              description={selectedItem.description}
              logo={selectedItem.logo}
              certificate={selectedItem.certificate}
            />
          )}

        </div>
      </section>
    </>
  );
};

export default EducationSection;
