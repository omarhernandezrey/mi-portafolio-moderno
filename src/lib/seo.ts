import type { Metadata } from 'next';

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
  /** Ruta desde la raíz, ej. '/faq'. Cadena vacía para el home. */
  path: string;
  /** Subtítulo de la imagen OG; por defecto la marca. */
  ogSubtitle?: string;
  locale?: 'es_CO' | 'en_US';
  keywords?: string[];
  /** URL absoluta de imagen OG propia; por defecto se genera con /api/og. */
  image?: string;
  noIndex?: boolean;
  /**
   * Pares hreflang ABSOLUTOS. Solo declararlos si la página equivalente
   * existe en el otro idioma y esa página declara el par recíproco.
   */
  languages?: Record<string, string>;
}

export function buildMetadata(opts: BuildMetadataOptions): Metadata {
  const {
    title,
    description,
    path,
    ogSubtitle,
    locale = 'es_CO',
    keywords,
    image,
    noIndex,
    languages,
  } = opts;

  const url = `${SITE_URL}${path}`;
  const ogImage = image ?? ogImageUrl(title, ogSubtitle ?? BRAND);

  if (process.env.NODE_ENV !== 'production') {
    if (title.length > TITLE_MAX) {
      console.warn(`[seo] title de ${title.length} chars (>${TITLE_MAX}) en ${path || '/'}: "${title}"`);
    }
    if (description.length > DESCRIPTION_MAX) {
      console.warn(`[seo] description de ${description.length} chars (>${DESCRIPTION_MAX}) en ${path || '/'}`);
    }
  }

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
      locale,
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
