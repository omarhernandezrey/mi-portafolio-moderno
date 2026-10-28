import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'as-needed',
  // Sin esto, la cookie NEXT_LOCALE que el propio middleware guarda entra en
  // conflicto con el redirect canónico de páginas con contenido en un solo
  // idioma (blog/[slug], comunidad/[id]): la página redirige a la URL del
  // locale correcto, pero el middleware vuelve a redirigir según la cookie,
  // generando un bucle infinito (ERR_TOO_MANY_REDIRECTS) al cambiar de idioma.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
