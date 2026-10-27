import React from 'react';
import { buildMetadata } from '@/lib/seo';
import { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { getAllPosts } from '@/lib/blog';
import { ArrowUpRight } from 'lucide-react';
import Footer from '@/components/shared/Footer';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbList } from '@/lib/schemas';
import BlogNewsletterCTA from '@/components/blog/BlogNewsletterCTA';
import BlogArchive from '@/components/blog/BlogArchive';
import ScrollReveal from '@/components/shared/ScrollReveal';
import SmoothScrollProvider from '@/components/shared/SmoothScrollProvider';

type Props = {
  params: Promise<{ locale: string }>;
};

const BASE_URL = 'https://omarhernandezrey.com';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';

  return buildMetadata(
    isEn
      ? {
          title: 'Web Development & SEO Blog | Omar Hernández Rey',
          description: 'Technical articles on web development with React and Next.js, SEO, and digital strategy for entrepreneurs in Colombia and LATAM.',
          path: '/blog',
          locale: 'en',
          ogSubtitle: 'Web Development & Digital Strategy',
          keywords: [
            'web development blog colombia',
            'react next.js tutorial',
            'technical seo colombia',
            'digital strategy entrepreneurs',
          ],
        }
      : {
          title: 'Blog de Desarrollo Web y SEO | Omar Hernández Rey',
          description: 'Artículos técnicos sobre desarrollo web con React y Next.js, SEO y estrategia digital para emprendedores en Colombia y LATAM.',
          path: '/blog',
          locale: 'es',
          ogSubtitle: 'Desarrollo Web y Estrategia Digital',
          keywords: [
            'blog desarrollo web colombia',
            'tutorial react next.js',
            'seo tecnico colombia',
            'estrategia digital emprendedores',
            'programacion web colombia',
          ],
        }
  );
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const isEn = locale === 'en';
  const allPosts = await getAllPosts();
  // Cada idioma solo lista su propio contenido — evita mezclar ES/EN en
  // una página que hreflang le promete a Google como monolingüe.
  const posts = allPosts.filter((post) => (isEn ? post.lang === 'en' : post.lang === 'es' || !post.lang));
  const base = isEn ? `${BASE_URL}/en` : BASE_URL;

  const totalWords = posts.reduce((total, post) => total + (post.wordCount ?? 0), 0);
  const averageReadingTime = posts.length
    ? Math.round(posts.reduce((total, post) => total + (post.readingTime ?? 5), 0) / posts.length)
    : 0;
  const latestDate = posts[0]?.date;
  const latestLabel = latestDate
    ? new Date(`${latestDate}T12:00:00`).toLocaleDateString(isEn ? 'en-US' : 'es-CO', {
        month: 'long',
        year: 'numeric',
      })
    : '';
  const wordCountLabel = new Intl.NumberFormat(isEn ? 'en-US' : 'es-CO').format(totalWords);

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${base}/blog#blog`,
    name: 'The Engineering Journal — Omar Hernández Rey',
    description: isEn
      ? 'Technical essays on web development, SEO, and digital business for companies and founders in Colombia and LATAM.'
      : 'Ensayos técnicos sobre desarrollo web, SEO y negocio digital para empresas y fundadores en Colombia y LATAM.',
    url: `${base}/blog`,
    inLanguage: isEn ? 'en' : 'es',
    publisher: { '@id': `${BASE_URL}/#organization` },
    author: { '@id': `${BASE_URL}/#person` },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.seoTitle ?? post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.updated ?? post.date,
      url: `${base}/blog/${post.slug}`,
      keywords: post.tags.join(', '),
      wordCount: post.wordCount,
      timeRequired: `PT${post.readingTime ?? 5}M`,
      inLanguage: isEn ? 'en' : 'es',
      author: {
        '@type': 'Person',
        '@id': `${BASE_URL}/#person`,
        name: post.author,
      },
      image: `${BASE_URL}/api/og?title=${encodeURIComponent(post.title)}&subtitle=${encodeURIComponent(
        isEn ? 'Omar Hernández Rey · Blog' : 'Blog · Omar Hernández Rey',
      )}`,
    })),
  };

  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-background text-text-main flex flex-col selection:bg-primary">
        <JsonLd
          data={breadcrumbList([
            { name: isEn ? 'Home' : 'Inicio', path: '' },
            { name: 'Blog', path: '/blog' },
          ])}
        />
        <JsonLd data={blogSchema} />

        <main className="flex-1 w-full min-w-0 max-w-[90rem] mx-auto px-[var(--grid-margin)] pt-32 pb-32 md:pt-40 space-y-16 md:space-y-24">
          <header className="relative overflow-hidden border-b border-white/10 pb-14">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute -right-40 -top-48 h-[520px] w-[520px] rounded-full bg-primary-7 blur-[130px]" />
              <div className="absolute -left-32 bottom-0 h-[360px] w-[360px] rounded-full bg-accent-5 blur-[110px]" />
              <div className="bg-tech-grid absolute inset-0 opacity-[0.08] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
            </div>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-8">
                <ScrollReveal immediate y={14}>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono-label text-[8px] text-muted-45">
                    <span className="inline-flex items-center gap-2 text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      The Engineering Journal
                    </span>
                    <span className="hidden h-px w-10 bg-white/20 sm:block" />
                    <span>Vol. 01 — {latestDate?.slice(0, 4) ?? '2026'}</span>
                    <span className="hidden h-px w-10 bg-white/20 sm:block" />
                    <span>Bogotá · CO</span>
                  </div>
                </ScrollReveal>

                <ScrollReveal immediate delay={0.08}>
                  <h1 className="mt-8 font-display text-[clamp(3rem,7.5vw,6.5rem)] font-medium italic leading-[0.9] tracking-tight text-white-custom">
                    {isEn ? (
                      <>
                        Code, judgment{' '}
                        <br />&amp; <span className="text-primary">strategy</span>.
                      </>
                    ) : (
                      <>
                        Código, criterio{' '}
                        <br />y <span className="text-primary">estrategia</span>.
                      </>
                    )}
                  </h1>
                </ScrollReveal>

                <ScrollReveal immediate delay={0.16}>
                  <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-70 sm:text-lg">
                    {isEn
                      ? 'Technical essays and field notes on web development, SEO, and digital business. What I learn building real products for companies and founders in Colombia and beyond.'
                      : 'Ensayos técnicos y notas de campo sobre desarrollo web, SEO y negocio digital. Lo que aprendo construyendo productos reales para empresas y fundadores en Colombia y el exterior.'}
                  </p>
                </ScrollReveal>

                <ScrollReveal immediate delay={0.24}>
                  <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-6 sm:grid-cols-4">
                    <div>
                      <p className="font-display text-2xl font-medium italic text-white-custom sm:text-3xl">
                        {posts.length.toString().padStart(2, '0')}
                      </p>
                      <p className="mt-1 font-mono-label text-[7px] text-muted-35">
                        {isEn ? 'Essays' : 'Ensayos'}
                      </p>
                    </div>
                    <div>
                      <p className="font-display text-2xl font-medium italic text-white-custom sm:text-3xl">
                        {wordCountLabel}
                      </p>
                      <p className="mt-1 font-mono-label text-[7px] text-muted-35">
                        {isEn ? 'Words' : 'Palabras'}
                      </p>
                    </div>
                    <div>
                      <p className="font-display text-2xl font-medium italic text-white-custom sm:text-3xl">
                        {averageReadingTime} min
                      </p>
                      <p className="mt-1 font-mono-label text-[7px] text-muted-35">
                        {isEn ? 'Avg. read' : 'Lectura media'}
                      </p>
                    </div>
                    <div>
                      <p className="font-display text-base font-medium italic leading-tight text-white-custom sm:text-lg">
                        {latestLabel}
                      </p>
                      <p className="mt-1 font-mono-label text-[7px] text-muted-35">
                        {isEn ? 'Last update' : 'Última actualización'}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              <aside className="space-y-4 lg:col-span-4 lg:border-l lg:border-white/10 lg:pl-8">
                <ScrollReveal immediate delay={0.2}>
                  <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-card-40 p-6 sm:p-7">
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary-10 blur-3xl" />
                    <div className="relative">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-primary-25 bg-primary-10 font-display text-2xl font-medium italic text-primary">
                          OH
                        </div>
                        <div>
                          <p className="font-mono-label text-[7px] text-muted-35">
                            {isEn ? 'Written by' : 'Escrito por'}
                          </p>
                          <p className="mt-1 font-display text-xl font-medium italic text-white-custom">
                            Omar Hernández Rey
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-55">
                            Full Stack Developer · Bogotá
                          </p>
                        </div>
                      </div>

                      <p className="mt-6 text-sm leading-relaxed text-muted-60">
                        {isEn
                          ? 'I write to make technical decisions easier for founders and teams: real prices, real trade-offs, and code that ships.'
                          : 'Escribo para que fundadores y equipos tomen mejores decisiones técnicas: precios reales, trade-offs reales y código que llega a producción.'}
                      </p>

                      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                        <span className="font-mono-label text-[7px] text-muted-35">
                          {isEn ? 'Available for projects' : 'Disponible para proyectos'}
                        </span>
                        <Link
                          href="/sobre-mi"
                          className="inline-flex items-center gap-1.5 font-mono-label text-[8px] text-primary-80 transition-colors hover:text-primary"
                        >
                          {isEn ? 'About' : 'Sobre mí'}
                          <ArrowUpRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal immediate delay={0.28}>
                  <div className="rounded-[28px] border border-white/10 bg-card-25 p-6 sm:p-7">
                    <div className="flex items-center justify-between">
                      <p className="font-mono-label text-[7px] text-primary-60">
                        {isEn ? 'In this issue' : 'En este número'}
                      </p>
                      <span className="font-mono-label text-[7px] text-muted-30">
                        01—{posts.length.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="mt-3 divide-y divide-white/5">
                      {posts.slice(0, 3).map((post, index) => (
                        <Link
                          key={post.slug}
                          href={`/blog/${post.slug}`}
                          className="group flex items-start gap-3 py-3 first:pt-2 last:pb-1"
                        >
                          <span className="mt-0.5 font-mono-label text-[7px] text-primary-40">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="line-clamp-2 flex-1 text-[13px] font-semibold leading-snug text-muted-60 transition-colors group-hover:text-white-custom">
                            {post.title}
                          </span>
                          <ArrowUpRight
                            size={11}
                            className="mt-0.5 shrink-0 text-muted-20 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              </aside>
            </div>
          </header>

          <BlogArchive posts={posts} locale={isEn ? 'en' : 'es'} />

          <BlogNewsletterCTA />
        </main>

        <Footer />
      </div>
    </SmoothScrollProvider>
  );
}
