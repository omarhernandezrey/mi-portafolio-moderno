"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
  FaReact,
  FaNodeJs,
  FaCss3Alt,
  FaHtml5,
  FaJs,
  FaPython,
  FaDocker,
  FaGitAlt,
  FaAws,
} from "react-icons/fa";
import { 
  SiTailwindcss, 
  SiTypescript, 
  SiNextdotjs,
  SiPrisma,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiGraphql,
  SiExpress,
  SiNestjs,
  SiDjango,
  SiFlask,
  SiVuedotjs,
  SiAngular,
  SiSvelte,
  SiWebpack,
  SiVite,
  SiJest,
  SiCypress,
  SiStorybook,
  SiFigma,
  SiKubernetes,
  SiTerraform,
  SiJenkins,
  SiGithubactions,
  SiVercel,
  SiNetlify,
  SiFirebase,
  SiSupabase,
  SiStripe,
  SiSocketdotio,
  SiNginx,
  SiElasticsearch,
} from "react-icons/si";
import { TbBrandThreejs } from "react-icons/tb";

interface TechItem {
  name: string;
  icon: React.ReactNode;
  color: string;
  category: string;
}

const technologies: TechItem[] = [
  // Frontend
  { name: "React", icon: <FaReact />, color: "#61DAFB", category: "Frontend" },
  { name: "Next.js", icon: <SiNextdotjs />, color: "#000000", category: "Frontend" },
  { name: "TypeScript", icon: <SiTypescript />, color: "#3178C6", category: "Frontend" },
  { name: "JavaScript", icon: <FaJs />, color: "#F7DF1E", category: "Frontend" },
  { name: "Vue.js", icon: <SiVuedotjs />, color: "#4FC08D", category: "Frontend" },
  { name: "Angular", icon: <SiAngular />, color: "#DD0031", category: "Frontend" },
  { name: "Svelte", icon: <SiSvelte />, color: "#FF3E00", category: "Frontend" },
  { name: "HTML5", icon: <FaHtml5 />, color: "#E34F26", category: "Frontend" },
  { name: "CSS3", icon: <FaCss3Alt />, color: "#1572B6", category: "Frontend" },
  { name: "Tailwind", icon: <SiTailwindcss />, color: "#06B6D4", category: "Frontend" },
  
  // 3D & Graphics
  { name: "Three.js", icon: <TbBrandThreejs />, color: "#000000", category: "3D" },
  
  // Backend
  { name: "Node.js", icon: <FaNodeJs />, color: "#339933", category: "Backend" },
  { name: "Express", icon: <SiExpress />, color: "#000000", category: "Backend" },
  { name: "NestJS", icon: <SiNestjs />, color: "#E0234E", category: "Backend" },
  { name: "Python", icon: <FaPython />, color: "#3776AB", category: "Backend" },
  { name: "Django", icon: <SiDjango />, color: "#092E20", category: "Backend" },
  { name: "Flask", icon: <SiFlask />, color: "#000000", category: "Backend" },
  
  // Databases
  { name: "PostgreSQL", icon: <SiPostgresql />, color: "#4169E1", category: "Database" },
  { name: "MongoDB", icon: <SiMongodb />, color: "#47A248", category: "Database" },
  { name: "Redis", icon: <SiRedis />, color: "#DC382D", category: "Database" },
  { name: "Prisma", icon: <SiPrisma />, color: "#2D3748", category: "Database" },
  
  // APIs & Real-time
  { name: "GraphQL", icon: <SiGraphql />, color: "#E10098", category: "API" },
  { name: "Socket.io", icon: <SiSocketdotio />, color: "#010101", category: "Real-time" },
  
  // DevOps & Cloud
  { name: "Docker", icon: <FaDocker />, color: "#2496ED", category: "DevOps" },
  { name: "Kubernetes", icon: <SiKubernetes />, color: "#326CE5", category: "DevOps" },
  { name: "AWS", icon: <FaAws />, color: "#FF9900", category: "Cloud" },
  { name: "Vercel", icon: <SiVercel />, color: "#000000", category: "Cloud" },
  { name: "Netlify", icon: <SiNetlify />, color: "#00C7B7", category: "Cloud" },
  { name: "Firebase", icon: <SiFirebase />, color: "#FFCA28", category: "Cloud" },
  { name: "Supabase", icon: <SiSupabase />, color: "#3ECF8E", category: "Cloud" },
  
  // Build Tools
  { name: "Webpack", icon: <SiWebpack />, color: "#8DD6F9", category: "Tools" },
  { name: "Vite", icon: <SiVite />, color: "#646CFF", category: "Tools" },
  { name: "Git", icon: <FaGitAlt />, color: "#F05032", category: "Tools" },
  
  // Testing
  { name: "Jest", icon: <SiJest />, color: "#C21325", category: "Testing" },
  { name: "Cypress", icon: <SiCypress />, color: "#17202C", category: "Testing" },
  
  // Other
  { name: "Terraform", icon: <SiTerraform />, color: "#7B42BC", category: "IaC" },
  { name: "Jenkins", icon: <SiJenkins />, color: "#D24939", category: "CI/CD" },
  { name: "GitHub Actions", icon: <SiGithubactions />, color: "#2088FF", category: "CI/CD" },
  { name: "Nginx", icon: <SiNginx />, color: "#009639", category: "Server" },
  { name: "Elasticsearch", icon: <SiElasticsearch />, color: "#005571", category: "Search" },
  { name: "Storybook", icon: <SiStorybook />, color: "#FF4785", category: "Tools" },
  { name: "Figma", icon: <SiFigma />, color: "#F24E1E", category: "Design" },
  { name: "Stripe", icon: <SiStripe />, color: "#008CDD", category: "Payments" },
];

