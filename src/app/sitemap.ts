import { MetadataRoute } from 'next';
import { clientEnv } from '@/config/env';
import { serviciosProgramaticos } from '@/data/servicios';
import { ciudades } from '@/data/ciudades';
import { getAllPosts } from '@/lib/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = clientEnv.NEXT_PUBLIC_SITE_URL || 'https://omarhernandezrey.com';
  const currentDate = new Date();

  // Rutas estáticas principales
  const staticRoutes = [
    { url: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { url: '/calculadora', priority: 0.9, changeFrequency: 'monthly' as const },
    { url: '/faq', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/blog', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/recursos', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/status', priority: 0.6, changeFrequency: 'daily' as const },
    { url: '/certificates', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/privacidad', priority: 0.5, changeFrequency: 'yearly' as const },
    { url: '/privacy', priority: 0.5, changeFrequency: 'yearly' as const },
  ];

  // Rutas de servicios por ciudad (programáticas)
  const serviciosCiudades = serviciosProgramaticos.flatMap((servicio) =>
    ciudades.map((ciudad) => ({
      url: `${baseUrl}/servicios/${servicio.id}/${ciudad.id}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
  );

  // Rutas de blog posts
  const posts = await getAllPosts();
  const blogRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  // Mapear rutas estáticas
  const staticSitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  return [...staticSitemap, ...serviciosCiudades, ...blogRoutes];
}
