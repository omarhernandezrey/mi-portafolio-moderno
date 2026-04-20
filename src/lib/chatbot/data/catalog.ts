export interface Service {
  id: string;
  name: { es: string; en: string; pt: string };
  description: { es: string; en: string; pt: string };
  priceRange: { min: number; max: number | string; currency: string };
  deliveryDays: { min: number; max: number };
  includes: { es: string[]; en: string[]; pt: string[] };
  notIncluded?: { es: string[]; en: string[]; pt: string[] };
  upsells?: string[];
  idealFor: { es: string; en: string; pt: string };
}

export const SERVICES_CATALOG: Service[] = [
  {
    id: 'landing-page',
    name: { es: 'Landing page estática', en: 'Static Landing Page', pt: 'Landing page estática' },
    description: {
      es: 'Una página de aterrizaje optimizada para conversión, ideal para productos o servicios específicos.',
      en: 'A conversion-optimized landing page, ideal for specific products or services.',
      pt: 'Uma página de destino otimizada para conversão, ideal para produtos ou serviços específicos.'
    },
    priceRange: { min: 250, max: 600, currency: 'USD' },
    deliveryDays: { min: 3, max: 7 },
    includes: {
      es: ['Diseño UI responsivo', 'Optimización de carga', 'Integración de formulario', 'SEO básico'],
      en: ['Responsive UI design', 'Performance optimization', 'Form integration', 'Basic SEO'],
      pt: ['Design de UI responsivo', 'Otimização de carregamento', 'Integração de formulário', 'SEO básico']
    },
    upsells: ['mantenimiento-mensual', 'seo-tecnico'],
    idealFor: { 
      es: 'Emprendedores y campañas de marketing.', 
      en: 'Entrepreneurs and marketing campaigns.',
      pt: 'Empreendedores e campanhas de marketing.'
    }
  },
  {
    id: 'corporate-web',
    name: { es: 'Sitio web corporativo', en: 'Corporate Website', pt: 'Site corporativo' },
    description: {
      es: 'Presencia profesional para tu empresa con múltiples secciones informativas.',
      en: 'Professional presence for your company with multiple informative sections.',
      pt: 'Presença profissional para sua empresa com múltiplas seções informativas.'
    },
    priceRange: { min: 800, max: 1800, currency: 'USD' },
    deliveryDays: { min: 14, max: 30 },
    includes: {
      es: ['Hasta 10 páginas', 'Gestión de contenidos', 'Blog (opcional)', 'Diseño personalizado'],
      en: ['Up to 10 pages', 'Content management', 'Blog (optional)', 'Custom design'],
      pt: ['Até 10 páginas', 'Gestão de conteúdo', 'Blog (opcional)', 'Design personalizado']
    },
    upsells: ['mantenimiento-mensual', 'seo-tecnico'],
    idealFor: { 
      es: 'Pymes y empresas consolidadas.', 
      en: 'SMEs and established companies.',
      pt: 'Pequenas e médias empresas e empresas consolidadas.'
    }
  },
  {
    id: 'ecommerce',
    name: { es: 'E-commerce con pasarela', en: 'E-commerce Store', pt: 'E-commerce com checkout' },
    description: {
      es: 'Tienda en línea completa para vender tus productos físicamente o digitales.',
      en: 'Complete online store to sell your physical or digital products.',
      pt: 'Loja online completa para vender seus produtos físicos ou digitais.'
    },
    priceRange: { min: 1500, max: 3500, currency: 'USD' },
    deliveryDays: { min: 30, max: 60 },
    includes: {
      es: ['Pasarela de pagos (Stripe/PayPal)', 'Gestión de inventario', 'Panel de administración', 'Carrito de compras'],
      en: ['Payment gateway (Stripe/PayPal)', 'Inventory management', 'Admin panel', 'Shopping cart'],
      pt: ['Checkout de pagamentos (Stripe/PayPal)', 'Gestão de estoque', 'Painel de administração', 'Carrinho de compras']
    },
    upsells: ['mantenimiento-mensual', 'optimizacion-performance'],
    idealFor: { 
      es: 'Negocios que quieren vender en línea.', 
      en: 'Businesses wanting to sell online.',
      pt: 'Negócios que querem vender online.'
    }
  },
  {
    id: 'web-app-mvp',
    name: { es: 'Web app a medida (MVP)', en: 'Custom Web App (MVP)', pt: 'Web app personalizada (MVP)' },
    description: {
      es: 'Desarrollo de un Producto Mínimo Viable para validar tu idea de negocio.',
      en: 'Development of a Minimum Viable Product to validate your business idea.',
      pt: 'Desenvolvimento de um Produto Mínimo Viável para validar sua ideia de negócio.'
    },
    priceRange: { min: 2500, max: 5000, currency: 'USD' },
    deliveryDays: { min: 30, max: 90 },
    includes: {
      es: ['Autenticación de usuarios', 'Base de datos escalable', 'Funcionalidades core personalizadas', 'Infraestructura cloud'],
      en: ['User authentication', 'Scalable database', 'Custom core features', 'Cloud infrastructure'],
      pt: ['Autenticação de usuários', 'Banco de dados escalável', 'Funcionalidades core personalizadas', 'Infraestrutura em nuvem']
    },
    upsells: ['mantenimiento-mensual', 'dashboard-admin'],
    idealFor: { 
      es: 'Startups y fundadores tecnológicos.', 
      en: 'Startups and tech founders.',
      pt: 'Startups e fundadores tecnológicos.'
    }
  },
  {
    id: 'dashboard-admin',
    name: { es: 'Dashboard / Panel admin', en: 'Admin Dashboard/Panel', pt: 'Dashboard / Painel admin' },
    description: {
      es: 'Herramienta interna para gestionar datos, usuarios y métricas de tu negocio.',
      en: 'Internal tool to manage data, users, and business metrics.',
      pt: 'Ferramenta interna para gerenciar dados, usuários e métricas do seu negócio.'
    },
    priceRange: { min: 1200, max: 3000, currency: 'USD' },
    deliveryDays: { min: 15, max: 45 },
    includes: {
      es: ['Gráficos interactivos', 'Gestión de roles', 'Exportación de datos', 'Integración con APIs'],
      en: ['Interactive charts', 'Role management', 'Data export', 'API integration'],
      pt: ['Gráficos interativos', 'Gestão de funções', 'Exportação de dados', 'Integração com APIs']
    },
    idealFor: { 
      es: 'Empresas que necesitan control operativo.', 
      en: 'Companies needing operational control.',
      pt: 'Empresas que precisam de controle operacional.'
    }
  },
  {
    id: 'seo-tecnico',
    name: { es: 'SEO Técnico', en: 'Technical SEO', pt: 'SEO Técnico' },
    description: {
      es: 'Optimización profunda para que tu sitio aparezca en los primeros resultados de Google.',
      en: 'Deep optimization for your site to rank on the first page of Google.',
      pt: 'Otimização profunda para que seu site apareça nos primeiros resultados do Google.'
    },
    priceRange: { min: 400, max: 800, currency: 'USD' },
    deliveryDays: { min: 7, max: 21 },
    includes: {
      es: ['Auditoría completa', 'Optimización de Core Web Vitals', 'Indexación avanzada', 'Sitemap y Robots.txt'],
      en: ['Full audit', 'Core Web Vitals optimization', 'Advanced indexing', 'Sitemap and Robots.txt'],
      pt: ['Auditoria completa', 'Otimização de Core Web Vitals', 'Indexação avançada', 'Sitemap e Robots.txt']
    },
    idealFor: { 
      es: 'Sitios que necesitan tráfico orgánico.', 
      en: 'Sites needing organic traffic.',
      pt: 'Sites que precisam de tráfego orgânico.'
    }
  },
  {
    id: 'optimizacion-performance',
    name: { es: 'Optimización de Performance', en: 'Performance Optimization', pt: 'Otimização de Performance' },
    description: {
      es: 'Hacemos que tu sitio vuele, mejorando la experiencia de usuario y el SEO.',
      en: 'We make your site fly, improving user experience and SEO.',
      pt: 'Fazemos seu site voar, melhorando a experiência do usuário e o SEO.'
    },
    priceRange: { min: 300, max: 700, currency: 'USD' },
    deliveryDays: { min: 3, max: 10 },
    includes: {
      es: ['Reducción de bundle size', 'Lazy loading avanzado', 'Optimización de imágenes', 'Configuración de CDN'],
      en: ['Bundle size reduction', 'Advanced lazy loading', 'Image optimization', 'CDN configuration'],
      pt: ['Redução do tamanho do bundle', 'Lazy loading avançado', 'Otimização de imagens', 'Configuração de CDN']
    },
    idealFor: { 
      es: 'Sitios lentos que pierden usuarios.', 
      en: 'Slow sites losing users.',
      pt: 'Sites lentos que perdem usuários.'
    }
  },
  {
    id: 'mantenimiento-mensual',
    name: { es: 'Mantenimiento mensual', en: 'Monthly Maintenance', pt: 'Manutenção mensal' },
    description: {
      es: 'Tranquilidad total con soporte continuo y actualizaciones de seguridad.',
      en: 'Total peace of mind with ongoing support and security updates.',
      pt: 'Tranquilidade total com suporte contínuo e atualizações de segurança.'
    },
    priceRange: { min: 300, max: 800, currency: 'USD' },
    deliveryDays: { min: 30, max: 30 },
    includes: {
      es: ['Backups diarios', 'Actualizaciones de seguridad', 'Soporte prioritario', 'Pequeños cambios mensuales'],
      en: ['Daily backups', 'Security updates', 'Priority support', 'Small monthly changes'],
      pt: ['Backups diários', 'Atualizações de segurança', 'Suporte prioritário', 'Pequenas mudanças mensais']
    },
    idealFor: { 
      es: 'Negocios que no quieren preocuparse por la técnica.', 
      en: 'Businesses not wanting to worry about tech.',
      pt: 'Negócios que não querem se preocupar com a técnica.'
    }
  },
  {
    id: 'landing-premium',
    name: { es: 'Landing de alta conversión', en: 'High-Conversion Landing Page', pt: 'Landing page de alta conversão' },
    description: {
      es: 'Paquete optimizado para resultados rápidos con diseño y copy persuasivo.',
      en: 'Package optimized for fast results with persuasive design and copy.',
      pt: 'Pacote otimizado para resultados rápidos com design e copy persuasivo.'
    },
    priceRange: { min: 600, max: 600, currency: 'USD' },
    deliveryDays: { min: 7, max: 7 },
    includes: {
      es: ['Diseño + Copy enfocado a venta', 'Setup de analíticas', '1 mes de mantenimiento incluido', 'Optimización de velocidad'],
      en: ['Design + Sales-focused copy', 'Analytics setup', '1 month of maintenance included', 'Speed optimization'],
      pt: ['Design + Copy focado em vendas', 'Setup de analíticas', '1 mês de manutenção incluída', 'Otimização de velocidade']
    },
    idealFor: { 
      es: 'Lanzamientos rápidos de productos o servicios.', 
      en: 'Fast product or service launches.',
      pt: 'Lançamentos rápidos de produtos ou serviços.'
    }
  },
  {
    id: 'mvp-startup-pack',
    name: { es: 'MVP Startup', en: 'Startup MVP', pt: 'MVP Startup' },
    description: {
      es: 'Todo lo necesario para validar tu idea de negocio en el mercado real.',
      en: 'Everything you need to validate your business idea in the real market.',
      pt: 'Tudo o que você precisa para validar sua ideia de negócio no mercado real.'
    },
    priceRange: { min: 2500, max: 2500, currency: 'USD' },
    deliveryDays: { min: 30, max: 45 },
    includes: {
      es: ['Autenticación + Base de Datos', 'CRUD completo de funcionalidades core', 'Dashboard administrativo', 'Despliegue con CI/CD automático'],
      en: ['Auth + Database', 'Full CRUD of core features', 'Admin dashboard', 'Deployment with automated CI/CD'],
      pt: ['Autenticação + Banco de Dados', 'CRUD completo de funcionalidades core', 'Dashboard administrativo', 'Implantação com CI/CD automático']
    },
    idealFor: { 
      es: 'Fundadores que necesitan validar ideas rápido.', 
      en: 'Founders who need to validate ideas fast.',
      pt: 'Fundadores que precisam validar ideias rapidamente.'
    }
  },
  {
    id: 'senior-retainer',
    name: { es: 'Soporte Senior Retainer', en: 'Senior Retainer Support', pt: 'Suporte Senior Retainer' },
    description: {
      es: 'Socio tecnológico a largo plazo para escalar tu aplicación existente.',
      en: 'Long-term tech partner to scale your existing application.',
      pt: 'Parceiro tecnológico de longo prazo para escalar sua aplicação existente.'
    },
    priceRange: { min: 500, max: 500, currency: 'USD/mes' },
    deliveryDays: { min: 30, max: 30 },
    includes: {
      es: ['10h de desarrollo mensual', 'Soporte técnico prioritario', 'Optimización continua', 'Consultoría estratégica'],
      en: ['10h of monthly development', 'Priority technical support', 'Continuous optimization', 'Strategic consulting'],
      pt: ['10h de desenvolvimento mensal', 'Suporte técnico prioritário', 'Otimização contínua', 'Consultoria estratégica']
    },
    idealFor: { 
      es: 'Empresas que ya tienen una app y quieren crecer.', 
      en: 'Companies that already have an app and want to grow.',
      pt: 'Empresas que já têm um app e querem crescer.'
    }
  }
];
