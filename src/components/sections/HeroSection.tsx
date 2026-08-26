"use client";

import React, { useRef, useEffect } from "react";
import { motion, MotionConfig } from "framer-motion";
import ParticlesComponent from "@/components/ParticlesComponent";
import "@/styles/advancedButton.css";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";

/**
 * Máquina de escribir propia, sin dependencias — tipea y borra en loop
 * infinito alternando entre `strings`. Deliberadamente NO usa la librería
 * typewriter-effect: esa usa requestAnimationFrame internamente, que Chrome
 * pausa por completo en pestañas ocultas/sin foco (comprobado leyendo su
 * código fuente); setTimeout no tiene ese problema.
 */
function useTypewriterLoop(
  strings: string[],
  { typeSpeed = 55, deleteSpeed = 30, pauseMs = 1800 } = {}
) {
  const [text, setText] = React.useState("");

  useEffect(() => {
    let stringIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      const current = strings[stringIndex] ?? "";
      if (!deleting) {
        charIndex++;
        setText(current.slice(0, charIndex));
        if (charIndex >= current.length) {
          timeoutId = setTimeout(() => {
            deleting = true;
            tick();
          }, pauseMs);
          return;
        }
        timeoutId = setTimeout(tick, typeSpeed);
      } else {
        charIndex--;
        setText(current.slice(0, charIndex));
        if (charIndex <= 0) {
          deleting = false;
          stringIndex = (stringIndex + 1) % strings.length;
        }
        timeoutId = setTimeout(tick, deleteSpeed);
      }
    };

    timeoutId = setTimeout(tick, typeSpeed);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strings.join("|"), typeSpeed, deleteSpeed, pauseMs]);

  return text;
}

