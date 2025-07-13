"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaEnvelope,
  FaWhatsapp,
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
    { href: "#contact", label: t("footer.navigation.contact") },
  ];

  return (
    <footer
      className="relative py-20 overflow-hidden"
      style={{
        background: `linear-gradient(to bottom, var(--background-color), var(--secondary-background-color))`,
        color: "var(--text-color)",
      }}
    >
      {/* Wave superior */}
      <div className="absolute top-0 left-0 w-full rotate-180 overflow-hidden leading-[0] z-0">
        <Image
          src="/images/wave-top.svg"
          alt="Decorative wave"
          width={1920}
          height={200}
          className="w-full h-auto"
          priority
        />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 container mx-auto px-6 lg:px-20">
        {/* Información principal */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-12 lg:space-y-0 mb-16">
          {/* Información personal */}
          <motion.div
            className="flex flex-col items-center lg:items-start"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2
              className="text-3xl font-bold mb-4"
              style={{
                background: `linear-gradient(to right, var(--primary-color), var(--accent-color))`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {t("footer.name")}
            </h2>
            <p
              className="text-center lg:text-left max-w-xs leading-relaxed"
              style={{ color: "var(--muted-color)" }}
            >
              {t("footer.description")}
            </p>
          </motion.div>

          {/* Navegación */}
          <motion.div
            className="flex flex-col items-center lg:items-start"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--accent-color)" }}
            >
              {t("footer.navigationTitle")}
            </h3>
            <ul className="space-y-2">
              {navigationLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="transition-all duration-300 hover:translate-x-2"
                    style={{ color: "var(--text-color)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--accent-color)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--text-color)";
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Redes sociales */}
          <motion.div
            className="flex flex-col items-center lg:items-start"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--accent-color)" }}
            >
              {t("footer.followTitle")}
            </h3>
            <div className="flex space-x-6">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-all duration-300"
                  style={{ color: "var(--muted-color)" }}
                  aria-label={social.label}
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--accent-color)";
                    e.currentTarget.style.filter = `drop-shadow(0 0 8px var(--accent-color))`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--muted-color)";
                    e.currentTarget.style.filter = "none";
                  }}
                >
                  <social.icon size={24} />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Newsletter */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <NewsletterForm />
        </motion.div>

        {/* Testimonios */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
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

        {/* Mapa */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <h3
            className="text-xl font-semibold mb-6"
            style={{ color: "var(--accent-color)" }}
          >
            {t("footer.findMe")}
          </h3>
          <div
            className="w-full h-64 rounded-xl overflow-hidden shadow-lg border transition-all duration-300 hover:shadow-2xl"
            style={{
              borderColor: `color-mix(in srgb, var(--accent-color) 30%, transparent)`,
              boxShadow: `0 10px 30px color-mix(in srgb, var(--accent-color) 20%, transparent)`,
            }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d497699.9973439676!2d-74.34209705000001!3d4.6097102!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9bfd2da6cb29%3A0x239d635520a33914!2sBogot%C3%A1%2C%20Bogota%2C%20Colombia!5e0!3m2!1sen!2s!4v1703123456789!5m2!1sen!2s"
              allowFullScreen
              loading="lazy"
              className="w-full h-full border-none"
              title={t("footer.mapTitle")}
            />
          </div>
        </motion.div>

        {/* Separador */}
        <div
          className="h-px mb-8"
          style={{
            backgroundColor: `color-mix(in srgb, var(--muted-color) 30%, transparent)`,
          }}
        />

        {/* Copyright y botón scroll */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <p
            className="text-center md:text-left"
            style={{ color: "var(--muted-color)" }}
          >
            © {new Date().getFullYear()} {t("footer.name")}. {t("footer.rights")}
          </p>

          <motion.button
            onClick={scrollToTop}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300"
            style={{
              color: isScrollButtonHovered
                ? "var(--white-color)"
                : "var(--muted-color)",
              backgroundColor: isScrollButtonHovered
                ? "var(--accent-color)"
                : "transparent",
              border: `1px solid ${isScrollButtonHovered ? "var(--accent-color)" : "var(--muted-color)"}`,
            }}
            aria-label={t("footer.backToTopAria")}
            onMouseEnter={() => setIsScrollButtonHovered(true)}
            onMouseLeave={() => setIsScrollButtonHovered(false)}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ y: isScrollButtonHovered ? [-2, 2, -2] : 0 }}
              transition={{
                duration: 1,
                repeat: isScrollButtonHovered ? Infinity : 0,
              }}
            >
              <FiArrowUp size={20} />
            </motion.div>
            <span className="font-medium">{t("footer.backToTop")}</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Botón flotante de WhatsApp */}
      <motion.a
        href={`https://wa.me/573219052878?text=${encodeURIComponent(t("footer.whatsappMessage"))}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-6 p-4 rounded-full shadow-lg transition-all duration-300 z-50"
        style={{ backgroundColor: "#25D366" }}
        aria-label={t("footer.whatsappAria")}
        initial={{ opacity: 0, scale: 0.5, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        whileHover={{
          scale: 1.1,
          y: -5,
          backgroundColor: "#20B357",
          boxShadow: "0 10px 30px rgba(37, 211, 102, 0.4)",
        }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 2 }}
        >
          <FaWhatsapp size={24} color="white" />
        </motion.div>
      </motion.a>

      {/* Wave inferior decorativo */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-0">
        <svg
          width="100%"
          height="150"
          viewBox="0 0 1440 150"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="block"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                stopColor="var(--background-color)"
                stopOpacity="1"
              />
              <stop
                offset="100%"
                stopColor="var(--secondary-background-color)"
                stopOpacity="0.8"
              />
            </linearGradient>
          </defs>
          <path
            fill="url(#waveGradient)"
            d="M0,80 C240,120 480,40 720,80 C960,120 1200,40 1440,80 V150 H0 Z"
          />
        </svg>
      </div>
    </footer>
  );
}
