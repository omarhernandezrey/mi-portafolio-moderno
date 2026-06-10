import { SITE_URL } from '@/lib/seo';

/**
 * Builders tipados de JSON-LD (schema.org). Renderizar con <JsonLd data={...} />.
 * Todas las URLs deben ser absolutas para pasar el Rich Results Test.
 */

export interface BreadcrumbItem {
  name: string;
  /** Ruta desde la raíz ('/blog') o URL absoluta. */
  path: string;
}

export function breadcrumbList(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.path.startsWith('http') ? item.path : `${SITE_URL}${item.path}`,
    })),
  } as const;
}

export interface FaqItem {
  q: string;
  a: string;
}

export function faqPage(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } as const;
}

export interface ServiceSchemaOptions {
  name: string;
  description: string;
  /** Ruta desde la raíz, ej. '/servicios/desarrollo-web'. */
  path: string;
  priceRange: string;
  inLanguage?: 'es' | 'en';
  areaServed?: string[];
}

export function serviceSchema(opts: ServiceSchemaOptions) {
  const url = `${SITE_URL}${opts.path}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': url,
    name: opts.name,
    url,
    description: opts.description,
    serviceType: opts.name,
    provider: { '@type': 'Person', '@id': `${SITE_URL}/#person` },
    areaServed: opts.areaServed ?? ['CO', 'US', 'MX', 'AR', 'CL', 'PE'],
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      priceRange: opts.priceRange,
    },
    inLanguage: opts.inLanguage ?? 'es',
  } as const;
}

export interface BlogPostingOptions {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  /** URL absoluta de la imagen 1200×630. */
  image: string;
  inLanguage?: 'es' | 'en';
}

export function blogPosting(opts: BlogPostingOptions) {
  const url = `${SITE_URL}/blog/${opts.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': url,
    headline: opts.title,
    description: opts.description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    author: { '@type': 'Person', '@id': `${SITE_URL}/#person`, name: opts.author },
    publisher: { '@id': `${SITE_URL}/#organization` },
    image: opts.image,
    inLanguage: opts.inLanguage ?? 'es',
  } as const;
}