export default function HeroSection() {
  const projectsRef = useRef<HTMLElement | null>(null);
  const { t } = useTranslation();
  const typedNameOrRole = useTypewriterLoop([t("hero.name"), t("hero.title")]);

  const handleViewProjects = () => {
    if (!projectsRef.current) {
      projectsRef.current = document.querySelector("#projects");
    }
    projectsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleContact = () => {
    const contactSection = document.querySelector("#contact");
    contactSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const [showParticles, setShowParticles] = React.useState(false);
  useEffect(() => {
    setShowParticles(true);
  }, []);

  return (
    // El sitio apaga toda animación en <768px (ver ClientProvider.tsx,
    // MotionConfig global reducedMotion="always" en móvil, por batería/perf).
    // El hero es la primera impresión del portafolio — aquí sí queremos que
    // se vea, incluso en móvil, así que este subárbol anula esa regla.
    <MotionConfig reducedMotion="never">
    <section
      id="hero"
      className="
        relative w-full min-h-screen
        flex items-center justify-center
        overflow-hidden
      "
      style={{ backgroundColor: "var(--background-color)" }}
    >
      {/* Fondo de imagen optimizado con next/image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-background.jpg"
          alt=""
          fill
          priority
          quality={85}
          className="object-cover"
          placeholder="empty"
        />
      </div>

      {/* Capa overlay mejorada */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Contenedor de partículas optimizado */}
      {showParticles && (
        <div
          className="
            absolute inset-0 overflow-hidden 
            pointer-events-none z-[1]
          "
          id="particles-container"
        >
          <ParticlesComponent />
        </div>
      )}

      {/* Contenido — grid editorial asimétrico */}
      <div
        className="grid-editorial relative z-10 w-full py-28 lg:py-0"
        style={{ color: "var(--white-color)" }}
      >
        {/* Badge de confianza */}
        <motion.h1
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="
            col-span-12 font-mono-label text-[0.65rem] sm:text-xs mb-6 sm:mb-8
            inline-flex w-fit max-w-[calc(100vw-2.5rem)] items-start sm:items-center gap-2
            px-4 py-2 rounded-2xl sm:rounded-full border leading-relaxed sm:leading-normal
          "
          style={{
            color: "var(--accent-color)",
            borderColor: "color-mix(in srgb, var(--accent-color) 35%, transparent)",
            backgroundColor: "color-mix(in srgb, var(--accent-color) 10%, transparent)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full mt-1 sm:mt-0 shrink-0" style={{ backgroundColor: "var(--accent-color)" }} />
          {t("hero.h1")}
        </motion.h1>

        {/* Columna principal: titular + descripción + CTA */}
        <div className="col-span-12 lg:col-span-7">
          {/* Saludo — estático, sin animación. */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="
              font-display italic
              text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem]
              font-medium mb-2 leading-[1.05] text-left
            "
          >
            {t("hero.greeting")}
          </motion.div>

          {/* Nombre + rol — un solo máquina de escribir en loop infinito que
              nunca se detiene, alternando entre ambos. Fuente sans (no la
              cursiva del saludo, que no tipea limpio letra a letra: los
              anchos de carácter saltan y se ve tosco). */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="font-sans font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-6 text-left min-h-[1.3em] tracking-tight"
            style={{ color: "var(--accent-color)" }}
          >
            {typedNameOrRole}
            <span className="animate-pulse">_</span>
          </motion.div>

          {/* Descripción orientada a resultados del cliente */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="
              max-w-xl text-base sm:text-lg md:text-xl
              mt-2 mb-8 leading-relaxed text-left
              [text-shadow:_0_2px_4px_rgba(0,0,0,0.5)]
            "
            style={{ color: "rgba(255, 255, 255, 0.85)" }}
            dangerouslySetInnerHTML={{
              __html: t("hero.subtitle")
                .replace(/\[\[b\]\](.*?)\[\[\/b\]\]/g, "<strong>$1</strong>")
                .replace(/\[\[hl\]\](.*?)\[\[\/hl\]\]/g, "<span>$1</span>"),
            }}
          />

          {/* Botones CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
            className="flex flex-wrap gap-4"
          >
            <button
              type="button"
              onClick={handleContact}
              className="btn relative group"
              aria-label={t("hero.ariaLabel")}
            >
              <strong className="relative z-10">{t("hero.ctaPrimary")}</strong>
              <div id="container-stars">
                <div id="stars" className="group-hover:animate-pulse" />
              </div>
              <div id="glow">
                <div className="circle group-hover:opacity-80" />
                <div className="circle group-hover:opacity-60" />
              </div>
            </button>

            <button
              type="button"
              onClick={handleViewProjects}
              className="
                inline-flex items-center gap-2 px-8 py-4 rounded-full
                border text-sm font-bold transition-all duration-300 cursor-pointer
                hover:scale-105
              "
              style={{
                borderColor: "color-mix(in srgb, var(--white-color) 30%, transparent)",
                color: "var(--white-color)",
                backgroundColor: "color-mix(in srgb, var(--white-color) 5%, transparent)",
              }}
            >
              {t("hero.viewProjects")}
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </button>
          </motion.div>
        </div>

        {/* Panel lateral — datos rápidos de confianza */}
        <motion.div
          initial={{ opacity: 0, y: 24, x: 16 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="hidden lg:block lg:col-span-3 lg:col-start-10"
        >
          <div
            className="rounded-2xl border backdrop-blur-sm p-6 space-y-5"
            style={{
              borderColor: "color-mix(in srgb, var(--white-color) 15%, transparent)",
              backgroundColor: "color-mix(in srgb, var(--background-color) 55%, transparent)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: "var(--primary-color)" }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ backgroundColor: "var(--primary-color)" }}
                />
              </span>
              <span className="text-sm font-semibold">{t("hero.status")}</span>
            </div>

            <div className="h-px w-full" style={{ backgroundColor: "color-mix(in srgb, var(--white-color) 12%, transparent)" }} />

            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="font-mono-label text-[0.6rem] tracking-widest" style={{ color: "var(--muted-color)" }}>Proyectos</dt>
                <dd className="text-right font-bold">+30 entregados</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="font-mono-label text-[0.6rem] tracking-widest" style={{ color: "var(--muted-color)" }}>Experiencia</dt>
                <dd className="text-right font-bold">5+ años</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="font-mono-label text-[0.6rem] tracking-widest" style={{ color: "var(--muted-color)" }}>Respuesta</dt>
                <dd className="text-right font-bold">{"<"} 24h</dd>
              </div>
            </dl>

            <div className="h-px w-full" style={{ backgroundColor: "color-mix(in srgb, var(--white-color) 12%, transparent)" }} />

            <div>
              <p className="font-mono-label text-[0.6rem] mb-2" style={{ color: "var(--muted-color)" }}>
                {t("hero.stackLabel")}
              </p>
              <div className="flex flex-wrap gap-2">
                {["React", "Next.js", "Node.js", "TypeScript"].map((tech) => (
                  <span
                    key={tech}
                    className="font-mono-label text-[0.6rem] tracking-normal normal-case px-2.5 py-1 rounded-md"
                    style={{
                      color: "var(--primary-color)",
                      backgroundColor: "color-mix(in srgb, var(--primary-color) 12%, transparent)",
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
    </MotionConfig>
  );
}
