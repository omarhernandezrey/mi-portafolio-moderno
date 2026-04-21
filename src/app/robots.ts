import { MetadataRoute } from 'next';
import { clientEnv } from '@/config/env';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = clientEnv.NEXT_PUBLIC_SITE_URL || 'https://omarhernandez.dev';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
