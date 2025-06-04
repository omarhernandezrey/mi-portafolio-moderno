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
  FaToolbox 
} from "react-icons/fa";
import { MdColorLens } from "react-icons/md";
import { usePalette } from "../../hooks/usePalette";

const NavbarDesktop = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("#hero");
  const { togglePalette } = usePalette();

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
        if (section && section.getBoundingClientRect().top + window.scrollY <= scrollPosition) {
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
    { id: "#hero", label: "Home", icon: <FaHome /> },
    { id: "#about", label: "About Me", icon: <FaUserAlt /> },
    { id: "#education", label: "Education", icon: <FaGraduationCap /> },
    { id: "#skills", label: "Skills", icon: <FaToolbox /> },
    { id: "#services", label: "Services", icon: <FaCode /> },
    { id: "#projects", label: "Projects", icon: <FaProjectDiagram /> },
    { id: "#contact", label: "Contact", icon: <FaEnvelope /> },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
        scrolled 
          ? "bg-[var(--background-color)]/95 backdrop-blur-xl shadow-2xl border-b border-[var(--accent-color)]/20" 
          : "bg-[var(--background-color)]/80 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 xl:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div 
            className="flex items-center cursor-pointer group"
            onClick={() => handleLinkClick("#hero")}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <Image
                src="/images/logo7.png"
                alt="Logo"
                width={56}
                height={56}
                className="relative h-14 w-14 object-contain rounded-full border-2 border-[var(--primary-color)]/30 group-hover:border-[var(--accent-color)] transition-all duration-300 group-hover:scale-105"
              />
            </div>
            <div className="ml-4">
              <div className="text-lg font-bold text-[var(--primary-color)] group-hover:text-[var(--accent-color)] transition-colors duration-300">
                Omar Hernández Rey
              </div>
              <div className="text-sm text-[var(--text-color)]/70 font-medium">
                Full Stack Developer
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  activeSection === link.id
                    ? "text-[var(--accent-color)] bg-[var(--primary-color)]/10"
                    : "text-[var(--text-color)] hover:text-[var(--primary-color)] hover:bg-[var(--secondary-background-color)]"
                }`}
              >
                <span className="text-base">{link.icon}</span>
                <span className="hidden xl:inline uppercase tracking-wider">{link.label}</span>
                {activeSection === link.id && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          {/* Palette Toggle Button */}
          <button
            onClick={togglePalette}
            className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
            aria-label="Toggle Color Palette"
          >
            <MdColorLens size={20} />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] rounded-full blur opacity-50"></div>
          </button>
        </div>
      </div>

      {/* Glass morphism effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary-color)]/5 to-[var(--accent-color)]/5 pointer-events-none"></div>
    </nav>
  );
};

export default NavbarDesktop;