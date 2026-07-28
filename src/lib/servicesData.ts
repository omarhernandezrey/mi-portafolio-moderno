// /lib/servicesData.ts

export interface Service {
  title: {
    es: string;
    en: string;
    pt: string;
  };
  description: {
    es: string;
    en: string;
    pt: string;
  };
  icon: string;
  badge: string;
  features: {
    es: string[];
    en: string[];
    pt: string[];
  };
  gradient: string;
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
}

export const servicesData: Service[] = [
  {
    title: {
      es: "Sitios Web Profesionales",
      en: "Professional Websites",
      pt: "Sites Profissionais"
    },
    description: {
      es: "Tu negocio necesita una página web que venda, no solo que exista. Diseño sitios rápidos, optimizados para Google y que convierten visitantes en clientes.",
      en: "Your business needs a website that sells, not just exists. I design fast, Google-optimized sites that turn visitors into paying clients.",
      pt: "Seu negócio precisa de um site que vende, não apenas existe. Crio sites rápidos, otimizados para Google e que convertem visitantes em clientes."
    },
    icon: "/images/services/frontend.svg",
    badge: "WEB",
    features: {
      es: [
        "Diseño orientado a conversión",
        "Carga en menos de 2 segundos",
        "Optimizado para Google (SEO)",
        "Panel para que edites tú mismo"
      ],
      en: [
        "Conversion-focused design",
        "Loads in under 2 seconds",
        "Google-optimized (SEO)",
        "Admin panel for easy editing"
      ],
      pt: [
        "Design focado em conversão",
        "Carrega em menos de 2 segundos",
        "Otimizado para Google (SEO)",
        "Painel administrativo intuitivo"
      ]
    },
    gradient: "from-blue-500 to-cyan-500",
    priceRange: {
      min: 300,
      max: 3800,
      currency: "USD"
    }
  },
  {
    title: {
      es: "Aplicaciones Web a Medida",
      en: "Custom Web Applications",
      pt: "Aplicações Web Personalizadas"
    },
    description: {
      es: "¿Tu negocio necesita algo más que una página web? Construyo aplicaciones web completas con bases de datos, autenticación y funcionalidades específicas para tu operación.",
      en: "Need more than a website? I build complete web applications with databases, authentication, and custom features tailored to your business operations.",
      pt: "Precisa de mais que um site? Construo aplicações web completas com bancos de dados, autenticação e funcionalidades personalizadas para sua operação."
    },
    icon: "/images/services/backend.svg",
    badge: "APP",
    features: {
      es: [
        "Sistemas de gestión internos",
        "Dashboards con datos en tiempo real",
        "Autenticación segura de usuarios",
        "APIs para conectar con otros sistemas"
      ],
      en: [
        "Internal management systems",
        "Real-time data dashboards",
        "Secure user authentication",
        "APIs to connect with other systems"
      ],
      pt: [
        "Sistemas de gestão internos",
        "Dashboards com dados em tempo real",
        "Autenticação segura de usuários",
        "APIs para conectar com outros sistemas"
      ]
    },
    gradient: "from-green-500 to-emerald-500",
    priceRange: {
      min: 800,
      max: 5000,
      currency: "USD"
    }
  },
  {
    title: {
      es: "Tiendas Online (E-commerce)",
      en: "Online Stores (E-commerce)",
      pt: "Lojas Online (E-commerce)"
    },
    description: {
      es: "Vende tus productos online con una tienda profesional. Integro pasarelas de pago (Wompi, Stripe, PayPal), gestión de inventario y todo lo necesario para que empieces a facturar.",
      en: "Sell your products online with a professional store. I integrate payment gateways (Stripe, PayPal), inventory management, and everything you need to start making sales.",
      pt: "Venda seus produtos online com uma loja profissional. Integro gateways de pagamento (Stripe, PayPal), gestão de estoque e tudo que precisa para começar a faturar."
    },
    icon: "/images/services/design.svg",
    badge: "SHOP",
    features: {
      es: [
        "Pagos con tarjeta, PSE y Nequi",
        "Gestión de productos e inventario",
        "Diseño que genera confianza para comprar",
        "Panel administrativo intuitivo"
      ],
      en: [
        "Credit card, PayPal and Stripe payments",
        "Product and inventory management",
        "Trust-building design that drives sales",
        "Intuitive admin dashboard"
      ],
      pt: [
        "Pagamentos com cartão, PayPal e Stripe",
        "Gestão de produtos e estoque",
        "Design que gera confiança para comprar",
        "Painel administrativo intuitivo"
      ]
    },
    gradient: "from-purple-500 to-pink-500",
    priceRange: {
      min: 1500,
      max: 5000,
      currency: "USD"
    }
  },
  {
    title: {
      es: "Automatización y SEO",
      en: "Automation & SEO",
      pt: "Automação e SEO"
    },
    description: {
      es: "Elimina tareas repetitivas y haz que Google te encuentre. Automatizo procesos de tu negocio y optimizo tu sitio para que aparezca en los primeros resultados de búsqueda.",
      en: "Eliminate repetitive tasks and get found on Google. I automate your business processes and optimize your site to rank on the first page of search results.",
      pt: "Elimine tarefas repetitivas e apareça no Google. Automatizo processos do seu negócio e otimizo seu site para aparecer nas primeiras posições de busca."
    },
    icon: "/images/services/devops.svg",
    badge: "AUTO",
    features: {
      es: [
        "Automatización de reportes y procesos",
        "Integración entre tus herramientas",
        "Optimización para Google (SEO técnico)",
        "Mejora de velocidad de carga"
      ],
      en: [
        "Automated reports and workflows",
        "Integration between your tools",
        "Google optimization (technical SEO)",
        "Page speed improvement"
      ],
      pt: [
        "Automação de relatórios e processos",
        "Integração entre suas ferramentas",
        "Otimização para Google (SEO técnico)",
        "Melhoria de velocidade de carregamento"
      ]
    },
    gradient: "from-orange-500 to-red-500",
    priceRange: {
      min: 300,
      max: 2500,
      currency: "USD"
    }
  },
];

// Función para obtener datos de servicios localizados
export const getLocalizedServicesData = (servicesData: Service[], language: string) => {
  const lang = language as 'es' | 'en' | 'pt';

  return servicesData.map(service => ({
    title: service.title[lang] || service.title.es,
    description: service.description[lang] || service.description.es,
    icon: service.icon,
    badge: service.badge,
    features: service.features[lang] || service.features.es,
    gradient: service.gradient,
    priceRange: service.priceRange,
  }));
};