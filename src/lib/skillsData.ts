// /lib/skillsData.ts

export interface Skill {
  name: {
    es: string;
    en: string;
    pt: string;
  };
  percentage: string;
  colorHex: string;
  icon: string;
  description: {
    es: string;
    en: string;
    pt: string;
  };
  category: {
    es: string;
    en: string;
    pt: string;
  };
}

export const skillsData: Skill[] = [
  {
    name: {
      es: "HTML5",
      en: "HTML5",
      pt: "HTML5"
    },
    percentage: "95%",
    colorHex: "#FF6D00",
    icon: "/images/logos/html.svg",
    description: {
      es: "Estructuras semánticas y optimizadas para SEO y accesibilidad.",
      en: "Semantic structures optimized for SEO and accessibility.",
      pt: "Estruturas semânticas e otimizadas para SEO e acessibilidade."
    },
    category: {
      es: "Frontend",
      en: "Frontend",
      pt: "Frontend"
    },
  },
  {
    name: {
      es: "CSS3/Sass",
      en: "CSS3/Sass",
      pt: "CSS3/Sass"
    },
    percentage: "92%",
    colorHex: "#2965F1",
    icon: "/images/logos/css.svg",
    description: {
      es: "Diseños responsive, animaciones CSS y arquitectura escalable.",
      en: "Responsive designs, CSS animations and scalable architecture.",
      pt: "Designs responsivos, animações CSS e arquitetura escalável."
    },
    category: {
      es: "Frontend",
      en: "Frontend",
      pt: "Frontend"
    },
  },
  {
    name: {
      es: "JavaScript",
      en: "JavaScript",
      pt: "JavaScript"
    },
    percentage: "98%",
    colorHex: "#F0DB4F",
    icon: "/images/logos/javascript.svg",
    description: {
      es: "ES6+, patrones avanzados y optimización de performance.",
      en: "ES6+, advanced patterns and performance optimization.",
      pt: "ES6+, padrões avançados e otimização de performance."
    },
    category: {
      es: "Frontend",
      en: "Frontend",
      pt: "Frontend"
    },
  },
  {
    name: {
      es: "TypeScript",
      en: "TypeScript",
      pt: "TypeScript"
    },
    percentage: "90%",
    colorHex: "#007ACC",
    icon: "/images/logos/typescript.svg",
    description: {
      es: "Tipado estático para aplicaciones empresariales escalables.",
      en: "Static typing for scalable enterprise applications.",
      pt: "Tipagem estática para aplicações empresariais escaláveis."
    },
    category: {
      es: "Frontend",
      en: "Frontend",
      pt: "Frontend"
    },
  },
  {
    name: {
      es: "React/Next.js",
      en: "React/Next.js",
      pt: "React/Next.js"
    },
    percentage: "96%",
    colorHex: "#61DAFB",
    icon: "/images/logos/react.svg",
    description: {
      es: "Aplicaciones SSR, ISR y estáticas optimizadas.",
      en: "SSR, ISR and optimized static applications.",
      pt: "Aplicações SSR, ISR e estáticas otimizadas."
    },
    category: {
      es: "Frontend",
      en: "Frontend",
      pt: "Frontend"
    },
  },
  {
    name: {
      es: "Node.js",
      en: "Node.js",
      pt: "Node.js"
    },
    percentage: "88%",
    colorHex: "#68A063",
    icon: "/images/logos/nodejs.svg",
    description: {
      es: "APIs REST/GraphQL, microservicios y autenticación JWT.",
      en: "REST/GraphQL APIs, microservices and JWT authentication.",
      pt: "APIs REST/GraphQL, microsserviços e autenticação JWT."
    },
    category: {
      es: "Backend",
      en: "Backend",
      pt: "Backend"
    },
  },
  {
    name: {
      es: "Diseño UI/UX",
      en: "UI/UX Design",
      pt: "Design UI/UX"
    },
    percentage: "85%",
    colorHex: "#FF4081",
    icon: "/images/logos/figma.svg",
    description: {
      es: "Diseño de interfaces centrado en la experiencia de usuario.",
      en: "User-centered interface design focused on user experience.",
      pt: "Design de interfaces focado na experiência do usuário."
    },
    category: {
      es: "Diseño",
      en: "Design",
      pt: "Design"
    },
  },
  {
    name: {
      es: "Arquitectura en la Nube",
      en: "Cloud Architecture",
      pt: "Arquitetura em Nuvem"
    },
    percentage: "82%",
    colorHex: "#4285F4",
    icon: "/images/logos/aws.svg",
    description: {
      es: "Infraestructura escalable en AWS, GCP y Azure.",
      en: "Scalable infrastructure on AWS, GCP and Azure.",
      pt: "Infraestrutura escalável em AWS, GCP e Azure."
    },
    category: {
      es: "DevOps",
      en: "DevOps",
      pt: "DevOps"
    },
  },
];

// Función para obtener datos de skills localizados
export const getLocalizedSkillsData = (skillsData: Skill[], language: string) => {
  const lang = language as 'es' | 'en' | 'pt';

  return skillsData.map(skill => ({
    name: skill.name[lang] || skill.name.es,
    percentage: skill.percentage,
    colorHex: skill.colorHex,
    icon: skill.icon,
    description: skill.description[lang] || skill.description.es,
    category: skill.category[lang] || skill.category.es,
  }));
};

// Función para obtener categorías únicas localizadas
export const getLocalizedCategories = (skillsData: Skill[], language: string): string[] => {
  const lang = language as 'es' | 'en' | 'pt';
  const categories = skillsData.map(skill => skill.category[lang] || skill.category.es);
  return Array.from(new Set(categories));
};