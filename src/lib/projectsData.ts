// /lib/projectsData.ts

export interface Project {
  title: {
    es: string;
    en: string;
  };
  description: {
    es: string;
    en: string;
  };
  technologies: string[];
  repository: string;
  demo: string;
  category: {
    es: string;
    en: string;
  };
}

export const projectsData: Project[] = [
      {
      title: {
        es: "Lanyard 3D - Componente Interactivo con Física",
        en: "Lanyard 3D - Interactive Physics Component"
      },
      description: {
        es: "Componente 3D ultra-realista de lanyard con física avanzada usando Three.js, React y Rapier. Simulación realista, renderizado PBR, interacción intuitiva y diseño responsive.",
        en: "Ultra-realistic 3D lanyard component with advanced physics using Three.js, React, and Rapier. Real-time simulation, PBR rendering, intuitive interaction, and responsive design."
      },
      technologies: [
        "Next.js",
        "React",
        "TypeScript",
        "Three.js",
        "Rapier",
        "@react-three/fiber",
        "@react-three/drei",
        "@react-three/rapier",
        "Tailwind CSS"
      ],
      repository: "https://github.com/omarhernandezrey/lanyard-project", // <-- actualízalo si es privado o cambiará
      demo: "https://lanyard-project.vercel.app/",
      category: {
        es: "3D Interactivo",
        en: "Interactive 3D"
      }
    },
    {
    title: {
      es: "Product Card - Proyecto con Web Components",
      en: "Product Card - Web Components Project"
    },
    description: {
      es: "Tarjeta de producto moderna creada con Web Components nativos usando JavaScript vanilla. Componente completamente encapsulado, reutilizable, con diseño responsive y estilos modernos.",
      en: "Modern product card built with native Web Components using vanilla JavaScript. Fully encapsulated, reusable component with responsive layout and modern styles."
    },
    technologies: ["HTML", "CSS", "JavaScript", "Web Components", "Vercel, netlify"],
    repository: "https://github.com/omarhernandezrey/32proyectoCursoDeJavaScriptWebComponents",
    demo: "https://32proyectocursodejavascriptwebcompone.netlify.app/",
    category: {
      es: "Web Components",
      en: "Web Components"
    }
  },
  {
    title: {
      es: "CineXpress - API REST con JavaScript",
      en: "CineXpress - REST API with JavaScript"
    },
    description: {
      es: "Explora películas en tendencia, búsquedas por categoría o nombre y detalles completos consumiendo TMDB API.",
      en: "Explore trending movies, search by category or name and get complete details consuming TMDB API."
    },
    technologies: ["HTML", "CSS", "JavaScript", "Axios", "Vercel"],
    repository: "https://github.com/omarhernandezrey/31-cursoDeApiRestConJavascriptEjemplosConApisReales",
    demo: "https://cinexpressonline.vercel.app/",
    category: {
      es: "JavaScript",
      en: "JavaScript"
    },
  },
  {
    title: {
      es: "Michis App - API REST con JavaScript",
      en: "Michis App - REST API with JavaScript"
    },
    description: {
      es: "Guarda y sube imágenes de gatitos usando The Cat API. Proyecto de fundamentos de API REST.",
      en: "Save and upload cat images using The Cat API. REST API fundamentals project."
    },
    technologies: ["HTML", "CSS", "JavaScript", "Fetch", "Axios"],
    repository: "https://github.com/omarhernandezrey/30_cursoDeApiRestConJavascriptFundamentos",
    demo: "https://michis-app-api-rest.netlify.app/",
    category: {
      es: "JavaScript",
      en: "JavaScript"
    },
  },
  {
    title: {
      es: "Página Web Enfermería Roxana",
      en: "Nursing Roxana Website"
    },
    description: {
      es: "Plataforma moderna y responsiva para promover servicios profesionales de enfermería.",
      en: "Modern and responsive platform to promote professional nursing services."
    },
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
    repository: "https://github.com/omarhernandezrey/enfermeriaroxanapag",
    demo: "https://enfermeria-roxana.vercel.app/inicio",
    category: {
      es: "Next.js",
      en: "Next.js"
    },
  },
  {
    title: {
      es: "Your Restaurant",
      en: "Your Restaurant"
    },
    description: {
      es: "Sitio web de restaurante con CSS Grid, diseño responsivo y presentación de menús atractivos.",
      en: "Restaurant website with CSS Grid, responsive design and attractive menu presentation."
    },
    technologies: ["HTML", "CSS", "CSS Grid"],
    repository: "https://github.com/omarhernandezrey/38-Curso-de-CSS-Grid-B-sico.io",
    demo: "https://omarhernandezrey.github.io/38-Curso-de-CSS-Grid-B-sico.io/",
    category: {
      es: "CSS",
      en: "CSS"
    },
  },
  {
    title: {
      es: "Steam - Hamburguesas Artesanales",
      en: "Steam - Artisan Burgers"
    },
    description: {
      es: "Landing para hamburguesas artesanales con secciones de menú, promociones y contacto.",
      en: "Landing page for artisan burgers with menu sections, promotions and contact."
    },
    technologies: ["HTML", "CSS"],
    repository: "https://github.com/omarhernandezrey/36-Curso-de-Dise-o-para-Developers-html.io",
    demo: "https://omarhernandezrey.github.io/36-Curso-de-Dise-o-para-Developers-html.io/",
    category: {
      es: "CSS",
      en: "CSS"
    },
  },
  {
    title: {
      es: "Eco-store",
      en: "Eco-store"
    },
    description: {
      es: "Tienda ecológica con categorías de cuidado personal y decoración sostenible.",
      en: "Ecological store with personal care categories and sustainable decoration."
    },
    technologies: ["HTML", "CSS", "SCSS", "Flexbox"],
    repository: "https://github.com/omarhernandezrey/35-Curso-de-Fundamentos-de-Sass.io",
    demo: "https://omarhernandezrey.github.io/35-Curso-de-Fundamentos-de-Sass.io/",
    category: {
      es: "CSS",
      en: "CSS"
    },
  },
  {
    title: {
      es: "Batatabit",
      en: "Batatabit"
    },
    description: {
      es: "Landing responsive Mobile-First para precios y tendencias de criptomonedas.",
      en: "Mobile-First responsive landing for cryptocurrency prices and trends."
    },
    technologies: ["HTML", "CSS", "Responsive Design"],
    repository: "https://github.com/omarhernandezrey/34-Curso-de-Responsive-Design-Maquetaci-n-Mobile-First.io",
    demo: "https://omarhernandezrey.github.io/34-Curso-de-Responsive-Design-Maquetaci-n-Mobile-First.io/",
    category: {
      es: "CSS",
      en: "CSS"
    },
  },
  {
    title: {
      es: "E-commerce Next.js",
      en: "E-commerce Next.js"
    },
    description: {
      es: "E-commerce con carrito, pagos y contacto, desarrollado en Next.js + Tailwind.",
      en: "E-commerce with cart, payments and contact, developed in Next.js + Tailwind."
    },
    technologies: ["Next.js", "Tailwind CSS", "TypeScript", "Vercel"],
    repository: "https://github.com/omarhernandezrey/tienda_Lizz.io",
    demo: "https://tienda-lizz-io.vercel.app/",
    category: {
      es: "Next.js",
      en: "Next.js"
    },
  },
  {
    title: {
      es: "Gestor de Tareas",
      en: "Task Manager App"
    },
    description: {
      es: "Gestor de tareas con CRUD y persistencia en localStorage, dark/light mode.",
      en: "Task manager with CRUD and localStorage persistence, dark/light mode."
    },
    technologies: ["HTML", "CSS", "JavaScript", "localStorage"],
    repository: "https://github.com/omarhernandezrey/46-Task-Manager",
    demo: "https://omarhernandezrey.github.io/46-Task-Manager/",
    category: {
      es: "JavaScript",
      en: "JavaScript"
    },
  },
  {
    title: {
      es: "Clon de Google Chrome",
      en: "Google Chrome Clone"
    },
    description: {
      es: "Réplica sencilla de la portada de Google con HTML y CSS puros.",
      en: "Simple replica of Google homepage with pure HTML and CSS."
    },
    technologies: ["HTML", "CSS"],
    repository: "https://github.com/omarhernandezrey/33-Google-Chrome-Clone.io",
    demo: "https://omarhernandezrey.github.io/33-Google-Chrome-Clone.io/",
    category: {
      es: "CSS",
      en: "CSS"
    },
  },
  {
    title: {
      es: "Plan de Comidas Semanal",
      en: "Weekly Meal Plan"
    },
    description: {
      es: "App para organizar un menú semanal de forma sencilla y visual.",
      en: "App to organize a weekly menu in a simple and visual way."
    },
    technologies: ["HTML", "CSS", "JavaScript"],
    repository: "https://github.com/omarhernandezrey/31.1--comidasDeLaSemana.io",
    demo: "https://omarhernandezrey.github.io/31.1--comidasDeLaSemana.io/",
    category: {
      es: "JavaScript",
      en: "JavaScript"
    },
  },
  {
    title: {
      es: "Pagar Recibos",
      en: "Pay Bills"
    },
    description: {
      es: "Gestión básica de pagos de servicios con interfaz intuitiva.",
      en: "Basic utility payment management with intuitive interface."
    },
    technologies: ["HTML", "CSS", "JavaScript"],
    repository: "https://github.com/omarhernandezrey/28.1-PagarRecibos.io",
    demo: "https://omarhernandezrey.github.io/28.1-PagarRecibos.io/",
    category: {
      es: "JavaScript",
      en: "JavaScript"
    },
  },
  {
    title: {
      es: "Calculadora de Pago de Turnos",
      en: "Shift Payment Calculator"
    },
    description: {
      es: "Calcula pagos de turnos de enfermería con calendario interactivo.",
      en: "Calculate nursing shift payments with interactive calendar."
    },
    technologies: ["HTML", "CSS", "JavaScript"],
    repository: "https://github.com/omarhernandezrey/07.1-calculadoraDePagoTurnosEmfermeria.github.io",
    demo: "https://omarhernandezrey.github.io/07.1-calculadoraDePagoTurnosEmfermeria.github.io/",
    category: {
      es: "JavaScript",
      en: "JavaScript"
    },
  },
  {
    title: {
      es: "Async Landing",
      en: "Async Landing"
    },
    description: {
      es: "Landing personal con integración de contenido dinámico mediante APIs.",
      en: "Personal landing with dynamic content integration through APIs."
    },
    technologies: ["HTML", "JavaScript"],
    repository: "https://github.com/omarhernandezrey/22.1_async-landing",
    demo: "https://omarhernandezrey.github.io/22.1_async-landing/",
    category: {
      es: "JavaScript",
      en: "JavaScript"
    },
  },
  {
    title: {
      es: "Frontend Developer JS Práctico",
      en: "Practical JS Frontend Developer"
    },
    description: {
      es: "E-commerce con carrito y navegación responsive, proyecto práctico.",
      en: "E-commerce with cart and responsive navigation, practical project."
    },
    technologies: ["HTML", "CSS", "JavaScript"],
    repository: "https://github.com/omarhernandezrey/18-curso-frontend-developer-javascript-practico.io",
    demo: "https://omarhernandezrey.github.io/18-curso-frontend-developer-javascript-practico.io/",
    category: {
      es: "JavaScript",
      en: "JavaScript"
    },
  },
  {
    title: {
      es: "Portafolio Personal",
      en: "Personal Portfolio"
    },
    description: {
      es: "Portafolio para destacar experiencia, skills y proyectos de desarrollo.",
      en: "Portfolio to highlight experience, skills and development projects."
    },
    technologies: ["HTML", "CSS", "JavaScript"],
    repository: "https://github.com/omarhernandezrey/07-portafolio.github.io",
    demo: "https://omarhernandezrey.github.io/07-portafolio.github.io/",
    category: {
      es: "CSS",
      en: "CSS"
    },
  },
];

// Función para obtener datos de proyectos localizados
export const getLocalizedProjectsData = (projectsData: Project[], language: string) => {
  const lang = language as 'es' | 'en';
  
  return projectsData.map(project => ({
    title: project.title[lang] || project.title.es,
    description: project.description[lang] || project.description.es,
    technologies: project.technologies,
    repository: project.repository,
    demo: project.demo,
    category: project.category[lang] || project.category.es,
  }));
};

// Función para obtener categorías únicas localizadas
export const getLocalizedProjectCategories = (projectsData: Project[], language: string): string[] => {
  const lang = language as 'es' | 'en';
  const categories = projectsData.map(project => project.category[lang] || project.category.es);
  return Array.from(new Set(categories));
};