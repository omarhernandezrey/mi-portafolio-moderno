"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import NavbarDesktop from "./NavbarDesktop";
import NavbarMobile from "./NavbarMobile";

const NavbarLogic = () => {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  useEffect(() => {
    setMounted(true);

    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 1024);
      if (width > 1024) setIsMenuOpen(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // No renderizar el navbar principal en el panel de administración
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // Renderizar ambos navbars hasta que se monte, CSS controlará cuál se ve
  if (!mounted) {
    return (
      <>
        <div className="lg:hidden">
          <NavbarMobile isOpen={isMenuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />
        </div>
        <div className="hidden lg:block">
          <NavbarDesktop />
        </div>
      </>
    );
  }

  return (
    <>
      {isMobile ? (
        <NavbarMobile isOpen={isMenuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />
      ) : (
        <NavbarDesktop />
      )}
    </>
  );
};

export default NavbarLogic;
