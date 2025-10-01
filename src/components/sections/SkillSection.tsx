/* -------------------------------------------------------------------------------------------------
   PremiumSkillsSection.tsx
   Sección de habilidades con animaciones avanzadas, filtros por categoría y diseño en glassmorphism.
   - 100 % funcional y tipado en TypeScript.
   - Variables CSS hardcodeadas reemplazadas por sistema dinámico de paletas
--------------------------------------------------------------------------------------------------*/

"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import { skillsData, getLocalizedSkillsData, getLocalizedCategories } from "@/lib/skillsData";

/* -------------------------------------------------------------------------------------------------
   Tipos y datos
--------------------------------------------------------------------------------------------------*/
// type Skill = {
//   name: string;
//   percentage: string;
//   colorHex: string;
//   icon: string;
//   description: string;
//   category: string;
// };

/* -------------------------------------------------------------------------------------------------
   Constantes para la animación de los círculos de progreso
--------------------------------------------------------------------------------------------------*/
const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ANIMATION_DURATION = 1200; // duración por defecto

/* -------------------------------------------------------------------------------------------------
   Partículas de fondo (decorativas)
--------------------------------------------------------------------------------------------------*/
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

type FloatingElement = ReturnType<typeof createFloatingElements>[number];

/* -------------------------------------------------------------------------------------------------
   Helpers
--------------------------------------------------------------------------------------------------*/
const parsePercentage = (str: string): number =>
  Math.min(100, Math.max(0, parseInt(str.replace("%", ""), 10) || 0));

