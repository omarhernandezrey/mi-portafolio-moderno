"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { educationData } from "../../lib/educationData";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";
import EducationModal from "../ui/EducationModal";
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
}

const INITIAL_VISIBLE_ITEMS = 8;
const LOAD_MORE_STEP = 4;

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
      es: 'Certificación que avala dominio integral en frontend y backend.',
      en: 'Certification proving end-to-end mastery in frontend and backend.',
    },
    logo: '/images/education/ITCertificate/itcertificate-logo.png',
    certificate:
      '/images/education/ITCertificate/fullStackDeveloperCertifiedSpecialist_page-0001.jpg',
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
      es: 'Entrenamiento intensivo con proyectos reales y tecnologías modernas.',
      en: 'Intensive training with real projects and modern technologies.',
    },
    logo: '/images/education/talento-tech/talento-tech-logo.png',
    certificate:
      '/images/education/talento-tech/desarrolloWebFullStack_page-0001.jpg',
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
      es: 'Formación técnica en análisis, diseño y mantenimiento de sistemas.',
      en: 'Technical training in systems analysis, design, and maintenance.',
    },
    logo: '/images/education/sena/sena-logo.png',
    certificate:
      '/images/education/sena/01tecnologoEnTituloAnalisisYDesarrolloDeSistemasDeInformacion.png',
  },
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
      es: 'Programa universitario enfocado en arquitectura y metodologías ágiles.',
      en: 'University program focused on architecture and agile methodologies.',
    },
    logo: '/images/education/politecnico/politecnico-logo.png',
    certificate: null,
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
      es: 'Fundamentos para crear APIs robustas y servicios escalables.',
      en: 'Foundations for building robust APIs and scalable services.',
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
      es: 'Dominio de consultas, modelado y optimización de bases relacionales.',
      en: 'Mastery of querying, modelling and optimising relational databases.',
    },
    logo: '/images/education/platzi/platzi-logo.png',
    certificate: '/images/education/platzi/27DiplomaDelCursoDeBasesDeDatosConSql.png',
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
      es: 'Diseño e implementación de soluciones relacionales en MySQL.',
      en: 'Design and implementation of relational solutions in MySQL.',
    },
    logo: '/images/education/sena/sena-logo.png',
    certificate: '/images/education/sena/03certificadoAprobacionConstruccionDeBasesDeDatosConMysql.png',
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
      style={{
        objectFit: "contain",
        borderRadius: "50%",
        boxShadow: "0 4px 16px rgba(243,156,18,0.15)",
        background: "#fff",
        border: "2px solid #f39c12",
        padding: "4px",
        display: "block",
        margin: "0 auto",
        transform: "scale(1.08)",
        transition: "transform 0.2s",
      }}
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
  const latestItem = allItems[0] ?? null;
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

  const [activeHighlight, setActiveHighlight] = useState<number>(0);
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const [visibleItems, setVisibleItems] = useState<EducationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<EducationItem | null>(null);
  const loadMoreTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  // Soporte para swipe táctil en móviles
  const touchStartXRef = React.useRef<number | null>(null);
  const touchStartYRef = React.useRef<number | null>(null);
  const touchStartTimeRef = React.useRef<number | null>(null);
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

  const clearHighlightAutoplay = useCallback(() => {
    if (highlightIntervalRef.current) {
      clearInterval(highlightIntervalRef.current);
      highlightIntervalRef.current = null;
    }
  }, []);

  const startHighlightAutoplay = useCallback(() => {
    clearHighlightAutoplay();
    if (highlightedCourses.length <= 1) return;
    highlightIntervalRef.current = setInterval(() => {
      setActiveHighlight((prev) => (prev + 1) % highlightedCourses.length);
    }, 6500);
  }, [highlightedCourses.length, clearHighlightAutoplay]);

  const goToHighlight = useCallback((targetIndex: number) => {
    if (!highlightedCourses.length) return;
    const length = highlightedCourses.length;
    const normalized = ((targetIndex % length) + length) % length;
    setActiveHighlight(normalized);
    startHighlightAutoplay();
  }, [highlightedCourses.length, startHighlightAutoplay]);

  const handlePrevHighlight = useCallback(() => {
    goToHighlight(activeHighlight - 1);
  }, [goToHighlight, activeHighlight]);

  const handleNextHighlight = useCallback(() => {
    goToHighlight(activeHighlight + 1);
  }, [goToHighlight, activeHighlight]);

  const handleHighlightPointerEnter = useCallback(() => {
    clearHighlightAutoplay();
  }, [clearHighlightAutoplay]);

  const handleHighlightPointerLeave = useCallback(() => {
    startHighlightAutoplay();
  }, [startHighlightAutoplay]);

  useEffect(() => {
    startHighlightAutoplay();
    return () => {
      clearHighlightAutoplay();
    };
  }, [startHighlightAutoplay, clearHighlightAutoplay]);

  useEffect(() => {
    if (!highlightedCourses.length) {
      setActiveHighlight(0);
      return;
    }
    setActiveHighlight((prev) => {
      if (prev >= highlightedCourses.length) {
        return highlightedCourses.length - 1;
      }
      return prev;
    });
  }, [highlightedCourses.length]);

  // Gestos táctiles para el carrusel destacado
  const onTouchStartHighlight = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartXRef.current = t.clientX;
    touchStartYRef.current = t.clientY;
    touchStartTimeRef.current = Date.now();
    handleHighlightPointerEnter(); // pausar autoplay mientras se interactúa
  }, [handleHighlightPointerEnter]);

  const onTouchEndHighlight = useCallback((e: React.TouchEvent) => {
    if (touchStartXRef.current == null || touchStartTimeRef.current == null) {
      handleHighlightPointerLeave();
      return;
    }
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartXRef.current;
    const dy = Math.abs(t.clientY - (touchStartYRef.current ?? t.clientY));
    const dt = Date.now() - touchStartTimeRef.current;

    // Umbrales: desplazamiento horizontal significativo, poco desplazamiento vertical
    const distanceThreshold = Math.max(40, window.innerWidth * 0.08);
    const verticalThreshold = 60;
    const timeThreshold = 800; // ms, swipes rápidos o medianos

    if (Math.abs(dx) > distanceThreshold && dy < verticalThreshold && dt < timeThreshold) {
      if (dx < 0) {
        handleNextHighlight();
      } else {
        handlePrevHighlight();
      }
    }

    // Reset
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchStartTimeRef.current = null;
    handleHighlightPointerLeave(); // reanudar autoplay
  }, [handleNextHighlight, handlePrevHighlight, handleHighlightPointerLeave]);

  useEffect(() => {
    setActiveHighlight(0);
    startHighlightAutoplay();
  }, [currentLanguage, startHighlightAutoplay]);

  useEffect(() => {
    setFloatingElements(createFloatingElements());
  }, []);

  useEffect(() => {
    return () => {
      if (loadMoreTimeout.current) {
        clearTimeout(loadMoreTimeout.current);
      }
      clearHighlightAutoplay();
    };
  }, [clearHighlightAutoplay]);

  const activeCourse = highlightedCourses[activeHighlight] ?? null;

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
          padding: 10rem 0.5rem 3rem 0.5rem;
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
          background: linear-gradient(to right, var(--primary-color), var(--accent-color));
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

        .highlights-section {
          margin: 4rem auto 0;
          max-width: 72rem;
          padding: 0 1rem 4rem;
        }

        .highlights-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .highlights-header h3 {
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 0.6rem;
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .highlights-header p {
          font-size: 0.95rem;
          color: var(--muted-color);
          max-width: 34rem;
          margin: 0.5rem auto 0;
          line-height: 1.6;
        }

        .highlights-shell {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 0; /* nav pegados al borde del stage */
          align-items: stretch;
          position: relative;
        }

        .highlights-stage {
          position: relative;
          overflow: hidden;
          border-radius: 1.75rem;
          background: color-mix(in srgb, var(--secondary-background-color) 82%, transparent);
          border: 1px solid color-mix(in srgb, var(--accent-color) 18%, transparent);
          box-shadow: 0 25px 60px color-mix(in srgb, var(--accent-color) 18%, transparent);
          min-height: 320px;
        }

        .highlights-card {
          width: 100%;
          height: 100%;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 2.25rem;
          padding: 2.75rem 3rem;
          align-items: center;
        }

        .highlights-media {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          border-radius: 1.25rem;
          overflow: hidden;
          background: linear-gradient(135deg, color-mix(in srgb, var(--accent-color) 20%, transparent), color-mix(in srgb, var(--primary-color) 25%, transparent));
          box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent-color) 25%, transparent);
        }

        .highlights-media img {
          object-fit: cover;
        }

        .highlights-media::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(160deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.45) 100%);
          pointer-events: none;
        }

        .highlights-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          color: color-mix(in srgb, var(--accent-color) 80%, white 20%);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .highlights-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          color: var(--text-color);
        }

        .highlights-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: color-mix(in srgb, var(--accent-color) 75%, white 25%);
        }

        .highlights-logo {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: color-mix(in srgb, var(--accent-color) 15%, transparent);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 12px 30px color-mix(in srgb, var(--accent-color) 18%, transparent);
        }

        .highlights-title {
          font-size: 1.75rem;
          font-weight: 800;
          line-height: 1.25;
        }

        .highlights-summary {
          font-size: 1rem;
          line-height: 1.7;
          color: var(--muted-color);
          max-width: 32rem;
        }

        .highlights-footer {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .highlights-progress {
          display: inline-flex;
          align-items: baseline;
          gap: 0.35rem;
          font-weight: 600;
          color: color-mix(in srgb, var(--accent-color) 70%, white 30%);
        }

        .highlights-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.55rem 1.35rem;
          border-radius: 9999px;
          font-size: 0.85rem;
          font-weight: 600;
          background: linear-gradient(135deg, var(--accent-color), color-mix(in srgb, var(--accent-color) 70%, white 30%));
          color: var(--background-color);
          box-shadow: 0 15px 35px color-mix(in srgb, var(--accent-color) 25%, transparent);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .highlights-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 40px color-mix(in srgb, var(--accent-color) 35%, transparent);
        }

        .highlights-nav {
          border: 1px solid color-mix(in srgb, var(--accent-color) 35%, transparent);
          width: 3rem;
          height: 3rem;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: color-mix(in srgb, var(--accent-color) 18%, transparent);
          -webkit-backdrop-filter: blur(8px);
          backdrop-filter: blur(8px);
          color: color-mix(in srgb, var(--accent-color) 75%, white 25%);
          font-size: 1.5rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
          box-shadow: 0 12px 30px color-mix(in srgb, var(--accent-color) 18%, transparent);
          position: static; /* desktop: usar grid */
          align-self: center; /* centro vertical respecto al stage */
          z-index: 3;
        }

        /* solape medio ancho sobre el borde del stage */
        .highlights-nav:first-of-type { margin-right: -1.5rem; }
        .highlights-nav:last-of-type { margin-left: -1.5rem; }

        .highlights-nav:hover {
          transform: scale(1.06);
          box-shadow: 0 18px 40px color-mix(in srgb, var(--accent-color) 28%, transparent);
          background: color-mix(in srgb, var(--accent-color) 24%, transparent);
          border-color: color-mix(in srgb, var(--accent-color) 45%, transparent);
        }

        .highlights-nav:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        .highlights-nav:focus-visible {
          outline: 2px solid color-mix(in srgb, var(--accent-color) 65%, transparent);
          outline-offset: 2px;
        }

        .highlights-dots {
          margin-top: 1.1rem;
          display: flex;
          justify-content: center;
          gap: 0.25rem;
        }

        .highlights-dot {
          width: 6px;
          height: 6px;
          padding: 0;
          line-height: 0;
          min-width: 0;
          min-height: 0;
          box-sizing: content-box;
          border-radius: 9999px;
          border: 1px solid color-mix(in srgb, var(--accent-color) 50%, transparent);
          background: color-mix(in srgb, var(--accent-color) 25%, transparent);
          cursor: pointer;
          transition: background 0.2s ease, box-shadow 0.2s ease;
        }

        .highlights-dot.active {
          background: color-mix(in srgb, var(--accent-color) 75%, white 25%);
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-color) 15%, transparent);
        }

        @media (max-width: 560px) {
          .highlights-dot {
            width: 5px;
            height: 5px;
            min-width: 0;
            min-height: 0;
          }

          .highlights-dots {
            gap: 0.22rem;
          }
        }

        @media (max-width: 420px) {
          .highlights-dot {
            width: 4px;
            height: 4px;
            min-width: 0;
            min-height: 0;
          }
        }

        @media (max-width: 1024px) {
          .highlights-card {
            grid-template-columns: minmax(0, 1fr);
            gap: 1.5rem;
            padding: 2.5rem 2rem;
          }

          .highlights-media {
            aspect-ratio: 16 / 10;
          }
        }

        @media (max-width: 768px) {
          .highlights-section {
            margin-top: 2.4rem;
          }

          .highlights-shell {
            position: relative;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.9rem 1rem;
            align-items: start;
            padding: 0.15rem 0;
          }

          .highlights-stage {
            grid-column: 1 / -1;
            order: -1;
            width: 100%;
            min-height: 0;
            border-radius: 1.4rem;
          }

          .highlights-card {
            grid-template-columns: minmax(0, 1fr);
            gap: 0.9rem;
            padding: 1.4rem 1rem;
          }

          .highlights-media {
            aspect-ratio: 4 / 3;
            border-radius: 1rem;
          }

          .highlights-content {
            align-items: flex-start;
            text-align: left;
          }

          .highlights-badge {
            justify-content: flex-start;
          }

          .highlights-footer {
            justify-content: flex-start;
          }

          .highlights-nav {
            position: static;
            transform: none;
            width: 2.4rem;
            height: 2.4rem;
            background: color-mix(in srgb, var(--accent-color) 22%, transparent);
            box-shadow: 0 10px 20px color-mix(in srgb, var(--accent-color) 18%, transparent);
            justify-self: center;
            margin: 0; /* reset solape desktop */
          }

          .highlights-nav:first-of-type { grid-column: 1; grid-row: 2; }
          .highlights-nav:last-of-type { grid-column: 2; grid-row: 2; }

          .highlights-dots {
            margin-top: 0.9rem;
            gap: 0.4rem;
          }
        }

        @media (max-width: 560px) {
          .highlights-header h3 {
            font-size: 1.35rem;
          }

          .highlights-summary {
            font-size: 0.9rem;
            max-width: 26rem;
          }

          .highlights-nav { width: 2.2rem; height: 2.2rem; }
          .highlights-summary { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
        }

        @media (max-width: 420px) {
          .highlights-section {
            margin-top: 2.1rem;
          }

          .highlights-card {
            padding: 1.2rem 1rem;
            border-radius: 0.9rem;
          }

          .highlights-media {
            aspect-ratio: 3 / 2;
            border-radius: 0.85rem;
          }

          .highlights-title {
            font-size: 1.16rem;
          }

          .highlights-summary {
            font-size: 0.85rem;
            display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
          }

          .highlights-nav {
            width: 2rem;
            height: 2rem;
          }

          .highlights-dots {
            margin-top: 0.8rem;
            gap: 0.35rem;
          }
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
          width: 65%;
          height: 65%;
          object-fit: contain;
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
          /* Botones carrusel prolijos en desktop */
          .highlights-nav {
            width: 3.25rem;
            height: 3.25rem;
          }
          .highlights-nav:first-of-type {
            left: clamp(0.5rem, 1vw, 1rem);
          }
          .highlights-nav:last-of-type {
            right: clamp(0.5rem, 1vw, 1rem);
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
        {/* Header animado igual que AboutSection */}
        {isHydrated && (
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
              {t('education.badge')}
            </motion.span>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t('education.headerTitle')}
            </h2>
          </motion.div>
        )}
        
        {/* Fallback para SSR */}
        {!isHydrated && (
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <span
              className="inline-block px-4 py-2 mb-6 text-sm font-semibold tracking-wider uppercase rounded-full border"
              style={{
                color: "var(--accent-color)",
                backgroundColor: `color-mix(in srgb, var(--accent-color) 10%, transparent)`,
                borderColor: `color-mix(in srgb, var(--accent-color) 30%, transparent)`,
              }}
            >
              Educación
            </span>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Mi Trayectoria Académica
            </h2>
          </div>
        )}

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
              const isLatest = Boolean(latestItem && item === latestItem);
              const itemNumber = Math.max(totalItems - index, 1);

              return (
                <div
                  key={index}
                  className={`timeline-item ${alignment}${isLatest ? ' latest-item' : ''}`}
                  onClick={() => openModal(item)}
                  onKeyPress={(e) => e.key === "Enter" && openModal(item)}
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

          {highlightCount > 0 && activeCourse && (
            <div className="highlights-section">
              <div className="highlights-header">
                <h3>{isHydrated ? t('education.highlightsTitle') : 'Certificaciones destacadas'}</h3>
                <p>{isHydrated ? t('education.highlightsSubtitle') : 'Una selección de logros que resumen mi crecimiento profesional.'}</p>
              </div>

              <div className="highlights-shell">
                <button
                  type="button"
                  className="highlights-nav"
                  onClick={handlePrevHighlight}
                  onMouseEnter={handleHighlightPointerEnter}
                  onMouseLeave={handleHighlightPointerLeave}
                  onFocus={handleHighlightPointerEnter}
                  onBlur={handleHighlightPointerLeave}
                  aria-label={isHydrated ? t('education.carouselPrevious') : 'Ver certificación anterior'}
                  disabled={highlightCount <= 1}
                >
                  ‹
                </button>

                <div
                  className="highlights-stage"
                  onMouseEnter={handleHighlightPointerEnter}
                  onMouseLeave={handleHighlightPointerLeave}
                  onFocusCapture={handleHighlightPointerEnter}
                  onBlurCapture={handleHighlightPointerLeave}
                  onTouchStart={onTouchStartHighlight}
                  onTouchEnd={onTouchEndHighlight}
                  role="region"
                  aria-live="polite"
                >
                  <AnimatePresence mode="wait">
                    <motion.article
                      key={`${activeCourse.id}-${currentLanguage}`}
                      className="highlights-card"
                      initial={{ opacity: 0, y: 32, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -28, scale: 0.98 }}
                      transition={{ duration: 0.45, ease: 'easeOut' }}
                    >
                      <div className="highlights-media">
                        {activeCourse.certificate ? (
                          <Image
                            src={activeCourse.certificate}
                            alt={`${activeCourse.title} ${isHydrated ? t('education.certificate').toLowerCase() : 'certificado'}`}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 560px"
                            priority={activeHighlight === 0}
                          />
                        ) : (
                          <div className="highlights-placeholder">
                            <div className="highlights-logo">
                              <Image src={activeCourse.logo} alt={activeCourse.institution} width={40} height={40} />
                            </div>
                            <span>{activeCourse.institution}</span>
                          </div>
                        )}
                      </div>
                      <div className="highlights-content">
                        <div className="highlights-badge">
                          <span className="highlights-logo">
                            <Image src={activeCourse.logo} alt={activeCourse.institution} width={36} height={36} />
                          </span>
                          {activeCourse.institution}
                        </div>
                        <h4 className="highlights-title">{activeCourse.title}</h4>
                        <p className="highlights-summary">{activeCourse.summary}</p>
                        <div className="highlights-footer">
                          <span className="highlights-progress">
                            <strong>{String(activeHighlight + 1).padStart(2, '0')}</strong>
                            <span aria-hidden="true">/</span>
                            <span>{String(highlightCount).padStart(2, '0')}</span>
                          </span>
                          {activeCourse.certificate && (
                            <a
                              className="highlights-link"
                              href={activeCourse.certificate}
                              target="_blank"
                              rel="noopener noreferrer"
                              onMouseEnter={handleHighlightPointerEnter}
                              onMouseLeave={handleHighlightPointerLeave}
                              onFocus={handleHighlightPointerEnter}
                              onBlur={handleHighlightPointerLeave}
                            >
                              {isHydrated ? t('education.viewCertificate') : 'Ver certificado'}
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  className="highlights-nav"
                  onClick={handleNextHighlight}
                  onMouseEnter={handleHighlightPointerEnter}
                  onMouseLeave={handleHighlightPointerLeave}
                  onFocus={handleHighlightPointerEnter}
                  onBlur={handleHighlightPointerLeave}
                  aria-label={isHydrated ? t('education.carouselNext') : 'Ver certificación siguiente'}
                  disabled={highlightCount <= 1}
                >
                  ›
                </button>
              </div>

              <div className="highlights-dots">
                {highlightedCourses.map((course, index) => {
                  const isActive = index === activeHighlight;
                  return (
                    <button
                      key={course.id}
                      type="button"
                      className={`highlights-dot${isActive ? ' active' : ''}`}
                      onClick={() => goToHighlight(index)}
                      onMouseEnter={handleHighlightPointerEnter}
                      onMouseLeave={handleHighlightPointerLeave}
                      onFocus={handleHighlightPointerEnter}
                      onBlur={handleHighlightPointerLeave}
                      aria-label={isHydrated ? t('education.goToHighlight', { index: index + 1 }) : `Ir a la certificación ${index + 1}`}
                      aria-pressed={isActive}
                    />
                  );
                })}
              </div>
            </div>
          )}

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
