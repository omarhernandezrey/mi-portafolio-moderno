// /lib/servicesData.ts

export interface Service {
  title: {
    es: string;
    en: string;
  };
  description: {
    es: string;
    en: string;
  };
  icon: string;
  features: {
    es: string[];
    en: string[];
  };
  gradient: string;
}

export const servicesData: Service[] = [
  {
    title: {
      es: "Desarrollo Frontend",
      en: "Frontend Development"
    },
    description: {
      es: "Creando interfaces de usuario modernas y responsivas usando tecnologías como React y Next.js.",
      en: "Creating modern, responsive user interfaces using technologies like React and Next.js."
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
      ]
    },
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: {
      es: "Desarrollo Backend",
      en: "Backend Development"
    },
    description: {
      es: "Construyendo APIs robustas y escalables con Node.js, Express y bases de datos SQL/NoSQL.",
      en: "Building robust, scalable APIs with Node.js, Express, and SQL/NoSQL databases."
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
      ]
    },
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: {
      es: "Diseño UI/UX",
      en: "UI/UX Design"
    },
    description: {
      es: "Prototipos funcionales y diseño enfocado en mejorar la experiencia del usuario.",
      en: "Functional prototypes and design focused on enhancing user experience."
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
      ]
    },
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: {
      es: "Implementación DevOps",
      en: "DevOps Implementation"
    },
    description: {
      es: "Automatizando despliegues y manteniendo infraestructura en la nube.",
      en: "Automating deployments and maintaining cloud infrastructure."
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
      ]
    },
    gradient: "from-orange-500 to-red-500",
  },
];

// Función para obtener datos de servicios localizados
export const getLocalizedServicesData = (servicesData: Service[], language: string) => {
  const lang = language as 'es' | 'en';
  
  return servicesData.map(service => ({
    title: service.title[lang] || service.title.es,
    description: service.description[lang] || service.description.es,
    icon: service.icon,
    features: service.features[lang] || service.features.es,
    gradient: service.gradient,
  }));
};