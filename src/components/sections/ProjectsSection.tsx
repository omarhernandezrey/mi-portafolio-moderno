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
import { track } from "@vercel/analytics";
import Card from "../shared/Card";
import ScrollReveal from "../shared/ScrollReveal";
import { useTranslation } from "../../hooks/useTranslation";
import { getLocalizedProjectsData, type Project } from "../../lib/projectsData";
import { slugificar } from "../../lib/portfolio/slug";
import { coincideConBusqueda, paginar } from "../../lib/portfolio/projectSearch";

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

interface ProjectsSectionProps {
  /** Bilingüe, misma forma que `projectsData`: lo resuelve `getProjects()` en la página de servidor. */
  projects: Project[];
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
  /* ---------------- estados ---------------- */
  const { language, t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState<string>("");
  // Lo ÚLTIMO que pidió el visitante. La página que de verdad se pinta se
  // deriva más abajo acotándola a las páginas existentes.
  const [paginaPedida, setPaginaPedida] = useState<number>(1);
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
  // Este efecto se queda a propósito, y `react-hooks/set-state-in-effect` lo
  // marca sin que haya nada que arreglar: `createFloatingElements` usa
  // `Math.random`, así que el servidor y el cliente generarían posiciones
  // distintas y la hidratación no coincidiría. Arrancar en `[]` y rellenar
  // tras montar es justo lo que evita eso; moverlo al inicializador del
  // `useState` reintroduciría el desajuste.
  useEffect(() => {
    setFloatingElements(createFloatingElements());
  }, []);

  /* ---------------- datos localizados con useMemo ---------------- */
  const localizedProjects = useMemo(
    () => getLocalizedProjectsData(projects, language),
    [projects, language]
  );

  /* ---------------- filtrado dinámico ---------------- */
  const filteredProjects = useMemo(
    () => localizedProjects.filter((p) => coincideConBusqueda(p, searchTerm)),
    [localizedProjects, searchTerm],
  );

  /* ---------------- paginación ---------------- */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE),
  );

  // La página que se pinta se DERIVA durante el render, no se sincroniza con
  // un efecto. Antes había dos efectos para mantenerla: uno que la devolvía a
  // 1 al cambiar la búsqueda y otro que la recortaba cuando el filtro dejaba
  // menos páginas que la página actual. El segundo pintaba una vez la página
  // inexistente (rejilla vacía) y solo después corregía, así que filtrar
  // desde una página alta daba un parpadeo en blanco.
  //
  // `paginaPedida` es lo último que pidió el visitante; la página válida es
  // esa, acotada a las páginas que existen ahora mismo. Si el filtro se
  // estrecha, el recorte ocurre en el mismo render.
  const currentPage = Math.min(paginaPedida, totalPages);

  const paginatedProjects = useMemo(
    () => paginar(filteredProjects, currentPage, PROJECTS_PER_PAGE),
    [filteredProjects, currentPage],
  );

  // Cambiar la búsqueda vuelve a la primera página. Va aquí, en el manejador,
  // porque es consecuencia directa de una acción del visitante: no hace falta
  // un efecto que lo observe después.
  const cambiarBusqueda = (valor: string) => {
    setSearchTerm(valor);
    setPaginaPedida(1);
  };

  const goToPage = (page: number) => {
    const next = Math.min(Math.max(1, page), totalPages);
    if (next === currentPage) return;
    setPaginaPedida(next);
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

  const mobilePageNumbers = useMemo(() => {
    const pageCount = Math.min(2, totalPages);
    const start = Math.min(
      Math.max(1, currentPage - 1),
      Math.max(1, totalPages - pageCount + 1),
    );
    return Array.from({ length: pageCount }, (_, index) => start + index);
  }, [totalPages, currentPage]);

  /* --------------------------------------------------------------------- */
  return (
    <>
      {/* Helper scrollbar oculto. Hasta aquí vivía un bloque `:root { ... }`
          con los valores quemados de la paleta 2 — styled-jsx transforma
          `:root` en el selector compuesto `.jsx-HASH:root`, que nunca
          coincide con nada porque <html> jamás recibe esa clase de scope.
          Era CSS muerto (confirmado en el navegador: la variable activa
          siempre fue la de la paleta real), no una paleta fija a propósito. */}
      <style jsx>{`
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
            className="absolute top-[60%] left-[-80px] w-[400px] h-[8px] bg-gradient-to-r from-accent/60 via-white/10 to-transparent opacity-40 rotate-[-20deg] blur-md"
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
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* header */}
          <ScrollReveal y={30} className="text-center mb-8 sm:mb-12 md:mb-16">
            <motion.span
              className="font-mono-label inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-6 text-[0.6rem] sm:text-[0.65rem] rounded-full border"
              style={{
                color: "var(--accent-color)",
                background: "color-mix(in srgb, var(--accent-color) 10%, transparent)",
                borderColor: "color-mix(in srgb, var(--accent-color) 30%, transparent)",
              }}
              whileHover={{ scale: 1.05 }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--accent-color)" }} />
              {t('projects.badge')}
            </motion.span>

            <h2
              className="font-display italic text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium mb-4 sm:mb-6 px-2"
              style={{ color: "var(--text-color)" }}
            >
              {t('projects.title')}
            </h2>

            <p
              className="text-sm sm:text-base md:text-lg max-w-xl sm:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-2"
              style={{ color: "var(--muted-color)" }}
            >
              {t('projects.description')}
            </p>
          </ScrollReveal>

          {/* buscador */}
          <ScrollReveal y={20} delay={0.1} className="w-full max-w-md mx-auto mb-8 sm:mb-12 md:mb-16">
            <div
              className="relative backdrop-blur-xl border rounded-xl sm:rounded-2xl p-0.5"
              style={{
                backgroundColor: "color-mix(in srgb, var(--card-bg-color) 50%, transparent)",
                borderColor: "color-mix(in srgb, var(--muted-color) 30%, transparent)",
              }}
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
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
              <input
                type="text"
                placeholder={t('projects.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => cambiarBusqueda(e.target.value)}
                className="w-full pl-11 pr-10 py-3 sm:py-3.5 bg-transparent text-text-main placeholder-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg sm:rounded-xl text-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => cambiarBusqueda("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </ScrollReveal>

          {/* contador */}
          <motion.div
            className="text-center mb-6 sm:mb-8"
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p
              className="text-xs sm:text-sm"
              style={{ color: "var(--muted-color)" }}
            >
              {t('projects.showingResults', { count: filteredProjects.length, total: localizedProjects.length })}
              {searchTerm && ` "${searchTerm}"`}
            </p>
          </motion.div>

          {/* grid de proyectos - SOLO 2 COLUMNAS MÁXIMO EN DESKTOP */}
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 md:gap-16 lg:gap-24"
          >
            <AnimatePresence>
              {paginatedProjects.map((p, i) => (
                <motion.div
                  key={`${slugificar(p.title)}-${currentPage}`}
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
                  viewport={{ once: true, amount: 0.5 }}
                  onViewportEnter={() => track("project_viewed", { project: slugificar(p.title) })}
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
              <div className="hidden items-center gap-1.5 sm:flex sm:gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label={t('projects.previousPage')}
                  className="flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 shrink-0"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--card-bg-color) 50%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--muted-color) 30%, transparent)',
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
                          p === currentPage ? 'var(--primary-color)' : 'color-mix(in srgb, var(--card-bg-color) 50%, transparent)',
                        borderColor:
                          p === currentPage
                            ? 'var(--primary-color)'
                            : 'color-mix(in srgb, var(--muted-color) 30%, transparent)',
                        color:
                          p === currentPage ? 'var(--white-color)' : 'var(--muted-color)',
                        boxShadow:
                          p === currentPage
                            ? '0 8px 20px color-mix(in srgb, var(--primary-color) 30%, transparent)'
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
                    backgroundColor: 'color-mix(in srgb, var(--card-bg-color) 50%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--muted-color) 30%, transparent)',
                    color: 'var(--muted-color)',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center justify-center gap-2 sm:hidden">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label={t('projects.previousPage')}
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--card-bg-color) 50%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--muted-color) 30%, transparent)',
                    color: 'var(--muted-color)',
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                {mobilePageNumbers.map((page) => (
                  <button
                    key={`mobile-${page}`}
                    type="button"
                    onClick={() => goToPage(page)}
                    aria-current={page === currentPage ? 'page' : undefined}
                    aria-label={t('projects.goToPage', { page })}
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border text-lg font-semibold transition-colors"
                    style={{
                      backgroundColor: page === currentPage ? 'var(--primary-color)' : 'color-mix(in srgb, var(--card-bg-color) 50%, transparent)',
                      borderColor: page === currentPage ? 'var(--primary-color)' : 'color-mix(in srgb, var(--muted-color) 30%, transparent)',
                      color: page === currentPage ? 'var(--white-color)' : 'var(--muted-color)',
                      boxShadow: page === currentPage ? '0 8px 20px color-mix(in srgb, var(--primary-color) 30%, transparent)' : 'none',
                    }}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label={t('projects.nextPage')}
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--card-bg-color) 50%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--muted-color) 30%, transparent)',
                    color: 'var(--muted-color)',
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
                  backgroundColor: "color-mix(in srgb, var(--card-bg-color) 50%, transparent)",
                  borderColor: "color-mix(in srgb, var(--muted-color) 30%, transparent)",
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
                    cambiarBusqueda("");
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
