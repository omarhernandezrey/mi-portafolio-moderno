'use client';

import { useEffect, useState } from 'react';

/**
 * Como framer-motion's useReducedMotion() lee matchMedia de forma síncrona
 * en el primer render (incluso en cliente, antes del primer paint), su valor
 * inicial difiere del SSR (que siempre asume "sin preferencia") para
 * cualquier usuario con prefers-reduced-motion activado — eso rompe la
 * hidratación si ese valor se usa para renderizar un elemento distinto o
 * contenido distinto. Este hook siempre arranca en `false` (igual que el
 * SSR) y solo actualiza después del montaje, así el primer render del
 * cliente coincide con el del servidor.
 */
export function useReducedMotionSafe(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);

  return reduced;
}
