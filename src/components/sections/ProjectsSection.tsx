/* ---------------------------------------------------------------------------
   ProjectsSection.tsx – sección de proyectos con filtrado premium
   Mobile First: optimizado para todos los dispositivos
--------------------------------------------------------------------------- */

"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import Card from "../shared/Card";

/* ---------------------------------------------------------------------------
   Tipado del proyecto
--------------------------------------------------------------------------- */
interface Project {
  title: string;
  description: string;
  technologies: string[];
  repository: string;
  demo: string;
  category: string;
}

/* ---------------------------------------------------------------------------
   Lista completa de proyectos (mantener actualizada)
--------------------------------------------------------------------------- */
const projects: Project[] = [
  {
    title: "CineXpress - API REST con JavaScript",
    description:
      "Explora películas en tendencia, búsquedas por categoría o nombre y detalles completos consumiendo TMDB API.",
    technologies: ["HTML", "CSS", "JavaScript", "Axios", "Vercel"],
    repository:
      "https://github.com/omarhernandezrey/31-cursoDeApiRestConJavascriptEjemplosConApisReales",
    demo: "https://cinexpressonline.vercel.app/",
    category: "JavaScript",
  },
  {
    title: "Michis App - API REST con JavaScript",
    description:
      "Guarda y sube imágenes de gatitos usando The Cat API. Proyecto de fundamentos de API REST.",
    technologies: ["HTML", "CSS", "JavaScript", "Fetch", "Axios"],
    repository:
      "https://github.com/omarhernandezrey/30_cursoDeApiRestConJavascriptFundamentos",
    demo: "https://michis-app-api-rest.netlify.app/",
    category: "JavaScript",
  },
  {
    title: "Página Web Enfermería Roxana",
    description:
      "Plataforma moderna y responsiva para promover servicios profesionales de enfermería.",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
    repository: "https://github.com/omarhernandezrey/enfermeriaroxanapag",
    demo: "https://enfermeria-roxana.vercel.app/inicio",
    category: "Next.js",
  },
  {
    title: "Your Restaurant",
    description:
      "Sitio web de restaurante con CSS Grid, diseño responsivo y presentación de menús atractivos.",
    technologies: ["HTML", "CSS", "CSS Grid"],
    repository:
      "https://github.com/omarhernandezrey/38-Curso-de-CSS-Grid-B-sico.io",
    demo: "https://omarhernandezrey.github.io/38-Curso-de-CSS-Grid-B-sico.io/",
    category: "CSS",
  },
  {
    title: "Steam - Hamburguesas Artesanales",
    description:
      "Landing para hamburguesas artesanales con secciones de menú, promociones y contacto.",
    technologies: ["HTML", "CSS"],
    repository:
      "https://github.com/omarhernandezrey/36-Curso-de-Dise-o-para-Developers-html.io",
    demo: "https://omarhernandezrey.github.io/36-Curso-de-Dise-o-para-Developers-html.io/",
    category: "CSS",
  },
  {
    title: "Eco-store",
    description:
      "Tienda ecológica con categorías de cuidado personal y decoración sostenible.",
    technologies: ["HTML", "CSS", "SCSS", "Flexbox"],
    repository:
      "https://github.com/omarhernandezrey/35-Curso-de-Fundamentos-de-Sass.io",
    demo: "https://omarhernandezrey.github.io/35-Curso-de-Fundamentos-de-Sass.io/",
    category: "CSS",
  },
  {
    title: "Batatabit",
    description:
      "Landing responsive Mobile-First para precios y tendencias de criptomonedas.",
    technologies: ["HTML", "CSS", "Responsive Design"],
    repository:
      "https://github.com/omarhernandezrey/34-Curso-de-Responsive-Design-Maquetaci-n-Mobile-First.io",
    demo: "https://omarhernandezrey.github.io/34-Curso-de-Responsive-Design-Maquetaci-n-Mobile-First.io/",
    category: "CSS",
  },
  {
    title: "E-commerce Next.js",
    description:
      "E-commerce con carrito, pagos y contacto, desarrollado en Next.js + Tailwind.",
    technologies: ["Next.js", "Tailwind CSS", "TypeScript", "Vercel"],
    repository: "https://github.com/omarhernandezrey/tienda_Lizz.io",
    demo: "https://tienda-lizz-io.vercel.app/",
    category: "Next.js",
  },
  {
    title: "Task Manager App",
    description:
      "Gestor de tareas con CRUD y persistencia en localStorage, dark/light mode.",
    technologies: ["HTML", "CSS", "JavaScript", "localStorage"],
    repository: "https://github.com/omarhernandezrey/46-Task-Manager",
    demo: "https://omarhernandezrey.github.io/46-Task-Manager/",
    category: "JavaScript",
  },
  {
    title: "Google Chrome Clone",
    description:
      "Réplica sencilla de la portada de Google con HTML y CSS puros.",
    technologies: ["HTML", "CSS"],
    repository: "https://github.com/omarhernandezrey/33-Google-Chrome-Clone.io",
    demo: "https://omarhernandezrey.github.io/33-Google-Chrome-Clone.io/",
    category: "CSS",
  },
  {
    title: "Plan de Comidas Semanal",
    description:
      "App para organizar un menú semanal de forma sencilla y visual.",
    technologies: ["HTML", "CSS", "JavaScript"],
    repository:
      "https://github.com/omarhernandezrey/31.1--comidasDeLaSemana.io",
    demo: "https://omarhernandezrey.github.io/31.1--comidasDeLaSemana.io/",
    category: "JavaScript",
  },
  {
    title: "Pagar Recibos",
    description: "Gestión básica de pagos de servicios con interfaz intuitiva.",
    technologies: ["HTML", "CSS", "JavaScript"],
    repository: "https://github.com/omarhernandezrey/28.1-PagarRecibos.io",
    demo: "https://omarhernandezrey.github.io/28.1-PagarRecibos.io/",
    category: "JavaScript",
  },
  {
    title: "Calculadora de Pago de Turnos",
    description:
      "Calcula pagos de turnos de enfermería con calendario interactivo.",
    technologies: ["HTML", "CSS", "JavaScript"],
    repository:
      "https://github.com/omarhernandezrey/07.1-calculadoraDePagoTurnosEmfermeria.github.io",
    demo: "https://omarhernandezrey.github.io/07.1-calculadoraDePagoTurnosEmfermeria.github.io/",
    category: "JavaScript",
  },
  {
    title: "Async Landing",
    description:
      "Landing personal con integración de contenido dinámico mediante APIs.",
    technologies: ["HTML", "JavaScript"],
    repository: "https://github.com/omarhernandezrey/22.1_async-landing",
    demo: "https://omarhernandezrey.github.io/22.1_async-landing/",
    category: "JavaScript",
  },
  {
    title: "Frontend Developer JS Práctico",
    description:
      "E-commerce con carrito y navegación responsive, proyecto práctico.",
    technologies: ["HTML", "CSS", "JavaScript"],
    repository:
      "https://github.com/omarhernandezrey/18-curso-frontend-developer-javascript-practico.io",
    demo: "https://omarhernandezrey.github.io/18-curso-frontend-developer-javascript-practico.io/",
    category: "JavaScript",
  },
  {
    title: "Portafolio Personal",
    description:
      "Portafolio para destacar experiencia, skills y proyectos de desarrollo.",
    technologies: ["HTML", "CSS", "JavaScript"],
    repository: "https://github.com/omarhernandezrey/07-portafolio.github.io",
    demo: "https://omarhernandezrey.github.io/07-portafolio.github.io/",
    category: "CSS",
  },
];

