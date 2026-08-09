// /lib/servicesData.ts

export interface Service {
  title: {
    es: string;
    en: string
  };
  description: {
    es: string;
    en: string
  };
  icon: string;
  badge: string;
  features: {
    es: string[];
    en: string[]
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
      en: "Professional Websites"
    },
    description: {
      es: "Tu negocio necesita una página web que venda, no solo que exista. Diseño sitios rápidos, optimizados para Google y que convierten visitantes en clientes.",
      en: "Your business needs a website that sells, not just exists. I design fast, Google-optimized sites that turn visitors into paying clients."
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
      en: "Custom Web Applications"
    },
    description: {
      es: "¿Tu negocio necesita algo más que una página web? Construyo aplicaciones web completas con bases de datos, autenticación y funcionalidades específicas para tu operación.",
      en: "Need more than a website? I build complete web applications with databases, authentication, and custom features tailored to your business operations."
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
      en: "Online Stores (E-commerce)"
    },
    description: {
      es: "Vende tus productos online con una tienda profesional. Integro pasarelas de pago (Wompi, Stripe, PayPal), gestión de inventario y todo lo necesario para que empieces a facturar.",
      en: "Sell your products online with a professional store. I integrate payment gateways (Stripe, PayPal), inventory management, and everything you need to start making sales."
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
      en: "Automation & SEO"
    },
    description: {
      es: "Elimina tareas repetitivas y haz que Google te encuentre. Automatizo procesos de tu negocio y optimizo tu sitio para que aparezca en los primeros resultados de búsqueda.",
      en: "Eliminate repetitive tasks and get found on Google. I automate your business processes and optimize your site to rank on the first page of search results."
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
  const lang = language as 'es' | 'en';

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