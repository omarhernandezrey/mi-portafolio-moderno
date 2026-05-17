import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPostBySlug, getAllPosts, getRelatedPosts } from '@/lib/blog';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { ArrowRight, Clock, Calendar, Tag, ChevronLeft } from 'lucide-react';

const BASE_URL = 'https://omarhernandezrey.com';

const components = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className="text-2xl font-bold mt-8 mb-4" {...props} />,
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className="text-xl font-bold mt-6 mb-3" {...props} />,
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => <p className="mb-4 leading-relaxed" {...props} />,
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
  li: (props: React.LiHTMLAttributes<HTMLLIElement>) => <li {...props} />,
  code: (props: React.HTMLAttributes<HTMLElement>) => <code className="bg-[var(--muted-color)]/10 px-1 rounded text-sm" {...props} />,
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => <pre className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto mb-4 text-sm" {...props} />,
  blockquote: (props: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-[var(--primary-color)] pl-4 italic my-6 text-[var(--muted-color)]" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a className="text-[var(--primary-color)] hover:underline" {...props} />,
  table: (props: React.HTMLAttributes<HTMLTableElement>) => <div className="overflow-x-auto mb-6"><table className="w-full text-sm border-collapse" {...props} /></div>,
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => <th className="border border-white/10 px-3 py-2 text-left font-bold bg-white/5" {...props} />,
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => <td className="border border-white/10 px-3 py-2" {...props} />,
};

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
  'chatbot': { href: '/servicios/chatbot-ia/bogota', label: 'Chatbots con IA' },
  'inteligencia artificial': { href: '/servicios/chatbot-ia/bogota', label: 'Chatbots con IA' },
  'automatización': { href: '/servicios/automatizacion/bogota', label: 'Automatización de Procesos' },
  'seo': { href: '/servicios/seo-tecnico/bogota', label: 'SEO Técnico Profesional' },
  'seo tecnico': { href: '/servicios/seo-tecnico/bogota', label: 'SEO Técnico Profesional' },
  'mvp': { href: '/servicios/desarrollo-web/bogota', label: 'Desarrollo de MVP' },
  'nextjs': { href: '/servicios/desarrollo-web/bogota', label: 'Desarrollo con Next.js' },
  'react': { href: '/servicios/desarrollo-web/bogota', label: 'Desarrollo con React' },
  'wordpress': { href: '/servicios/desarrollo-web/bogota', label: 'Alternativa a WordPress' },
  'startup': { href: '/servicios/consultoria-tech/bogota', label: 'Consultoría Tecnológica' },
  'freelance developer': { href: '/servicios', label: 'Ver todos los Servicios' },
  'freelance': { href: '/servicios', label: 'Servicios Freelance' },
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

