'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useReducedMotionSafe } from '@/hooks/useReducedMotionSafe';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}

export default function ScrollReveal({ children, delay = 0, y = 24, className }: ScrollRevealProps) {
  // Siempre el mismo elemento (motion.div) en servidor y cliente — solo
  // cambian los valores de animación según reduced-motion, nunca el tipo de
  // nodo ni los hijos, así no hay riesgo de mismatch de hidratación.
  const shouldReduceMotion = useReducedMotionSafe();

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
