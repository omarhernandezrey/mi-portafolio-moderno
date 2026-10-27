import type { PostMetadata } from '@/lib/blog';

export type BlogTopicIcon = 'code' | 'pricing' | 'ecommerce' | 'seo' | 'business';

export interface BlogTopic {
  id: string;
  label: string;
  tags: string[];
  icon: BlogTopicIcon;
}

/**
 * Taxonomía editorial del blog. Los tags crudos de los MDX son
 * heterogéneos (ES/EN, singular/plural), así que se agrupan en cinco
 * temas estables que funcionan como índice de la publicación.
 * El orden importa: el primer tema que coincide es el "primary topic"
 * que se muestra en portadas y tarjetas.
 */
export const BLOG_TOPICS: Record<'es' | 'en', BlogTopic[]> = {
  es: [
    {
      id: 'precios',
      label: 'Precios & Presupuesto',
      icon: 'pricing',
      tags: ['precios', 'presupuesto', 'contratar', 'freelancer', 'desarrollador web'],
    },
    {
      id: 'ecommerce',
      label: 'E-commerce',
      icon: 'ecommerce',
      tags: ['ecommerce', 'tienda online', 'ventas online'],
    },
    {
      id: 'seo',
      label: 'SEO & Clientes',
      icon: 'seo',
      tags: ['seo', 'conseguir clientes', 'marketing digital', 'conversion', 'presencia digital'],
    },
    {
      id: 'negocios',
      label: 'Negocios',
      icon: 'business',
      tags: ['negocios pequeños', 'pymes', 'emprendedores', 'empresas'],
    },
    {
      id: 'desarrollo',
      label: 'Desarrollo Web',
      icon: 'code',
      tags: ['desarrollo web', 'react', 'wordpress', 'nextjs', 'landing page', 'sitio web', 'diseño web', 'mvp'],
    },
  ],
  en: [
    {
      id: 'pricing',
      label: 'Pricing & Budget',
      icon: 'pricing',
      tags: ['pricing', 'budget', 'hiring', 'freelancer', 'web developer'],
    },
    {
      id: 'ecommerce',
      label: 'E-commerce',
      icon: 'ecommerce',
      tags: ['ecommerce', 'online store', 'online sales'],
    },
    {
      id: 'seo',
      label: 'SEO & Growth',
      icon: 'seo',
      tags: ['seo', 'get customers', 'digital marketing', 'conversion', 'digital presence'],
    },
    {
      id: 'business',
      label: 'Business',
      icon: 'business',
      tags: ['small business', 'sme', 'entrepreneurs', 'business'],
    },
    {
      id: 'development',
      label: 'Web Development',
      icon: 'code',
      tags: ['web development', 'react', 'wordpress', 'nextjs', 'landing page', 'website', 'web design', 'mvp', 'startup'],
    },
  ],
};

function postTagSet(post: PostMetadata): Set<string> {
  return new Set(post.tags.map((tag) => tag.toLowerCase()));
}

export function getPostTopics(post: PostMetadata, locale: 'es' | 'en'): BlogTopic[] {
  const tags = postTagSet(post);
  return BLOG_TOPICS[locale].filter((topic) => topic.tags.some((tag) => tags.has(tag)));
}

export function getPrimaryTopic(post: PostMetadata, locale: 'es' | 'en'): BlogTopic | null {
  return getPostTopics(post, locale)[0] ?? null;
}
