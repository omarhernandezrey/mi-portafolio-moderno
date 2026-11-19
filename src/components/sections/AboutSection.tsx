"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import ScrollReveal from "../shared/ScrollReveal";
import ProfileCard from "./ProfileCard";
import ModernInterestCard from "../ui/ModernInterestCard";
import { resolveIcon } from "@/lib/portfolio/source/icon-registry";
import { interestsData, personalData as personalDataFields } from "@/lib/portfolio/source/about";

const AboutSection: React.FC = () => {
  const { t } = useTranslation();
  // CV único (ES/EN): Omar la coloca en public/files/.
  const cvDownloadPath = "/files/Omar_Hernandez_Rey_Full_Stack_Developer_CV.pdf";

  /* Referencia a la sección para el fundido de entrada/salida por scroll */
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  /* Datos de intereses y enlaces: los datos vienen de
     src/lib/portfolio/source/about.ts (antes estaban inline aquí). El icono es
     una clave que resuelve el registro; las props de tamaño siguen puestas en
     el render, idénticas a antes. */

  /* Datos personales: el módulo guarda las CLAVES de i18n, el texto lo sigue
     resolviendo t() aquí mismo, como antes. */
  const personalData = personalDataFields.map((field) => ({
    icon: resolveIcon(field.iconKey),
    label: t(field.labelKey),
    value: t(field.valueKey),
  }));

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative min-h-screen py-32 px-4 overflow-hidden"
      style={{
        background: "var(--background-color)",
        backgroundImage: `
          radial-gradient(circle at 12% -8%, color-mix(in srgb, var(--primary-color) 10%, transparent), transparent 32rem),
          radial-gradient(circle at 100% 110%, color-mix(in srgb, var(--accent-color) 8%, transparent), transparent 28rem)
        `,
      }}
    >
      {/* Wave superior */}
      <motion.div
        className="absolute top-0 left-0 w-full overflow-hidden z-0"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <Image
          src="/images/wave-top.svg"
          alt="Wave Top"
          className="w-full h-auto rotate-180"
          width={1920}
          height={200}
          priority
        />
      </motion.div>

      {/* Contenido principal */}
      <motion.div
        className="relative z-10 mx-auto max-w-full sm:max-w-7xl px-0 sm:px-4"
        style={{ opacity }}
      >
        {/* Header Seccion (Consistente con Educación/Proyectos) */}
        <ScrollReveal y={30} className="text-center mb-16">
          <motion.span
            className="font-mono-label inline-flex items-center gap-2 px-4 py-2 mb-6 text-[0.65rem] rounded-full border"
            style={{
              color: "var(--accent-color)",
              backgroundColor: `color-mix(in srgb, var(--accent-color) 10%, transparent)`,
              borderColor: `color-mix(in srgb, var(--accent-color) 30%, transparent)`,
            }}
            whileHover={{ scale: 1.05 }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--accent-color)" }} />
            {t("about.badge")}
          </motion.span>
          <h2
            className="font-display italic text-4xl md:text-5xl lg:text-6xl font-medium mb-6"
            style={{ color: "var(--text-color)" }}
          >
            {t("about.title")}
          </h2>
        </ScrollReveal>

        {/* Grid principal (foto + texto) — grilla editorial asimétrica 5/7 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Foto */}
          <ScrollReveal x={-60} y={0} className="flex flex-col items-center lg:col-span-5">
            <ProfileCard
              name={t("about.name")}
              tagline={t("about.role")}
              cvPath={cvDownloadPath}
            />
          </ScrollReveal>

          {/* Bio + Datos Personales */}
          <ScrollReveal x={60} y={0} delay={0.1} className="flex flex-col space-y-10 lg:col-span-7">
            {/* Descripción */}
            <motion.p
              className="text-lg leading-relaxed text-justify"
              style={{
                color: "var(--muted-color)",
              }}
              dangerouslySetInnerHTML={{
                __html: t("about.description")
                  .replace("[[name]]", `<strong class="font-bold text-[var(--text-color)]">${t("about.name")}</strong>`)
                  .replace("[[role]]", `<strong class="font-bold text-[var(--primary-color)]">${t("about.role")}</strong>`)
                  .replace("[[frontend]]", `<strong class="font-bold text-[var(--accent-color)]">${t("about.frontend")}</strong>`)
                  .replace("[[backend]]", `<strong class="font-bold text-[var(--accent-color)]">${t("about.backend")}</strong>`)
                  .replace("[[degree]]", `<strong class="font-bold text-[var(--primary-color)]">${t("about.degree")}</strong>`)
                  .replace("[[university]]", `<strong class="font-bold text-[var(--primary-color)]">${t("about.university")}</strong>`)
                  .replace("[[platform]]", `<strong class="font-bold text-[var(--accent-color)]">${t("about.platform")}</strong>`),
              }}
            />

            {/* Datos personales - Grid Estándar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {personalData.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-4 group"
                  whileHover={{ x: 5 }}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[var(--primary-color)] shadow-lg">
                    {item.icon ? <item.icon size={16} /> : null}
                  </div>
                  <div>
                    <p className="font-mono-label text-3xs text-accent/70">
                      {item.label}
                    </p>
                    <p className="text-sm font-bold text-[var(--text-color)]">
                      {item.value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>
        </div>

        {/* ───────── Sección de intereses ───────── */}
        <ScrollReveal y={50} delay={0.2} className="mt-32">
          <div className="text-center mb-16">
            <motion.span
              className="font-mono-label inline-flex items-center gap-2 px-4 py-2 mb-6 text-[0.65rem] rounded-full border"
              style={{
                color: "var(--accent-color)",
                backgroundColor: `color-mix(in srgb, var(--accent-color) 10%, transparent)`,
                borderColor: `color-mix(in srgb, var(--accent-color) 30%, transparent)`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--accent-color)" }} />
              {t("about.interests.badge")}
            </motion.span>

            <h3
              className="font-display italic text-4xl md:text-5xl font-medium mb-6"
              style={{ color: "var(--text-color)" }}
            >
              {t("about.interests.title")}
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-8">
            {interestsData.map((item) => {
              const Icon = resolveIcon(item.iconKey);
              return (
                <ModernInterestCard
                  key={item.title}
                  title={item.title}
                  href={item.href}
                  icon={Icon ? <Icon size={40} strokeWidth={1.5} /> : undefined}
                />
              );
            })}
          </div>
        </ScrollReveal>
      </motion.div>

      <motion.div
        className="absolute bottom-0 left-0 w-full h-48 overflow-hidden leading-[0] z-0"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <Image
          src="/images/wave-bottom.svg"
          alt="Wave Bottom"
          fill
          style={{ objectFit: "cover" }}
          className="w-full h-full"
        />
      </motion.div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(to right, transparent 0%, var(--accent-color) 50%, transparent 100%)`,
          opacity: 0.4,
        }}
      />
    </section>
  );
};

export default AboutSection;
