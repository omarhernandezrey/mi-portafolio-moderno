"use client";

import { useState, useEffect } from "react";
import { MdColorLens } from "react-icons/md";

// Las diez paletas, en el mismo orden que antes: la primera es la
// predeterminada y no lleva clase. Vive a nivel de módulo porque es constante
// (antes se reconstruía el array en cada llamada) y porque `applyPalette` no
// depende de nada del componente.
const CLASES_DE_PALETA = [
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

// Fuera del componente, y declarada ANTES del efecto que la usa. Estaba
// definida como `const` después del `useEffect` que la llamaba: funcionaba
// solo porque el cuerpo del efecto corre tras el render (cuando la variable
// ya está inicializada), pero era un uso antes de la declaración —
// exactamente lo que marcaba `react-hooks/immutability`— y se rompía al
// mover una línea.
function applyPalette(index: number) {
  const root = document.documentElement;

  // Eliminar todas las clases de paleta previamente aplicadas
  CLASES_DE_PALETA.forEach((palette) => {
    if (palette) root.classList.remove(palette);
  });

  // Aplicar la nueva paleta si no es la predeterminada
  if (CLASES_DE_PALETA[index]) {
    root.classList.add(CLASES_DE_PALETA[index]);
  }
}

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

  const togglePalette = () => {
    // Ata el ciclo a la lista real en vez de a un 10 literal, para que no se
    // desincronicen si algún día cambia el número de paletas.
    const nextIndex = (paletteIndex + 1) % CLASES_DE_PALETA.length;
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
