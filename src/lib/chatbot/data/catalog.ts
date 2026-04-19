export interface Service {
  id: string;
  name: { es: string; en: string };
  description: { es: string; en: string };
  priceRange: { min: number; max: number | string; currency: string };
  deliveryDays: { min: number; max: number };
  includes: { es: string[]; en: string[] };
  notIncluded?: { es: string[]; en: string[] };
  upsells?: string[];
  idealFor: { es: string; en: string };
}

export const SERVICES_CATALOG: Service[] = [
  {
    id: 'landing-page',
    name: { es: 'Landing page estática', en: 'Static Landing Page' },
    description: {
      es: 'Una página de aterrizaje optimizada para conversión, ideal para productos o servicios específicos.',
      en: 'A conversion-optimized landing page, ideal for specific products or services.'
    },
    priceRange: { min: 250, max: 600, currency: 'USD' },
    deliveryDays: { min: 3, max: 7 },
    includes: {
      es: ['Diseño UI responsivo', 'Optimización de carga', 'Integración de formulario', 'SEO básico'],
      en: ['Responsive UI design', 'Performance optimization', 'Form integration', 'Basic SEO']
    },
    upsells: ['mantenimiento-mensual', 'seo-tecnico'],
    idealFor: { es: 'Emprendedores y campañas de marketing.', en: 'Entrepreneurs and marketing campaigns.' }
  },
  {
    id: 'corporate-web',
    name: { es: 'Sitio web corporativo', en: 'Corporate Website' },
    description: {
      es: 'Presencia profesional para tu empresa con múltiples secciones informativas.',
      en: 'Professional presence for your company with multiple informative sections.'
    },
    priceRange: { min: 800, max: 1800, currency: 'USD' },
    deliveryDays: { min: 14, max: 30 },
    includes: {
      es: ['Hasta 10 páginas', 'Gestión de contenidos', 'Blog (opcional)', 'Diseño personalizado'],
      en: ['Up to 10 pages', 'Content management', 'Blog (optional)', 'Custom design']
    },
    upsells: ['mantenimiento-mensual', 'seo-tecnico'],
    idealFor: { es: 'Pymes y empresas consolidadas.', en: 'SMEs and established companies.' }
  },
  {
    id: 'ecommerce',
    name: { es: 'E-commerce con pasarela', en: 'E-commerce Store' },
    description: {
      es: 'Tienda en línea completa para vender tus productos físicamente o digitales.',
      en: 'Complete online store to sell your physical or digital products.'
    },
    priceRange: { min: 1500, max: 3500, currency: 'USD' },
    deliveryDays: { min: 30, max: 60 },
    includes: {
      es: ['Pasarela de pagos (Stripe/PayPal)', 'Gestión de inventario', 'Panel de administración', 'Carrito de compras'],
      en: ['Payment gateway (Stripe/PayPal)', 'Inventory management', 'Admin panel', 'Shopping cart']
    },
    upsells: ['mantenimiento-mensual', 'optimizacion-performance'],
    idealFor: { es: 'Negocios que quieren vender en línea.', en: 'Businesses wanting to sell online.' }
  },
  {
    id: 'web-app-mvp',
    name: { es: 'Web app a medida (MVP)', en: 'Custom Web App (MVP)' },
    description: {
      es: 'Desarrollo de un Producto Mínimo Viable para validar tu idea de negocio.',
      en: 'Development of a Minimum Viable Product to validate your business idea.'
    },
    priceRange: { min: 2500, max: 5000, currency: 'USD' },
    deliveryDays: { min: 30, max: 90 },
    includes: {
      es: ['Autenticación de usuarios', 'Base de datos escalable', 'Funcionalidades core personalizadas', 'Infraestructura cloud'],
      en: ['User authentication', 'Scalable database', 'Custom core features', 'Cloud infrastructure']
    },
    upsells: ['mantenimiento-mensual', 'dashboard-admin'],
    idealFor: { es: 'Startups y fundadores tecnológicos.', en: 'Startups and tech founders.' }
  },
  {
    id: 'dashboard-admin',
    name: { es: 'Dashboard / Panel admin', en: 'Admin Dashboard/Panel' },
    description: {
      es: 'Herramienta interna para gestionar datos, usuarios y métricas de tu negocio.',
      en: 'Internal tool to manage data, users, and business metrics.'
    },
    priceRange: { min: 1200, max: 3000, currency: 'USD' },
    deliveryDays: { min: 15, max: 45 },
    includes: {
      es: ['Gráficos interactivos', 'Gestión de roles', 'Exportación de datos', 'Integración con APIs'],
      en: ['Interactive charts', 'Role management', 'Data export', 'API integration']
    },
    idealFor: { es: 'Empresas que necesitan control operativo.', en: 'Companies needing operational control.' }
  },
  {
    id: 'seo-tecnico',
    name: { es: 'SEO Técnico', en: 'Technical SEO' },
    description: {
      es: 'Optimización profunda para que tu sitio aparezca en los primeros resultados de Google.',
      en: 'Deep optimization for your site to rank on the first page of Google.'
    },
    priceRange: { min: 400, max: 800, currency: 'USD' },
    deliveryDays: { min: 7, max: 21 },
    includes: {
      es: ['Auditoría completa', 'Optimización de Core Web Vitals', 'Indexación avanzada', 'Sitemap y Robots.txt'],
      en: ['Full audit', 'Core Web Vitals optimization', 'Advanced indexing', 'Sitemap and Robots.txt']
    },
    idealFor: { es: 'Sitios que necesitan tráfico orgánico.', en: 'Sites needing organic traffic.' }
  },
  {
    id: 'optimizacion-performance',
    name: { es: 'Optimización de Performance', en: 'Performance Optimization' },
    description: {
      es: 'Hacemos que tu sitio vuele, mejorando la experiencia de usuario y el SEO.',
      en: 'We make your site fly, improving user experience and SEO.'
    },
    priceRange: { min: 300, max: 700, currency: 'USD' },
    deliveryDays: { min: 3, max: 10 },
    includes: {
      es: ['Reducción de bundle size', 'Lazy loading avanzado', 'Optimización de imágenes', 'Configuración de CDN'],
      en: ['Bundle size reduction', 'Advanced lazy loading', 'Image optimization', 'CDN configuration']
    },
    idealFor: { es: 'Sitios lentos que pierden usuarios.', en: 'Slow sites losing users.' }
  },
  {
    id: 'mantenimiento-mensual',
    name: { es: 'Mantenimiento mensual', en: 'Monthly Maintenance' },
    description: {
      es: 'Tranquilidad total con soporte continuo y actualizaciones de seguridad.',
      en: 'Total peace of mind with ongoing support and security updates.'
    },
    priceRange: { min: 300, max: 800, currency: 'USD' },
    deliveryDays: { min: 30, max: 30 },
    includes: {
      es: ['Backups diarios', 'Actualizaciones de seguridad', 'Soporte prioritario', 'Pequeños cambios mensuales'],
      en: ['Daily backups', 'Security updates', 'Priority support', 'Small monthly changes']
    },
    idealFor: { es: 'Negocios que no quieren preocuparse por la técnica.', en: 'Businesses not wanting to worry about tech.' }
  }
];
