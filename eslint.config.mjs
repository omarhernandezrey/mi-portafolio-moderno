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
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    /**
     * DEUDA CONOCIDA, NO SILENCIADA.
     *
     * `eslint-config-next` 16 activa como ERROR las reglas del compilador de
     * React. Sobre este código, que no cambió, aparecen 81 hallazgos en 45
     * archivos:
     *
     *   41  react-hooks/set-state-in-effect
     *   21  react-hooks/static-components
     *   10  react-hooks/purity
     *    5  react-hooks/immutability
     *    4  react-hooks/refs
     *
     * Son señales legítimas —patrones que React ya desaconseja—, pero
     * arreglarlas es un refactor de 45 archivos con riesgo real de cambiar
     * comportamiento, y no tiene nada que ver con el motivo de esta subida
     * (cerrar la vulnerabilidad `high` de postcss).
     *
     * Se bajan a `warn`, NO a `off`: siguen saliendo en cada `npm run lint`
     * y en el `verify`, así que la deuda es visible y medible. Lo que se
     * evita es que una subida de dependencia arrastre consigo un refactor
     * de hooks sin revisar.
     *
     * Para abordarlas: `npx eslint . --format stylish` y empezar por
     * `set-state-in-effect`, que es la mayoría y la de arreglo más
     * mecánico.
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
