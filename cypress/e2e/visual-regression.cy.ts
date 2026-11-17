/**
 * Regresión visual (T-23): capturas de referencia de la home —incluido el
 * visor de proyectos, el caso más importante— y del panel, a 375 y 1280px.
 *
 * Sin plugin de diff de imágenes: la ficha pide reutilizar Cypress, que ya
 * está en el repo, no añadir una dependencia nueva. Esto establece las
 * capturas base con `cy.screenshot()` nativo, subidas como artefacto en
 * cada corrida de CI (ver el workflow) — comparar una corrida contra la
 * anterior es una revisión humana de esos PNG, no un fallo automático de
 * test. Es justo lo que pide la ficha ("capturas de referencia"), no un
 * sistema de diff de píxeles.
 *
 * El panel solo se captura hasta donde se puede sin sesión real — la
 * pantalla de login, pública — la misma limitación que ya queda anotada en
 * todo el plan ("revisión 375px solo estática, sin sesión real
 * disponible"). Las pantallas autenticadas del panel no tienen captura
 * automatizada todavía: haría falta una sesión real en el entorno de CI.
 */
const VIEWPORTS = [
  { nombre: 'movil', width: 375, height: 812 },
  { nombre: 'escritorio', width: 1280, height: 800 },
] as const;

/**
 * Muchas secciones públicas usan `whileInView` de Framer Motion
 * (`ScrollReveal.tsx`): empiezan en opacidad 0 y solo se revelan cuando el
 * `IntersectionObserver` las ve entrar. Capturar la página completa
 * desplazándola rápido puede ganarle a ese disparo, dejando franjas vacías
 * en la captura — no es un defecto del sitio, es una carrera contra el
 * `whileInView`. El propio proyecto ya respeta `prefers-reduced-motion`
 * (`useReducedMotionSafe.ts`) para esto mismo; forzarlo aquí reduce la
 * duración de la transición a 0, así que en cuanto el observer dispara, el
 * contenido ya está en su estado final en el siguiente fotograma.
 */
function visitarConMovimientoReducido(ruta: string) {
  cy.visit(ruta, {
    onBeforeLoad(win) {
      const original = win.matchMedia.bind(win);
      win.matchMedia = (query: string) => {
        if (query.includes('prefers-reduced-motion')) {
          return {
            matches: true,
            media: query,
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            addListener: () => {},
            removeListener: () => {},
            dispatchEvent: () => false,
          } as MediaQueryList;
        }
        return original(query);
      };
    },
  });
}

describe('Regresión visual — home (el visor de proyectos es el caso más importante)', () => {
  VIEWPORTS.forEach(({ nombre, width, height }) => {
    // Dos `it()` en vez de un solo test con dos capturas: la home mide
    // ~12000px de alto, y encadenar una captura de página completa con una
    // de un elemento concreto en el mismo test deja el scroll/viewport en
    // un estado que a Cypress le cuesta (visto en la práctica: un
    // `RangeError` al calcular el tamaño del buffer de la 2.ª captura).
    // Cada `it()` parte de una visita limpia, sin ese arrastre.
    it(`home a ${nombre} (${width}×${height}): página completa`, () => {
      cy.viewport(width, height);
      visitarConMovimientoReducido('/');
      cy.clearLocalStorage();
      cy.wait(1000); // deja asentar el montaje pesado de la home (Three.js + GSAP + Lenis) antes de capturar.

      // Hallazgo real, no un defecto de este test: bajo Electron headless,
      // algunas secciones con `whileInView` (p. ej. AboutSection) a veces
      // no llegan a revelarse ni con movimiento reducido ni recorriendo la
      // página antes de capturar — coincide exactamente con lo que ya
      // advierte el comentario de `ScrollReveal.tsx` ("bajo carga inicial
      // pesada... pueden quedarse sin ejecutar nunca"). No es un problema
      // de esta suite: es un límite ya conocido del propio sitio bajo
      // ciertas condiciones, anotado en el plan en vez de perseguido aquí.
      // La captura del visor de proyectos (el caso que la ficha marca como
      // el más importante) no depende de esa animación y sale completa.
      cy.screenshot(`home-${nombre}`, { capture: 'fullPage', overwrite: true });
    });

    it(`home a ${nombre} (${width}×${height}): visor de proyectos`, () => {
      cy.viewport(width, height);
      visitarConMovimientoReducido('/');
      cy.clearLocalStorage();

      cy.get('#projects').scrollIntoView();
      cy.get('#projects').should('be.visible');
      cy.get('#projects').screenshot(`visor-proyectos-${nombre}`, { overwrite: true });
    });
  });
});

describe('Regresión visual — panel (solo lo público, sin sesión real disponible)', () => {
  VIEWPORTS.forEach(({ nombre, width, height }) => {
    it(`/admin/login a ${nombre} (${width}×${height})`, () => {
      cy.viewport(width, height);
      cy.visit('/admin/login');

      // La tarjeta del formulario entra con un fundido de Framer Motion
      // (0.4s): esperar solo `body` capturaba el fotograma a medio
      // desvanecer, vacío en el centro. `.visible` de Cypress no mira la
      // opacidad (un elemento con opacity:0 ya cuenta como visible), así
      // que hace falta esperar la duración real de la animación.
      cy.get('input[type="email"]').should('be.visible');
      cy.wait(500);
      cy.screenshot(`admin-login-${nombre}`, { capture: 'fullPage', overwrite: true });
    });
  });
});
