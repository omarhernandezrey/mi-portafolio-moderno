import { MetadataRoute } from 'next';
import { clientEnv } from '@/config/env';
import { serviciosProgramaticos } from '@/data/servicios';
import { ciudades, CIUDADES_INDEXABLES } from '@/data/ciudades';
import { getAllPosts } from '@/lib/blog';

// Regla: el sitemap SOLO contiene URLs indexables (200, self-canonical, sin noindex).
// Excluidos a propósito: /status (noindex), /certificates (la ruta raíz no existe,
// solo el catch-all), y las ~740 combinaciones servicio×ciudad retiradas (ahora 301).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = clientEnv.NEXT_PUBLIC_SITE_URL || 'https://omarhernandezrey.com';
  const currentDate = new Date();

  // Rutas estáticas principales
  const staticRoutes = [
    { url: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { url: '/servicios', priority: 0.95, changeFrequency: 'weekly' as const },
    { url: '/calculadora', priority: 0.9, changeFrequency: 'monthly' as const },
    { url: '/faq', priority: 0.85, changeFrequency: 'monthly' as const },
    { url: '/blog', priority: 0.85, changeFrequency: 'weekly' as const },
    { url: '/sobre-mi', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/recursos', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/privacidad', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
  ];

  // Páginas pilar por servicio — el hub canónico de cada servicio
  const serviciosPilar = serviciosProgramaticos.map((servicio) => ({
    url: `${baseUrl}/servicios/${servicio.id}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  // Servicio × ciudad: solo el set curado de ciudades indexables
  const ciudadesIndexables = ciudades.filter((c) =>
    (CIUDADES_INDEXABLES as readonly string[]).includes(c.id)
  );
  const serviciosCiudades = serviciosProgramaticos.flatMap((servicio) =>
    ciudadesIndexables.map((ciudad) => ({
      url: `${baseUrl}/servicios/${servicio.id}/${ciudad.id}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: ciudad.id === 'bogota' ? 0.85 : 0.75,
    }))
  );

  // Blog posts
  const posts = await getAllPosts();
  const blogRoutes = posts.map((post) => {
    const isSpanish = post.lang === 'es' || !post.lang;
    return {
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: isSpanish ? 0.82 : 0.75,
    };
  });

  const staticSitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  return [...staticSitemap, ...serviciosPilar, ...serviciosCiudades, ...blogRoutes];
}
