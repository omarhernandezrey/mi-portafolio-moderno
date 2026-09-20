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
