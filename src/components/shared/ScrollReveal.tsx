'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  // Contenido above-the-fold (hero): ya está en el viewport en la carga
  // inicial. En vez de whileInView (IntersectionObserver) o animate() de
  // Framer Motion, usa una animación CSS pura (clase .hero-reveal, definida
  // en globals.css) — arranca en cuanto el navegador pinta el elemento, sin
  // depender de que React hidrate ni de que Framer Motion dispare su
  // animación. Se probó que bajo carga inicial pesada (Three.js + GSAP +
  // Lenis montando a la vez) tanto whileInView como animate() de Framer
  // Motion pueden quedarse sin ejecutar nunca en algunas páginas, dejando el
  // hero con opacidad 0 indefinidamente — CSS puro no tiene ese riesgo.
  immediate?: boolean;
}

export default function ScrollReveal({ children, delay = 0, y = 24, className, immediate = false }: ScrollRevealProps) {
  // Siempre el mismo elemento en servidor y cliente — solo cambian valores,
  // nunca el tipo de nodo ni los hijos, así no hay riesgo de mismatch.
  const shouldReduceMotion = useReducedMotionSafe();

  if (immediate) {
    return (
      <div
        className={`hero-reveal ${className ?? ''}`}
        style={{ '--reveal-y': `${y}px`, '--reveal-delay': `${delay}s` } as React.CSSProperties}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.6,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
