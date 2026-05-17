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
    { url: '/servicios', priority: 0.95, changeFrequency: 'weekly' as const },
    { url: '/calculadora', priority: 0.9, changeFrequency: 'monthly' as const },
    { url: '/faq', priority: 0.85, changeFrequency: 'monthly' as const },
    { url: '/blog', priority: 0.85, changeFrequency: 'weekly' as const },
    { url: '/recursos', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/certificates', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/privacidad', priority: 0.4, changeFrequency: 'yearly' as const },
    { url: '/privacy', priority: 0.4, changeFrequency: 'yearly' as const },
  ];

  // Rutas de servicios por ciudad (programáticas)
  // Las páginas de Bogotá tienen máxima prioridad como hub de cada servicio
  const US_MAJOR = new Set(['new-york', 'los-angeles', 'chicago', 'houston', 'miami', 'dallas', 'san-francisco', 'seattle', 'boston', 'atlanta', 'washington-dc', 'austin', 'denver', 'san-diego', 'phoenix']);
  const US_CITIES = new Set(['boston', 'philadelphia', 'washington-dc', 'baltimore', 'newark', 'hartford', 'providence', 'miami', 'atlanta', 'tampa', 'orlando', 'charlotte', 'nashville', 'jacksonville', 'raleigh', 'richmond', 'memphis', 'louisville', 'new-orleans', 'chicago', 'detroit', 'minneapolis', 'columbus', 'indianapolis', 'milwaukee', 'cleveland', 'kansas-city', 'st-louis', 'pittsburgh', 'cincinnati', 'omaha', 'houston', 'dallas', 'san-antonio', 'austin', 'el-paso', 'oklahoma-city', 'phoenix', 'las-vegas', 'denver', 'albuquerque', 'salt-lake-city', 'tucson', 'los-angeles', 'san-francisco', 'seattle', 'portland', 'san-diego', 'sacramento', 'san-jose', 'boise', 'honolulu', 'new-york']);

  const serviciosCiudades = serviciosProgramaticos.flatMap((servicio) =>
    ciudades.map((ciudad) => ({
      url: `${baseUrl}/servicios/${servicio.id}/${ciudad.id}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: US_MAJOR.has(ciudad.id) ? 0.88
        : US_CITIES.has(ciudad.id) ? 0.80
        : ciudad.id === 'bogota' ? 0.90
        : ciudad.id === 'medellin' || ciudad.id === 'cali' ? 0.85
        : 0.75,
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
