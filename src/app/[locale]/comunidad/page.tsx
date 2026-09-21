import React from 'react';
import { Metadata } from 'next';
import { buildMetadata, SITE_URL } from '@/lib/seo';
import { getFeedPosts } from '@/lib/feed';
import JsonLd from '@/components/seo/JsonLd';
import FeedList from '@/components/feed/FeedList';
import TiltImageCard from '@/components/shared/TiltImageCard';
import HeroParallax from '@/components/shared/HeroParallax';
import ParticleField from '@/components/shared/ParticleFieldLoader';
import ScrollReveal from '@/components/shared/ScrollReveal';
import SmoothScrollProvider from '@/components/shared/SmoothScrollProvider';
import { pageHeroImages, unsplashUrl } from '@/data/heroImages';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';

  return buildMetadata(
    isEn
      ? {
          title: 'Community | Omar Hernández Rey',
          description: 'Follow updates on courses, skills, and projects — and join the conversation. Open community feed, no account needed to comment.',
          path: '/comunidad',
          locale: 'en',
          ogSubtitle: 'Community Feed',
          keywords: ['omar hernandez rey community', 'web developer updates', 'developer feed'],
        }
      : {
          title: 'Comunidad | Omar Hernández Rey',
          description: 'Sigue mis actualizaciones de cursos, skills y proyectos — y únete a la conversación. Feed de comunidad abierto, sin cuenta para comentar.',
          path: '/comunidad',
          locale: 'es',
          ogSubtitle: 'Feed de Comunidad',
          keywords: ['comunidad omar hernandez rey', 'actualizaciones desarrollador web', 'feed desarrollador'],
        }
  );
}

export default async function ComunidadPage({ params }: Props) {
  const { locale } = await params;
  const isEn = locale === 'en';
  const lang = isEn ? 'en' : 'es';
  const path = isEn ? `${SITE_URL}/en/comunidad` : `${SITE_URL}/comunidad`;

  const { posts, hasMore } = await getFeedPosts({ page: 1, limit: 10, lang });

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': path,
    url: path,
    name: isEn ? 'Community' : 'Comunidad',
    description: isEn
      ? 'Community feed with updates on courses, skills, projects, and open discussion.'
      : 'Feed de comunidad con actualizaciones de cursos, skills, proyectos y discusión abierta.',
    inLanguage: lang,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.map((post, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${path}/${post.id}`,
        name: post.title ?? post.body.slice(0, 60),
      })),
    },
  };

  return (
    <SmoothScrollProvider>
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)]">
      <JsonLd data={collectionSchema} />

      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <header className="relative overflow-hidden mb-8 text-center">
          <HeroParallax className="absolute -inset-x-10 -inset-y-16 -z-10">
            <div data-parallax-speed="0.3" className="absolute inset-0">
              <ParticleField className="w-full h-full opacity-40" />
            </div>
          </HeroParallax>
          <ScrollReveal immediate>
            <span className="font-mono-label text-[0.65rem]" style={{ color: 'var(--primary-color)' }}>
              {isEn ? 'Community' : 'Comunidad'}
            </span>
            <h1 className="font-display italic text-3xl md:text-4xl font-medium mt-2 mb-3">
              {isEn ? 'Community' : 'Comunidad'}
            </h1>
            <p className="text-sm max-w-lg mx-auto" style={{ color: 'var(--muted-color)' }}>
              {isEn
                ? 'Course completions, new skills, projects, and job applications — plus your own comments and posts.'
                : 'Cursos completados, nuevas skills, proyectos y postulaciones laborales — más tus propios comentarios y publicaciones.'}
            </p>
          </ScrollReveal>
        </header>

        <ScrollReveal immediate delay={0.1} y={24}>
          <TiltImageCard
            src={unsplashUrl(pageHeroImages.comunidad.photoId)}
            alt={isEn ? pageHeroImages.comunidad.alt.en : pageHeroImages.comunidad.alt.es}
            sizes="(max-width: 640px) 100vw, 672px"
            priority
            className="w-full aspect-[3/2] sm:aspect-[16/9] rounded-[28px] border border-white/10 shadow-2xl mb-10"
          />
        </ScrollReveal>

        <FeedList initialPosts={posts} initialHasMore={hasMore} />
      </div>
    </div>
    </SmoothScrollProvider>
  );
}
