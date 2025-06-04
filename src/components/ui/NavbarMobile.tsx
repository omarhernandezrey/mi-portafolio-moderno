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

interface NavbarMobileProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

const NavbarMobile: React.FC<NavbarMobileProps> = ({ isOpen, toggleMenu }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<string>("#hero");
  const { paletteIndex, togglePalette } = usePalette();

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        toggleMenu();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, toggleMenu]);

  const handleLinkClick = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      toggleMenu();
    }
  };

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
      <nav className="flex justify-between items-center px-6 py-4 bg-[var(--background-color)] text-[var(--text-color)] border-b border-[var(--accent-color)] fixed top-0 left-0 w-full z-50 shadow-md">
        <button
          onClick={toggleMenu}
          className="text-[var(--primary-color)] text-3xl focus:outline-none hover:text-[var(--primary-hover-color)] transition-colors duration-300"
          aria-label="Toggle menu"
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
        className={`fixed top-0 left-0 h-screen bg-[var(--secondary-background-color)] text-[var(--text-color)] z-40 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-500 ease-in-out w-4/5`}
      >
        <div className="flex flex-col justify-between h-full">
          {/* Enlaces de navegación */}
          <ul className="flex flex-col items-start pl-8 mt-32 space-y-6">
            {[
              { id: "#hero", label: "Home", icon: <AiOutlineHome size={24} /> },
              { id: "#about", label: "About Me", icon: <AiOutlineUser size={24} /> },
              { id: "#education", label: "Education", icon: <AiOutlineBook size={24} /> },
              { id: "#skills", label: "Skills", icon: <BiBrain size={24} /> },
              { id: "#services", label: "Services", icon: <FaTools size={24} /> },
              { id: "#projects", label: "Projects", icon: <AiOutlineProject size={24} /> },
              { id: "#contact", label: "Contact", icon: <AiOutlineMail size={24} /> },
            ].map((link) => (
              <li key={link.id} className="w-full">
                <button
                  onClick={() => handleLinkClick(link.id)}
                  className={`flex items-center gap-4 w-full px-4 py-2 text-[var(--primary-color)] hover:text-[var(--accent-hover-color)] transition-colors duration-300 ${
                    activeSection === link.id ? "underline" : ""
                  }`}
                  aria-current={activeSection === link.id ? "page" : undefined}
                >
                  {link.icon}
                  <span className="text-base">{link.label}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Iconos sociales y botón de paleta de colores */}
          <div className="flex items-center justify-center gap-6 py-6 border-t border-[var(--accent-color)]">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary-color)] transition-transform duration-500 hover:text-[var(--accent-hover-color)] hover:scale-125 hover:rotate-6"
              aria-label="GitHub"
            >
              <AiFillGithub size={36} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary-color)] transition-transform duration-500 hover:text-[var(--accent-hover-color)] hover:scale-125 hover:-rotate-6"
              aria-label="LinkedIn"
            >
              <AiFillLinkedin size={36} />
            </a>
            <button
              onClick={togglePalette}
              className="text-[var(--primary-color)] transition-transform transform hover:scale-125 hover:text-[var(--accent-hover-color)] focus:outline-none"
              aria-label="Toggle Palette"
            >
              <MdColorLens size={36} />
            </button>
          </div>
        </div>
      </div>

      {/* Fondo nublado */}
      {isOpen && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black opacity-50 z-30"></div>
      )}
    </div>
  );
};

export default NavbarMobile;