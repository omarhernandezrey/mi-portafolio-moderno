import React from 'react';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import { BookOpen, Calendar, Clock, ArrowRight, Search, Sparkles, ChevronRight } from 'lucide-react';
import Footer from '@/components/shared/Footer';

export const metadata = {
  title: 'Blog Técnico — Desarrollo Web, IA y Estrategia Digital | Omar Hernández Rey',
  description: 'Artículos técnicos sobre desarrollo web con React y Next.js, chatbots con IA, SEO y estrategia digital para emprendedores en Colombia y LATAM.',
  alternates: {
    canonical: 'https://omarhernandezrey.com/blog',
  },
  keywords: [
    'blog desarrollo web colombia',
    'tutorial react next.js',
    'chatbot ia tutorial',
    'seo tecnico colombia',
    'estrategia digital emprendedores',
    'programacion web colombia',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: 'https://omarhernandezrey.com/blog',
    siteName: 'Omar Hernández Rey Portfolio',
    title: 'Blog Técnico — Desarrollo Web, IA y Estrategia Digital',
    description: 'Artículos técnicos sobre React, Next.js, chatbots con IA y SEO para emprendedores en Colombia y LATAM.',
    images: [
      {
        url: 'https://omarhernandezrey.com/api/og?title=Blog%20T%C3%A9cnico&subtitle=Desarrollo%20Web%2C%20IA%20y%20Estrategia%20Digital',
        width: 1200,
        height: 630,
        alt: 'Blog Técnico — Omar Hernández Rey',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog Técnico — Desarrollo Web e IA | Omar Hernández Rey',
    description: 'Artículos sobre React, Next.js, chatbots IA y estrategia digital para Colombia y LATAM.',
    images: ['https://omarhernandezrey.com/api/og?title=Blog%20T%C3%A9cnico&subtitle=Desarrollo%20Web%2C%20IA%20y%20Estrategia%20Digital'],
  },
};

export default async function BlogPage() {
  const posts = await getAllPosts();
  const featuredPost = posts[0];
  const regularPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col selection:bg-primary/30">
      
      <main className="flex-1 max-w-[1400px] mx-auto px-4 md:px-8 pt-32 pb-32 space-y-12 md:space-y-24">
        
        {/* Journal Header */}
        <header className="max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest italic">
            Knowledge Base & Research
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white-custom tracking-tighter leading-[0.9] italic">
            Journal de <br />
            <span className="text-primary text-outline-primary">Ingeniería</span>
          </h1>
          <p className="text-lg md:text-xl text-text-muted font-medium max-w-2xl opacity-70 leading-relaxed italic">
            Artículos técnicos y reflexiones estratégicas sobre la intersección entre el código de alto rendimiento y los sistemas inteligentes.
          </p>
        </header>

        {/* Blog Infrastructure Control */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 border-b border-white/5 pb-10">
          <nav className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted/40">
            <Link href="/blog" className="text-primary border-b-2 border-primary pb-2 italic">Latest Research</Link>
            <Link href="/blog" className="hover:text-white-custom transition-colors pb-2">Architecture</Link>
            <Link href="/blog" className="hover:text-white-custom transition-colors pb-2">AI Agents</Link>
            <Link href="/blog" className="hover:text-white-custom transition-colors pb-2">Strategy</Link>
          </nav>
          
          <div className="relative group w-full lg:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/40 group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Buscar artículo..." 
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-[11px] font-bold text-white-custom outline-none focus:border-primary/30 transition-all italic"
            />
          </div>
        </div>

        {/* Featured Content Architecture */}
        {featuredPost && (
          <section className="group relative bg-card-bg rounded-[60px] border border-white/5 overflow-hidden shadow-2xl hover:border-primary/20 transition-all duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
              <div className="p-6 sm:p-10 md:p-20 space-y-6 sm:space-y-10 relative z-10">
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 rounded-md bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest italic">Featured</span>
                  <div className="flex items-center gap-2 text-[10px] text-text-muted/40 font-black uppercase tracking-widest">
                    <Calendar size={12} />
                    {new Date(featuredPost.date).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                
                <h2 className="text-4xl md:text-6xl font-black text-white-custom tracking-tighter leading-tight italic group-hover:text-primary transition-colors">
                  {featuredPost.title}
                </h2>
                
                <p className="text-lg text-text-muted font-medium italic opacity-60 leading-relaxed max-w-lg">
                  {featuredPost.description}
                </p>
                
                <Link 
                  href={`/blog/${featuredPost.slug}`}
                  className="group/btn inline-flex items-center gap-4 bg-primary text-background px-10 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl shadow-primary/20"
                >
                  Leer Publicación
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
                    5 min read
                  </div>
                  <div className="text-[10px] font-black text-primary/60 uppercase tracking-tighter italic">
                    {new Date(post.date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
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
                    View Project
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
        <section className="bg-background rounded-[32px] md:rounded-[60px] border border-white/5 p-8 md:p-12 lg:p-24 shadow-2xl relative overflow-hidden text-center group hover:border-primary/20 transition-all duration-500">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity blur-[100px]" />
          
          <div className="max-w-2xl mx-auto space-y-12 relative z-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest italic mb-6">
                Journal Subscription
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white-custom tracking-tighter italic">
                Reciba Research Técnico <br />
                <span className="text-primary text-outline-primary">Directamente</span>
              </h2>
              <p className="text-lg text-text-muted font-medium italic opacity-70 leading-relaxed max-w-lg mx-auto">
                Únase al protocolo de actualización para recibir análisis profundos sobre el futuro del desarrollo de software.
              </p>
            </div>

            <div className="relative group max-w-md mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-[24px] blur-lg opacity-10 group-focus-within:opacity-30 transition duration-500"></div>
              <div className="relative flex bg-card-bg/40 rounded-[24px] p-2 border border-white/5 backdrop-blur-xl shadow-2xl overflow-hidden group-focus-within:border-primary/20 transition-all">
                <input
                  type="email"
                  placeholder="su-email@compania.com"
                  className="w-full bg-transparent border-none focus:ring-0 px-6 py-4 text-xs font-bold text-white-custom placeholder:text-text-muted/20 placeholder:italic"
                />
                <button className="bg-primary text-background px-8 py-3 rounded-[18px] font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">
                  Subscribirse
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
