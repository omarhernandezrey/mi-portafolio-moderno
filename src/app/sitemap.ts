import { MetadataRoute } from 'next';
import { clientEnv } from '@/config/env';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = clientEnv.NEXT_PUBLIC_SITE_URL || 'https://omarhernandezrey.com';
  const currentDate = new Date();

  const staticRoutes = [
    { url: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { url: '/calculadora', priority: 0.9, changeFrequency: 'monthly' as const },
    { url: '/faq', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/privacidad', priority: 0.5, changeFrequency: 'yearly' as const },
    { url: '/privacy', priority: 0.5, changeFrequency: 'yearly' as const },
    { url: '/certificates', priority: 0.6, changeFrequency: 'monthly' as const },
  ];

  const sectionAnchors = [
    { url: '/#about', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/#education', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/#skills', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/#services', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/#projects', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/#contact', priority: 0.8, changeFrequency: 'monthly' as const },
  ];

  return [...staticRoutes, ...sectionAnchors].map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
