import { MetadataRoute } from 'next';
import { clientEnv } from '@/config/env';
import { serviciosProgramaticos } from '@/data/servicios';
import { ciudades, CIUDADES_INDEXABLES } from '@/data/ciudades';
import { getAllPosts } from '@/lib/blog';
import { getFeedPosts } from '@/lib/feed';

// Regla: el sitemap SOLO contiene URLs indexables (200, self-canonical, sin noindex).
// Excluidos a propósito: /status (noindex), /certificates (la ruta raíz no existe,
// solo el catch-all), y las ~740 combinaciones servicio×ciudad retiradas (ahora 301).
// /privacy ya no es una página propia — es un 301 a /en/privacidad.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = clientEnv.NEXT_PUBLIC_SITE_URL || 'https://omarhernandezrey.com';
  const currentDate = new Date();

  const altPair = (path: string) => ({
    languages: {
      es: `${baseUrl}${path}`,
      en: `${baseUrl}/en${path}`,
    },
  });

  // Rutas estáticas principales — cada una existe en es (sin prefijo) y en
  // (bajo /en), con hreflang cruzado vía `alternates.languages`.
  const staticRoutes = [
    { url: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { url: '/servicios', priority: 0.95, changeFrequency: 'weekly' as const },
    { url: '/calculadora', priority: 0.9, changeFrequency: 'monthly' as const },
    { url: '/faq', priority: 0.85, changeFrequency: 'monthly' as const },
    { url: '/blog', priority: 0.85, changeFrequency: 'weekly' as const },
    { url: '/sobre-mi', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/recursos', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/privacidad', priority: 0.3, changeFrequency: 'yearly' as const },
  ];

  const staticSitemap: MetadataRoute.Sitemap = staticRoutes.flatMap((route) => [
    {
      url: `${baseUrl}${route.url}`,
      lastModified: currentDate,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: altPair(route.url),
    },
    {
      url: `${baseUrl}/en${route.url}`,
      lastModified: currentDate,
      changeFrequency: route.changeFrequency,
      priority: route.priority * 0.9,
      alternates: altPair(route.url),
    },
  ]);

  // Páginas pilar por servicio — el hub canónico de cada servicio, es + en
  const serviciosPilar: MetadataRoute.Sitemap = serviciosProgramaticos.flatMap((servicio) => [
    {
      url: `${baseUrl}/servicios/${servicio.id}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
      alternates: altPair(`/servicios/${servicio.id}`),
    },
    {
      url: `${baseUrl}/en/servicios/${servicio.id}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: altPair(`/servicios/${servicio.id}`),
    },
  ]);

  // Servicio × ciudad × idioma — solo el set curado de ciudades indexables
  const ciudadesIndexables = ciudades.filter((c) =>
    (CIUDADES_INDEXABLES as readonly string[]).includes(c.id)
  );
  const serviciosCiudades: MetadataRoute.Sitemap = serviciosProgramaticos.flatMap((servicio) =>
    ciudadesIndexables.flatMap((ciudad) => {
      const path = `/servicios/${servicio.id}/${ciudad.id}`;
      const priority = ciudad.id === 'bogota' ? 0.85 : 0.75;
      return [
        {
          url: `${baseUrl}${path}`,
          lastModified: currentDate,
          changeFrequency: 'monthly' as const,
          priority,
          alternates: altPair(path),
        },
        {
          url: `${baseUrl}/en${path}`,
          lastModified: currentDate,
          changeFrequency: 'monthly' as const,
          priority: priority * 0.9,
          alternates: altPair(path),
        },
      ];
    })
  );

  // Blog posts — cada post existe en un solo idioma (sin hreflang cruzado,
  // ver comentario en blog/[slug]/page.tsx sobre `singleLanguage`).
  const posts = await getAllPosts();
  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => {
    const isEnglish = post.lang === 'en';
    return {
      url: isEnglish ? `${baseUrl}/en/blog/${post.slug}` : `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: isEnglish ? 0.75 : 0.82,
    };
  });

  // Posts de comunidad publicados — igual que el blog, un post existe en
  // un solo idioma (sin hreflang cruzado). getFeedPosts limita a 50 por
  // página (mismo cap que la API pública), así que paginamos hasta 10
  // páginas (500 posts) para cubrir el crecimiento del feed.
  const feedPosts = [];
  for (let page = 1; page <= 10; page++) {
    const { posts: pagePosts, hasMore } = await getFeedPosts({ page, limit: 50 });
    feedPosts.push(...pagePosts);
    if (!hasMore) break;
  }
  const feedRoutes: MetadataRoute.Sitemap = feedPosts.map((post) => {
    const isEnglish = post.lang === 'en';
    return {
      url: isEnglish ? `${baseUrl}/en/comunidad/${post.id}` : `${baseUrl}/comunidad/${post.id}`,
      lastModified: new Date(post.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    };
  });

  return [...staticSitemap, ...serviciosPilar, ...serviciosCiudades, ...blogRoutes, ...feedRoutes];
}
