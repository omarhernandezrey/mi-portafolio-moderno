"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  FaUser,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from "react-icons/fa";
import { useTranslation } from "@/hooks/useTranslation";
import ProfileCard from "./ProfileCard";
import BrutalistInterestCard from "../shared/BrutalistInterestCard";

/* ──────────────────────────────────────────────────────────
   Función para crear partículas aleatorias (solo en cliente) */
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

const AboutSection: React.FC = () => {
  const { t, language } = useTranslation();
  const currentLanguage = language === "en" ? "en" : "es";
  const cvDownloadPath = (
    currentLanguage === "en"
      ? "/files/Omar_Hernandez_Rey_English-ATS.pdf"
      : "/files/Omar_Hernandez_Rey_Español-ATS.pdf"
  );
  
  /* Estado para partículas flotantes (solo cliente) */
  const [floatingElements, setFloatingElements] = useState<
    ReturnType<typeof createFloatingElements>
  >([]);

  /* Referencia a la sección para animaciones de scroll */
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  /* Parallax para fondo */
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  /* Datos de intereses y enlaces */
  const interests = [
    "Platzi Learning",
    "Open Source",
    "AI & ML",
    "Coding",
    "Tech Conferences",
  ];
  const interestLinks: Record<string, string> = {
    "Platzi Learning": "https://platzi.com/",
    "Open Source": "https://opensource.org/",
    "AI & ML": "https://ai.google/",
    Coding: "https://www.codecademy.com/",
    "Tech Conferences": "https://confs.tech/",
  };

  /* Datos personales */
  const personalData = [
    { 
      icon: FaUser, 
      label: t("about.personalData.name"), 
      value: t("about.personalInfo.fullName") 
    },
    {
      icon: FaCalendarAlt,
      label: t("about.personalData.birthDate"),
      value: t("about.personalInfo.birth"),
    },
    {
      icon: FaMapMarkerAlt,
      label: t("about.personalData.address"),
      value: t("about.personalInfo.location"),
    },
    { 
      icon: FaPhoneAlt, 
      label: t("about.personalData.phone"), 
      value: t("about.personalInfo.phoneNumber") 
    },
  ];

  /* Efecto: genera partículas tras montar (evita discrepancia SSR/CSR) */
  useEffect(() => {
    setFloatingElements(createFloatingElements());
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative min-h-screen py-32 px-2 sm:px-4 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, var(--background-color) 0%, var(--secondary-background-color) 50%, var(--background-color) 100%)",
      }}
    >
      {/* Fondo parallax moderno */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <motion.div
          className="absolute top-[-120px] left-[-120px] w-[350px] h-[350px] rounded-full opacity-30 blur-3xl"
          style={{
            backgroundColor: "var(--primary-color)",
            y: y1,
          }}
        />
        <motion.div
          className="absolute top-[30%] right-[-100px] w-[280px] h-[280px] opacity-40 blur-2xl rotate-12"
          style={{
            backgroundColor: "var(--accent-color)",
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
            y: y2,
          }}
        />
        <motion.div
          className="absolute bottom-[-100px] left-[20%] w-[220px] h-[220px] rounded-full opacity-30 blur-2xl"
          style={{
            background: `linear-gradient(to top right, var(--primary-color), var(--accent-color), transparent)`,
            y: y3,
          }}
        />
        <motion.div
          className="absolute top-[60%] left-[-80px] w-[400px] h-[8px] opacity-40 rotate-[-20deg] blur-md"
          style={{
            background: `linear-gradient(to right, var(--accent-color), rgba(255,255,255,0.1), transparent)`,
            y: y4,
          }}
        />
        <div className="absolute bottom-[-60px] right-[10%] w-[120px] h-[120px] rounded-full bg-white opacity-10 blur-2xl" />
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
        className="relative z-10 mx-auto max-w-full sm:max-w-7xl px-2 sm:px-4"
        style={{ opacity }}
      >
        {/* Header Seccion (Consistente con Educación/Proyectos) */}
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
            {t("about.badge")}
          </motion.span>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            style={{
              backgroundImage:
                "linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {t("about.title")}
          </h2>
        </motion.div>

        {/* Grid principal (foto + texto) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Foto */}
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
          >
            <ProfileCard
              name={t("about.name")}
              tagline={t("about.role")}
              cvPath={cvDownloadPath}
            />
          </motion.div>

          {/* Bio + Datos Personales */}
          <motion.div
            className="flex flex-col space-y-10"
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
          >
            {/* Descripción */}
            <motion.p
              className="text-lg leading-relaxed text-justify"
              style={{
                color: "var(--muted-color)",
              }}
              dangerouslySetInnerHTML={{
                __html: t("about.description")
                  .replace("{name}", `<strong class="font-bold text-[var(--text-color)]">${t("about.name")}</strong>`)
                  .replace("{role}", `<strong class="font-bold text-[var(--primary-color)]">${t("about.role")}</strong>`)
                  .replace("{frontend}", `<strong class="font-bold text-[var(--accent-color)]">${t("about.frontend")}</strong>`)
                  .replace("{backend}", `<strong class="font-bold text-[var(--accent-color)]">${t("about.backend")}</strong>`)
                  .replace("{degree}", `<strong class="font-bold text-[var(--primary-color)]">${t("about.degree")}</strong>`)
                  .replace("{university}", `<strong class="font-bold text-[var(--primary-color)]">${t("about.university")}</strong>`)
                  .replace("{platform}", `<strong class="font-bold text-[var(--accent-color)]">${t("about.platform")}</strong>`),
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
                  <div className="w-10 h-10 rounded-full bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/20 flex items-center justify-center text-[var(--primary-color)] shadow-lg">
                    <item.icon size={16} />
                  </div>
                  <div>
                    <p className="uppercase text-[10px] font-black tracking-widest text-[var(--accent-color)]/70">
                      {item.label}
                    </p>
                    <p className="text-sm font-bold text-[var(--text-color)]">
                      {item.value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ───────── Sección de intereses ───────── */}
        <motion.div
          className="mt-32"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <motion.span
              className="inline-block px-4 py-2 mb-6 text-sm font-semibold tracking-wider uppercase rounded-full border"
              style={{
                color: "var(--accent-color)",
                backgroundColor: `color-mix(in srgb, var(--accent-color) 10%, transparent)`,
                borderColor: `color-mix(in srgb, var(--accent-color) 30%, transparent)`,
              }}
            >
              {t("about.interests.badge")}
            </motion.span>

            <h3
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{
                backgroundImage: `linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t("about.interests.title")}
            </h3>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-12">
            {interests.map((interest, index) => (
              <BrutalistInterestCard
                key={interest}
                title={interest}
                href={interestLinks[interest] || "#"}
                index={index}
              />
            ))}
          </div>
        </motion.div>
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
