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
  features?: {
    es: string[];
    en: string[];
  };
  highlights?: {
    es: string[];
    en: string[];
  };
  architecture?: {
    es: {
      description: string;
      layers: string[];
    };
    en: {
      description: string;
      layers: string[];
    };
  };
}

export const projectsData: Project[] = [
  {
  "title": {
    "es": "Gestor de Tareas Profesional - TODO App con Patrones Avanzados de React",
    "en": "Professional Task Manager - TODO App with Advanced React Patterns"
  },
  "description": {
    "es": "Aplicación moderna y completa de gestión de tareas construida con React 18 y Zustand. Incluye sistema avanzado de recordatorios con alertas de audio, dashboard estadístico, subtareas anidadas, etiquetado por colores, notas enriquecidas, timer Pomodoro, persistencia en localStorage, temas claro/oscuro, animaciones suaves y diseño responsive Mobile-First para máxima productividad.",
    "en": "Modern and complete task management application built with React 18 and Zustand. Features advanced reminder system with audio alerts, statistical dashboard, nested subtasks, color-coded tagging, enriched notes, Pomodoro timer, localStorage persistence, light/dark themes, smooth animations and responsive Mobile-First design for maximum productivity."
  },
  "technologies": [
    "React",
    "JavaScript",
    "HTML",
    "CSS",
    "Vercel"
  ],
  "repository": "https://github.com/omarhernandezrey/57-curso-react-patrones-render",
  "demo": "https://57-curso-react-patrones-render.vercel.app",
  "category": {
    "es": "Productividad & Gestión",
    "en": "Productivity & Management"
  },
  "features": {
    "es": [
      "✅ CRUD Completo de Tareas: Crear, leer, actualizar y eliminar con validaciones",
      "🎯 Estados de Tarea: Completadas, activas, atrasadas con indicadores visuales",
      "⭐ Sistema de Prioridades: Alta, Media, Baja con códigos de color diferenciados",
      "📅 Fechas de Vencimiento: Establecer y seguimiento automático de tareas atrasadas",
      "🏷️ Categorías Personalizadas: Organiza tareas por contexto (Trabajo, Personal, Estudio)",
      "🔔 Sistema Avanzado de Recordatorios: Fecha/hora específica con alertas modales",
      "🔊 Alertas de Audio: Web Audio API generando sonido persistente cada 3 segundos",
      "🎚️ Control de Sonido: Toggle para silenciar alertas sin cerrar el modal",
      "📊 Dashboard de Estadísticas: Total, completadas, activas, atrasadas en tiempo real",
      "📈 Gráficos Estadísticos: Distribución por prioridad y progreso visual",
      "📝 Notas y Descripciones: Texto enriquecido para cada tarea",
      "📋 Sistema de Subtareas: Tareas anidadas con progreso individual",
      "⏲️ Timer Pomodoro Integrado: Sesiones de 25 min, pausa, reanuda, contador de sesiones",
      "🏷️ Etiquetas Múltiples: 8 colores diferentes para categorizar por temas",
      "🔍 Búsqueda Inteligente: Filtro en tiempo real por título y descripción",
      "🗂️ Filtros Avanzados: Por estado, categoría, prioridad, etiqueta y fecha",
      "↕️ Ordenamiento Dinámico: Por fecha, prioridad, alfabético, estado",
      "🎨 Tema Oscuro/Claro: Toggle persistente con CSS variables",
      "📱 Diseño Responsive: Mobile-First (móvil, tablet, desktop)",
      "💾 Persistencia Automática: localStorage con sincronización en tiempo real",
      "⚡ Estado Global con Zustand: Ligero, rápido y escalable",
      "🎬 Animaciones Suaves: Framer Motion con transiciones profesionales",
      "🚨 Diálogos de Confirmación: Modal para acciones destructivas",
      "🎯 Rutas Protegidas: Navegación intuitiva con React Router",
      "♿ Accesibilidad Web: ARIA labels, semantic HTML, navegación por teclado",
      "📴 Modo Offline: Funciona completamente sin conexión a internet",
      "🎪 UI Profesional: Badges, gradientes, shadows e iconografía personalizada",
      "⚡ Performance Optimizado: Code splitting, lazy loading, memoización",
      "📤 Exportación de Datos: Descarga historial de tareas en JSON",
      "🔄 Sincronización: Actualizaciones en tiempo real entre componentes"
    ],
    "en": [
      "✅ Complete CRUD Tasks: Create, read, update and delete with validations",
      "🎯 Task States: Completed, active, overdue with visual indicators",
      "⭐ Priority System: High, Medium, Low with differentiated color codes",
      "📅 Due Dates: Set and automatic tracking of overdue tasks",
      "🏷️ Custom Categories: Organize tasks by context (Work, Personal, Study)",
      "🔔 Advanced Reminder System: Specific date/time with modal alerts",
      "🔊 Audio Alerts: Web Audio API generating persistent sound every 3 seconds",
      "🎚️ Sound Control: Toggle to mute alerts without closing the modal",
      "📊 Statistics Dashboard: Total, completed, active, overdue in real-time",
      "📈 Statistical Charts: Distribution by priority and visual progress",
      "📝 Notes and Descriptions: Rich text for each task",
      "📋 Subtasks System: Nested tasks with individual progress",
      "⏲️ Integrated Pomodoro Timer: 25 min sessions, pause, resume, session counter",
      "🏷️ Multiple Tags: 8 different colors for categorizing by themes",
      "🔍 Intelligent Search: Real-time filter by title and description",
      "🗂️ Advanced Filters: By state, category, priority, tag and date",
      "↕️ Dynamic Sorting: By date, priority, alphabetical, state",
      "🎨 Dark/Light Theme: Persistent toggle with CSS variables",
      "📱 Responsive Design: Mobile-First (mobile, tablet, desktop)",
      "💾 Automatic Persistence: localStorage with real-time synchronization",
      "⚡ Global State with Zustand: Lightweight, fast and scalable",
      "🎬 Smooth Animations: Framer Motion with professional transitions",
      "🚨 Confirmation Dialogs: Modal for destructive actions",
      "🎯 Protected Routes: Intuitive navigation with React Router",
      "♿ Web Accessibility: ARIA labels, semantic HTML, keyboard navigation",
      "📴 Offline Mode: Works completely without internet",
      "🎪 Professional UI: Badges, gradients, shadows and custom iconography",
      "⚡ Optimized Performance: Code splitting, lazy loading, memoization",
      "📤 Data Export: Download task history in JSON",
      "🔄 Real-time Sync: Updates across components instantly"
    ]
  },
  "highlights": {
    "es": [
      "🏆 Patrones Profesionales: Componentes modulares, hooks personalizados, state management escalable",
      "🎓 Código Educativo: Perfecto para aprender React avanzado, Zustand y mejores prácticas",
      "🚀 Producción Ready: Optimizado, probado y listo para usar o extender",
      "🎨 Diseño Premium: UI/UX profesional con animaciones y transiciones suaves",
      "📱 100% Funcional Offline: Toda la app funciona sin conexión de red"
    ],
    "en": [
      "🏆 Professional Patterns: Modular components, custom hooks, scalable state management",
      "🎓 Educational Code: Perfect for learning advanced React, Zustand and best practices",
      "🚀 Production Ready: Optimized, tested and ready to use or extend",
      "🎨 Premium Design: Professional UI/UX with smooth animations and transitions",
      "📱 100% Offline Functional: Entire app works without internet connection"
    ]
  }
},
{

  title: {
    es: "Diccionario Dev - Diccionario Técnico Web en Español",
    en: "Diccionario Dev - Spanish Technical Web Dictionary"
  },
  description: {
    es: "Plataforma completa de aprendizaje para desarrollo web con más de 200 términos técnicos en español. Incluye búsqueda inteligente, preview interactivo de código, módulos de entrenamiento (quizzes, entrevistas en vivo), sistema de autenticación JWT, panel de administración, API REST documentada con OpenAPI, extensiones para navegador y VS Code. Desplegado en Vercel con PostgreSQL, Redis y arquitectura escalable.",
    en: "Comprehensive web development learning platform with over 200 technical terms in Spanish. Features intelligent search, interactive code preview, training modules (quizzes, live interviews), JWT authentication system, admin panel, OpenAPI-documented REST API, browser and VS Code extensions. Deployed on Vercel with PostgreSQL, Redis and scalable architecture."
  },
  technologies: [
    "Next.js 14",
    "React 18",
    "TypeScript",
    "Prisma ORM",
    "PostgreSQL",
    "Redis",
    "Tailwind CSS 4",
    "Zod",
    "JWT",
    "Vitest",
    "OpenAPI",
    "Vercel"
  ],
  repository: "https://github.com/omarhernandezrey/diccionario-dev",
  demo: "https://diccionario-dev-xi.vercel.app/",
  category: {
    es: "Full Stack",
    en: "Full Stack"
  },
  features: {
    es: [
      "200+ términos técnicos en español con traducciones",
      "Preview interactivo para HTML/CSS/JavaScript/Tailwind",
      "Sistema de autenticación JWT con cookies HttpOnly",
      "Panel de administración completo (CRUD)",
      "Módulos de entrenamiento: quizzes y entrevistas en vivo",
      "API REST documentada con OpenAPI",
      "Rate limiting con Redis",
      "Extensiones oficiales (navegador y VS Code)",
      "Modo offline con Service Worker",
      "Sistema de favoritos y historial",
      "Rutas SEO optimizadas por término",
      "Testing con Vitest y 60%+ cobertura"
    ],
    en: [
      "200+ technical terms in Spanish with translations",
      "Interactive preview for HTML/CSS/JavaScript/Tailwind",
      "JWT authentication system with HttpOnly cookies",
      "Full admin panel (CRUD)",
      "Training modules: quizzes and live interviews",
      "OpenAPI-documented REST API",
      "Rate limiting with Redis",
      "Official extensions (browser and VS Code)",
      "Offline mode with Service Worker",
      "Favorites and history system",
      "SEO-optimized routes per term",
      "Testing with Vitest and 60%+ coverage"
    ]
  }
},
        {
    title: {
      es: "Proyecto React.js - Aplicación Web lista de Tareas",
      en: "React.js Project - Interactive Web Application"
    },
    description: {
      es: "Proyecto práctico desarrollado durante el Curso de React.js en Platzi. Implementa componentes funcionales, hooks, enrutamiento, manejo de estado y diseño responsive. Desplegado en Vercel como demostración de una aplicación moderna y escalable.",
      en: "Practical project developed during the React.js Course at Platzi. Implements functional components, hooks, routing, state management, and responsive design. Deployed on Vercel as a demonstration of a modern and scalable application."
    },
    technologies: [
      "React",
      "JavaScript",
      "HTML5",
      "CSS3",
      "Vercel"
    ],
    repository: "https://github.com/omarhernandezrey/54-Curso-de-React.js",
    demo: "https://54-curso-de-react-js.vercel.app/",
    category: {
      es: "Frontend",
      en: "Frontend"
    }
  },

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