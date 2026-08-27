import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ChevronLeft } from 'lucide-react';
import { buildMetadata, SITE_URL } from '@/lib/seo';
import { getFeedPostById, getFeedComments } from '@/lib/feed';
import { Link } from '@/i18n/navigation';
import JsonLd from '@/components/seo/JsonLd';
import FeedPostCard from '@/components/feed/FeedPostCard';
import CommentSection from '@/components/feed/CommentSection';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const post = await getFeedPostById(id);
  if (!post || (post.lang === 'en') !== (locale === 'en')) {
    return { title: locale === 'en' ? 'Post not found' : 'Publicación no encontrada' };
  }

  const isEn = post.lang === 'en';
  const title = post.title ? `${post.title} | Comunidad` : `${post.author_name} | Comunidad`;
  const description = post.body.length > 155 ? `${post.body.slice(0, 152)}...` : post.body;

  return buildMetadata({
    title,
    description,
    path: `/comunidad/${id}`,
    locale: isEn ? 'en' : 'es',
    ogSubtitle: isEn ? 'Community' : 'Comunidad',
    image: post.image_urls[0] ?? undefined,
    singleLanguage: true,
  });
}

export default async function ComunidadPostPage({ params }: Props) {
  const { locale, id } = await params;
  const post = await getFeedPostById(id);
  if (!post || (post.lang === 'en') !== (locale === 'en')) notFound();

  const isEn = post.lang === 'en';
  const path = isEn ? `${SITE_URL}/en/comunidad/${id}` : `${SITE_URL}/comunidad/${id}`;
  const feedPath = isEn ? `${SITE_URL}/en/comunidad` : `${SITE_URL}/comunidad`;
  const homePath = isEn ? `${SITE_URL}/en` : SITE_URL;

  const { comments, hasMore } = await getFeedComments(id, { page: 1, limit: 20 });

  const discussionSchema = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    '@id': path,
    headline: post.title ?? post.body.slice(0, 80),
    text: post.body,
    url: path,
    datePublished: post.created_at,
    inLanguage: isEn ? 'en' : 'es',
    author: {
      '@type': 'Person',
      name: post.author_name,
      ...(post.author_role === 'owner' ? { '@id': `${SITE_URL}/#person` } : {}),
    },
    ...(post.image_urls.length ? { image: post.image_urls } : {}),
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/LikeAction',
        userInteractionCount: post.likes_count,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/CommentAction',
        userInteractionCount: post.comments_count,
      },
    ],
    comment: comments.map((c) => ({
      '@type': 'Comment',
      text: c.body,
      dateCreated: c.created_at,
      author: { '@type': 'Person', name: c.author_name },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isEn ? 'Home' : 'Inicio', item: homePath },
      { '@type': 'ListItem', position: 2, name: isEn ? 'Community' : 'Comunidad', item: feedPath },
      { '@type': 'ListItem', position: 3, name: post.title ?? post.author_name, item: path },
    ],
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)]">
      <JsonLd data={discussionSchema} />
      <JsonLd data={breadcrumbSchema} />

      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Link
          href="/comunidad"
          className="inline-flex items-center gap-1 text-sm font-medium mb-8 hover:underline"
          style={{ color: 'var(--primary-color)' }}
        >
          <ChevronLeft size={14} />
          {isEn ? 'Back to community' : 'Volver a la comunidad'}
        </Link>

        <div className="mb-6">
          <FeedPostCard post={post} variant="full" />
        </div>

        <CommentSection postId={id} initialComments={comments} initialHasMore={hasMore} />
      </div>
    </div>
  );
}