/* -------------------------------------------------------------------------------------------------
   Componente principal
--------------------------------------------------------------------------------------------------*/
export default function PremiumSkillsSection() {
  /* ----------------------- i18n y datos ----------------------- */
  const { t, language } = useTranslation();
  const localizedSkills = useMemo(() => getLocalizedSkillsData(skillsData, language), [language]);
  const localizedCategories = useMemo(() => getLocalizedCategories(skillsData, language), [language]);

  /* --------------------------- estados --------------------------- */
  const [animatedValues, setAnimatedValues] = useState<number[]>(() =>
    skillsData.map(() => 0),
  );
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [hasAnimated, setHasAnimated] = useState(false);
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>(
    [],
  );
  // Ref para leer el valor actual sin re-dependencias en callbacks
  const animatedValuesRef = useRef<number[]>([]);
  useEffect(() => {
    animatedValuesRef.current = animatedValues;
  }, [animatedValues]);

  /* -------------------------- refs ---------------------------- */
  const sectionRef = React.useRef<HTMLElement>(null);
  const animationRefs = useRef<Array<number | null>>([]);

  /* -------------------- parallax scroll effect -------------------- */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  /* -------------------- filtrado por categoría -------------------- */
  const filteredSkills = useMemo(
    () =>
      selectedCategory === "All"
        ? localizedSkills
        : localizedSkills.filter((skill) => skill.category === selectedCategory),
    [selectedCategory, localizedSkills]
  );

  // Ref para acceder a filteredSkills sin crear dependencias problemáticas
  const filteredSkillsRef = useRef(filteredSkills);
  filteredSkillsRef.current = filteredSkills;

  // Resetear animaciones cuando cambie el idioma
  useEffect(() => {
    setAnimatedValues(localizedSkills.map(() => 0));
    setHasAnimated(false);
    setHoveredIndex(null);
  }, [language, localizedSkills]);

  /* ---------------- función genérica de animación ---------------- */
  const animateToValue = useCallback(
    (index: number, target: number, duration: number = ANIMATION_DURATION, fromOverride?: number) => {
      if (animationRefs.current[index]) {
        cancelAnimationFrame(animationRefs.current[index]!);
      }

      const start = performance.now();
      const startFrom =
        typeof fromOverride === "number"
          ? fromOverride
          : animatedValuesRef.current[index] ?? 0;
      
      // Usamos una función para obtener el valor actual en lugar de la dependencia
      const animate = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        const current = Math.round(startFrom + (target - startFrom) * eased);
        setAnimatedValues((prev) => {
          const next = [...prev];
          next[index] = current;
          return next;
        });

        if (progress < 1) {
          animationRefs.current[index] = requestAnimationFrame(animate);
        } else {
          animationRefs.current[index] = null;
        }
      };

      animationRefs.current[index] = requestAnimationFrame(animate);
    },
    [], // Sin dependencias para evitar re-creaciones innecesarias
  );

  /* -------------------- observer para establecer llenas por defecto -------------------- */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            // Mantener barras llenas por defecto sin animación
            const filled = filteredSkillsRef.current.map((skill) =>
              parsePercentage(skill.percentage)
            );
            setAnimatedValues(filled);
            setHasAnimated(true);
          }
        });
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAnimated, animateToValue]); // Removemos filteredSkills para evitar bucle infinito

  /* --------------- al cambiar categoría/idioma: mantener llenas por defecto --------------- */
  useEffect(() => {
    // Establecer de inmediato los porcentajes visibles
    setAnimatedValues(filteredSkills.map((s) => parsePercentage(s.percentage)));
    setHasAnimated(true);
    setHoveredIndex(null);
    animationRefs.current.forEach((id) => {
      if (id) cancelAnimationFrame(id);
    });
    animationRefs.current = Array(filteredSkills.length).fill(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, language]); // Incluir language para resetear al cambiar idioma

  useEffect(() => {
    setFloatingElements(createFloatingElements());
  }, []);

  /* ---------------- manejadores de hover ---------------- */
  const handleSkillHover = (idx: number) => {
    setHoveredIndex(idx);
    // Al pasar el mouse: volver a 0 y llenar rápidamente al porcentaje
    const target = parsePercentage(filteredSkills[idx].percentage);
    animateToValue(idx, target, 350, 0);
  };

  const handleSkillLeave = (idx: number) => {
    setHoveredIndex(null);
    // Mantener llena en su porcentaje al salir
    const target = parsePercentage(filteredSkills[idx].percentage);
    setAnimatedValues((prev) => {
      const next = [...prev];
      next[idx] = target;
      return next;
    });
  };

  /* ------------------------------------------------------------------------------------------------
     Render
  -------------------------------------------------------------------------------------------------*/
  return (
    <section
      ref={sectionRef}
      id="skills"
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

      {/* Fondo parallax moderno */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {/* Círculo grande blur */}
        <motion.div
          style={{
            y: y1,
            backgroundColor: "var(--primary-color)",
          }}
          className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] rounded-full opacity-30 blur-3xl"
        />
        {/* Blob naranja */}
        <motion.div
          style={{
            y: y2,
            backgroundColor: "var(--accent-color)",
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          }}
          className="absolute top-[30%] right-[-100px] w-[280px] h-[280px] opacity-40 blur-2xl rotate-12"
        />
        {/* Círculo degradado */}
        <motion.div
          style={{
            y: y3,
            background: `linear-gradient(to top right, var(--primary-color), var(--accent-color), transparent)`,
          }}
          className="absolute bottom-[-100px] left-[20%] w-[220px] h-[220px] rounded-full opacity-30 blur-2xl"
        />
        {/* Línea diagonal luminosa */}
        <motion.div
          style={{
            y: y4,
            background: `linear-gradient(to right, var(--accent-color), rgba(255,255,255,0.1), transparent)`,
          }}
          className="absolute top-[60%] left-[-80px] w-[400px] h-[8px] opacity-40 rotate-[-20deg] blur-md"
        />
        {/* Círculo blanco suave */}
        <motion.div
          style={{ y: y2 }}
          className="absolute bottom-[-60px] right-[10%] w-[120px] h-[120px] rounded-full bg-white opacity-10 blur-2xl"
        />
      </div>

      {/* Partículas animadas */}
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

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* cabecera */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
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
            {t('skills.badge')}
          </motion.span>

          <h2
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
            style={{
              background:
                "linear-gradient(135deg, var(--white-color) 0%, var(--text-color) 50%, var(--muted-color) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {t('skills.title')}
          </h2>

          <p
            className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: "var(--muted-color)" }}
          >
            {t('skills.description')}
          </p>
        </motion.div>

        {/* filtros de categoría */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          viewport={{ once: true }}
          className="flex justify-center mb-16"
        >
          <div
            className="flex flex-wrap gap-2 p-2 backdrop-blur-lg rounded-2xl border"
            style={{
              backgroundColor: `color-mix(in srgb, var(--secondary-background-color) 50%, transparent)`,
              borderColor: `color-mix(in srgb, var(--muted-color) 30%, transparent)`,
            }}
          >
            <CategoryButton
              isActive={selectedCategory === "All"}
              label={t('skills.allSkills')}
              onClick={() => setSelectedCategory("All")}
            />

            {localizedCategories.map((cat) => (
              <CategoryButton
                key={cat}
                isActive={selectedCategory === cat}
                label={cat}
                onClick={() => setSelectedCategory(cat)}
              />
            ))}
          </div>
        </motion.div>

        {/* grilla de skills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatePresence>
            {filteredSkills.map((skill, idx) => {
              const currentValue = animatedValues[idx] || 0;
              const offset =
                CIRCUMFERENCE - (CIRCUMFERENCE * currentValue) / 100;
              const hovered = hoveredIndex === idx;

              return (
                <motion.div
                  key={`${skill.name}-${selectedCategory}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{
                    duration: 0.5,
                    delay: idx * 0.1,
                    type: "spring",
                    stiffness: 100,
                  }}
                  className="relative group cursor-pointer"
                  onMouseEnter={() => handleSkillHover(idx)}
                  onMouseLeave={() => handleSkillLeave(idx)}
                >
                  {/* tarjeta */}
                  <div
                    className="relative h-full p-8 backdrop-blur-xl border rounded-3xl transition-all duration-500 transform-gpu"
                    style={{
                      backgroundColor: hovered
                        ? "var(--card-bg-color)"
                        : `color-mix(in srgb, var(--secondary-background-color) 40%, transparent)`,
                      borderColor: hovered
                        ? "var(--accent-color)"
                        : `color-mix(in srgb, var(--muted-color) 30%, transparent)`,
                      boxShadow: hovered
                        ? `0 25px 50px color-mix(in srgb, var(--accent-color) 15%, transparent)`
                        : "none",
                      transform: hovered ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    {/* brillo */}
                    <div
                      className="absolute inset-0 rounded-3xl transition-opacity duration-500"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)",
                        opacity: hovered ? 1 : 0,
                      }}
                    />

                    {/* contenido */}
                    <div className="relative z-10 flex flex-col items-center text-center h-full">
                      <div className="relative w-32 h-32 mb-6">
                        <svg
                          className="w-full h-full transform -rotate-90"
                          viewBox="0 0 80 80"
                        >
                          <circle
                            cx="40"
                            cy="40"
                            r={RADIUS}
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="4"
                            fill="none"
                          />
                          <motion.circle
                            cx="40"
                            cy="40"
                            r={RADIUS}
                            stroke={skill.colorHex}
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={CIRCUMFERENCE}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                            className="drop-shadow-lg"
                            style={{
                              filter: hovered
                                ? `drop-shadow(0 0 8px ${skill.colorHex}50)`
                                : "none",
                            }}
                            animate={{ strokeDashoffset: offset }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <motion.img
                            src={skill.icon}
                            alt={skill.name}
                            className="w-10 h-10 mb-1 opacity-90"
                            animate={{
                              scale: hovered ? 1.2 : 1,
                              filter: hovered
                                ? "brightness(1.2)"
                                : "brightness(1)",
                            }}
                            transition={{ type: "spring", stiffness: 300 }}
                          />
                          <motion.span
                            className="text-2xl font-bold"
                            style={{ color: "var(--white-color)" }}
                            animate={{ scale: hovered ? 1.1 : 1 }}
                          >
                            {currentValue}%
                          </motion.span>
                        </div>
                      </div>

                      <h3
                        className="text-xl font-bold mb-3"
                        style={{ color: "var(--white-color)" }}
                      >
                        {skill.name}
                      </h3>

                      <motion.p
                        className="text-sm leading-relaxed flex-grow"
                        style={{ color: "var(--muted-color)" }}
                        animate={{ opacity: hovered ? 1 : 0.7 }}
                        transition={{ duration: 0.3 }}
                      >
                        {skill.description}
                      </motion.p>

                      <motion.div
                        className="w-full h-px mt-4"
                        style={{
                          background: `linear-gradient(to right, transparent 0%, ${skill.colorHex} 50%, transparent 100%)`,
                        }}
                        animate={{
                          scaleX: hovered ? 1 : 0,
                          opacity: hovered ? 1 : 0,
                        }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </div>

                  <motion.div
                    className="absolute -top-3 -right-3 px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                    style={{
                      backgroundColor: "var(--accent-color)",
                      color: "var(--background-color)",
                    }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {skill.category}
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
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
  );
}

/* -------------------------------------------------------------------------------------------------
   Componente auxiliar: botón de categoría
--------------------------------------------------------------------------------------------------*/
type CategoryButtonProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
};

function CategoryButton({ label, isActive, onClick }: CategoryButtonProps) {
  const handleEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isActive) {
      const el = e.currentTarget;
      el.style.color = "var(--white-color)";
      el.style.backgroundColor = `color-mix(in srgb, var(--secondary-background-color) 50%, transparent)`;
    }
  };

  const handleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isActive) {
      const el = e.currentTarget;
      el.style.color = "var(--muted-color)";
      el.style.backgroundColor = "transparent";
    }
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300"
      style={{
        backgroundColor: isActive ? "var(--primary-color)" : "transparent",
        color: isActive ? "var(--white-color)" : "var(--muted-color)",
        boxShadow: isActive
          ? `0 10px 25px color-mix(in srgb, var(--primary-color) 30%, transparent)`
          : "none",
      }}
    >
      {label}
    </button>
  );
}