/* ---------------------------------------------------------------------------
   Botón de categoría (estilos y badge)
--------------------------------------------------------------------------- */
type CategoryButtonProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
  count: number;
};

const CategoryButton: React.FC<CategoryButtonProps> = ({
  label,
  isActive,
  onClick,
  count,
}) => (
  <button
    onClick={onClick}
    onMouseEnter={(e) => {
      if (!isActive) {
        e.currentTarget.style.color = "var(--white-color)";
        e.currentTarget.style.backgroundColor = "rgba(40,40,60,0.5)";
        e.currentTarget.style.transform = "scale(1.05)";
      }
    }}
    onMouseLeave={(e) => {
      if (!isActive) {
        e.currentTarget.style.color = "var(--muted-color)";
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.transform = "scale(1)";
      }
    }}
    className="relative px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-300 whitespace-nowrap min-w-max"
    style={{
      backgroundColor: isActive ? "var(--primary-color)" : "transparent",
      color: isActive ? "var(--white-color)" : "var(--muted-color)",
      boxShadow: isActive ? "0 8px 20px rgba(255,111,97,0.3)" : "none",
      transform: isActive ? "scale(1.05)" : "scale(1)",
    }}
  >
    <span className="relative z-10">{label}</span>
    <motion.span
      className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-bold"
      style={{
        backgroundColor: "var(--accent-color)",
        color: "var(--background-color)",
        fontSize: "10px",
      }}
      animate={{ scale: isActive ? 1.1 : 1, opacity: isActive ? 1 : 0.8 }}
      transition={{ duration: 0.2 }}
    >
      {count}
    </motion.span>
  </button>
);

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
const ProjectsSection: React.FC = () => {
  /* ---------------- estados ---------------- */
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const sectionRef = useRef<HTMLElement | null>(null);
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

  /* ---------------- detectar mobile (solo en cliente) ---------------- */
  useEffect(() => {
    // const checkIsMobile = () => setIsMobile(window.innerWidth < 640);
    // checkIsMobile();
    window.addEventListener("resize", () => {});
    setFloatingElements(createFloatingElements());
    return () => window.removeEventListener("resize", () => {});
  }, []);

  /* ---------------- filtrado dinámico ---------------- */
  const filteredProjects = projects.filter((p) => {
    const byCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    const bySearch = `${p.title} ${p.description} ${p.technologies.join(" ")}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return byCategory && bySearch;
  });

  const categories = ["All", ...new Set(projects.map((p) => p.category))];
  const getCount = (c: string) =>
    c === "All"
      ? projects.length
      : projects.filter((p) => p.category === c).length;

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
              Proyectos Destacados
            </motion.span>

            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6 uppercase tracking-wider"
              style={{
                background:
                  "linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Mis Proyectos
            </h2>

            <p
              className="text-sm sm:text-base md:text-lg lg:text-xl max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-4"
              style={{ color: "var(--muted-color)" }}
            >
              Explora mi colección de aplicaciones web y proyectos de desarrollo
            </p>
          </motion.div>

          {/* buscador */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-xs sm:max-w-sm md:max-w-md mx-auto mb-8 sm:mb-10 md:mb-12"
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
                placeholder="Buscar proyectos..."
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

          {/* filtros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            viewport={{ once: true }}
            className="flex justify-center mb-8 sm:mb-12 md:mb-16"
          >
            <div
              className="flex flex-wrap gap-2 sm:gap-3 p-2 sm:p-3 backdrop-blur-lg rounded-xl sm:rounded-2xl border max-w-full"
              style={{
                backgroundColor: "rgba(40,40,60,0.5)",
                borderColor: "rgba(209,209,224,0.3)",
              }}
            >
              {categories.map((c) => (
                <div key={c} style={{ scrollSnapAlign: "start" }}>
                  <CategoryButton
                    label={c}
                    isActive={selectedCategory === c}
                    count={getCount(c)}
                    onClick={() => setSelectedCategory(c)}
                  />
                </div>
              ))}
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
              Mostrando {filteredProjects.length} de {projects.length} proyectos
              {searchTerm && ` para "${searchTerm}"`}
            </p>
          </motion.div>

          {/* grid de proyectos - SOLO 2 COLUMNAS MÁXIMO EN DESKTOP */}
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-20 lg:gap-28 xl:gap-32">
            <AnimatePresence mode="wait">
              {filteredProjects.map((p, i) => (
                <motion.div
                  key={`${p.title}-${selectedCategory}`}
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
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

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
                  No se encontraron proyectos
                </h3>
                <p
                  className="text-sm sm:text-base mb-4"
                  style={{ color: "var(--muted-color)" }}
                >
                  Intenta ajustar tu búsqueda o los filtros.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-300 text-sm sm:text-base font-medium"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "var(--white-color)",
                  }}
                >
                  Limpiar filtros
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
