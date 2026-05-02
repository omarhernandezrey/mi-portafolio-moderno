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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
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

          <motion.div
            className="flex flex-col space-y-10"
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            viewport={{ once: true }}
          >
            {/* Glassmorphism Card for Content */}
            <div 
              className="backdrop-blur-2xl rounded-[40px] border p-8 md:p-12 shadow-2xl relative overflow-hidden"
              style={{
                backgroundColor: `color-mix(in srgb, var(--secondary-background-color) 30%, transparent)`,
                borderColor: `color-mix(in srgb, var(--accent-color) 15%, transparent)`,
              }}
            >
              {/* Brillo dinámico de fondo */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
              
              {/* Encabezado */}
              <div className="relative z-10 mb-10">
                <motion.span
                  className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border italic"
                  style={{
                    color: "var(--accent-color)",
                    backgroundColor: `color-mix(in srgb, var(--accent-color) 5%, transparent)`,
                    borderColor: `color-mix(in srgb, var(--accent-color) 20%, transparent)`,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  {t("about.badge")}
                </motion.span>

                <h2
                  className="text-5xl md:text-7xl font-black mb-8 italic tracking-tighter leading-none"
                  style={{
                    background: `linear-gradient(135deg, var(--white-color) 0%, var(--text-color) 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {t("about.title")}
                </h2>

                <div className="h-1 w-24 bg-gradient-to-r from-primary to-accent rounded-full mb-10" />

                {/* Descripción */}
                <motion.p
                  className="text-lg md:text-xl leading-relaxed text-text-muted font-medium italic opacity-90"
                  dangerouslySetInnerHTML={{
                    __html: t("about.description")
                      .replace("{name}", `<span class="text-white-custom font-black">${t("about.name")}</span>`)
                      .replace("{role}", `<span class="text-primary font-black uppercase tracking-tight">${t("about.role")}</span>`)
                      .replace("{frontend}", `<span class="text-accent font-black">UI/UX</span>`)
                      .replace("{backend}", `<span class="text-accent font-black">Scalability</span>`)
                      .replace("{degree}", `<span class="text-white-custom font-black border-b-2 border-primary/30">${t("about.degree")}</span>`)
                      .replace("{university}", `<span class="italic opacity-70">${t("about.university")}</span>`)
                      .replace("{platform}", `<span class="text-accent font-black italic underline decoration-accent/30 underline-offset-4">${t("about.platform")}</span>`),
                  }}
                />
              </div>

              {/* Datos personales - Grid Profesional */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-8 pt-10 border-t border-white/5">
                {personalData.map((item, index) => (
                  <div
                    key={index}
                    className="group flex flex-col space-y-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-all duration-500">
                        <item.icon size={14} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/60 italic">
                        {item.label}
                      </span>
                    </div>
                    <p className="text-sm md:text-base font-bold text-white-custom pl-11">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
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
          {/* Encabezado Profesional */}
          <div className="text-center mb-20 space-y-4">
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-1.5 mb-2 text-[10px] font-black uppercase tracking-[0.4em] rounded-full border italic"
              style={{
                color: "var(--accent-color)",
                backgroundColor: `color-mix(in srgb, var(--accent-color) 5%, transparent)`,
                borderColor: `color-mix(in srgb, var(--accent-color) 20%, transparent)`,
              }}
            >
              {t("about.interests.badge")}
            </motion.span>

            <h3
              className="text-4xl md:text-6xl font-black italic tracking-tighter"
              style={{
                background: `linear-gradient(135deg, var(--white-color) 0%, var(--primary-color) 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {t("about.interests.title")}
            </h3>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted/40 italic">
              Core Ecosystem & Passion Projects
            </p>
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
