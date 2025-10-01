"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  FaHome,
  FaUserAlt,
  FaGraduationCap,
  FaCode,
  FaEnvelope,
  FaProjectDiagram,
  FaToolbox,
} from "react-icons/fa";
import { MdColorLens } from "react-icons/md";
import { usePalette } from "../../hooks/usePalette";
import { useTranslation } from "../../hooks/useTranslation";
import LanguageSelector from "./LanguageSelector";

const NavbarDesktop = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("#hero");
  const { togglePalette } = usePalette();
  const { t } = useTranslation();

  // Effect para manejar el scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Effect para detectar sección activa
  useEffect(() => {
    const sections = [
      "#hero",
      "#about",
      "#education",
      "#skills",
      "#services",
      "#projects",
      "#contact",
    ];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.querySelector(sections[i]);
        if (
          section &&
          section.getBoundingClientRect().top + window.scrollY <= scrollPosition
        ) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const navLinks = [
    { id: "#hero", label: t("navigation.home"), icon: <FaHome /> },
    { id: "#about", label: t("navigation.about"), icon: <FaUserAlt /> },
    { id: "#education", label: t("navigation.education"), icon: <FaGraduationCap /> },
    { id: "#skills", label: t("navigation.skills"), icon: <FaToolbox /> },
    { id: "#services", label: t("navigation.services"), icon: <FaCode /> },
    { id: "#projects", label: t("navigation.projects"), icon: <FaProjectDiagram /> },
    { id: "#contact", label: t("navigation.contact"), icon: <FaEnvelope /> },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 relative transition-all duration-500 ease-in-out ${
        scrolled
          ? "bg-[var(--background-color)]/95 backdrop-blur-xl shadow-2xl border-b border-[var(--accent-color)]/20"
          : "bg-[var(--background-color)]/80 backdrop-blur-md"
      }`}
    >
      <div className="w-full px-2 sm:px-4">
        <div className="flex flex-wrap items-center justify-between min-h-16 lg:min-h-20 py-2">
          {/* Logo Section */}
          <div
            className="flex items-center cursor-pointer group flex-shrink-0"
            onClick={() => handleLinkClick("#hero")}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <Image
                src="/images/logo7.png"
                alt="Logo"
                width={44}
                height={44}
                className="relative h-9 w-9 lg:h-11 lg:w-11 xl:h-12 xl:w-12 object-contain rounded-full border-2 border-[var(--primary-color)]/30 group-hover:border-[var(--accent-color)] transition-all duration-300 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center justify-center flex-1 mx-2 min-w-0 max-w-full">
            <div className="flex flex-wrap items-center gap-x-2 md:gap-x-2.5 lg:gap-x-3 xl:gap-x-3 gap-y-2 pr-2">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  className={`relative flex items-center px-2 lg:px-3 xl:px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    activeSection === link.id
                      ? "text-[var(--accent-color)] bg-[var(--primary-color)]/10"
                      : "text-[var(--text-color)] hover:text-[var(--primary-color)] hover:bg-[var(--secondary-background-color)]"
                  }`}
                >
                  <span className="text-xs md:text-sm xl:tracking-wider">
                    {link.label}
                  </span>
                  {activeSection === link.id && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-1 lg:gap-2 shrink min-w-0">
            {/* Language Selector */}
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>
            
            {/* Palette Toggle Button */}
            <button
              onClick={togglePalette}
              className="relative flex items-center justify-center w-8 h-8 lg:w-9 lg:h-9 text-[var(--primary-color)] hover:text-[var(--accent-color)] hover:scale-110 transition-all duration-300"
              aria-label="Toggle Color Palette"
            >
              <MdColorLens size={16} className="lg:w-5 lg:h-5" />
            </button>
            
            {/* Mobile Language Selector */}
            <div className="sm:hidden">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </div>

      {/* Glass morphism effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-color)]/5 to-[var(--accent-color)]/5 pointer-events-none"></div>
    </nav>
  );
};

export default NavbarDesktop;
