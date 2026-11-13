"use client";

import React from "react";
import { resolveIcon } from "@/lib/portfolio/source/icon-registry";
import {
  marqueeTechnologies,
  type MarqueeTechnology,
} from "@/lib/portfolio/source/technologies";
import styles from "./TechMarquee.module.css";

// El stack completo (42 tecnologías) vivía aquí inline, con el icono en JSX.
// Ahora son datos puros en src/lib/portfolio/source/technologies.ts: el icono
// es una clave (`iconKey`) que resuelve el registro. Mismo orden, mismos
// nombres, mismos colores; el icono se sigue pintando sin props.

interface TechCardProps {
  tech: MarqueeTechnology;
}

const TechCard: React.FC<TechCardProps> = ({ tech }) => {
  const Icon = resolveIcon(tech.iconKey);

  return (
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
        {Icon ? <Icon /> : null}
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
};

interface TechRowProps {
  technologies: MarqueeTechnology[];
  rowIdPrefix: string;
  ariaLabel: string;
}

const TechRow: React.FC<TechRowProps> = ({ technologies, rowIdPrefix, ariaLabel }) => (
  <div className="relative isolate">
    <div className={`${styles.track} gap-8 relative z-10`} aria-label={ariaLabel}>
      {technologies.map((tech, index) => (
        <TechCard key={`${rowIdPrefix}-a-${index}`} tech={tech} />
      ))}
      {technologies.map((tech, index) => (
        <TechCard key={`${rowIdPrefix}-b-${index}`} tech={tech} />
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
        <span className="font-mono-label text-[0.65rem] text-[var(--accent-color)]">Tecnologías</span>
        <h2 className="font-display italic text-3xl md:text-4xl font-medium text-[var(--text-color)] mt-2 mb-3">
          Stack Tecnológico
        </h2>
        <p className="text-[var(--muted-color)] text-sm md:text-base">
          Tecnologías y herramientas con las que trabajo
        </p>
      </div>

      <TechRow technologies={marqueeTechnologies} rowIdPrefix="stack" ariaLabel="Tech stack" />

      <div className="relative mt-12">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-[var(--muted-color)]/20" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-6 bg-[var(--background-color)] text-[var(--muted-color)] text-sm font-medium">
            Desarrollo Full Stack
          </span>
        </div>
      </div>
    </section>
  );
};

export default TechMarquee;
