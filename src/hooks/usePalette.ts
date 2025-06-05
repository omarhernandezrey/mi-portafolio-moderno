import { useCallback, useEffect, useState } from "react";

const PALETTE_COUNT = 10;
const PALETTE_KEY = "paletteIndex";

export function usePalette() {
  const [paletteIndex, setPaletteIndex] = useState(0);

  // Aplicar la paleta al cambiar
  const applyPalette = useCallback((index: number) => {
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
  }, []);

  // Cargar paleta guardada en localStorage
  useEffect(() => {
    const stored = localStorage.getItem(PALETTE_KEY);
    if (stored) {
      const storedIndex = parseInt(stored, 10);
      setPaletteIndex(storedIndex);
      applyPalette(storedIndex);
    } else {
      applyPalette(0);
    }
  }, [applyPalette]); // applyPalette es estable gracias a useCallback

  // Cambiar paleta
  const togglePalette = useCallback(() => {
    const nextIndex = (paletteIndex + 1) % PALETTE_COUNT;
    setPaletteIndex(nextIndex);
    localStorage.setItem(PALETTE_KEY, nextIndex.toString());
    applyPalette(nextIndex);
  }, [paletteIndex, applyPalette]);

  return { paletteIndex, setPaletteIndex, togglePalette };
}
