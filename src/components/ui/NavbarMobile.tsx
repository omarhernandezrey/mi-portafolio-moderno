"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AiOutlineHome,
  AiOutlineUser,
  AiOutlineBook,
  AiOutlineProject,
  AiOutlineMail,
  AiOutlineClose,
  AiOutlineMenu,
  AiFillGithub,
  AiFillLinkedin,
} from "react-icons/ai";
import { MdColorLens } from "react-icons/md"; // Icono de paleta
import { BiBrain } from "react-icons/bi";
import { FaTools } from "react-icons/fa";
import { usePalette } from "../../hooks/usePalette";
import { useTranslation } from "../../hooks/useTranslation";
import LanguageSelector from "./LanguageSelector";

interface NavbarMobileProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

const NavbarMobile: React.FC<NavbarMobileProps> = ({ isOpen, toggleMenu }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<string>("#hero");
  const { togglePalette } = usePalette();
  const { t } = useTranslation();
  const firstLinkRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        toggleMenu();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      // Prevenir scroll del body cuando el menú está abierto
      document.body.style.overflow = "hidden";
      // Foco inicial en el primer enlace del menú
      const toFocus = firstLinkRef.current ?? (document.querySelector('.menu-link') as HTMLButtonElement | null);
      if (toFocus) {
        setTimeout(() => toFocus.focus(), 0);
      }
    } else {
      // Restaurar scroll del body cuando el menú se cierra
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, toggleMenu]);

  const handleLinkClick = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      toggleMenu();
    }
  };

  // Cerrar con tecla Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        toggleMenu();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, toggleMenu]);

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
      const scrollPosition = window.scrollY + window.innerHeight / 2;
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

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="relative">
      {/* Navbar */}
  <nav className="flex justify-between items-center px-6 py-4 bg-[var(--background-color)] text-[var(--text-color)] border-b border-[var(--accent-color)] fixed top-0 left-0 w-full z-[90] shadow-md">
        <button
          onClick={toggleMenu}
          className="text-[var(--primary-color)] text-3xl focus:outline-none hover:text-[var(--primary-hover-color)] transition-colors duration-300"
          aria-label="Toggle menu"
          aria-controls="mobile-menu-panel"
          aria-expanded={isOpen}
        >
          {isOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
        </button>
        <button
          onClick={() => handleLinkClick("#hero")}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 focus:outline-none border-2 rounded-full border-[var(--primary-color)] p-1"
          aria-label="Go to Home"
        >
          <Image
            src="/images/logo7.png"
            alt="Logo"
            width={35}
            height={35}
            className="object-contain rounded-full"
          />
        </button>
      </nav>

      {/* Menú desplegable */}
      <div
        ref={menuRef}
        className={`fixed top-0 left-0 bg-[var(--secondary-background-color)] text-[var(--text-color)] z-[100] transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-500 ease-in-out w-4/5 max-w-sm overflow-y-hidden mobile-menu-panel h-screen-dvh pt-safe pb-safe`}
        style={{
          overscrollBehavior: 'contain',
        }}
        id="mobile-menu-panel"
        role="dialog"
        aria-modal="true"
        aria-label={t("navigation.menu", { defaultValue: "Menú" })}
      >
        <div className="flex flex-col min-h-full">
          {/* Selector de idioma + botón Cerrar (sticky) */}
          <div className="px-4 py-3 border-b border-[var(--accent-color)]/20 sticky top-0 bg-[var(--secondary-background-color)]/95 backdrop-blur z-50">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2 flex-1">
                <span className="text-sm text-[var(--text-color)]/70 font-medium">
                  {t("navigation.language")}:
                </span>
                <div className="relative z-50">
                  <LanguageSelector isMobile={true} />
                </div>
              </div>
              <button
                onClick={toggleMenu}
                className="flex items-center gap-2 text-[var(--primary-color)] hover:text-[var(--accent-hover-color)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)] rounded-lg px-2 py-1"
                aria-label={`${t("actions.close", { defaultValue: "Cerrar" })} menú`}
              >
                <AiOutlineClose size={22} />
                <span className="text-sm hidden xs:inline">{t("actions.close", { defaultValue: "Cerrar" })}</span>
              </button>
            </div>
          </div>

          {/* Enlaces de navegación */}
          <div className="flex-1 px-4 py-6">
            <ul className="flex flex-col space-y-4 menu-links">
              {[
                { id: "#hero", label: t("navigation.home"), icon: <AiOutlineHome size={20} /> },
                { id: "#about", label: t("navigation.about"), icon: <AiOutlineUser size={20} /> },
                { id: "#education", label: t("navigation.education"), icon: <AiOutlineBook size={20} /> },
                { id: "#skills", label: t("navigation.skills"), icon: <BiBrain size={20} /> },
                { id: "#services", label: t("navigation.services"), icon: <FaTools size={20} /> },
                { id: "#projects", label: t("navigation.projects"), icon: <AiOutlineProject size={20} /> },
                { id: "#contact", label: t("navigation.contact"), icon: <AiOutlineMail size={20} /> },
              ].map((link) => (
                <li key={link.id} className="w-full">
                  <button
                    onClick={() => handleLinkClick(link.id)}
                    className={`flex items-center gap-3 w-full px-3 py-3 text-[var(--primary-color)] hover:text-[var(--accent-hover-color)] hover:bg-[var(--background-color)] rounded-lg transition-all duration-300 menu-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)] ${
                      activeSection === link.id
                        ? "bg-[var(--background-color)] text-[var(--accent-color)] font-semibold border-l-2 border-[var(--accent-color)]"
                        : ""
                    }`}
                    aria-current={activeSection === link.id ? "page" : undefined}
                    ref={link.id === "#hero" ? firstLinkRef : undefined}
                    tabIndex={0}
                    aria-label={`${t("navigation.go_to", { defaultValue: "Ir a" })} ${link.label}`}
                  >
                    {link.icon}
                    <span className="text-sm font-medium">{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Sección Tema / Paleta de colores (debajo de los links) */}
          <div className="flex-shrink-0 px-4 py-4 border-t border-[var(--accent-color)]/20">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-[var(--text-color)]/70 font-medium">
                  {t("theme.change", { defaultValue: "Cambiar tema" })}
                </span>
              </div>
              <button
                onClick={togglePalette}
                className="text-[var(--primary-color)] transition-transform duration-300 hover:scale-110 active:scale-95 hover:text-[var(--accent-hover-color)] focus:outline-none p-2 rounded-lg hover:bg-[var(--background-color)] animate-pulse"
                aria-label={t("actions.change_theme", { defaultValue: "Cambiar tema" })}
                title={t("actions.change_theme", { defaultValue: "Cambiar tema" })}
              >
                <MdColorLens size={28} />
              </button>
            </div>
          </div>

          {/* Iconos sociales */}
          <div className="flex-shrink-0 mt-auto">
            <div className="border-t border-[var(--accent-color)] px-4 py-4">
              <div className="flex items-center justify-center gap-8 social-icons">
                <a
                  href="https://github.com/omarhernandezrey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--primary-color)] transition-transform duration-300 hover:text-[var(--accent-hover-color)] hover:scale-110"
                  aria-label="GitHub"
                >
                  <AiFillGithub size={32} />
                </a>
                <a
                  href="https://www.linkedin.com/in/omarhernandezrey/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--primary-color)] transition-transform duration-300 hover:text-[var(--accent-hover-color)] hover:scale-110"
                  aria-label="LinkedIn"
                >
                  <AiFillLinkedin size={32} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fondo nublado */}
      {isOpen && (
        <div onClick={toggleMenu} aria-hidden="true" className="fixed top-0 left-0 w-screen h-screen bg-black opacity-50 z-[95]"></div>
      )}
    </div>
  );
};

export default NavbarMobile;
