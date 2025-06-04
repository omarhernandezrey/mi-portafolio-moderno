// hooks/useWindowSize.ts
import { useState, useEffect } from "react";

interface WindowSize {
  width: number;
  height: number;
}

export const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // Función para actualizar el tamaño
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Agregar el evento
    window.addEventListener("resize", handleResize);

    // Llamar a la función para obtener el tamaño inicial
    handleResize();

    // Limpiar el evento al desmontar
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};
