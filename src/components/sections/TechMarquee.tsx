"use client";

import React from "react";
import {
  FaReact,
  FaNodeJs,
  FaCss3Alt,
  FaHtml5,
  FaJs,
  FaPython,
  FaDocker,
  FaGitAlt,
  FaJava,
} from "react-icons/fa";
import {
  SiTailwindcss,
  SiTypescript,
  SiNextdotjs,
  SiPrisma,
  SiTypeorm,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiExpress,
  SiNestjs,
  SiVuedotjs,
  SiAngular,
  SiWebpack,
  SiVite,
  SiJest,
  SiStorybook,
  SiFigma,
  SiJenkins,
  SiCircleci,
  SiGitlab,
  SiGithubactions,
  SiVercel,
  SiRailway,
  SiFirebase,
  SiSupabase,
  SiNginx,
  SiSwagger,
  SiSpringboot,
  SiKotlin,
  SiJetpackcompose,
  SiExpo,
  SiFlutter,
} from "react-icons/si";
import { TbBrandThreejs } from "react-icons/tb";
import styles from "./TechMarquee.module.css";

interface TechItem {
  name: string;
  icon: React.ReactNode;
  color: string;
  category: string;
}

// Stack principal: tecnologías que uso a diario en proyectos reales
// (React, Next.js, Node.js/Express/NestJS, bases de datos, CI/CD, testing).
const principalTech: TechItem[] = [
  { name: "React", icon: <FaReact />, color: "#61DAFB", category: "Frontend" },
  { name: "Next.js", icon: <SiNextdotjs />, color: "#000000", category: "Frontend" },
  { name: "TypeScript", icon: <SiTypescript />, color: "#3178C6", category: "Frontend" },
  { name: "JavaScript", icon: <FaJs />, color: "#F7DF1E", category: "Frontend" },
  { name: "HTML5", icon: <FaHtml5 />, color: "#E34F26", category: "Frontend" },
  { name: "CSS3", icon: <FaCss3Alt />, color: "#1572B6", category: "Frontend" },
  { name: "Tailwind", icon: <SiTailwindcss />, color: "#06B6D4", category: "Frontend" },

  { name: "Node.js", icon: <FaNodeJs />, color: "#339933", category: "Backend" },
  { name: "Express", icon: <SiExpress />, color: "#000000", category: "Backend" },
  { name: "NestJS", icon: <SiNestjs />, color: "#E0234E", category: "Backend" },
  { name: "Swagger / OpenAPI", icon: <SiSwagger />, color: "#85EA2D", category: "Backend" },

  { name: "PostgreSQL", icon: <SiPostgresql />, color: "#4169E1", category: "Database" },
  { name: "MongoDB", icon: <SiMongodb />, color: "#47A248", category: "Database" },
  { name: "Redis", icon: <SiRedis />, color: "#DC382D", category: "Database" },
  { name: "Prisma", icon: <SiPrisma />, color: "#2D3748", category: "Database" },
  { name: "TypeORM", icon: <SiTypeorm />, color: "#E83524", category: "Database" },

  { name: "Docker", icon: <FaDocker />, color: "#2496ED", category: "DevOps" },
  { name: "GitHub Actions", icon: <SiGithubactions />, color: "#2088FF", category: "CI/CD" },
  { name: "Jenkins", icon: <SiJenkins />, color: "#D24939", category: "CI/CD" },
  { name: "CircleCI", icon: <SiCircleci />, color: "#343434", category: "CI/CD" },
  { name: "GitLab CI", icon: <SiGitlab />, color: "#FC6D26", category: "CI/CD" },
  { name: "Vercel", icon: <SiVercel />, color: "#000000", category: "Cloud" },
  { name: "Railway", icon: <SiRailway />, color: "#0B0D0E", category: "Cloud" },

  { name: "Jest", icon: <SiJest />, color: "#C21325", category: "Testing" },
  { name: "Git", icon: <FaGitAlt />, color: "#F05032", category: "Tools" },
  { name: "Vite", icon: <SiVite />, color: "#646CFF", category: "Tools" },
];

// También he trabajado con: stack secundario (según mi CV) + herramientas
// de proyectos puntuales de este portafolio.
const secondaryTech: TechItem[] = [
  { name: "Java", icon: <FaJava />, color: "#007396", category: "Backend" },
  { name: "Spring Boot", icon: <SiSpringboot />, color: "#6DB33F", category: "Backend" },
  { name: "Python", icon: <FaPython />, color: "#3776AB", category: "Backend" },
  { name: "Kotlin", icon: <SiKotlin />, color: "#7F52FF", category: "Mobile" },
  { name: "Jetpack Compose", icon: <SiJetpackcompose />, color: "#4285F4", category: "Mobile" },
  { name: "React Native (Expo)", icon: <SiExpo />, color: "#000020", category: "Mobile" },
  { name: "Flutter", icon: <SiFlutter />, color: "#02569B", category: "Mobile" },
  { name: "Angular", icon: <SiAngular />, color: "#DD0031", category: "Frontend" },
  { name: "Vue.js", icon: <SiVuedotjs />, color: "#4FC08D", category: "Frontend" },

  // Verificado en este repo: componente 3D "Lanyard" (github.com/omarhernandezrey/lanyard-project)
  { name: "Three.js", icon: <TbBrandThreejs />, color: "#000000", category: "3D" },
  // Verificado en este repo: backend real de auth/admin/leads de este mismo sitio
  { name: "Supabase", icon: <SiSupabase />, color: "#3ECF8E", category: "Cloud" },

  { name: "Firebase", icon: <SiFirebase />, color: "#FFCA28", category: "Cloud" },
  { name: "Nginx", icon: <SiNginx />, color: "#009639", category: "Server" },
  { name: "Webpack", icon: <SiWebpack />, color: "#8DD6F9", category: "Tools" },
  { name: "Storybook", icon: <SiStorybook />, color: "#FF4785", category: "Tools" },
  { name: "Figma", icon: <SiFigma />, color: "#F24E1E", category: "Design" },
];

