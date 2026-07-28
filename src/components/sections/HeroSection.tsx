"use client";

import React, { useRef, useEffect } from "react";
import ParticlesComponent from "@/components/ParticlesComponent";
import "@/styles/advancedButton.css";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";

export default function HeroSection() {
  const projectsRef = useRef<HTMLElement | null>(null);
  const { t } = useTranslation();

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
          {/* Título principal orientado a clientes */}
          <div
            className="
              font-display italic
              text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem]
              font-medium mb-6 leading-[1.05] text-left
            "
          >
            {t("hero.greeting")}{" "}
            <span style={{ color: "var(--accent-color)" }}>{t("hero.name")}</span>
          </div>

          {/* Descripción orientada a resultados del cliente */}
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

          {/* Botones CTA */}
          <div className="flex flex-wrap gap-4">
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
          </div>
        </div>

        {/* Panel lateral — datos rápidos de confianza */}
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
                <dt className="font-mono-label text-[0.6rem] tracking-widest" style={{ color: "var(--muted-color)" }}>Proyectos</dt>
                <dd className="text-right font-bold">+30 entregados</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="font-mono-label text-[0.6rem] tracking-widest" style={{ color: "var(--muted-color)" }}>Desde</dt>
                <dd className="text-right font-bold">$300 USD</dd>
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
        </div>
      </div>
    </section>
  );
}
