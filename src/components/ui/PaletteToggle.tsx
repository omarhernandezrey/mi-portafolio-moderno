"use client";

import { useState, useEffect } from "react";
import { MdColorLens } from "react-icons/md";

export default function PaletteToggle() {
  const [paletteIndex, setPaletteIndex] = useState(0);

  useEffect(() => {
    // Cargar paleta guardada al montar el componente
    const storedPalette = localStorage.getItem("paletteIndex");
    if (storedPalette) {
      const index = parseInt(storedPalette, 10);
      setPaletteIndex(index);
      applyPalette(index);
    }
  }, []);

  const applyPalette = (index: number) => {
    const root = document.documentElement;
    const palettes = [
      "",
      "palette2",
      "palette3",
      "palette4",
      "palette5",
      "palette6",
      "palette7",
      "palette8",
      "palette9",
      "palette10",
    ];

    // Eliminar todas las clases de paleta previamente aplicadas
    palettes.forEach((palette) => {
      if (palette) root.classList.remove(palette);
    });

    // Aplicar la nueva paleta si no es la predeterminada
    if (palettes[index]) {
      root.classList.add(palettes[index]);
    }
  };

  const togglePalette = () => {
    const nextIndex = (paletteIndex + 1) % 10; // 10 paletas disponibles
    setPaletteIndex(nextIndex);
    applyPalette(nextIndex);
    localStorage.setItem("paletteIndex", nextIndex.toString());
  };

  return (
    <button
      onClick={togglePalette}
      className="fixed top-6 right-6 w-14 h-14 flex items-center justify-center rounded-full shadow-xl transition-all duration-300 z-50 group hover:scale-110 lg:block hidden"
      style={{
        background:
          "linear-gradient(135deg, var(--primary-color), var(--accent-color))",
        border: "2px solid var(--accent-color)/30",
      }}
      aria-label="Cambiar Paleta de Colores"
    >
      <MdColorLens
        size={24}
        className="text-white group-hover:rotate-180 transition-transform duration-500"
      />
      <div
        className="absolute inset-0 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300"
        style={{
          background:
            "linear-gradient(135deg, var(--primary-color), var(--accent-color))",
        }}
      />
    </button>
  );
}
