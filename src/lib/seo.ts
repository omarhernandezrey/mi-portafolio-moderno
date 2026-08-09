import type { Metadata } from 'next';
import { clientEnv } from '@/config/env';

export const SITE_URL = 'https://omarhernandezrey.com';
export const BRAND = 'Omar Hernández Rey';

/** Límites SERP: Google trunca títulos ~60 chars y descriptions ~155. */
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 155;

/** Añade la marca al título solo si el resultado cabe en el SERP. */
export function withBrand(base: string): string {
  const branded = `${base} | ${BRAND}`;
  return branded.length <= TITLE_MAX ? branded : base;
}

/** URL de imagen OG 1200×630 generada por /api/og. */
export function ogImageUrl(title: string, subtitle: string): string {
  return `${SITE_URL}/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(subtitle)}`;
}

export interface BuildMetadataOptions {
  /**
   * Título final de la página (≤60 chars). Se emite como `absolute`,
   * por lo que el template del root layout NO vuelve a añadir la marca.
   * Usa `withBrand()` si quieres la marca cuando quepa.
   */
  title: string;
  /** Meta description única (≤155 chars). */
  description: string;
  /**
   * Ruta canónica AGNÓSTICA de idioma, desde la raíz sin prefijo /en,
   * ej. '/faq', '/servicios/desarrollo-web/bogota'. Cadena vacía para el home.
   */
  path: string;
  /** Idioma de ESTA página. 'es' = sin prefijo, 'en' = bajo /en. Default 'es'. */
  locale?: 'es' | 'en';
  /** Subtítulo de la imagen OG; por defecto la marca. */
  ogSubtitle?: string;
  keywords?: string[];
  /** URL absoluta de imagen OG propia; por defecto se genera con /api/og. */
  image?: string;
  noIndex?: boolean;
  /**
   * La página NO tiene versión en el otro idioma (ej. un post de blog sin
   * traducir) — omite el bloque hreflang para no prometerle a Google una
   * URL que da 404.
   */
  singleLanguage?: boolean;
}

export function buildMetadata(opts: BuildMetadataOptions): Metadata {
  const {
    title,
    description,
    path,
    ogSubtitle,
    locale = 'es',
    keywords,
    image,
    noIndex,
    singleLanguage,
  } = opts;

  const esUrl = `${SITE_URL}${path}`;
  const enUrl = `${SITE_URL}/en${path}`;
  const url = locale === 'es' ? esUrl : enUrl;
  const ogImage = image ?? ogImageUrl(title, ogSubtitle ?? BRAND);
  const ogLocale = locale === 'es' ? 'es_CO' : 'en_US';

  if (clientEnv.IS_DEV) {
    if (title.length > TITLE_MAX) {
      console.warn(`[seo] title de ${title.length} chars (>${TITLE_MAX}) en ${path || '/'}: "${title}"`);
    }
    if (description.length > DESCRIPTION_MAX) {
      console.warn(`[seo] description de ${description.length} chars (>${DESCRIPTION_MAX}) en ${path || '/'}`);
    }
  }

  // Pares hreflang generados a partir de path+locale — imposible que se
  // desalineen entre sí, a diferencia de declararlos a mano por página.
  const languages = singleLanguage
    ? undefined
    : { es: esUrl, en: enUrl, 'x-default': esUrl };

  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: {
      canonical: url,
      ...(languages ? { languages } : {}),
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: 'website',
      locale: ogLocale,
      url,
      siteName: BRAND,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}