const TechMarquee: React.FC = () => {
  // Duplicamos el array para crear un efecto infinito sin cortes
  const duplicatedTechs = [...technologies, ...technologies];

  return (
    <section className="relative w-full overflow-hidden py-12 sm:py-16 bg-gradient-to-b from-[var(--background-color)] via-[var(--secondary-background-color)] to-[var(--background-color)]">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--primary-color)] rounded-full blur-[120px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--accent-color)] rounded-full blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Título */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 relative z-10"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-color)] mb-3">
          <span className="bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] bg-clip-text text-transparent">
            Tech Stack
          </span>
        </h2>
        <p className="text-[var(--muted-color)] text-sm md:text-base">
          Tecnologías y herramientas con las que trabajo
        </p>
      </motion.div>

      {/* Contenedor principal del marquee */}
      <div className="relative isolate">
        {/* Primera fila - Izquierda a Derecha */}
        <motion.div
          className="flex gap-8 mb-8 relative z-10"
          animate={{
            x: [0, -1920],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 60,
              ease: "linear",
            },
          }}
        >
          {duplicatedTechs.map((tech, index) => (
            <motion.div
              key={`row1-${index}`}
              className="flex-shrink-0 group relative"
              whileHover={{ scale: 1.15, y: -8 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="relative flex flex-col items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-[var(--card-bg-color)] to-[var(--secondary-background-color)] border border-[var(--muted-color)]/20 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:shadow-2xl group-hover:border-[var(--accent-color)]/50">
                {/* Brillo de fondo en hover */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                  style={{ 
                    background: `radial-gradient(circle at center, ${tech.color}40, transparent)` 
                  }}
                ></div>
                
                {/* Icono */}
                <div 
                  className="text-5xl md:text-6xl relative z-10 transition-all duration-300"
                  style={{ color: tech.color }}
                >
                  {tech.icon}
                </div>
                
                {/* Badge de categoría */}
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] text-white shadow-lg">
                    {tech.category}
                  </span>
                </div>
              </div>
              
              {/* Tooltip FUERA del div principal - con fixed positioning */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[9999]">
                <div className="bg-[var(--secondary-background-color)] text-[var(--text-color)] text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl border border-[var(--muted-color)]/30 whitespace-nowrap">
                  {tech.name}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--secondary-background-color)] border-l border-t border-[var(--muted-color)]/30 rotate-45"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Segunda fila - Derecha a Izquierda (invertida) */}
        <motion.div
          className="flex gap-8 relative -z-10"
          animate={{
            x: [-1920, 0],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 60,
              ease: "linear",
            },
          }}
        >
          {[...duplicatedTechs].reverse().map((tech, index) => (
            <motion.div
              key={`row2-${index}`}
              className="flex-shrink-0 group relative"
              whileHover={{ scale: 1.15, y: -8 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="relative flex flex-col items-center justify-center w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-[var(--card-bg-color)] to-[var(--secondary-background-color)] border border-[var(--muted-color)]/20 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:shadow-2xl group-hover:border-[var(--accent-color)]/50">
                {/* Brillo de fondo en hover */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                  style={{ 
                    background: `radial-gradient(circle at center, ${tech.color}40, transparent)` 
                  }}
                ></div>
                
                {/* Icono */}
                <div 
                  className="text-5xl md:text-6xl relative z-10 transition-all duration-300"
                  style={{ color: tech.color }}
                >
                  {tech.icon}
                </div>
                
                {/* Badge de categoría */}
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] text-white shadow-lg">
                    {tech.category}
                  </span>
                </div>
              </div>
              
              {/* Tooltip FUERA del div principal - con fixed positioning */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[9999]">
                <div className="bg-[var(--secondary-background-color)] text-[var(--text-color)] text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl border border-[var(--muted-color)]/30 whitespace-nowrap">
                  {tech.name}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--secondary-background-color)] border-l border-t border-[var(--muted-color)]/30 rotate-45"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Línea decorativa inferior */}
      <div className="relative mt-12">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-[var(--muted-color)]/20"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-6 bg-[var(--background-color)] text-[var(--muted-color)] text-sm font-medium">
            ⚡ Full Stack Development ⚡
          </span>
        </div>
      </div>
    </section>
  );
};

export default TechMarquee;