function getRelatedServices(tags: string[]): Array<{ href: string; label: string }> {
  const seen = new Set<string>();
  const services: Array<{ href: string; label: string }> = [];
  for (const tag of tags.map(t => t.toLowerCase())) {
    const match = TAG_SERVICE[tag];
    if (match && !seen.has(match.href)) {
      seen.add(match.href);
      services.push(match);
      if (services.length >= 3) break;
    }
  }
  return services;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Post no encontrado' };

  const isEnglish = post.lang === 'en';
  const siteSuffix = isEnglish
    ? 'Omar Hernández Rey — Colombian Full Stack Developer'
    : 'Omar Hernández Rey — Desarrollador Web Colombia';
  const title = `${post.title} | ${siteSuffix}`;
  const ogImageUrl = post.image?.startsWith('/api/og')
    ? `${BASE_URL}${post.image}`
    : `${BASE_URL}/api/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(isEnglish ? 'Omar Hernández Rey · Blog' : 'Blog · Omar Hernández Rey')}`;

  return {
    title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author, url: `${BASE_URL}/#person` }],
    alternates: {
      canonical: `${BASE_URL}/blog/${slug}`,
      languages: {
        [isEnglish ? 'en' : 'es']: `${BASE_URL}/blog/${slug}`,
        'x-default': `${BASE_URL}/blog`,
      },
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: `${BASE_URL}/blog/${slug}`,
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      locale: isEnglish ? 'en_US' : 'es_CO',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [ogImageUrl],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([getPostBySlug(slug), getAllPosts()]);

  if (!post) notFound();

  const isEnglish = post.lang === 'en';
  const relatedPosts = getRelatedPosts(slug, post.tags, allPosts);
  const relatedServices = getRelatedServices(post.tags);
  const ogImageUrl = post.image?.startsWith('/api/og')
    ? `${BASE_URL}${post.image}`
    : `${BASE_URL}/api/og?title=${encodeURIComponent(post.title)}&subtitle=Blog`;

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${BASE_URL}/blog/${slug}`,
    "headline": post.title,
    "description": post.description,
    "keywords": post.tags.join(', '),
    "datePublished": post.date,
    "dateModified": post.date,
    "wordCount": post.wordCount,
    "timeRequired": `PT${post.readingTime}M`,
    "inLanguage": isEnglish ? 'en' : 'es',
    "articleSection": post.tags[0] ?? 'Desarrollo Web',
    "author": {
      "@type": "Person",
      "@id": `${BASE_URL}/#person`,
      "name": post.author ?? "Omar Hernández Rey",
      "url": BASE_URL,
    },
    "publisher": {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      "name": "Omar Hernández Rey",
      "logo": { "@type": "ImageObject", "url": `${BASE_URL}/favicon.png` },
    },
    "image": { "@type": "ImageObject", "url": ogImageUrl, "width": 1200, "height": 630 },
    "url": `${BASE_URL}/blog/${slug}`,
    "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE_URL}/blog/${slug}` },
    "isPartOf": { "@id": `${BASE_URL}/#website` },
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["article h1", "article h2", "article p:first-of-type"],
    },
    "about": post.tags.map(tag => ({ "@type": "Thing", "name": tag })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": BASE_URL },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${BASE_URL}/blog` },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": `${BASE_URL}/blog/${slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)]">
      <JsonLd data={blogPostingSchema} />
      <JsonLd data={breadcrumbSchema} />

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        {/* Breadcrumb nav */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-[var(--muted-color)]">
            <li><Link href="/" className="hover:text-[var(--primary-color)] transition-colors">Inicio</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/blog" className="hover:text-[var(--primary-color)] transition-colors">Blog</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-[var(--text-color)] truncate max-w-[200px]">{post.title}</li>
          </ol>
        </nav>

        <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-[var(--primary-color)] hover:underline mb-8">
          <ChevronLeft size={14} />
          {isEnglish ? 'Back to Blog' : 'Volver al Blog'}
        </Link>

        <article itemScope itemType="https://schema.org/BlogPosting">
          <header className="mb-10">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded-full border border-[var(--primary-color)]/20">
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-4xl font-bold mb-6 leading-tight" itemProp="headline">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--muted-color)]">
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                <time dateTime={post.date} itemProp="datePublished">
                  {new Date(post.date).toLocaleDateString(isEnglish ? 'en-US' : 'es-CO', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </time>
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} />
                {post.readingTime} min read
              </span>
              <span itemProp="author" itemScope itemType="https://schema.org/Person">
                <span itemProp="name">{post.author}</span>
              </span>
            </div>
          </header>

          <div className="prose dark:prose-invert max-w-none" itemProp="articleBody">
            <MDXRemote source={post.content} components={components} />
          </div>

          {/* Author bio / EEAT signal */}
          <aside className="mt-12 p-6 rounded-2xl bg-[var(--muted-color)]/5 border border-[var(--muted-color)]/10 flex items-start gap-4" itemProp="author" itemScope itemType="https://schema.org/Person">
            <div className="w-12 h-12 rounded-full bg-[var(--primary-color)]/20 flex items-center justify-center text-[var(--primary-color)] font-black text-lg shrink-0">O</div>
            <div>
              <p className="font-bold text-sm" itemProp="name">{post.author}</p>
              <p className="text-xs text-[var(--muted-color)] mt-1" itemProp="description">
                {isEnglish
                  ? 'Full Stack Web Developer freelance based in Colombia. 5+ years building web apps, chatbots with AI, and e-commerce solutions for Colombia and USA clients. React, Next.js, Node.js specialist.'
                  : 'Desarrollador web full stack freelance con más de 5 años entregando proyectos en Colombia y USA. Especialista en React, Next.js, Node.js y chatbots con IA.'}
              </p>
            </div>
          </aside>

          {/* Related Services — internal linking for SEO */}
          {relatedServices.length > 0 && (
            <section className="mt-12 p-6 rounded-2xl bg-[var(--primary-color)]/5 border border-[var(--primary-color)]/20">
              <h2 className="text-base font-black uppercase tracking-widest text-[var(--primary-color)] mb-4">
                {isEnglish ? '→ Hire for your project' : '→ Contratar para tu proyecto'}
              </h2>
              <div className="flex flex-col gap-3">
                {relatedServices.map(service => (
                  <Link
                    key={service.href}
                    href={service.href}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--background-color)] border border-[var(--muted-color)]/10 hover:border-[var(--primary-color)]/30 transition-all group text-sm"
                  >
                    <span className="font-medium group-hover:text-[var(--primary-color)] transition-colors">{service.label}</span>
                    <ArrowRight size={14} className="text-[var(--muted-color)] group-hover:text-[var(--primary-color)] transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <footer className="mt-10 p-8 rounded-2xl bg-[var(--muted-color)]/5 text-center border border-[var(--muted-color)]/10">
            <h3 className="text-xl font-bold mb-2">
              {isEnglish ? 'Ready to build your project?' : '¿Listo para tu próximo proyecto?'}
            </h3>
            <p className="text-sm text-[var(--muted-color)] mb-6">
              {isEnglish
                ? "Let's talk about how I can help you. Free consultation, response within 24h."
                : 'Hablemos sobre cómo puedo aplicar esto en tu proyecto. Consulta gratis, respuesta en 24h.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/#contact"
                className="inline-block bg-[var(--primary-color)] text-white px-8 py-3 rounded-full font-bold hover:opacity-90 transition-all"
              >
                {isEnglish ? 'Get Free Consultation' : 'Consulta Gratuita'}
              </Link>
              <Link
                href="/calculadora"
                className="inline-block bg-[var(--primary-color)]/10 text-[var(--primary-color)] px-8 py-3 rounded-full font-bold hover:bg-[var(--primary-color)]/20 transition-all"
              >
                {isEnglish ? 'Estimate Your Project' : 'Calcular Presupuesto'}
              </Link>
              <Link
                href="/servicios"
                className="inline-block border border-[var(--muted-color)]/30 text-[var(--text-color)] px-8 py-3 rounded-full font-bold hover:border-[var(--primary-color)] transition-all"
              >
                {isEnglish ? 'View All Services' : 'Ver Servicios'}
              </Link>
            </div>
          </footer>
        </article>

        {/* Related Posts — internal linking */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[var(--muted-color)]/10">
            <h2 className="text-xl font-bold mb-6">
              {isEnglish ? 'Related Articles' : 'Artículos Relacionados'}
            </h2>
            <div className="grid gap-4">
              {relatedPosts.map(related => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group p-4 rounded-xl border border-[var(--muted-color)]/10 hover:border-[var(--primary-color)]/30 transition-all flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-sm group-hover:text-[var(--primary-color)] transition-colors">{related.title}</p>
                    <p className="text-xs text-[var(--muted-color)] mt-1 flex items-center gap-2">
                      <Clock size={11} />
                      {related.readingTime} min
                    </p>
                  </div>
                  <ArrowRight size={16} className="text-[var(--muted-color)] group-hover:text-[var(--primary-color)] transition-colors shrink-0 ml-4" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
