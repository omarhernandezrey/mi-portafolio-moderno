import { MetadataRoute } from 'next';

const BASE_URL = 'https://omarhernandezrey.com';
const PRIVATE: string[] = ['/admin/', '/api/', '/onboarding/', '/proposal/', '/auth/'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      { userAgent: 'Googlebot', allow: '/', disallow: PRIVATE },
      { userAgent: 'Google-Extended', allow: '/', disallow: PRIVATE },
      { userAgent: 'GPTBot', allow: '/', disallow: PRIVATE },
      { userAgent: 'PerplexityBot', allow: '/', disallow: PRIVATE },
      { userAgent: 'ClaudeBot', allow: '/', disallow: PRIVATE },
      { userAgent: 'anthropic-ai', allow: '/', disallow: PRIVATE },
      { userAgent: 'Amazonbot', allow: '/', disallow: PRIVATE },
      { userAgent: 'Applebot', allow: '/', disallow: PRIVATE },
      { userAgent: 'cohere-ai', allow: '/', disallow: PRIVATE },
      { userAgent: 'AhrefsBot', disallow: ['/'] },
      { userAgent: 'SemrushBot', disallow: ['/'] },
      { userAgent: 'DotBot', disallow: ['/'] },
      { userAgent: 'MJ12bot', disallow: ['/'] },
      { userAgent: 'BLEXBot', disallow: ['/'] },
    ],
    sitemap: [`${BASE_URL}/sitemap.xml`],
    host: BASE_URL,
  };
}
