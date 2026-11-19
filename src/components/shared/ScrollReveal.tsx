'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  x?: number;
  className?: string;
  // Contenido above-the-fold (hero): ya está en el viewport en la carga
  // inicial. Usa la animación CSS pura .hero-reveal (definida en
  // globals.css) — arranca en cuanto el navegador pinta el elemento, sin
  // depender de ningún observer ni de que React hidrate.
  immediate?: boolean;
}

// Respaldo si el IntersectionObserver nunca dispara (error del navegador,
// elemento ya fuera del árbol cuando se conecta, etc.) — garantiza que el
// contenido no se quede invisible para siempre. 1.5s es generoso: ningún
// scroll real tarda tanto en cruzar el margen de activación.
const FALLBACK_MS = 1500;

export default function ScrollReveal({ children, delay = 0, y = 24, x = 0, className, immediate = false }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (immediate) return;
    const el = ref.current;
    if (!el) return;

    const reveal = () => el.classList.add('is-revealed');

    if (typeof IntersectionObserver === 'undefined') {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          reveal();
          observer.disconnect();
          clearTimeout(fallback);
        }
      },
      { threshold: 0, rootMargin: '0px 0px -10% 0px' }
    );
    observer.observe(el);

    const fallback = setTimeout(reveal, FALLBACK_MS);

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, [immediate]);

  const style = { '--reveal-y': `${y}px`, '--reveal-x': `${x}px`, '--reveal-delay': `${delay}s` } as React.CSSProperties;

  if (immediate) {
    return (
      <div className={`hero-reveal ${className ?? ''}`} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={`scroll-reveal ${className ?? ''}`} style={style}>
      {children}
    </div>
  );
}
