/* ---------------------------------------------------------------------------
   ProjectsSection.tsx – sección de proyectos con buscador
   Mobile First: optimizado para todos los dispositivos
--------------------------------------------------------------------------- */

"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import Card from "../shared/Card";
import { useTranslation } from "../../hooks/useTranslation";
import { projectsData, getLocalizedProjectsData } from "../../lib/projectsData";

// Tipado para los elementos flotantes
interface FloatingElement {
  id: number;
  size: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  opacity: number;
}

// --- Lógica de partículas flotantes tipo AboutSection ---
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

/* ---------------------------------------------------------------------------
   ProjectsSection – componente principal Mobile First
--------------------------------------------------------------------------- */
const PROJECTS_PER_PAGE = 4;

const ProjectsSection: React.FC = () => {
  /* ---------------- estados ---------------- */
  const { language, t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const sectionRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>(
    [],
  );
  // Parallax para varias formas
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  /* ---------------- inicializar elementos flotantes ---------------- */
  useEffect(() => {
    setFloatingElements(createFloatingElements());
  }, []);

  /* ---------------- datos localizados con useMemo ---------------- */
  const localizedProjects = useMemo(
    () => getLocalizedProjectsData(projectsData, language),
    [language]
  );

  /* ---------------- filtrado dinámico ---------------- */
  const filteredProjects = useMemo(
    () =>
      localizedProjects.filter((p) => {
        const bySearch = `${p.title} ${p.description} ${p.technologies.join(" ")}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        return bySearch;
      }),
    [localizedProjects, searchTerm],
  );

  /* ---------------- paginación ---------------- */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE),
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * PROJECTS_PER_PAGE;
    return filteredProjects.slice(start, start + PROJECTS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const goToPage = (page: number) => {
    const next = Math.min(Math.max(1, page), totalPages);
    if (next === currentPage) return;
    setCurrentPage(next);
    if (typeof window !== "undefined" && gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      const top = window.scrollY + rect.top - 96;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis")[] = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    if (start > 2) pages.push("ellipsis");
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < totalPages - 1) pages.push("ellipsis");
    pages.push(totalPages);
    return pages;
  }, [totalPages, currentPage]);

  /* --------------------------------------------------------------------- */
  return (
    <>
      {/* variables globales + helper scrollbar oculto */}
      <style jsx>{`
        :root {
          --background-color: #1c1c2e;
          --secondary-background-color: #28283c;
          --white-color: #ffffff;
          --text-color: #f4f4f9;
          --muted-color: #d1d1e0;
          --primary-color: #ff6f61;
          --accent-color: #f39c12;
          --card-bg-color: #28283c;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @media (max-width: 640px) {
          .container {
            padding-left: 16px;
            padding-right: 16px;
          }
        }
      `}</style>

      <section
        ref={sectionRef}
        id="projects"
        className="relative min-h-screen py-32 px-4 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, var(--background-color) 0%, var(--secondary-background-color) 50%, var(--background-color) 100%)",
        }}
      >
        {/* Wave superior */}
        <div className="absolute top-0 left-0 w-full rotate-180 overflow-hidden leading-[0] z-0">
          <Image
            src="/images/wave-top.svg"
            alt="Wave Top"
            className="w-full h-auto"
            width={1920}
            height={200}
            priority
          />
        </div>
        {/* Fondo parallax moderno (igual que AboutSection) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {/* Círculo grande blur */}
          <motion.div
            style={{ y: y1 }}
            className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] rounded-full bg-[var(--primary-color)] opacity-30 blur-3xl"
          />
          {/* Blob naranja */}
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

        {/* ---------------- contenido principal ---------------- */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <motion.span
              className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-6 text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-full border"
              style={{
                color: "var(--accent-color)",
                background: "rgba(243, 156, 18, 0.1)",
                borderColor: "rgba(243, 156, 18, 0.3)",
              }}
              whileHover={{ scale: 1.05 }}
            >
              {t('projects.badge')}
            </motion.span>

            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6 uppercase tracking-wider"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t('projects.title')}
            </h2>

            <p
              className="text-sm sm:text-base md:text-lg lg:text-xl max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-4"
              style={{ color: "var(--muted-color)" }}
            >
              {t('projects.description')}
            </p>
          </motion.div>

          {/* buscador */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-xs sm:max-w-sm md:max-w-md mx-auto mb-8 sm:mb-12 md:mb-16"
          >
            <div
              className="relative backdrop-blur-xl border rounded-xl sm:rounded-2xl p-0.5 sm:p-1"
              style={{
                backgroundColor: "rgba(40,40,60,0.5)",
                borderColor: "rgba(209,209,224,0.3)",
              }}
            >
              <input
                type="text"
                placeholder={t('projects.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-transparent text-white placeholder-gray-400 focus:outline-none rounded-lg sm:rounded-xl text-sm sm:text-base"
              />
              <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: "var(--muted-color)" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* contador */}
          <motion.div
            className="text-center mb-6 sm:mb-8"
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p
              className="text-xs sm:text-sm md:text-base px-4"
              style={{ color: "var(--muted-color)" }}
            >
              {t('projects.showingResults', { count: filteredProjects.length, total: localizedProjects.length })}
              {searchTerm && ` ${t('projects.searchResults', { searchTerm })}`}
            </p>
          </motion.div>

          {/* grid de proyectos - SOLO 2 COLUMNAS MÁXIMO EN DESKTOP */}
          <div
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-20 lg:gap-28 xl:gap-32"
          >
            <AnimatePresence>
              {paginatedProjects.map((p, i) => (
                <motion.div
                  key={`${p.title}-${currentPage}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.05,
                    type: "spring",
                    stiffness: 100,
                  }}
                >
                  <Card
                    title={p.title}
                    description={p.description}
                    technologies={p.technologies}
                    repository={p.repository}
                    demo={p.demo}
                    category={p.category}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* paginación */}
          {totalPages > 1 && (
            <nav
              className="mt-10 sm:mt-14 flex flex-col items-center gap-3"
              aria-label={t('projects.paginationLabel')}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label={t('projects.previousPage')}
                  className="flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 shrink-0"
                  style={{
                    backgroundColor: 'rgba(40,40,60,0.5)',
                    borderColor: 'rgba(209,209,224,0.3)',
                    color: 'var(--muted-color)',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                {pageNumbers.map((p, idx) =>
                  p === 'ellipsis' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-10 h-10 flex items-center justify-center text-sm select-none shrink-0"
                      style={{ color: 'var(--muted-color)' }}
                      aria-hidden="true"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => goToPage(p)}
                      aria-current={p === currentPage ? 'page' : undefined}
                      aria-label={t('projects.goToPage', { page: p })}
                      className="w-10 h-10 flex items-center justify-center rounded-full border text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105 shrink-0"
                      style={{
                        backgroundColor:
                          p === currentPage ? 'var(--primary-color)' : 'rgba(40,40,60,0.5)',
                        borderColor:
                          p === currentPage
                            ? 'var(--primary-color)'
                            : 'rgba(209,209,224,0.3)',
                        color:
                          p === currentPage ? 'var(--white-color)' : 'var(--muted-color)',
                        boxShadow:
                          p === currentPage
                            ? '0 8px 20px rgba(255,111,97,0.3)'
                            : 'none',
                      }}
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label={t('projects.nextPage')}
                  className="flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 shrink-0"
                  style={{
                    backgroundColor: 'rgba(40,40,60,0.5)',
                    borderColor: 'rgba(209,209,224,0.3)',
                    color: 'var(--muted-color)',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </button>
              </div>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--muted-color)' }}>
                {t('projects.pageStatus', { current: currentPage, total: totalPages })}
              </p>
            </nav>
          )}

          {/* mensaje sin resultados */}
          {filteredProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 sm:py-16"
            >
              <div
                className="max-w-xs sm:max-w-sm md:max-w-md mx-auto p-6 sm:p-8 backdrop-blur-xl border rounded-xl sm:rounded-2xl"
                style={{
                  backgroundColor: "rgba(40,40,60,0.5)",
                  borderColor: "rgba(209,209,224,0.3)",
                }}
              >
                <h3
                  className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4"
                  style={{ color: "var(--white-color)" }}
                >
                  {t('projects.noResults')}
                </h3>
                <p
                  className="text-sm sm:text-base mb-4"
                  style={{ color: "var(--muted-color)" }}
                >
                  {t('projects.noResultsDescription')}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-300 text-sm sm:text-base font-medium"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "var(--white-color)",
                  }}
                >
                  {t('projects.clearFilters')}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Wave inferior */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden z-0">
          <Image
            src="/images/wave-bottom.svg"
            alt="Wave Bottom"
            className="w-full h-auto"
            width={1920}
            height={200}
          />
        </div>
      </section>
    </>
  );
};

export default ProjectsSection;
