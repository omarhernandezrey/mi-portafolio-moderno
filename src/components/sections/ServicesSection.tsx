/* components/sections/ServicesSection.tsx
   - Se reemplazó la apóstrofe sin escapar (`Let's`) por `Let&apos;s`
     para cumplir con la regla ESLint `react/no-unescaped-entities`.
   - Variables CSS hardcodeadas reemplazadas por sistema dinámico de paletas */

"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useMemo } from "react";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import { servicesData, getLocalizedServicesData } from "@/lib/servicesData";
import ServiceCard3D from "@/components/shared/ServiceCard3D";
import ScrollReveal from "@/components/shared/ScrollReveal";

// Los datos se obtienen ahora del archivo servicesData.ts

export default function ServicesSection() {
  /* ----------------------- i18n y datos ----------------------- */
  const { t, language } = useTranslation();
  const localizedServices = useMemo(() => getLocalizedServicesData(servicesData, language), [language]);

  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative min-h-screen py-32 px-2 sm:px-4 overflow-hidden"
      style={{
        background: "var(--background-color)",
        backgroundImage: `
          radial-gradient(circle at 100% -8%, color-mix(in srgb, var(--accent-color) 10%, transparent), transparent 32rem),
          radial-gradient(circle at 0% 110%, color-mix(in srgb, var(--primary-color) 8%, transparent), transparent 28rem)
        `,
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

      {/* Contenido principal */}
      <motion.div
        className="relative z-10 max-w-full sm:max-w-7xl mx-auto px-2 sm:px-4"
        style={{ opacity }}
      >
        {/* Encabezado */}
        <ScrollReveal y={50} className="text-center mb-20">
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
            {t('services.badge')}
          </motion.span>

          <h2
            className="font-display italic text-4xl md:text-5xl lg:text-6xl font-medium mb-6"
            style={{ color: "var(--text-color)" }}
          >
            {t('services.title')}
          </h2>
          <p
            className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: "var(--muted-color)" }}
          >
            {t('services.description')}
          </p>
        </ScrollReveal>

        {/* Grid de servicios — móvil: 2 col · desktop: 4 col */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 items-stretch">
          {localizedServices.map((service, index) => (
            <ScrollReveal key={index} y={50} delay={index * 0.1} className="w-full h-full">
              <ServiceCard3D
                title={service.title}
                description={service.description}
                badge={service.badge}
                number={`0${index + 1}`}
                onHire={() => {
                  const contactSection = document.querySelector("#contact");
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: "smooth" });
                    // Opcional: Podríamos disparar un evento para que el ChatBot o el Formulario
                    // sepa qué servicio se seleccionó.
                    console.log(`Interesado en: ${service.title}`);
                  }
                }}
              />
            </ScrollReveal>
          ))}
        </div>

        {/* CTA inferior */}
        <ScrollReveal y={30} delay={0.3} className="text-center mt-20">
          <motion.button
            onClick={() => {
              const contactSection = document.querySelector("#contact");
              contactSection?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
            className="group px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 cursor-pointer"
            style={{
              background:
                "linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)",
              color: "var(--white-color)",
              boxShadow: `0 10px 30px color-mix(in srgb, var(--accent-color) 30%, transparent)`,
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: `0 15px 40px color-mix(in srgb, var(--accent-color) 40%, transparent)`,
            }}
            whileTap={{ scale: 0.95 }}
            aria-label="Ir a la sección de contacto"
          >
            {t('services.cta')}
            <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
              →
            </span>
          </motion.button>
        </ScrollReveal>
      </motion.div>

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
