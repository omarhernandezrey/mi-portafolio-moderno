"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const [isScrollButtonHovered, setIsScrollButtonHovered] = useState(false);
  const { t } = useTranslation();

  const handleLinkClick = (id: string) => {
    // Si estamos en otra página y es un link interno, redirigir al home con el ancla
    if (pathname !== "/" && id.startsWith("#")) {
      window.location.href = `/${id}`;
      return;
    }

    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
      href: "#contact",
      icon: FaEnvelope,
      label: "Email",
      isAnchor: true,
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
                  backgroundImage: `linear-gradient(to right, var(--primary-color), var(--accent-color))`,
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
                    target={social.isAnchor ? "_self" : "_blank"}
                    rel={social.isAnchor ? "" : "noopener noreferrer"}
                    onClick={(e) => {
                      if (social.isAnchor) {
                        e.preventDefault();
                        handleLinkClick(social.href);
                      }
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer"
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
              <ul className="grid grid-cols-2 md:grid-cols-1 gap-4">
                {navigationLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-sm font-bold opacity-60 hover:opacity-100 transition-all hover:text-primary italic flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform shrink-0" />
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
            </div>
          </div>

          {/* Testimonios Reinstalados */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                quote={testimonial.quote}
                author={testimonial.author}
                role={testimonial.role}
                avatar={testimonial.avatar}
              />
            ))}
          </motion.div>

          {/* Mapa Reinstalado */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3
              className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-6 italic"
            >
              {t("footer.findMe")}
            </h3>
            <div
              className="w-full h-64 rounded-[32px] overflow-hidden shadow-2xl border transition-all duration-300"
              style={{
                borderColor: `color-mix(in srgb, var(--accent-color) 20%, transparent)`,
              }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d497699.9973439676!2d-74.34209705000001!3d4.6097102!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9bfd2da6cb29%3A0x239d635520a33914!2sBogot%C3%A1%2C%20Bogota%2C%20Colombia!5e0!3m2!1sen!2s!4v1703123456789!5m2!1sen!2s"
                allowFullScreen
                loading="lazy"
                className="w-full h-full border-none grayscale contrast-125 opacity-70 hover:opacity-100 transition-opacity duration-500"
                title={t("footer.mapTitle")}
              />
            </div>
          </motion.div>

          {/* Footer del Container */}
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4 text-xs font-bold opacity-50 italic">
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
          
          <div className="flex flex-wrap justify-center md:justify-end gap-3 sm:gap-6">
            <Link href="/privacidad" className="px-3 py-1 rounded-full border border-white/10 hover:border-primary/50 hover:text-primary transition-all bg-white/5">
              PRIVACY
            </Link>
            <Link href="/faq" className="px-3 py-1 rounded-full border border-white/10 hover:border-primary/50 hover:text-primary transition-all bg-white/5">
              FAQ
            </Link>
            <Link href="/status" className="px-3 py-1 rounded-full border border-white/10 hover:border-primary/50 hover:text-primary transition-all bg-white/5">
              STATUS
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
