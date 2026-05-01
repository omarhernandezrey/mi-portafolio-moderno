"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import NavbarDesktop from "./NavbarDesktop";
import NavbarMobile from "./NavbarMobile";

const NavbarLogic = () => {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  useEffect(() => {
    setMounted(true);
    
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 1024);

      if (width > 1024 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen]);

  // No renderizar el navbar principal en el panel de administración
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // Renderizar ambos navbars hasta que se monte, CSS controlará cuál se ve
  if (!mounted) {
    return (
      <>
        <div className="lg:hidden">
          <NavbarMobile isOpen={isMenuOpen} toggleMenu={toggleMenu} />
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
        <NavbarMobile isOpen={isMenuOpen} toggleMenu={toggleMenu} />
      ) : (
        <NavbarDesktop />
      )}
    </>
  );
};

export default NavbarLogic;
