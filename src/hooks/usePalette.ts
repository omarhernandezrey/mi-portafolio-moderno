import { useCallback, useEffect, useState } from "react";

const PALETTE_COUNT = 10;
const PALETTE_KEY = "paletteIndex";

export function usePalette() {
  const [paletteIndex, setPaletteIndex] = useState(0);

  // Aplicar la paleta al cambiar
  const applyPalette = useCallback((index: number) => {
    const root = document.documentElement;
    const palettes = Array.from({ length: PALETTE_COUNT }, (_, i) => i === 0 ? "" : `palette${i+1}`);
    palettes.forEach((palette) => {
      if (palette) root.classList.remove(palette);
    });
    if (paletteIndex > 0) {
      root.classList.add(`palette${paletteIndex+1}`);
    }
  }, [paletteIndex]);

  // Cargar paleta guardada en localStorage
  useEffect(() => {
    const stored = localStorage.getItem(PALETTE_KEY);
    if (stored) {
      setPaletteIndex(parseInt(stored, 10));
      applyPalette(parseInt(stored, 10));
    } else {
      applyPalette(0);
    }
  }, [applyPalette]);

  // Cambiar paleta
  const togglePalette = useCallback(() => {
    const nextIndex = (paletteIndex + 1) % PALETTE_COUNT;
    setPaletteIndex(nextIndex);
    localStorage.setItem(PALETTE_KEY, nextIndex.toString());
    applyPalette(nextIndex);
  }, [paletteIndex, applyPalette]);

  return { paletteIndex, setPaletteIndex, togglePalette };
} 