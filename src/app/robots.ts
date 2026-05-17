import { MetadataRoute } from 'next';

const BASE_URL = 'https://omarhernandezrey.com';
const PRIVATE: string[] = ['/admin/', '/api/', '/onboarding/', '/proposal/', '/auth/'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE },
      // Google Bard / Gemini AI Overview
      { userAgent: 'Google-Extended', allow: '/', disallow: PRIVATE },
      // ChatGPT search + training
      { userAgent: 'GPTBot', allow: '/', disallow: PRIVATE },
      // Perplexity AI search
      { userAgent: 'PerplexityBot', allow: '/', disallow: PRIVATE },
      // Anthropic Claude AI search
      { userAgent: 'ClaudeBot', allow: '/', disallow: PRIVATE },
      { userAgent: 'anthropic-ai', allow: '/', disallow: PRIVATE },
      // Amazon Alexa / AI
      { userAgent: 'Amazonbot', allow: '/', disallow: PRIVATE },
      // Apple Intelligence
      { userAgent: 'Applebot', allow: '/', disallow: PRIVATE },
      // Cohere AI
      { userAgent: 'cohere-ai', allow: '/', disallow: PRIVATE },
      // Block SEO scrapers that don't power search results
      { userAgent: 'AhrefsBot', disallow: ['/'] },
      { userAgent: 'SemrushBot', disallow: ['/'] },
      { userAgent: 'DotBot', disallow: ['/'] },
      { userAgent: 'MJ12bot', disallow: ['/'] },
      { userAgent: 'BLEXBot', disallow: ['/'] },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
