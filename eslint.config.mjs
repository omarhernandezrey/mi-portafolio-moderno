import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * Next 16 eliminó `next lint`, así que `npm run lint` pasa a ser el CLI de
 * ESLint (`eslint .`).
 *
 * De paso desaparece el envoltorio `FlatCompat`: existía para traducir la
 * configuración antigua (`.eslintrc`) al formato plano de ESLint 9. Desde
 * `eslint-config-next` 16 los presets YA son flat config nativo, y pasarlos
 * por el compat rompía con "Converting circular structure to JSON".
 *
 * `ignores` sustituye a lo que `next lint` excluía por su cuenta: el CLI
 * desnudo recorrería `.next/`, `node_modules/` y los artefactos de
 * cobertura, que no son código del proyecto.
 */
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "coverage/**",
      "node_modules/**",
      "next-env.d.ts",
      // Skills de terceros instaladas con `npx skills add` (Fase -1 de
      // portfolio-engineering-team). Traen 97 archivos JS/TS propios, y sin
      // esta exclusión `eslint .` falla ANTES de linear nada con «could not
      // find plugin react-hooks»: el bloque de reglas de abajo no lleva
      // `files`, así que se aplica a todo archivo que eslint considere, y en
      // los de terceros no está el preset de Next que aporta ese plugin.
      // Es la misma razón por la que se ignora `node_modules`: son
      // herramientas, no código del proyecto.
      ".agents/**",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    /**
     * DEUDA CONOCIDA, NO SILENCIADA.
     *
     * `eslint-config-next` 16 activa como ERROR las reglas del compilador de
     * React. Al subir a Next 16 aparecieron 81 hallazgos en 45 archivos que
     * la subida no tocó. Se bajaron a `warn` para no mezclar la subida con un
     * refactor de hooks, y después se trabajaron en lotes revisando caso por
     * caso si la regla señalaba un defecto real.
     *
     *                            al subir    hoy
     *   set-state-in-effect         41        24
     *   static-components           21         0
     *   purity                      10         2
     *   immutability                 5         4
     *   refs                         4         0
     *                            ───────   ─────
     *                               81        30
     *
     * Lo que se arregló eran defectos verdaderos: componentes redefinidos en
     * cada render, un ref de portal leído durante el render, una función
     * usada antes de declararse, `Date.now()` en cada repintado, búferes de
     * WebGL sembrados en un `useMemo` descartable y un store externo
     * (matchMedia) atendido con estado en vez de `useSyncExternalStore`, y los
     * nueve `*FormDialog` de portfolio, que sincronizaban props -> estado en
     * un efecto y ahora remontan con `key` (ver `claveDeFormulario`), y el
     * estado derivado de cuatro secciones públicas: la paginación de
     * ProjectsSection, la ventana de «cargar más» de BlogArchive y de
     * EducationSection, la diapositiva de FeaturedCertificates y un efecto de
     * SkillSection que era código muerto demostrable, y el núcleo de
     * animación de SkillSection, donde los valores en reposo dejaron de ser
     * estado para derivarse y solo la animación transitoria del hover sigue
     * en estado, viajando junto a la firma de su lista.
     *
     * Los 30 que quedan están clasificados uno a uno en TRES familias (la
     * cuarta, el estado derivado, se cerró por completo). Las cuentas suman
     * 30 exactas; se midieron, no se estimaron:
     *
     *  A. 11 — carga de datos al montar o al cambiar un filtro: las páginas
     *     del panel (audit, contenido, educacion, logs, proyectos,
     *     reports/time, security, skills, subscribers, timer) y /status, todas
     *     con la forma `useEffect(() => { cargar(); }, [cargar])`. La
     *     alternativa de la regla es Suspense / `use()`: cambio de
     *     arquitectura de la capa de datos del panel, no un arreglo de lint.
     *  B. 13 — valores que SOLO pueden existir en el cliente, leídos tras
     *     hidratar. Banderas de montado (ParticlesComponent, HeroSection,
     *     NavbarLogic, NotyfProvider, PortfolioLinkedInShare,
     *     EducationModal), lecturas de `localStorage` (PaletteToggle,
     *     usePalette, ReactionButton), un parámetro de URL (admin/login),
     *     StatCounter, y los dos `createFloatingElements()` de
     *     ProjectsSection y EducationSection.
     *
     *     Nota: esos dos últimos estaban antes clasificados como estado
     *     derivado, y era un error de clasificación: usan `Math.random`, así
     *     que servidor y cliente generarían valores distintos y moverlos al
     *     inicializador del `useState` rompería la hidratación. El efecto es
     *     la herramienta correcta y queda dicho en el propio código.
     *
     *     Para `localStorage`, `useSyncExternalStore` no ayuda como ayudó con
     *     matchMedia (que tiene evento `change`): no notifica en la misma
     *     pestaña, así que exigiría inventar una capa de notificación.
     *  C. 6 — código imperativo correcto, donde la regla no encaja:
     *     `useFrame` de three.js mutando arrays tipados (ParticleField, 3) —
     *     es el patrón performante y lo que three.js espera—, `Math.random`
     *     en el `useMemo` de ParticlesComponent que SÍ debe recalcular cuando
     *     cargan los logos (2), y `window.location.href` dentro de un
     *     manejador de evento en Footer (1). Estas no se van a arreglar.
     *
     * Siguen en `warn`, NO en `off`: salen en cada `npm run lint` y en el
     * `verify`, así que un hallazgo NUEVO es visible sobre este fondo. Si la
     * cuenta sube por encima de 30, es código nuevo y hay que mirarlo.
     */
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
];

export default eslintConfig;
