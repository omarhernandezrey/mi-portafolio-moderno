// IDs de fotos de Unsplash (uso comercial libre, sin atribución obligatoria)
// para las imágenes hero de las páginas internas del sitio.
export function unsplashUrl(photoId: string): string {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1600&q=75`;
}

interface HeroImageEntry {
  photoId: string;
  alt: { es: string; en: string };
}

export const pageHeroImages: Record<
  'servicios' | 'blog' | 'sobreMi' | 'comunidad' | 'calculadora' | 'recursos' | 'faq',
  HeroImageEntry
> = {
  servicios: {
    photoId: '1498050108023-c5249f4df085',
    alt: {
      es: 'Escritorio de trabajo con laptop mostrando código de desarrollo web',
      en: 'Workspace desk with a laptop showing web development code',
    },
  },
  blog: {
    photoId: '1499914485622-a88fac536970',
    alt: {
      es: 'Libreta y laptop abiertos sobre un escritorio, representando la escritura de artículos técnicos',
      en: 'Open notebook and laptop on a desk, representing the writing of technical articles',
    },
  },
  sobreMi: {
    photoId: '1542315192-1f61a1792f33',
    alt: {
      es: 'Escritorio de desarrollador con varios monitores mostrando código y una laptop, sin personas',
      en: "A developer's desk with multiple monitors showing code and a laptop, no people",
    },
  },
  comunidad: {
    photoId: '1521737604893-d14cc237f11d',
    alt: {
      es: 'Personas conectadas en red, representando una comunidad de desarrolladores',
      en: 'People connected in a network, representing a developer community',
    },
  },
  calculadora: {
    photoId: '1626266061368-46a8f578ddd6',
    alt: {
      es: 'Persona usando una calculadora en un escritorio para estimar el presupuesto de un proyecto web',
      en: 'Person using a calculator at a desk to estimate a web project budget',
    },
  },
  recursos: {
    photoId: '1453928582365-b6ad33cbcf64',
    alt: {
      es: 'Documentos y recursos digitales organizados sobre un escritorio',
      en: 'Digital documents and resources organized on a desk',
    },
  },
  faq: {
    photoId: '1618218168350-6e7c81151b64',
    alt: {
      es: 'Fichas de madera formando las palabras "pide ayuda", representando la sección de preguntas frecuentes',
      en: 'Wooden tiles spelling out "ask for help", representing the FAQ section',
    },
  },
};

export const servicioHeroImages: Record<string, HeroImageEntry> = {
  'desarrollo-web': {
    photoId: '1547658719-da2b51169166',
    alt: {
      es: 'Pantalla de laptop con editor de código durante el desarrollo de un sitio web',
      en: 'Laptop screen with a code editor during website development',
    },
  },
  'landing-page': {
    photoId: '1467232004584-a241de8bcf5d',
    alt: {
      es: 'Diseño de interfaz web mostrado en una pantalla, representando una landing page',
      en: 'Web interface design shown on a screen, representing a landing page',
    },
  },
  'e-commerce': {
    photoId: '1563013544-824ae1b704d3',
    alt: {
      es: 'Persona comprando en línea desde un computador portátil, representando una tienda e-commerce',
      en: 'Person shopping online from a laptop, representing an e-commerce store',
    },
  },
  automatizacion: {
    photoId: '1580203784276-6ded72fea88a',
    alt: {
      es: 'Engranajes y procesos automatizados representando la automatización de flujos de trabajo',
      en: 'Gears and automated processes representing workflow automation',
    },
  },
  'seo-tecnico': {
    photoId: '1551288049-bebda4e38f71',
    alt: {
      es: 'Panel de análisis con gráficos de tráfico y posicionamiento SEO',
      en: 'Analytics dashboard with traffic and SEO ranking charts',
    },
  },
  'aplicacion-movil': {
    photoId: '1511707171634-5f897ff02aa9',
    alt: {
      es: 'Persona usando una aplicación móvil en un smartphone',
      en: 'Person using a mobile app on a smartphone',
    },
  },
  'consultoria-tech': {
    photoId: '1522071820081-009f0129c71c',
    alt: {
      es: 'Equipo en una reunión de estrategia tecnológica frente a un tablero',
      en: 'Team in a technology strategy meeting in front of a whiteboard',
    },
  },
  'integracion-apis': {
    photoId: '1594915440248-1e419eba6611',
    alt: {
      es: 'Cables de fibra óptica conectados a un switch de red representando la integración de sistemas y APIs',
      en: 'Fiber optic cables connected to a network switch representing systems and API integration',
    },
  },
  'mantenimiento-web': {
    photoId: '1593720213428-28a5b9e94613',
    alt: {
      es: 'Desarrollador revisando código para el mantenimiento de un sitio web',
      en: 'Developer reviewing code for website maintenance',
    },
  },
};

// Segunda imagen por servicio — usada en la sección de capacidades (bento)
// de las páginas servicio×ciudad, junto a la imagen hero ya existente.
export const servicioSecondaryImages: Record<string, HeroImageEntry> = {
  'desarrollo-web': {
    photoId: '1773349807434-374473797148',
    alt: {
      es: 'Pantalla oscura de un IDE mostrando paquetes y dependencias de un proyecto web',
      en: 'Dark IDE screen showing packages and dependencies of a web project',
    },
  },
  'landing-page': {
    photoId: '1686061592689-312bbfb5c055',
    alt: {
      es: 'Panel de analítica mostrando actividad de usuarios por cohortes en una landing page',
      en: 'Analytics panel showing user activity by cohort on a landing page',
    },
  },
  'e-commerce': {
    photoId: '1587293852726-70cdb56c2866',
    alt: {
      es: 'Estanterías de una bodega de fulfillment llenas de paquetes para envío',
      en: 'Fulfillment warehouse shelving stacked with packages ready for shipping',
    },
  },
  automatizacion: {
    photoId: '1606206873764-fd15e242df52',
    alt: {
      es: 'Brazo robótico industrial iluminado en azul dentro de una línea de producción automatizada',
      en: 'Industrial robotic arm lit in blue on an automated production line',
    },
  },
  'seo-tecnico': {
    photoId: '1633307057722-a4740ba0c5d0',
    alt: {
      es: 'Panel de resumen de sitio mostrando vistas de página y duración promedio en crecimiento',
      en: 'Site overview panel showing page views and average duration trending up',
    },
  },
  'aplicacion-movil': {
    photoId: '1772272935464-2e90d8218987',
    alt: {
      es: 'Pantalla de laptop mostrando variantes de diseño de botones para una interfaz de app',
      en: 'Laptop screen showing button style variants for an app interface',
    },
  },
  'consultoria-tech': {
    photoId: '1557804506-669a67965ba0',
    alt: {
      es: 'Equipo de trabajo en una sesión de planeación ágil frente a un tablero kanban',
      en: 'Team in an agile planning session in front of a kanban board',
    },
  },
  'integracion-apis': {
    photoId: '1785682231847-93265d8e633d',
    alt: {
      es: 'Rack de equipos de red con múltiples conexiones, representando la integración de sistemas',
      en: 'Network equipment rack with multiple connections, representing systems integration',
    },
  },
  'mantenimiento-web': {
    photoId: '1625296276188-1d149bdaf560',
    alt: {
      es: 'Reporte de Google PageSpeed Insights con puntaje de 99 y métricas Core Web Vitals en verde',
      en: 'Google PageSpeed Insights report with a 99 score and green Core Web Vitals metrics',
    },
  },
};

// Banner cinemático compartido — mismo en las 126 páginas de servicio×ciudad,
// representa el alcance/infraestructura remota global (no es un dato por
// ciudad, es una declaración de marca sobre trabajo remoto internacional).
export const globalTechBanner: HeroImageEntry = {
  photoId: '1777047023536-8e47688b77f9',
  alt: {
    es: 'Vista de la Tierra desde el espacio, representando el alcance global del trabajo remoto',
    en: 'View of Earth from space, representing the global reach of remote work',
  },
};
