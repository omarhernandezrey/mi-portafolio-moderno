"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaEnvelope,
} from "react-icons/fa";
import { FiArrowUp } from "react-icons/fi";
import { motion } from "framer-motion";
import TestimonialCard from "./TestimonialCard";
import NewsletterForm from "./NewsletterForm";
import { useTranslation } from "../../hooks/useTranslation";

export default function Footer() {
  const [isScrollButtonHovered, setIsScrollButtonHovered] = useState(false);
  const { t } = useTranslation();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const testimonials = [
    {
      quote:
        "Omar es un desarrollador excepcional que aporta creatividad y eficiencia a cada proyecto.",
      author: "María López",
      role: "Gerente de Proyectos en TechCorp",
      avatar: "/images/testimonials/maria.jpg",
    },
    {
      quote:
        "Trabajar con Omar ha sido una experiencia increíble. Su atención al detalle y habilidades técnicas son insuperables.",
      author: "Juan Pérez",
      role: "CEO en Innovatech",
      avatar: "/images/testimonials/juan.jpg",
    },
  ];

  const socialLinks = [
    {
      href: "https://github.com/omarhernandezrey",
      icon: FaGithub,
      label: "GitHub",
    },
    {
      href: "https://linkedin.com/in/omarhernandezrey",
      icon: FaLinkedin,
      label: "LinkedIn",
    },
    {
      href: "https://twitter.com/omarhernandezrey",
      icon: FaTwitter,
      label: "Twitter",
    },
    {
      href: "mailto:omarhernandezrey@gmail.com",
      icon: FaEnvelope,
      label: "Email",
    },
  ];

  const navigationLinks = [
    { href: "#about", label: t("footer.navigation.aboutMe") },
    { href: "#projects", label: t("footer.navigation.projects") },
    { href: "#skills", label: t("footer.navigation.skills") },
    { href: "/calculadora", label: t("footer.navigation.calculator") },
    { href: "#contact", label: t("footer.navigation.contact") },
    { href: "/privacidad", label: t("footer.navigation.privacy") },
  ];

  return (
    <footer
      className="relative pt-32 pb-12 overflow-hidden"
      style={{
        background: `var(--background-color)`,
        color: "var(--text-color)",
      }}
    >
      {/* Wave superior decorativa */}
      <div className="absolute top-0 left-0 w-full rotate-180 overflow-hidden leading-[0] z-0 pointer-events-none opacity-50">
        <Image
          src="/images/wave-top.svg"
          alt=""
          width={1920}
          height={200}
          className="w-full h-auto"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        {/* Contenedor Principal (Ahora invisible para integración fluida) */}
        <div className="p-8 md:p-16 mb-12 relative overflow-hidden">
          {/* Grid de Información */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Col 1: Bio & Branding */}
            <div className="space-y-6">
              <h2
                className="text-3xl font-black tracking-tighter italic"
                style={{
                  background: `linear-gradient(to right, var(--primary-color), var(--accent-color))`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {t("footer.name")}
              </h2>
              <p className="text-sm leading-relaxed opacity-70 italic font-medium">
                {t("footer.description")}
              </p>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full flex items-center justify-center border transition-all"
                    style={{ 
                      borderColor: 'color-mix(in srgb, var(--muted-color) 20%, transparent)',
                      color: 'var(--muted-color)' 
                    }}
                    whileHover={{ 
                      scale: 1.1, 
                      backgroundColor: 'var(--primary-color)',
                      color: 'var(--background-color)',
                      borderColor: 'var(--primary-color)'
                    }}
                  >
                    <social.icon size={18} />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Col 2: Enlaces Rápidos */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-8 italic">
                {t("footer.navigationTitle")}
              </h3>
              <ul className="space-y-4">
                {navigationLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-sm font-bold opacity-60 hover:opacity-100 transition-all hover:text-primary italic flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Newsletter (Ocupa 2 columnas en desktop) */}
            <div className="lg:col-span-2 space-y-8">
              <div className="p-6 rounded-3xl bg-background/30 border border-white/5 shadow-inner">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-6 italic">
                  Newsletter
                </h3>
                <NewsletterForm />
              </div>
              
              {/* Mini Testimonios compactos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-[11px] italic">
                    <p className="opacity-70 mb-2">"{testimonial.quote.substring(0, 80)}..."</p>
                    <span className="font-bold text-primary">— {testimonial.author}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer del Container (Ubicación) */}
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4 text-xs font-bold opacity-50 italic">
               <span className="flex items-center gap-2">📍 {t("footer.findMe")}</span>
               <div className="w-1 h-1 rounded-full bg-white/20" />
               <span>Remote Worldwide • Bogotá, CO</span>
            </div>
            
            <motion.button
              onClick={scrollToTop}
              className="group flex items-center gap-3 px-6 py-3 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all"
              style={{
                borderColor: 'var(--primary-color)',
                color: 'var(--primary-color)'
              }}
              whileHover={{ 
                backgroundColor: 'var(--primary-color)',
                color: 'var(--background-color)',
                scale: 1.05
              }}
              whileTap={{ scale: 0.95 }}
            >
              {t("footer.backToTop")}
              <FiArrowUp size={14} className="group-hover:-translate-y-1 transition-transform" />
            </motion.button>
          </div>
        </div>

        {/* Créditos Finales Fuera del Container */}
        <div className="flex flex-col md:flex-row justify-between items-center text-[10px] font-medium opacity-40 px-4 space-y-4 md:space-y-0 text-center md:text-left">
          <div className="space-y-1">
            <p>© {new Date().getFullYear()} {t("footer.name")}. {t("footer.rights")}</p>
            <p className="max-w-md italic">
              Built with precision using Next.js, Framer Motion & Tailwind. Designed for high-performance conversion.
            </p>
          </div>
          
          <div className="flex gap-6">
            <Link href="/privacidad" className="hover:text-primary transition-colors">PRIVACY</Link>
            <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
            <Link href="/status" className="hover:text-primary transition-colors">STATUS</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
