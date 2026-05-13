export interface ServicioProgramatico {
  id: string;
  name: string;
  h1: string;
  h2: string;
  description: string;
  keywords: string[];
  benefits: string[];
  process: string[];
  faqs: Array<{ q: string; a: string }>;
  priceRange: string;
  deliveryTime: string;
}

export const serviciosProgramaticos: ServicioProgramatico[] = [
  {
    id: 'desarrollo-web',
    name: 'Desarrollo Web',
    h1: 'Desarrollo Web Profesional en {ciudad}',
    h2: 'Creamos sitios web de alto rendimiento para negocios en {ciudad}',
    description: 'Ofrecemos soluciones de desarrollo web a medida utilizando Next.js y React. Potenciamos tu presencia digital en {ciudad} con sitios optimizados para SEO y conversión.',
    keywords: ['desarrollo web {ciudad}', 'programador web {ciudad}', 'diseño web {ciudad}'],
    benefits: [
      'Sitios web ultra-rápidos con Next.js y React',
      'Diseño responsive que se adapta a todos los dispositivos',
      'Optimización SEO técnica incluida',
      'Panel de administración intuitivo',
      'Hosting y dominio configurados'
    ],
    process: [
      'Descubrimiento: Entendemos tu negocio y objetivos',
      'Diseño: Creamos mockups en Figma para tu aprobación',
      'Desarrollo: Construimos con tecnologías modernas',
      'Lanzamiento: Desplegamos y configuramos todo'
    ],
    faqs: [
      { q: '¿Cuánto cuesta una página web en {ciudad}?', a: 'Los precios varían según complejidad: landing pages desde $1.2M COP, sitios corporativos desde $4M COP, e-commerce desde $6M COP.' },
      { q: '¿Cuánto tiempo toma desarrollar mi sitio?', a: 'Landing pages: 3-7 días. Sitios corporativos: 2-4 semanas. E-commerce: 3-6 semanas.' },
      { q: '¿Incluye diseño o debo tenerlo listo?', a: 'El diseño está incluido. Trabajamos juntos en Figma hasta que estés 100% satisfecho.' }
    ],
    priceRange: '$1.2M - $15M COP ($300 - $3,800 USD)',
    deliveryTime: '1-6 semanas según complejidad'
  },
  {
    id: 'chatbot-ia',
    name: 'Chatbots con IA',
    h1: 'Chatbots con Inteligencia Artificial en {ciudad}',
    h2: 'Automatiza tus ventas 24/7 en {ciudad} con IA',
    description: 'Implementamos agentes de IA inteligentes que captan leads y cierran ventas por ti en {ciudad}. Soluciones innovadoras para empresas que buscan escala en {country}.',
    keywords: ['chatbot ia {ciudad}', 'automatización ventas {ciudad}', 'agente ai {ciudad}'],
    benefits: [
      'Atención al cliente 24/7 sin interrupciones',
      'Integración nativa con WhatsApp Business',
      'Captura automática de leads cualificados',
      'Respuestas inteligentes en español natural',
      'Escalación automática a humanos cuando es necesario'
    ],
    process: [
      'Análisis: Identificamos las consultas más frecuentes de tu negocio',
      'Configuración: Entrenamos el bot con tu información',
      'Integración: Conectamos con WhatsApp y/o tu web',
      'Pruebas: Ajustamos respuestas basados en conversaciones reales'
    ],
    faqs: [
      { q: '¿Cuánto cuesta un chatbot con IA?', a: 'Desde $1.5M COP para chatbot web básico. WhatsApp Business + IA desde $4M COP más costos mensuales de API.' },
      { q: '¿El chatbot puede vender por WhatsApp?', a: 'Sí, puede cualificar leads, responder preguntas frecuentes y escalar conversaciones listas para comprar.' },
      { q: '¿Qué tan inteligente es?', a: 'Usamos GPT-4/Claude. Entiende contexto, mantiene conversaciones naturales y aprende de tu información específica.' }
    ],
    priceRange: '$1.5M - $8M COP ($400 - $2,000 USD)',
    deliveryTime: '1-3 semanas'
  },
  {
    id: 'automatizacion',
    name: 'Automatización de Procesos',
    h1: 'Automatización de Procesos en {ciudad}',
    h2: 'Elimina tareas repetitivas y escala tu negocio en {ciudad}',
    description: 'Conectamos tus herramientas favoritas para que tu negocio en {ciudad} funcione solo. Desde integraciones con Notion hasta workflows complejos en la nube.',
    keywords: ['automatización {ciudad}', 'software a medida {ciudad}', 'integraciones api {ciudad}'],
    benefits: [
      'Elimina tareas manuales repetitivas',
      'Integración entre tus herramientas actuales',
      'Notificaciones automáticas por email/Telegram',
      'Reportes automáticos generados',
      'Escalable según crece tu negocio'
    ],
    process: [
      'Auditoría: Mapeamos tus procesos manuales actuales',
      'Diseño: Proponemos workflows automáticos optimizados',
      'Implementación: Construimos las integraciones',
      'Capacitación: Te enseñamos a gestionar y modificar'
    ],
    faqs: [
      { q: '¿Qué procesos puedo automatizar?', a: 'Reportes, notificaciones, sincronización de datos entre apps, respuestas automáticas, y mucho más.' },
      { q: '¿Necesito saber programar?', a: 'No. Nosotros construimos todo y te entregamos documentación simple para gestionar.' },
      { q: '¿Con qué herramientas se integra?', a: 'WhatsApp, Notion, Google Sheets, Airtable, Slack, Telegram, correo, y cualquier API moderna.' }
    ],
    priceRange: '$2M - $10M COP ($500 - $2,500 USD)',
    deliveryTime: '2-4 semanas'
  },
  {
    id: 'e-commerce',
    name: 'E-commerce',
    h1: 'Tiendas Online de Alto Impacto en {ciudad}',
    h2: 'Vende tus productos en {ciudad} y todo {country} con facilidad',
    description: 'Desarrollamos tiendas virtuales rápidas y seguras. Ayudamos a emprendedores de {ciudad} a llevar sus productos al mundo digital con pasarelas de pago integradas.',
    keywords: ['tienda online {ciudad}', 'e-commerce {ciudad}', 'vender por internet {ciudad}'],
    benefits: [
      'Tienda online profesional lista para vender',
      'Pasarela de pagos integrada (Wompi, PayPal, Stripe)',
      'Gestión de inventario sencilla',
      'Optimizada para conversión y ventas',
      'Panel de administración intuitivo'
    ],
    process: [
      'Estrategia: Definimos categorías y estructura de tu catálogo',
      'Diseño: Creamos una tienda atractiva que vende',
      'Desarrollo: Integramos pagos, envíos y gestión',
      'Lanzamiento: Te capacitamos para gestionar tu tienda'
    ],
    faqs: [
      { q: '¿Cuánto cuesta una tienda online?', a: 'E-commerce básico desde $6M COP. Con funcionalidades avanzadas (suscripciones, membresías) desde $10M COP.' },
      { q: '¿Qué pasarela de pagos usar?', a: 'En Colombia recomendamos Wompi (tiene PSE, tarjetas, Nequi). Para internacional: Stripe o PayPal.' },
      { q: '¿Puedo gestionar productos yo mismo?', a: 'Sí, incluimos un panel intuitivo donde puedes agregar, editar y eliminar productos sin saber código.' }
    ],
    priceRange: '$6M - $20M COP ($1,500 - $5,000 USD)',
    deliveryTime: '3-6 semanas'
  },
  {
    id: 'consultoria-tech',
    name: 'Consultoría Tecnológica',
    h1: 'Consultoría Tech en {ciudad}',
    h2: 'Asesoría experta para proyectos digitales en {ciudad}',
    description: '¿No sabes por dónde empezar tu proyecto en {ciudad}? Te ayudamos a elegir el stack tecnológico correcto y a diseñar una arquitectura escalable.',
    keywords: ['consultor it {ciudad}', 'arquitecto software {ciudad}', 'asesoría tech {ciudad}'],
    benefits: [
      'Stack tecnológico adecuado a tus necesidades',
      'Arquitectura escalable desde el día 1',
      'Presupuesto realista y roadmap claro',
      'Evita errores costosos desde el inicio',
      'Independiente de proveedores específicos'
    ],
    process: [
      'Diagnóstico: Entendemos tu visión y restricciones',
      'Análisis: Evaluamos opciones tecnológicas',
      'Propuesta: Entregamos documento técnico detallado',
      'Acompañamiento: Estamos disponibles para dudas posteriores'
    ],
    faqs: [
      { q: '¿Cuánto cuesta la consultoría?', a: 'Auditoría básica desde $800k COP. Consultoría completa con documentación técnica desde $2M COP.' },
      { q: '¿Debo contratar el desarrollo con ustedes después?', a: 'No es obligatorio. Nuestra consultoría es independiente, aunque muchos clientes prefieren que ejecutemos también.' },
      { q: '¿Tengo que tener conocimientos técnicos?', a: 'No. Explicamos todo en lenguaje claro para que tomes decisiones informadas.' }
    ],
    priceRange: '$800k - $5M COP ($200 - $1,250 USD)',
    deliveryTime: '3-10 días'
  }
];
