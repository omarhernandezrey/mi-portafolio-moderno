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
  },
  {
    id: 'landing-page',
    name: 'Landing Pages de Alta Conversión',
    h1: 'Landing Pages Profesionales en {ciudad}',
    h2: 'Páginas de aterrizaje que convierten visitantes en clientes en {ciudad}',
    description: 'Diseñamos y desarrollamos landing pages optimizadas para conversión en {ciudad}. Con A/B testing, formularios inteligentes y análisis de comportamiento para maximizar tus ventas en {country}.',
    keywords: ['landing page {ciudad}', 'página de aterrizaje {ciudad}', 'landing page profesional {ciudad}'],
    benefits: [
      'Diseño orientado a conversión y resultados',
      'Carga ultrarrápida para mejor experiencia',
      'Formularios optimizados para captar leads',
      'Integración con analytics y tracking',
      'Diseño responsive para todos los dispositivos'
    ],
    process: [
      'Investigación: Analizamos tu audiencia y competencia',
      'Copywriting: Redactamos textos persuasivos',
      'Diseño: Creamos layout optimizado para conversión',
      'Lanzamiento: Configuramos tracking y publicamos'
    ],
    faqs: [
      { q: '¿Cuánto cuesta una landing page?', a: 'Landing pages profesionales desde $1.2M COP. Con A/B testing y optimización avanzada desde $2M COP.' },
      { q: '¿Landing page o sitio web completo?', a: 'Si tienes un objetivo específico (vender un producto, captar leads), landing page. Si necesitas presencia institucional completa, sitio web.' },
      { q: '¿Incluye hosting y dominio?', a: 'Incluimos configuración en tu hosting. Si no tienes, te recomendamos las mejores opciones según tu presupuesto.' }
    ],
    priceRange: '$1.2M - $3M COP ($300 - $750 USD)',
    deliveryTime: '3-7 días'
  },
  {
    id: 'aplicacion-movil',
    name: 'Aplicaciones Web Progresivas (PWA)',
    h1: 'Aplicaciones Web Progresivas en {ciudad}',
    h2: 'Apps que funcionan en móvil y desktop para negocios en {ciudad}',
    description: 'Desarrollamos Progressive Web Apps (PWA) que funcionan como apps nativas sin pasar por las tiendas de aplicaciones. Solución ideal para negocios en {ciudad} que quieren presencia mobile sin el costo de apps nativas.',
    keywords: ['app web {ciudad}', 'aplicacion movil {ciudad}', 'pwa {ciudad}'],
    benefits: [
      'Funciona como app nativa sin instalación obligatoria',
      'Acceso offline a contenido guardado',
      'Notificaciones push en móviles',
      'Un solo código para web y móvil',
      'Sin comisiones de App Store ni Play Store'
    ],
    process: [
      'Análisis: Definimos funcionalidades core de la app',
      'Diseño: Creamos interfaz tipo app nativa',
      'Desarrollo: Construimos con React + PWA features',
      'Publicación: Configuramos y desplegamos'
    ],
    faqs: [
      { q: '¿Qué es una PWA?', a: 'Es una web app que se comporta como app nativa: ícono en home, acceso offline, notificaciones push, pero sin pasar por tiendas de apps.' },
      { q: '¿PWA o app nativa?', a: 'PWA es mejor para: presupuestos limitados, lanzamiento rápido, contenido dinámico. App nativa para: juegos, acceso a hardware específico, mercados masivos.' },
      { q: '¿Funciona en iPhone?', a: 'Sí, aunque con algunas limitaciones vs Android. iOS 16+ soporta PWA cada vez mejor.' }
    ],
    priceRange: '$4M - $12M COP ($1,000 - $3,000 USD)',
    deliveryTime: '3-6 semanas'
  },
  {
    id: 'seo-tecnico',
    name: 'SEO Técnico y Posicionamiento Web',
    h1: 'SEO Técnico Profesional en {ciudad}',
    h2: 'Posicionamiento real en Google para negocios de {ciudad}',
    description: 'Auditoría y optimización SEO técnica completa para sitios web de {ciudad}. Schema.org, velocidad de carga, Core Web Vitals, sitemap y todas las técnicas que Google realmente premia en {country}.',
    keywords: ['seo {ciudad}', 'posicionamiento web {ciudad}', 'consultor seo {ciudad}'],
    benefits: [
      'Auditoría SEO completa de tu sitio actual',
      'Optimización Core Web Vitals',
      'Implementación Schema.org para rich snippets',
      'Sitemap y robots.txt optimizados',
      'Informe mensual de posiciones y tráfico'
    ],
    process: [
      'Auditoría: Analizamos tu sitio con herramientas profesionales',
      'Diagnóstico: Identificamos problemas técnicos críticos',
      'Implementación: Corregimos errores y optimizamos',
      'Monitoreo: Seguimiento de mejoras en ranking'
    ],
    faqs: [
      { q: '¿Cuánto tiempo para ver resultados?', a: 'SEO técnico: 2-4 semanas. Para posicionamiento en keywords competitivas: 3-6 meses de trabajo constante.' },
      { q: '¿Garantizas primera posición en Google?', a: 'No. Nadie puede garantizar eso. Pero sí garantizamos implementar todas las mejores prácticas técnicas.' },
      { q: '¿Incluye creación de contenido?', a: 'El SEO técnico no incluye contenido. Para content marketing y link building tenemos un servicio separado.' }
    ],
    priceRange: '$2M - $8M COP ($500 - $2,000 USD)',
    deliveryTime: '1-4 semanas'
  },
  {
    id: 'integracion-apis',
    name: 'Integración de APIs y Sistemas',
    h1: 'Integración de APIs y Sistemas en {ciudad}',
    h2: 'Conectamos tus herramientas digitales para que trabajen juntas en {ciudad}',
    description: 'Integramos tu sitio web o sistema con cualquier API externa: pagos (Stripe, PayPal, Wompi), CRMs, ERPs, WhatsApp Business, Google Workspace. Soluciones personalizadas para empresas en {ciudad}.',
    keywords: ['integracion api {ciudad}', 'conectar sistemas {ciudad}', 'automatizacion api {ciudad}'],
    benefits: [
      'Conexión entre tus sistemas actuales',
      'Automatización de flujos de datos',
      'Sincronización en tiempo real',
      'Manejo seguro de credenciales y tokens',
      'Documentación técnica completa'
    ],
    process: [
      'Mapeo: Entendemos qué sistemas necesitas conectar',
      'Análisis: Revisamos APIs y documentación técnica',
      'Desarrollo: Construimos los conectores necesarios',
      'Testing: Pruebas exhaustivas antes de producción'
    ],
    faqs: [
      { q: '¿Con qué sistemas pueden integrar?', a: 'Prácticamente cualquier API moderna: Stripe, PayPal, Wompi, Salesforce, HubSpot, Zoho, WhatsApp Business API, y más.' },
      { q: '¿Qué pasa si falla la API externa?', a: 'Implementamos manejo de errores, reintentos automáticos y notificaciones para que sepas si algo falla.' },
      { q: '¿Es seguro?', a: 'Sí. Las credenciales se almacenan encriptadas, usamos variables de entorno y seguimos mejores prácticas de seguridad.' }
    ],
    priceRange: '$3M - $15M COP ($750 - $3,750 USD)',
    deliveryTime: '2-6 semanas'
  },
  {
    id: 'mantenimiento-web',
    name: 'Mantenimiento y Soporte Web',
    h1: 'Mantenimiento Web Profesional en {ciudad}',
    h2: 'Tu sitio web siempre actualizado, seguro y funcionando en {ciudad}',
    description: 'Planes de mantenimiento web mensual para sitios y aplicaciones en {ciudad}. Actualizaciones de seguridad, backups automáticos, optimización de rendimiento y soporte técnico prioritario para negocios en {country}.',
    keywords: ['mantenimiento web {ciudad}', 'soporte web {ciudad}', 'actualizacion sitio web {ciudad}'],
    benefits: [
      'Actualizaciones de seguridad regulares',
      'Backups automáticos diarios/semanales',
      'Monitoreo de uptime 24/7',
      'Soporte técnico prioritario',
      'Optimización continua de velocidad'
    ],
    process: [
      'Auditoría: Revisamos estado actual de tu sitio',
      'Setup: Configuramos backups y monitoreo',
      'Mantenimiento: Actualizaciones mensuales',
      'Soporte: Respuesta a incidentes y dudas'
    ],
    faqs: [
      { q: '¿Cuánto cuesta el mantenimiento?', a: 'Planes desde $500k COP/mes para sitios pequeños. Sitios complejos o e-commerce desde $1.2M COP/mes.' },
      { q: '¿Qué incluye el plan básico?', a: 'Backups semanales, actualizaciones de seguridad, monitoreo uptime, soporte por email con respuesta en 24h.' },
      { q: '¿Pueden mantener un sitio que no desarrollaron ustedes?', a: 'Sí, pero primero hacemos una auditoría para evaluar el estado del código y determinar si podemos asumir el mantenimiento.' }
    ],
    priceRange: '$500k - $3M COP/mes ($125 - $750 USD/mes)',
    deliveryTime: 'Plan continuo'
  }
];
