"use client";

import React, { useState, useEffect } from "react";
import NavbarDesktop from "./NavbarDesktop";
import NavbarMobile from "./NavbarMobile";

const NavbarLogic = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 1024); // Cambia a mobile/tablet si es menor o igual a 1024px

      // Cierra el menú si cambia a desktop
      if (width > 1024 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    handleResize(); // Detecta el tamaño inicial
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen]);

  return (
    <>
      {isMobile ? (
        <NavbarMobile isOpen={isMenuOpen} toggleMenu={toggleMenu} />
      ) : (
        <NavbarDesktop />
      )}
    </>
  );
};

export default NavbarLogic;
