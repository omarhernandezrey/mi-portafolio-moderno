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
      es: "Desarrollo Frontend",
      en: "Frontend Development",
      pt: "Desenvolvimento Frontend"
    },
    description: {
      es: "Creando interfaces de usuario modernas y responsivas usando tecnologías como React y Next.js.",
      en: "Creating modern, responsive user interfaces using technologies like React and Next.js.",
      pt: "Criando interfaces de usuário modernas e responsivas usando tecnologias como React e Next.js."
    },
    icon: "/images/services/frontend.svg",
    features: {
      es: [
        "React & Next.js",
        "TypeScript",
        "Diseño Responsivo",
        "Optimización de Rendimiento"
      ],
      en: [
        "React & Next.js",
        "TypeScript",
        "Responsive Design",
        "Performance Optimization"
      ],
      pt: [
        "React & Next.js",
        "TypeScript",
        "Design Responsivo",
        "Otimização de Performance"
      ]
    },
    gradient: "from-blue-500 to-cyan-500",
    priceRange: {
      min: 250,
      max: 1800,
      currency: "USD"
    }
  },
  {
    title: {
      es: "Desarrollo Backend",
      en: "Backend Development",
      pt: "Desenvolvimento Backend"
    },
    description: {
      es: "Construyendo APIs robustas y escalables con Node.js, Express y bases de datos SQL/NoSQL.",
      en: "Building robust, scalable APIs with Node.js, Express, and SQL/NoSQL databases.",
      pt: "Construindo APIs robustas e escaláveis com Node.js, Express e bancos de dados SQL/NoSQL."
    },
    icon: "/images/services/backend.svg",
    features: {
      es: [
        "Node.js & Express",
        "Diseño de Bases de Datos",
        "Desarrollo de APIs",
        "Microservicios"
      ],
      en: [
        "Node.js & Express",
        "Database Design",
        "API Development",
        "Microservices"
      ],
      pt: [
        "Node.js & Express",
        "Design de Banco de Dados",
        "Desenvolvimento de APIs",
        "Microsserviços"
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
      es: "Diseño UI/UX",
      en: "UI/UX Design",
      pt: "Design UI/UX"
    },
    description: {
      es: "Prototipos funcionales y diseño enfocado en mejorar la experiencia del usuario.",
      en: "Functional prototypes and design focused on enhancing user experience.",
      pt: "Protótipos funcionais e design focado em melhorar a experiência do usuário."
    },
    icon: "/images/services/design.svg",
    features: {
      es: [
        "Investigación de Usuario",
        "Wireframing",
        "Prototipado",
        "Sistemas de Diseño"
      ],
      en: [
        "User Research",
        "Wireframing",
        "Prototyping",
        "Design Systems"
      ],
      pt: [
        "Pesquisa de Usuário",
        "Wireframing",
        "Prototipagem",
        "Sistemas de Design"
      ]
    },
    gradient: "from-purple-500 to-pink-500",
    priceRange: {
      min: 300,
      max: 2000,
      currency: "USD"
    }
  },
  {
    title: {
      es: "Implementación DevOps",
      en: "DevOps Implementation",
      pt: "Implementação DevOps"
    },
    description: {
      es: "Automatizando despliegues y manteniendo infraestructura en la nube.",
      en: "Automating deployments and maintaining cloud infrastructure.",
      pt: "Automatizando deploys e mantendo infraestrutura na nuvem."
    },
    icon: "/images/services/devops.svg",
    features: {
      es: [
        "Pipelines CI/CD",
        "Infraestructura en la Nube",
        "Orquestación de Contenedores",
        "Monitoreo"
      ],
      en: [
        "CI/CD Pipelines",
        "Cloud Infrastructure",
        "Container Orchestration",
        "Monitoring"
      ],
      pt: [
        "Pipelines CI/CD",
        "Infraestrutura na Nuvem",
        "Orquestração de Containers",
        "Monitoramento"
      ]
    },
    gradient: "from-orange-500 to-red-500",
    priceRange: {
      min: 500,
      max: 3000,
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
    features: service.features[lang] || service.features.es,
    gradient: service.gradient,
    priceRange: service.priceRange,
  }));
};