interface TechCardProps {
  tech: TechItem;
}

const TechCard: React.FC<TechCardProps> = ({ tech }) => (
  <div className="flex-shrink-0 group relative">
    <div className="relative flex flex-col items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-[var(--card-bg-color)] to-[var(--secondary-background-color)] border border-[var(--muted-color)]/20 shadow-lg backdrop-blur-sm transition-transform duration-300 ease-out will-change-transform group-hover:-translate-y-2 group-hover:scale-[1.12] group-hover:shadow-2xl group-hover:border-[var(--accent-color)]/50">
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
        style={{
          background: `radial-gradient(circle at center, ${tech.color}40, transparent)`,
        }}
      />
      <div
        className="text-5xl md:text-6xl relative z-10"
        style={{ color: tech.color }}
      >
        {tech.icon}
      </div>
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] text-white shadow-lg">
          {tech.category}
        </span>
      </div>
    </div>
    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-[9999]">
      <div className="bg-[var(--secondary-background-color)] text-[var(--text-color)] text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl border border-[var(--muted-color)]/30 whitespace-nowrap">
        {tech.name}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--secondary-background-color)] border-l border-t border-[var(--muted-color)]/30 rotate-45" />
      </div>
    </div>
  </div>
);

interface TechRowProps {
  technologies: TechItem[];
  rowIdPrefix: string;
  ariaLabel: string;
}

const TechRow: React.FC<TechRowProps> = ({ technologies, rowIdPrefix, ariaLabel }) => (
  <div className="relative isolate">
    <div
      className={`${styles.track} gap-8 mb-8 relative z-10`}
      aria-label={`${ariaLabel} fila uno`}
    >
      {technologies.map((tech, index) => (
        <TechCard key={`${rowIdPrefix}-row1-a-${index}`} tech={tech} />
      ))}
      {technologies.map((tech, index) => (
        <TechCard key={`${rowIdPrefix}-row1-b-${index}`} tech={tech} />
      ))}
    </div>

    <div
      className={`${styles.track} ${styles.trackReverse} gap-8 relative -z-10`}
      aria-label={`${ariaLabel} fila dos`}
    >
      {technologies.map((tech, index) => (
        <TechCard key={`${rowIdPrefix}-row2-a-${index}`} tech={tech} />
      ))}
      {technologies.map((tech, index) => (
        <TechCard key={`${rowIdPrefix}-row2-b-${index}`} tech={tech} />
      ))}
    </div>
  </div>
);

const TechMarquee: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden py-12 sm:py-16 bg-gradient-to-b from-[var(--background-color)] via-[var(--secondary-background-color)] to-[var(--background-color)]">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-[var(--primary-color)] rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[var(--accent-color)] rounded-full blur-3xl opacity-20" />
      </div>

      <div className="text-center mb-12 relative z-10">
        <span className="font-mono-label text-[0.65rem] text-[var(--accent-color)]">Stack</span>
        <h2 className="font-display italic text-3xl md:text-4xl font-medium text-[var(--text-color)] mt-2 mb-3">
          Tech Stack
        </h2>
        <p className="text-[var(--muted-color)] text-sm md:text-base">
          Tecnologías y herramientas con las que trabajo
        </p>
      </div>

      <div className="relative z-10 mb-3 text-center">
        <span className="font-mono-label text-[0.65rem] uppercase tracking-widest text-[var(--muted-color)]">
          Principal
        </span>
      </div>
      <TechRow technologies={principalTech} rowIdPrefix="principal" ariaLabel="Tech stack principal" />

      <div className="relative mt-10 mb-3 text-center">
        <span className="font-mono-label text-[0.65rem] uppercase tracking-widest text-[var(--muted-color)]">
          También he trabajado con
        </span>
      </div>
      <TechRow technologies={secondaryTech} rowIdPrefix="secondary" ariaLabel="Tech stack secundario" />

      <div className="relative mt-12">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-[var(--muted-color)]/20" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-6 bg-[var(--background-color)] text-[var(--muted-color)] text-sm font-medium">
            Full Stack Development
          </span>
        </div>
      </div>
    </section>
  );
};

export default TechMarquee;
