'use client';

import { useEffect } from 'react';

// "NotFoundError: Failed to execute 'removeChild'/'insertBefore' on 'Node'"
// es una clase de error muy documentada en React 18/19 + Next.js App Router
// (facebook/react#11538, #24865, #14188; vercel/next.js#58055) que ocurre
// cuando algo fuera del control de React toca el DOM que React también
// gestiona — el disparador más común son extensiones del navegador
// (bloqueadores de anuncios, Grammarly, el traductor de Chrome, gestores de
// contraseñas), pero cualquier librería que manipule el DOM de forma
// imperativa junto a React (como el Canvas de Three.js o Lenis que usamos
// en varias páginas) aumenta la probabilidad de pisarse con React durante
// una transición de ruta. React no puede evitarlo de forma general, y
// Next.js trata cualquier error no capturado como fatal (pantalla completa
// de "Application error"), aunque el estado real del DOM/la app sigue
// funcional en la enorme mayoría de estos casos.
//
// Este guard intercepta específicamente esa clase de error a nivel global
// y evita que tumbe toda la página — se queda solo como warning en consola
// para poder seguir monitoreándolo sin romper la experiencia del usuario.
const DOM_MUTATION_ERROR_PATTERN = /(removeChild|insertBefore|appendChild|replaceChild)/i;

function isBenignDomMutationError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const isNotFoundOrHierarchy = error.name === 'NotFoundError' || error.name === 'HierarchyRequestError';
  return isNotFoundOrHierarchy && DOM_MUTATION_ERROR_PATTERN.test(error.message);
}

export default function DomErrorGuard() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (isBenignDomMutationError(event.error)) {
        console.warn('[DomErrorGuard] Suprimido error de mutación DOM conocido (React/extensión del navegador):', event.error);
        event.preventDefault();
        // stopImmediatePropagation además de preventDefault: sin esto, el
        // listener propio de Next.js para detectar excepciones no
        // capturadas en el nivel raíz también recibiría el evento y
        // igual mostraría la pantalla de "Application error".
        event.stopImmediatePropagation();
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      if (isBenignDomMutationError(event.reason)) {
        console.warn('[DomErrorGuard] Suprimido rechazo de promesa por mutación DOM conocida:', event.reason);
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    // capture:true — se ejecuta ANTES que los listeners de Next.js
    // (que se registran después, durante la hidratación), así nuestro
    // stopImmediatePropagation() realmente los bloquea.
    window.addEventListener('error', handleError, { capture: true });
    window.addEventListener('unhandledrejection', handleRejection, { capture: true });
    return () => {
      window.removeEventListener('error', handleError, { capture: true });
      window.removeEventListener('unhandledrejection', handleRejection, { capture: true });
    };
  }, []);

  return null;
}
