"use client";

import React, { useRef, useEffect } from "react";
import Typewriter from "typewriter-effect";
import ParticlesComponent from "@/components/ParticlesComponent";
import "@/styles/advancedButton.css";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";

export default function HeroSection() {
  const projectsRef = useRef<HTMLElement | null>(null);
  const { t } = useTranslation();

  // Scroll suave mejorado con useRef
  const handleViewProjects = () => {
    if (!projectsRef.current) {
      projectsRef.current = document.querySelector("#projects");
    }
    projectsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Precarga las partículas solo en cliente
  const [showParticles, setShowParticles] = React.useState(false);
  useEffect(() => {
    setShowParticles(true);
  }, []);

  return (
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
          alt="Fondo decorativo"
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

      {/* Contenido — grid editorial asimétrico, no centrado */}
      <div
        className="grid-editorial relative z-10 w-full py-28 lg:py-0"
        style={{ color: "var(--white-color)" }}
      >
        {/* H1 — keyword-rich, siempre visible en SSR (Google lo lee) */}
        <h1
          className="
            col-span-12 font-mono-label text-[0.65rem] sm:text-xs mb-6 sm:mb-8
            inline-flex w-fit items-center gap-2 px-4 py-2 rounded-full border
          "
          style={{
            color: "var(--accent-color)",
            borderColor: "color-mix(in srgb, var(--accent-color) 35%, transparent)",
            backgroundColor: "color-mix(in srgb, var(--accent-color) 10%, transparent)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--accent-color)" }} />
          {t("hero.h1")}
        </h1>

        {/* Columna principal: titular + descripción + CTA */}
        <div className="col-span-12 lg:col-span-7">
          {/* Título visual animado — decorativo, no el H1 */}
          <div
            className="
              font-display italic
              text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem]
              font-medium mb-6 leading-[1.05] text-left
            "
            aria-hidden="true"
          >
            {t("hero.greeting")}{" "}
            <span className="inline-block min-h-[1.2em]">
              <Typewriter
                options={{
                  strings: [
                    `<span style="color: var(--accent-color)">${t("hero.name")}</span>`,
                    `<span style="color: var(--primary-color)">${t("hero.title")}</span>`,
                    `<span style="color: var(--accent-color)">React &amp; Next.js Expert</span>`,
                  ],
                  autoStart: true,
                  loop: true,
                  delay: 75,
                  deleteSpeed: 50,
                  wrapperClassName: "inline-block",
                }}
              />
            </span>
          </div>

          {/* Descripción con keywords comerciales — visible y en SSR */}
          <p
            className="
              max-w-xl text-base sm:text-lg md:text-xl
              mt-2 mb-8 leading-relaxed text-left
              [text-shadow:_0_2px_4px_rgba(0,0,0,0.5)]
              animate-fadeIn
            "
            style={{ color: "rgba(255, 255, 255, 0.85)" }}
            dangerouslySetInnerHTML={{ __html: t("hero.subtitle") }}
          />

          {/* Botón interactivo mejorado */}
          <button
            type="button"
            className="btn relative group"
            onClick={handleViewProjects}
            aria-label={t("hero.ariaLabel")}
          >
            <strong className="relative z-10">{t("hero.viewProjects")}</strong>
            <div id="container-stars">
              <div id="stars" className="group-hover:animate-pulse" />
            </div>
            <div id="glow">
              <div className="circle group-hover:opacity-80" />
              <div className="circle group-hover:opacity-60" />
            </div>
          </button>
        </div>

        {/* Panel lateral — asimetría deliberada, deja el col 8 vacío como respiro */}
        <div className="hidden lg:block lg:col-span-3 lg:col-start-10">
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
                <dt className="font-mono-label text-[0.6rem] tracking-widest" style={{ color: "var(--muted-color)" }}>Base</dt>
                <dd className="text-right">{t("hero.location")}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="font-mono-label text-[0.6rem] tracking-widest" style={{ color: "var(--muted-color)" }}>SLA</dt>
                <dd className="text-right">{t("hero.responseTime")}</dd>
              </div>
            </dl>

            <div className="h-px w-full" style={{ backgroundColor: "color-mix(in srgb, var(--white-color) 12%, transparent)" }} />

            <div>
              <p className="font-mono-label text-[0.6rem] mb-2" style={{ color: "var(--muted-color)" }}>
                {t("hero.stackLabel")}
              </p>
              <div className="flex flex-wrap gap-2">
                {["React", "Next.js", "Node.js", "IA"].map((tech) => (
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
        </div>
      </div>
    </section>
  );
}
