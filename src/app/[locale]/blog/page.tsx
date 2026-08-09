import React from 'react';
import { buildMetadata } from '@/lib/seo';
import { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { getAllPosts } from '@/lib/blog';
import { BookOpen, Calendar, Clock, ArrowRight, Search, Sparkles, ChevronRight } from 'lucide-react';
import Footer from '@/components/shared/Footer';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbList } from '@/lib/schemas';
import BlogNewsletterCTA from '@/components/blog/BlogNewsletterCTA';

type Props = {
  params: Promise<{ locale: string }>;
};

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
  const posts = allPosts.filter(p => (isEn ? p.lang === 'en' : p.lang === 'es' || !p.lang));
  const featuredPost = posts[0];
  const regularPosts = posts.filter(p => p.slug !== featuredPost?.slug);

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col selection:bg-primary/30">
      <JsonLd data={breadcrumbList([
        { name: isEn ? 'Home' : 'Inicio', path: '' },
        { name: 'Blog', path: '/blog' },
      ])} />

      <main className="flex-1 max-w-[90rem] mx-auto px-[var(--grid-margin)] pt-32 pb-32 space-y-12 md:space-y-24">

        {/* Journal Header */}
        <header className="max-w-4xl space-y-8">
          <div className="font-mono-label inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[0.65rem]">
            Knowledge Base &amp; Research
          </div>
          <h1 className="font-display italic text-6xl md:text-8xl font-medium text-white-custom tracking-tight leading-[0.95]">
            {isEn ? (
              <>Engineering <br /><span className="text-primary">Journal</span></>
            ) : (
              <>Journal de <br /><span className="text-primary">Ingeniería</span></>
            )}
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-lg md:text-xl text-text-muted font-medium max-w-2xl opacity-70 leading-relaxed italic">
              {isEn
                ? 'Technical articles and strategic reflections at the intersection of high-performance code and intelligent systems.'
                : 'Artículos técnicos y reflexiones estratégicas sobre la intersección entre el código de alto rendimiento y los sistemas inteligentes.'}
            </p>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20 text-primary text-xs font-black italic shrink-0">
              {isEn ? `${posts.length} articles published` : `${posts.length} artículos publicados`}
            </span>
          </div>
        </header>

        {/* Blog Infrastructure Control */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 border-b border-white/5 pb-10">
          <nav className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted/40">
            <Link href="/blog" className="text-primary border-b-2 border-primary pb-2 italic">{isEn ? 'All' : 'Todos'}</Link>
            <Link href="/blog" className="hover:text-white-custom transition-colors pb-2">{isEn ? 'Web Development' : 'Desarrollo Web'}</Link>
            <Link href="/blog" className="hover:text-white-custom transition-colors pb-2">{isEn ? 'Business' : 'Negocios'}</Link>
            <Link href="/blog" className="hover:text-white-custom transition-colors pb-2">{isEn ? 'Technology' : 'Tecnología'}</Link>
          </nav>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative group w-full lg:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/40 group-focus-within:text-primary transition-colors" size={16} />
              <input
                type="text"
                placeholder={isEn ? 'Search article...' : 'Buscar artículo...'}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-[11px] font-bold text-white-custom outline-none focus:border-primary/30 transition-all italic"
              />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-full text-[9px] font-black uppercase tracking-widest text-primary/70 italic shrink-0">
              {isEn ? 'EN' : 'ES'}
              <span className="text-text-muted/30">{isEn ? 'English' : 'Español'}</span>
            </span>
          </div>
        </div>

        {/* Featured Content Architecture */}
        {featuredPost && (
          <section className="group relative bg-card-bg rounded-[60px] border border-white/5 overflow-hidden shadow-2xl hover:border-primary/20 transition-all duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
              <div className="p-6 sm:p-10 md:p-20 space-y-6 sm:space-y-10 relative z-10">
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 rounded-md bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest italic">{isEn ? 'Featured' : 'Destacado'}</span>
                  <div className="flex items-center gap-2 text-[10px] text-text-muted/40 font-black uppercase tracking-widest">
                    <Calendar size={12} />
                    {new Date(featuredPost.date).toLocaleDateString(isEn ? 'en-US' : 'es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                </div>

                <h2 className="font-display italic text-4xl md:text-6xl font-medium text-white-custom tracking-tight leading-tight group-hover:text-primary transition-colors">
                  {featuredPost.title}
                </h2>

                <p className="text-lg text-text-muted font-medium italic opacity-60 leading-relaxed max-w-lg">
                  {featuredPost.description}
                </p>

                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="group/btn inline-flex items-center gap-4 bg-primary text-background px-10 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl shadow-primary/20"
                >
                  {isEn ? 'Read Post' : 'Leer Publicación'}
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="h-[400px] lg:h-full bg-background relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-card-bg to-transparent z-10 lg:block hidden" />
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-700" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <BookOpen size={160} strokeWidth={0.5} className="text-white-custom/5 group-hover:scale-110 transition-transform duration-1000" />
                </div>
                {/* Visual placeholder for post image if available */}
                <div className="absolute top-10 right-10 flex gap-2">
                  {featuredPost.tags.map(tag => (
                    <span key={tag} className="bg-background/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[8px] font-black uppercase tracking-widest text-primary italic">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Post Repository Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-12">
          {regularPosts.length > 0 ? (
            regularPosts.map((post) => (
              <article key={post.slug} className="group flex flex-col bg-card-bg rounded-[28px] md:rounded-[40px] border border-white/5 p-6 md:p-10 shadow-xl hover:border-primary/30 transition-all duration-500 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                  <Sparkles size={100} className="-rotate-12" />
                </div>

                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="text-[10px] font-black text-text-muted/40 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={12} className="text-primary" />
                    {post.readingTime || 5} min
                  </div>
                  <div className="text-[10px] font-black text-primary/60 uppercase tracking-tighter italic">
                    {new Date(post.date).toLocaleDateString(isEn ? 'en-US' : 'es-CO', { day: '2-digit', month: 'short' })}
                  </div>
                </div>

                <div className="space-y-4 flex-1 relative z-10">
                  <h3 className="text-2xl font-black text-white-custom leading-tight tracking-tight italic group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-text-muted font-medium leading-relaxed opacity-60 italic line-clamp-3">
                    {post.description}
                  </p>
                </div>

                <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between relative z-10">
                  <div className="flex gap-1">
                    {post.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[8px] font-black uppercase tracking-widest text-text-muted/30">#{tag}</span>
                    ))}
                  </div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-white-custom transition-colors"
                  >
                    {isEn ? 'Read more' : 'Leer más'}
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </article>
            ))
          ) : !featuredPost && (
            <div className="col-span-full py-40 text-center">
              <div className="flex flex-col items-center gap-6 opacity-20">
                <BookOpen size={80} strokeWidth={1} />
                <p className="text-xl font-black uppercase tracking-[0.3em] italic">No Logs Found</p>
              </div>
            </div>
          )}
        </div>

        {/* Global Subscription Protocol */}
        <BlogNewsletterCTA />

      </main>

      <Footer />
    </div>
  );
}
