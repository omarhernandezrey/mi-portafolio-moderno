import React from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import { Metadata } from 'next';
import { getPostBySlug, getAllPosts, getRelatedPosts, getFaqSection } from '@/lib/blog';
import { extractHeadings, slugifyHeading } from '@/lib/blogToc';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { Link } from '@/i18n/navigation';
import JsonLd from '@/components/seo/JsonLd';
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Clock3, FileText } from 'lucide-react';
import Footer from '@/components/shared/Footer';
import SmoothScrollProvider from '@/components/shared/SmoothScrollProvider';
import PostCover from '@/components/blog/PostCover';
import ReadingProgress from '@/components/blog/ReadingProgress';
import ArticleToc from '@/components/blog/ArticleToc';
import ShareButtons from '@/components/blog/ShareButtons';
import BlogNewsletterCTA from '@/components/blog/BlogNewsletterCTA';
import { getPrimaryTopic } from '@/data/blogTopics';

const BASE_URL = 'https://omarhernandezrey.com';

// Tag → service page mapping for internal linking
const TAG_SERVICE: Record<string, { href: string; label: string }> = {
  'desarrollo web': { href: '/servicios/desarrollo-web/bogota', label: 'Desarrollo Web Profesional' },
  'web development': { href: '/servicios/desarrollo-web/bogota', label: 'Professional Web Development' },
  'landing page': { href: '/servicios/landing-page/bogota', label: 'Landing Pages de Alto Impacto' },
  'diseño web': { href: '/servicios/landing-page/bogota', label: 'Diseño y Desarrollo Web' },
  'e-commerce': { href: '/servicios/e-commerce/bogota', label: 'E-commerce Profesional' },
  'ecommerce': { href: '/servicios/e-commerce/bogota', label: 'E-commerce Profesional' },
  'tienda online': { href: '/servicios/e-commerce/bogota', label: 'Tiendas Online' },
  'ventas online': { href: '/servicios/e-commerce/bogota', label: 'Ventas Online' },
  'automatización': { href: '/servicios/automatizacion/bogota', label: 'Automatización de Procesos' },
  'inteligencia artificial': { href: '/servicios/automatizacion/bogota', label: 'Automatización de Procesos' },
  'seo': { href: '/servicios/seo-tecnico/bogota', label: 'SEO Técnico Profesional' },
  'seo tecnico': { href: '/servicios/seo-tecnico/bogota', label: 'SEO Técnico Profesional' },
  'mvp': { href: '/servicios/desarrollo-web/bogota', label: 'Desarrollo de MVP' },
  'nextjs': { href: '/servicios/desarrollo-web/bogota', label: 'Desarrollo con Next.js' },
  'react': { href: '/servicios/desarrollo-web/bogota', label: 'Desarrollo con React' },
  'wordpress': { href: '/servicios/desarrollo-web/bogota', label: 'Alternativa a WordPress' },
  'startup': { href: '/servicios/consultoria-tech/bogota', label: 'Consultoría Tecnológica' },
  'freelance developer': { href: '/servicios', label: 'Ver todos los Servicios' },
  'freelance': { href: '/servicios', label: 'Servicios de Desarrollo Web' },
  'agency': { href: '/servicios', label: 'Servicios de Desarrollo Web' },
  'hiring': { href: '/servicios', label: 'Contratar Desarrollador Web' },
  'contratar': { href: '/servicios', label: 'Contratar Desarrollador Web' },
  'presupuesto': { href: '/calculadora', label: 'Calculadora de Presupuesto' },
  'precios': { href: '/calculadora', label: 'Calcular mi Presupuesto' },
  'colombia': { href: '/servicios/desarrollo-web/bogota', label: 'Desarrollo Web en Colombia' },
  'negocios pequeños': { href: '/servicios/desarrollo-web/bogota', label: 'Desarrollo para PYMES' },
  'pymes': { href: '/servicios/desarrollo-web/bogota', label: 'Desarrollo para PYMES' },
  'emprendedores': { href: '/servicios/landing-page/bogota', label: 'Landing para Emprendedores' },
  'conversion': { href: '/servicios/landing-page/bogota', label: 'Landing Pages Conversión' },
  'conseguir clientes': { href: '/servicios/seo-tecnico/bogota', label: 'Atraer Clientes Online' },
  'marketing digital': { href: '/servicios/seo-tecnico/bogota', label: 'Marketing Digital Técnico' },
  'comparativa': { href: '/servicios', label: 'Comparar Servicios' },
  'empresas': { href: '/servicios/desarrollo-web/bogota', label: 'Desarrollo Web Empresarial' },
  'desarrollador web': { href: '/servicios', label: 'Contratar Desarrollador' },
};

