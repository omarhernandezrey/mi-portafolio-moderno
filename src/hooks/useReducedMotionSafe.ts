'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Como framer-motion's useReducedMotion() lee matchMedia de forma síncrona
 * en el primer render (incluso en cliente, antes del primer paint), su valor
 * inicial difiere del SSR (que siempre asume "sin preferencia") para
 * cualquier usuario con prefers-reduced-motion activado — eso rompe la
 * hidratación si ese valor se usa para renderizar un elemento distinto o
 * contenido distinto. Este hook arranca en `false` en el servidor (igual que
 * el SSR) y solo refleja la preferencia real en el cliente, así el primer
 * render del cliente coincide con el del servidor.
 *
 * Implementado con `useSyncExternalStore` y no con `useState` + `useEffect`:
 * matchMedia ES un store externo, y esta es la API que React ofrece
 * exactamente para eso. Antes el efecto hacía `setReduced(mq.matches)` al
 * montar, lo que provocaba un render extra en cascada (y era lo que marcaba
 * `react-hooks/set-state-in-effect`). Ahora React lee el valor directamente
 * de la fuente, sin estado intermedio ni render de más.
 *
 * `getServerSnapshot` devuelve `false`: es lo que hace que la hidratación
 * siga coincidiendo, que es el motivo original de que este hook exista.
 */
const CONSULTA = '(prefers-reduced-motion: reduce)';

function leerEnCliente(): boolean {
  return window.matchMedia(CONSULTA).matches;
}

function leerEnServidor(): boolean {
  return false;
}

export function useReducedMotionSafe(): boolean {
  // La función va inline dentro del `useCallback` (la regla de hooks lo
  // exige para poder analizar sus dependencias), y el `useCallback` existe
  // porque `useSyncExternalStore` vuelve a suscribirse cada vez que cambia
  // la referencia de `subscribe`.
  const subscribe = useCallback((alCambiar: () => void) => {
    const mq = window.matchMedia(CONSULTA);
    mq.addEventListener('change', alCambiar);
    return () => mq.removeEventListener('change', alCambiar);
  }, []);

  return useSyncExternalStore(subscribe, leerEnCliente, leerEnServidor);
}
