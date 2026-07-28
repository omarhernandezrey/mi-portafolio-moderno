"use client";

import { useEffect } from "react";

/**
 * El root layout fija <html lang="es"> para todo el sitio.
 * Páginas con contenido íntegramente en otro idioma (ej. /privacy)
 * corrigen aquí el atributo lang para lectores de pantalla y crawlers.
 */
export default function SetHtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = previous;
    };
  }, [lang]);

  return null;
}