const SERVICE_LABELS_EN: Record<string, string> = {
  '/servicios/desarrollo-web/bogota': 'Professional Web Development',
  '/servicios/landing-page/bogota': 'High-Impact Landing Pages',
  '/servicios/e-commerce/bogota': 'Professional E-commerce',
  '/servicios/automatizacion/bogota': 'Process Automation',
  '/servicios/seo-tecnico/bogota': 'Technical SEO',
  '/servicios/consultoria-tech/bogota': 'Tech Consulting',
  '/servicios': 'All Services',
  '/calculadora': 'Budget Calculator',
};

function getRelatedServices(
  tags: string[],
  isEnglish: boolean,
): Array<{ href: string; label: string }> {
  const seen = new Set<string>();
  const services: Array<{ href: string; label: string }> = [];

  for (const tag of tags.map((tag) => tag.toLowerCase())) {
    const match = TAG_SERVICE[tag];
    if (match && !seen.has(match.href)) {
      seen.add(match.href);
      services.push({
        href: match.href,
        label: isEnglish ? SERVICE_LABELS_EN[match.href] ?? match.label : match.label,
      });
      if (services.length >= 3) break;
    }
  }

  return services;
}

function getNodeText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return getNodeText(node.props.children);
  }
  return '';
}

function createHeadingComponent(
  tag: 'h2' | 'h3',
  className: string,
  isEnglish: boolean,
) {
  return function Heading({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    const text = getNodeText(children);
    const id = slugifyHeading(text);

    return React.createElement(
      tag,
      { ...props, id, className: `group scroll-mt-28 ${className}` },
      children,
      React.createElement(
        'a',
        {
          key: 'anchor',
          href: `#${id}`,
          'aria-label': isEnglish ? `Link to section: ${text}` : `Enlazar a la sección: ${text}`,
          className:
            'ml-3 inline-block align-middle font-mono-label text-[0.5em] text-primary-40 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100',
        },
        '#',
      ),
    );
  };
}

function createMdxComponents(isEnglish: boolean) {
  const linkClass =
    'font-medium text-primary underline decoration-primary-30 underline-offset-4 transition-colors hover:decoration-primary';

  return {
    h1: createHeadingComponent(
      'h2',
      'mt-14 mb-5 font-display text-3xl font-medium italic leading-tight text-white-custom sm:text-[2.1rem]',
      isEnglish,
    ),
    h2: createHeadingComponent(
      'h2',
      'mt-14 mb-5 font-display text-3xl font-medium italic leading-tight text-white-custom sm:text-[2.1rem]',
      isEnglish,
    ),
    h3: createHeadingComponent(
      'h3',
      'mt-10 mb-3 font-display text-2xl font-medium italic leading-snug text-white-custom',
      isEnglish,
    ),
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p {...props} className="mb-6 text-[15px] leading-[1.85] text-muted-70 sm:text-base" />
    ),
    ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
      <ul {...props} className="mb-6 list-disc space-y-2.5 pl-5 marker:text-primary" />
    ),
    ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
      <ol {...props} className="mb-6 list-decimal space-y-2.5 pl-5 marker:text-primary" />
    ),
    li: (props: React.LiHTMLAttributes<HTMLLIElement>) => (
      <li {...props} className="pl-1 leading-[1.8] text-muted-70" />
    ),
    strong: (props: React.HTMLAttributes<HTMLElement>) => (
      <strong {...props} className="font-bold text-white-custom" />
    ),
    a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
      const external = href?.startsWith('http');

      return (
        <a
          {...props}
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className={linkClass}
        >
          {children}
        </a>
      );
    },
    code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) => {
      if (className?.includes('language-')) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }

      return (
        <code
          {...props}
          className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[0.85em] text-primary-80"
        >
          {children}
        </code>
      );
    },
    pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
      <pre
        {...props}
        className="mb-6 overflow-x-auto rounded-2xl border border-white/10 bg-[#070c11] p-5 text-[13px] leading-relaxed text-white/80"
      />
    ),
    blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
      <blockquote
        {...props}
        className="my-10 rounded-r-2xl border-l-2 border-primary bg-primary-7 px-6 py-5 font-display text-xl italic leading-relaxed text-white-custom [&>p]:mb-0 [&>p]:text-white-custom"
      />
    ),
    hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
      <hr {...props} className="my-12 border-white/10" />
    ),
    table: (props: React.HTMLAttributes<HTMLTableElement>) => (
      <div className="my-8 overflow-x-auto rounded-2xl border border-white/10">
        <table {...props} className="w-full min-w-[560px] border-collapse text-left text-sm" />
      </div>
    ),
    th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
      <th
        {...props}
        className="border-b border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-bold text-white-custom"
      />
    ),
    td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
      <td {...props} className="border-b border-white/5 px-4 py-3 align-top text-sm text-muted-70" />
    ),
    tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
      <tr {...props} className="transition-colors hover:bg-white/[0.02]" />
    ),
  };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  // Cada post solo se genera bajo SU locale — un post ES no debe existir
  // en /en/blog/<slug> ni viceversa (evita contenido en el idioma
  // equivocado sirviéndose bajo una URL que promete lo contrario).
  return posts.map((post) => ({
    locale: post.lang === 'en' ? 'en' : 'es',
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Post no encontrado' };
  // El slug existe pero bajo el prefijo de idioma equivocado (cruce de la
  // migración a i18n): la página redirige 301, así que el metadata de esta
  // respuesta no se sirve — no hace falta calcularlo por completo.
  if ((post.lang === 'en') !== (locale === 'en')) return { title: post.seoTitle ?? post.title };

  const isEnglish = post.lang === 'en';
  const path = isEnglish ? `${BASE_URL}/en/blog/${slug}` : `${BASE_URL}/blog/${slug}`;
  // Título absoluto: los `title` de posts son largos y descriptivos (se usan
  // como H1 en la página); `seoTitle` (≤60 chars) es lo que se manda a
  // <title>/OG/Twitter para no truncarse en resultados de búsqueda.
  const title = post.seoTitle ?? post.title;
  const ogImageUrl = post.image?.startsWith('/api/og')
    ? `${BASE_URL}${post.image}`
    : `${BASE_URL}/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(isEnglish ? 'Omar Hernández Rey · Blog' : 'Blog · Omar Hernández Rey')}`;

  return {
    title: { absolute: title },
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author, url: `${BASE_URL}/#person` }],
    // Sin hreflang: cada post existe en un solo idioma, no hay par equivalente
    // que declarar (y un x-default hacia /blog era una señal inválida).
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description: post.description,
      type: 'article',
      url: path,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [post.author],
      tags: post.tags,
      locale: isEnglish ? 'en_US' : 'es_CO',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: post.description,
      images: [ogImageUrl],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const [post, allPosts] = await Promise.all([getPostBySlug(slug), getAllPosts()]);

  if (!post) notFound();

  // 301: el slug existe pero bajo el prefijo de idioma equivocado (cruce de
  // la migración a i18n, ej. /en/blog/<slug-es> o /blog/<slug-en>) —
  // redirige a la ruta canónica en vez de dar 404.
  if ((post.lang === 'en') !== (locale === 'en')) {
    permanentRedirect(post.lang === 'en' ? `/en/blog/${slug}` : `/blog/${slug}`);
  }

  const isEnglish = post.lang === 'en';
  const contentLocale: 'es' | 'en' = isEnglish ? 'en' : 'es';
  const path = isEnglish ? `${BASE_URL}/en/blog/${slug}` : `${BASE_URL}/blog/${slug}`;
  const blogPath = isEnglish ? `${BASE_URL}/en/blog` : `${BASE_URL}/blog`;
  const homePath = isEnglish ? `${BASE_URL}/en` : BASE_URL;
  const sameLangPosts = allPosts.filter((candidate) => candidate.lang === post.lang);
  const postIndex = sameLangPosts.findIndex((candidate) => candidate.slug === post.slug) + 1;
  const indexLabel = String(postIndex).padStart(2, '0');
  const indexBySlug = new Map(sameLangPosts.map((candidate, index) => [candidate.slug, index + 1]));
  const relatedPosts = getRelatedPosts(slug, post.tags, sameLangPosts);
  const relatedServices = getRelatedServices(post.tags, isEnglish);
  const topic = getPrimaryTopic(post, contentLocale);
  const tocHeadings = extractHeadings(post.content).filter((heading) => heading.level === 2);
  const newerPost = postIndex > 1 ? sameLangPosts[postIndex - 2] : null;
  const olderPost = postIndex < sameLangPosts.length ? sameLangPosts[postIndex] : null;
  const ogImageUrl = post.image?.startsWith('/api/og')
    ? `${BASE_URL}${post.image}`
    : `${BASE_URL}/api/og?title=${encodeURIComponent(post.title)}&subtitle=Blog`;

  const formatDate = (value: string, options: Intl.DateTimeFormatOptions) => {
    const date = new Date(value.includes('T') ? value : `${value}T12:00:00`);
    return date.toLocaleDateString(isEnglish ? 'en-US' : 'es-CO', options);
  };

  const publishedDate = formatDate(post.date, { day: '2-digit', month: 'long', year: 'numeric' });
  const updatedDate = formatDate(post.updated ?? post.date, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const wordCountLabel = new Intl.NumberFormat(isEnglish ? 'en-US' : 'es-CO').format(
    post.wordCount ?? 0,
  );

  const glance = [
    { label: isEnglish ? 'Reading time' : 'Lectura', value: `${post.readingTime ?? 5} min` },
    { label: isEnglish ? 'Words' : 'Palabras', value: wordCountLabel },
    { label: isEnglish ? 'Published' : 'Publicado', value: publishedDate },
    ...(post.updated && post.updated !== post.date
      ? [{ label: isEnglish ? 'Updated' : 'Actualizado', value: updatedDate }]
      : []),
  ];

  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': path,
    headline: post.title,
    description: post.description,
    keywords: post.tags.join(', '),
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    wordCount: post.wordCount,
    timeRequired: `PT${post.readingTime}M`,
    inLanguage: isEnglish ? 'en' : 'es',
    articleSection: topic?.label ?? post.tags[0] ?? 'Desarrollo Web',
    author: {
      '@type': 'Person',
      '@id': `${BASE_URL}/#person`,
      name: post.author ?? 'Omar Hernández Rey',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'Omar Hernández Rey',
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/favicon.png` },
    },
    image: { '@type': 'ImageObject', url: ogImageUrl, width: 1200, height: 630 },
    url: path,
    mainEntityOfPage: { '@type': 'WebPage', '@id': path },
    isPartOf: { '@id': `${BASE_URL}/#website` },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['article h1', 'article h2', 'article p:first-of-type'],
    },
    about: post.tags.map((tag) => ({ '@type': 'Thing', name: tag })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: isEnglish ? 'Home' : 'Inicio',
        item: homePath,
      },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: blogPath },
      { '@type': 'ListItem', position: 3, name: post.title, item: path },
    ],
  };

  // Rich snippet de preguntas frecuentes cuando el post tiene una sección FAQ real.
  const faqItems = getFaqSection(post.content);
  const faqSchema = faqItems && {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };

  const mdxComponents = createMdxComponents(isEnglish);
  const proseVariables = {
    '--tw-prose-body': 'var(--muted-color)',
    '--tw-prose-headings': 'var(--text-color)',
    '--tw-prose-lead': 'var(--muted-color)',
    '--tw-prose-links': 'var(--primary-color)',
    '--tw-prose-bold': 'var(--text-color)',
    '--tw-prose-counters': 'var(--primary-color)',
    '--tw-prose-bullets': 'var(--primary-color)',
    '--tw-prose-hr': 'var(--muted-color)',
    '--tw-prose-quotes': 'var(--text-color)',
    '--tw-prose-quote-borders': 'var(--primary-color)',
    '--tw-prose-captions': 'var(--muted-color)',
    '--tw-prose-code': 'var(--text-color)',
    '--tw-prose-pre-code': 'var(--text-color)',
    '--tw-prose-pre-bg': '#070c11',
    '--tw-prose-th-borders': 'var(--muted-color)',
    '--tw-prose-td-borders': 'var(--muted-color)',
  } as React.CSSProperties;

  return (
    <SmoothScrollProvider>
      <div className="flex min-h-screen flex-col bg-background text-text-main selection:bg-primary">
        <ReadingProgress />
        <JsonLd data={blogPostingSchema} />
        <JsonLd data={breadcrumbSchema} />
        {faqSchema && <JsonLd data={faqSchema} />}

        <main className="mx-auto w-full min-w-0 max-w-[90rem] flex-1 px-[var(--grid-margin)] pb-24 pt-28 md:pt-36">
          <nav
            aria-label={isEnglish ? 'Breadcrumb' : 'Migas de pan'}
            className="flex items-center gap-2 font-mono-label text-[7px] text-muted-35"
          >
            <Link href="/" className="transition-colors hover:text-primary">
              {isEnglish ? 'Home' : 'Inicio'}
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/blog" className="transition-colors hover:text-primary">
              Blog
            </Link>
            <span aria-hidden="true">/</span>
            <span className="max-w-[50vw] truncate text-muted-55">
              {topic?.label ?? (isEnglish ? 'Essay' : 'Ensayo')}
            </span>
          </nav>

          <article itemScope itemType="https://schema.org/BlogPosting">
            <header className="mt-8 border-b border-white/10 pb-10 md:pb-14">
              <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
                <div className="min-w-0 lg:col-span-8">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono-label text-[8px] text-muted-40">
                    <span className="inline-flex items-center gap-2 text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {topic?.label ?? (isEnglish ? 'Essay' : 'Ensayo')}
                    </span>
                    <span className="h-px w-6 bg-white/15" />
                    <span>
                      {isEnglish ? 'Essay' : 'Ensayo'} {indexLabel}
                    </span>
                    <span className="h-px w-6 bg-white/15" />
                    <span>{publishedDate}</span>
                  </div>

                  <h1
                    itemProp="headline"
                    className="mt-6 max-w-4xl text-balance font-display text-[clamp(2.4rem,5vw,4.8rem)] font-medium italic leading-[0.98] tracking-tight text-white-custom"
                  >
                    {post.title}
                  </h1>

                  <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-70 sm:text-lg">
                    {post.description}
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-white/10 pt-5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary-25 bg-primary-10 font-display text-xs font-medium italic text-primary">
                        OH
                      </div>
                      <div>
                        <p
                          className="text-xs font-bold text-white-custom"
                          itemProp="author"
                          itemScope
                          itemType="https://schema.org/Person"
                        >
                          <span itemProp="name">{post.author}</span>
                        </p>
                        <p className="font-mono-label text-[7px] text-muted-35">
                          {isEnglish ? 'Full Stack Developer' : 'Desarrollador Full Stack'}
                        </p>
                      </div>
                    </div>
                    <span className="hidden h-7 w-px bg-white/10 sm:block" />
                    <span className="inline-flex items-center gap-1.5 font-mono-label text-[8px] text-muted-40">
                      <CalendarDays size={11} />
                      <time dateTime={post.date} itemProp="datePublished">
                        {publishedDate}
                      </time>
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-mono-label text-[8px] text-muted-40">
                      <Clock3 size={11} />
                      {post.readingTime ?? 5} min
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-mono-label text-[8px] text-muted-40">
                      <FileText size={11} />
                      {wordCountLabel} {isEnglish ? 'words' : 'palabras'}
                    </span>
                  </div>
                </div>

                <aside className="min-w-0 lg:col-span-4 lg:border-l lg:border-white/10 lg:pl-8">
                  <div className="rounded-[26px] border border-white/10 bg-card-40 p-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <p className="font-mono-label text-[8px] text-primary-60">
                        {isEnglish ? 'At a glance' : 'De un vistazo'}
                      </p>
                      <span className="font-mono-label text-[7px] text-muted-30">{indexLabel}</span>
                    </div>

                    <dl className="divide-y divide-white/5">
                      {glance.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-baseline justify-between gap-4 py-2.5"
                        >
                          <dt className="font-mono-label text-[7px] text-muted-35">{item.label}</dt>
                          <dd className="text-right text-[12px] font-bold text-muted-65">
                            {item.value}
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <div className="mt-3 border-t border-white/10 pt-4">
                      <p className="font-mono-label text-[7px] text-muted-35">
                        {isEnglish ? 'Filed under' : 'Archivado en'}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {post.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/10 px-2.5 py-1 font-mono-label text-[7px] text-muted-40"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </header>

            <figure className="mt-10 md:mt-12">
              <div className="overflow-hidden rounded-[28px] border border-white/10">
                <PostCover
                  post={post}
                  locale={contentLocale}
                  index={postIndex}
                  variant="featured"
                  className="aspect-[16/9] w-full sm:aspect-[21/8]"
                />
              </div>
              <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono-label text-[7px] text-muted-25">
                <span>
                  {isEnglish
                    ? 'Generative cover · The Engineering Journal'
                    : 'Portada generativa · The Engineering Journal'}
                </span>
                <span>Ref. {post.slug.slice(0, 12).replace(/-/g, '·').toUpperCase()}</span>
              </figcaption>
            </figure>

            <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="min-w-0 lg:col-span-3">
                <ArticleToc items={tocHeadings} locale={contentLocale} />
              </div>

              <div className="min-w-0 lg:col-span-6">
                <div
                  className="prose max-w-none"
                  style={proseVariables}
                  itemProp="articleBody"
                >
                  <MDXRemote
                    source={post.content}
                    components={mdxComponents}
                    options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
                  />
                </div>

                <div className="mt-12 flex items-center gap-4">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="font-display text-lg italic text-primary">OH</span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>

                <div className="mt-8 flex flex-col gap-5 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 px-2.5 py-1 font-mono-label text-[7px] text-muted-40"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="lg:hidden">
                    <ShareButtons
                      url={path}
                      title={post.title}
                      locale={contentLocale}
                    />
                  </div>
                </div>

                <aside className="mt-10 rounded-[28px] border border-white/10 bg-card-40 p-6 sm:p-7">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-primary-25 bg-primary-10 font-display text-2xl font-medium italic text-primary">
                      OH
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono-label text-[8px] text-primary-60">
                        {isEnglish ? 'About the author' : 'Sobre el autor'}
                      </p>
                      <p className="mt-2 font-display text-2xl font-medium italic text-white-custom">
                        {post.author}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-muted-60">
                        {isEnglish
                          ? 'Full Stack Web Developer based in Colombia. 3+ years building web apps and e-commerce solutions for Colombia and USA clients. React, Next.js, Node.js specialist.'
                          : 'Desarrollador web full stack con más de 3 años entregando proyectos en Colombia y USA. Especialista en React, Next.js y Node.js.'}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-4 font-mono-label text-[7px] text-muted-35">
                        <span>3+ {isEnglish ? 'years' : 'años'}</span>
                        <span className="h-3 w-px bg-white/10" />
                        <span>16+ {isEnglish ? 'projects' : 'proyectos'}</span>
                        <span className="h-3 w-px bg-white/10" />
                        <Link
                          href="/sobre-mi"
                          className="inline-flex items-center gap-1 text-muted-45 transition-colors hover:text-primary"
                        >
                          {isEnglish ? 'Full profile' : 'Perfil completo'}
                          <ArrowUpRight size={11} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </aside>

                {relatedServices.length > 0 && (
                  <section className="mt-10">
                    <div className="flex items-center justify-between">
                      <p className="font-mono-label text-[8px] text-primary-60">
                        {isEnglish ? 'Work with me' : 'Trabaja conmigo'}
                      </p>
                      <span className="font-mono-label text-[7px] text-muted-30">
                        {String(relatedServices.length).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {relatedServices.map((service) => (
                        <Link
                          key={service.href}
                          href={service.href}
                          className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-card-25 px-5 py-4 transition-colors hover:border-primary hover:bg-white/[0.04]"
                        >
                          <span className="text-sm font-bold text-muted-65 transition-colors group-hover:text-white-custom">
                            {service.label}
                          </span>
                          <ArrowUpRight
                            size={14}
                            className="shrink-0 text-muted-30 transition-colors group-hover:text-primary"
                          />
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                <footer className="relative mt-10 overflow-hidden rounded-[28px] border border-primary-25 bg-primary-7 p-6 sm:p-8">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-10 blur-3xl"
                  />
                  <div className="relative">
                    <p className="font-mono-label text-[8px] text-primary-60">
                      {isEnglish ? 'Next step' : 'Siguiente paso'}
                    </p>
                    <h2 className="mt-3 font-display text-3xl font-medium italic leading-tight text-white-custom sm:text-4xl">
                      {isEnglish ? 'Have a project in mind?' : '¿Tienes un proyecto en mente?'}
                    </h2>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-60">
                      {isEnglish
                        ? "Let's talk about how I can apply this to your project. Free consultation, response within 24h."
                        : 'Hablemos sobre cómo puedo aplicar esto en tu proyecto. Consulta gratis, respuesta en 24h.'}
                    </p>
                    <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                      <Link
                        href="/#contact"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-mono-label text-[8px] text-background transition-transform hover:scale-[1.02]"
                      >
                        {isEnglish ? 'Free consultation' : 'Consulta gratuita'}
                        <ArrowUpRight size={13} />
                      </Link>
                      <Link
                        href="/calculadora"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-30 px-6 py-3 font-mono-label text-[8px] text-primary transition-colors hover:border-primary"
                      >
                        {isEnglish ? 'Estimate my project' : 'Calcular presupuesto'}
                      </Link>
                    </div>
                  </div>
                </footer>
              </div>

              <aside className="hidden min-w-0 lg:col-span-3 lg:block">
                <div className="space-y-5 lg:sticky lg:top-28">
                  <div className="rounded-[26px] border border-white/10 bg-card-40 p-5">
                    <ShareButtons
                      url={path}
                      title={post.title}
                      locale={contentLocale}
                      vertical
                    />
                  </div>

                  {relatedPosts.length > 0 && (
                    <div className="rounded-[26px] border border-white/10 bg-card-40 p-5">
                      <p className="font-mono-label text-[8px] text-primary-60">
                        {isEnglish ? 'Keep reading' : 'Sigue leyendo'}
                      </p>
                      <div className="mt-3 divide-y divide-white/5">
                        {relatedPosts.slice(0, 2).map((related) => (
                          <Link
                            key={related.slug}
                            href={`/blog/${related.slug}`}
                            className="group flex items-start gap-3 py-3 first:pt-2 last:pb-1"
                          >
                            <span className="mt-0.5 font-mono-label text-[7px] text-primary-40">
                              {String(indexBySlug.get(related.slug) ?? 1).padStart(2, '0')}
                            </span>
                            <span className="flex-1 text-[13px] font-semibold leading-snug text-muted-60 transition-colors group-hover:text-white-custom">
                              {related.title}
                            </span>
                            <ArrowUpRight
                              size={11}
                              className="mt-0.5 shrink-0 text-muted-25 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                            />
                          </Link>
                        ))}
                      </div>
                      <Link
                        href="/blog"
                        className="mt-4 inline-flex items-center gap-1.5 font-mono-label text-[7px] text-muted-40 transition-colors hover:text-primary"
                      >
                        {isEnglish ? 'All essays' : 'Todos los ensayos'}
                        <ArrowUpRight size={11} />
                      </Link>
                    </div>
                  )}

                  <p className="px-2 font-mono-label text-[7px] leading-relaxed text-muted-25">
                    {isEnglish
                      ? 'Written in MDX · Built with Next.js · No tracking pixels'
                      : 'Escrito en MDX · Construido con Next.js · Sin píxeles de seguimiento'}
                  </p>
                </div>
              </aside>
            </div>
          </article>

          <nav
            aria-label={isEnglish ? 'More essays' : 'Más ensayos'}
            className="mt-16 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-2"
          >
            {newerPost ? (
              <Link
                href={`/blog/${newerPost.slug}`}
                className="group rounded-2xl border border-white/10 bg-card-25 p-5 transition-colors hover:border-primary"
              >
                <span className="inline-flex items-center gap-2 font-mono-label text-[7px] text-muted-35">
                  <ArrowLeft size={11} />
                  {isEnglish ? 'Newer essay' : 'Ensayo más reciente'}
                </span>
                <span className="mt-3 block font-display text-xl font-medium italic leading-snug text-white-custom transition-colors group-hover:text-primary">
                  {newerPost.title}
                </span>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}

            {olderPost ? (
              <Link
                href={`/blog/${olderPost.slug}`}
                className="group rounded-2xl border border-white/10 bg-card-25 p-5 transition-colors hover:border-primary sm:text-right"
              >
                <span className="inline-flex items-center gap-2 font-mono-label text-[7px] text-muted-35">
                  {isEnglish ? 'Older essay' : 'Ensayo anterior'}
                  <ArrowRight size={11} />
                </span>
                <span className="mt-3 block font-display text-xl font-medium italic leading-snug text-white-custom transition-colors group-hover:text-primary">
                  {olderPost.title}
                </span>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}
          </nav>

          {relatedPosts.length > 0 && (
            <section className="mt-16">
              <div className="flex flex-col gap-4 border-t border-white/10 pt-10 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono-label text-[8px] text-primary-60">
                    {isEnglish ? 'Keep reading' : 'Sigue leyendo'}
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-medium italic tracking-tight text-white-custom sm:text-4xl">
                    {isEnglish ? 'Related essays' : 'Ensayos relacionados'}
                  </h2>
                </div>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 font-mono-label text-[8px] text-muted-45 transition-colors hover:text-primary"
                >
                  {isEnglish ? 'The full archive' : 'El archivo completo'}
                  <ArrowUpRight size={13} />
                </Link>
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-white/10 bg-card-40 transition-all duration-500 hover:-translate-y-1 hover:border-primary"
                  >
                    <div className="aspect-[16/10] overflow-hidden border-b border-white/10">
                      <PostCover
                        post={related}
                        locale={contentLocale}
                        index={indexBySlug.get(related.slug) ?? 1}
                        className="h-full w-full"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center justify-between gap-3 font-mono-label text-[8px] text-muted-40">
                        <span className="text-primary-70">
                          {getPrimaryTopic(related, contentLocale)?.label ??
                            (isEnglish ? 'Essay' : 'Ensayo')}
                        </span>
                        <span>{related.readingTime ?? 5} min</span>
                      </div>
                      <h3 className="mt-3 font-display text-xl font-medium italic leading-snug text-white-custom transition-colors group-hover:text-primary">
                        {related.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-60">
                        {related.description}
                      </p>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-4 font-mono-label text-[8px] text-muted-45 transition-colors group-hover:text-primary">
                        {isEnglish ? 'Read the essay' : 'Leer el ensayo'}
                        <ArrowUpRight size={12} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="mt-16">
            <BlogNewsletterCTA />
          </div>
        </main>

        <Footer />
      </div>
    </SmoothScrollProvider>
  );
}
