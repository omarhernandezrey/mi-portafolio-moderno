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
  nameEn?: string;
  h1En?: string;
  h2En?: string;
  descriptionEn?: string;
  keywordsEn?: string[];
  benefitsEn?: string[];
  processEn?: string[];
  faqsEn?: Array<{ q: string; a: string }>;
  priceRangeUsd?: string;
  deliveryTimeEn?: string;
}

export const serviciosProgramaticos: ServicioProgramatico[] = [
  {
    id: 'desarrollo-web',
    name: 'Desarrollo Web',
    h1: 'Desarrollo Web Profesional en {ciudad}',
    h2: 'Creamos sitios web de alto rendimiento para negocios en {ciudad}',
    description: 'Desarrollo web a medida con Next.js y React en {ciudad}. Sitios rápidos, optimizados para SEO y conversión, desde $300 USD.',
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
    deliveryTime: '1-6 semanas según complejidad',
    nameEn: 'Web Development',
    h1En: 'Professional Web Development in {city}',
    h2En: 'High-Performance Websites for Businesses in {city}',
    descriptionEn: 'Custom web development with Next.js and React in {city}. Fast, SEO-ready sites that turn visitors into paying clients, from $300 USD.',
    keywordsEn: ['web development {city}', 'web developer {city}', 'hire web developer {city}', 'website design {city}', 'freelance web developer {city}'],
    benefitsEn: [
      'Ultra-fast Next.js & React websites',
      'Mobile-first responsive design for all devices',
      'Technical SEO optimization included',
      'Intuitive admin dashboard',
      'Hosting & domain fully configured',
    ],
    processEn: [
      'Discovery: We understand your business goals and target audience',
      'Design: Figma mockups for your approval before coding',
      'Development: Built with modern, scalable tech stack',
      'Launch: Deploy, configure, and go live with full handover',
    ],
    faqsEn: [
      { q: 'How much does a website cost in {city}?', a: 'Landing pages start at $300 USD. Corporate websites from $1,000 USD. E-commerce from $1,500 USD. Final price depends on features: payment integrations, advanced forms, admin panel, etc.' },
      { q: 'How long does it take to build my website?', a: 'Landing pages: 3-7 business days. Corporate sites: 2-4 weeks. E-commerce: 3-6 weeks.' },
      { q: 'Is design included in the price?', a: 'Yes. We work in Figma until you\'re 100% satisfied before writing a single line of code.' },
    ],
    priceRangeUsd: '$300 - $3,800 USD',
    deliveryTimeEn: '1-6 weeks depending on complexity',
  },
  {
    id: 'chatbot-ia',
    name: 'Chatbots con IA',
    h1: 'Chatbots con Inteligencia Artificial en {ciudad}',
    h2: 'Automatiza tus ventas 24/7 en {ciudad} con IA',
    description: 'Chatbots con IA que captan leads y venden 24/7 para tu negocio en {ciudad}. Integración con WhatsApp Business y tu web, desde $400 USD.',
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
    deliveryTime: '1-3 semanas',
    nameEn: 'AI Chatbots',
    h1En: 'AI-Powered Chatbots for Businesses in {city}',
    h2En: 'Automate Your Sales 24/7 in {city} with Artificial Intelligence',
    descriptionEn: 'AI chatbots that capture leads and sell 24/7 for your business in {city}. GPT-4 and Claude, WhatsApp Business integration, from $400 USD.',
    keywordsEn: ['ai chatbot {city}', 'chatbot development {city}', 'whatsapp chatbot {city}', 'ai sales automation {city}', 'conversational ai {city}'],
    benefitsEn: [
      '24/7 customer support without interruptions',
      'Native WhatsApp Business integration',
      'Automatic lead capture and qualification',
      'Natural language responses in English and Spanish',
      'Automatic escalation to human agents when needed',
    ],
    processEn: [
      'Analysis: We identify your most frequent customer queries',
      'Configuration: We train the bot with your business information',
      'Integration: Connect with WhatsApp and/or your website',
      'Testing: Fine-tune responses based on real conversations',
    ],
    faqsEn: [
      { q: 'How much does an AI chatbot cost?', a: 'Basic web chatbot from $400 USD. WhatsApp Business + AI integration from $1,000 USD plus monthly API costs.' },
      { q: 'Can the chatbot sell through WhatsApp?', a: 'Yes — it qualifies leads, answers FAQs, sends quotes, and escalates sales-ready conversations.' },
      { q: 'How smart is it?', a: 'We use GPT-4 and Claude. It understands context, maintains natural conversations, and learns from your specific business information.' },
    ],
    priceRangeUsd: '$400 - $2,000 USD',
    deliveryTimeEn: '1-3 weeks',
  },
  {
    id: 'automatizacion',
    name: 'Automatización de Procesos',
    h1: 'Automatización de Procesos en {ciudad}',
    h2: 'Elimina tareas repetitivas y escala tu negocio en {ciudad}',
    description: 'Automatización de procesos para que tu negocio en {ciudad} funcione solo: integraciones, workflows en la nube y horas ahorradas cada semana.',
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
    deliveryTime: '2-4 semanas',
    nameEn: 'Process Automation',
    h1En: 'Business Process Automation in {city}',
    h2En: 'Eliminate Repetitive Tasks and Scale Your Business in {city}',
    descriptionEn: 'Process automation so your business in {city} runs on autopilot: integrations, cloud workflows, and hours saved every week.',
    keywordsEn: ['business automation {city}', 'workflow automation {city}', 'api integration {city}', 'process automation developer {city}', 'no-code automation {city}'],
    benefitsEn: [
      'Eliminate time-consuming manual tasks',
      'Seamless integration between your current tools',
      'Automatic email, Slack, and Telegram notifications',
      'Auto-generated reports and dashboards',
      'Scales as your business grows',
    ],
    processEn: [
      'Audit: We map your current manual workflows and pain points',
      'Design: We propose optimized automated workflows',
      'Implementation: We build the integrations and connectors',
      'Training: We teach you to manage and modify them',
    ],
    faqsEn: [
      { q: 'What processes can you automate?', a: 'Reports, notifications, data sync between apps, automatic replies, CRM updates, invoicing, and much more.' },
      { q: 'Do I need to know how to code?', a: 'No. We build everything and deliver simple documentation so you can manage it yourself.' },
      { q: 'What tools do you integrate with?', a: 'WhatsApp, Notion, Google Sheets, Airtable, Slack, Telegram, HubSpot, Salesforce, and any modern API.' },
    ],
    priceRangeUsd: '$500 - $2,500 USD',
    deliveryTimeEn: '2-4 weeks',
  },
  {
    id: 'e-commerce',
    name: 'E-commerce',
    h1: 'Tiendas Online de Alto Impacto en {ciudad}',
    h2: 'Vende tus productos en {ciudad} y todo {country} con facilidad',
    description: 'Tiendas online rápidas y seguras para emprendedores en {ciudad}. Pasarelas de pago, inventario y optimización de conversión incluidos.',
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
    deliveryTime: '3-6 semanas',
    nameEn: 'E-Commerce Development',
    h1En: 'High-Impact E-Commerce Development in {city}',
    h2En: 'Sell Your Products Online in {city} and Beyond',
    descriptionEn: 'Fast, secure online stores for businesses in {city}. Payment gateways, inventory management, and conversion optimization included.',
    keywordsEn: ['ecommerce development {city}', 'online store {city}', 'custom ecommerce {city}', 'ecommerce developer {city}', 'shopify alternative {city}'],
    benefitsEn: [
      'Professional online store ready to sell from day one',
      'Integrated payment gateways (Stripe, PayPal)',
      'Easy inventory and product management',
      'Conversion-optimized design and UX',
      'Intuitive admin panel — no coding required',
    ],
    processEn: [
      'Strategy: We define your product catalog and store structure',
      'Design: We create an attractive, conversion-focused store',
      'Development: We integrate payments, shipping, and management',
      'Launch: Full training so you can manage it independently',
    ],
    faqsEn: [
      { q: 'How much does an online store cost?', a: 'Basic e-commerce from $1,500 USD. With advanced features (subscriptions, memberships, multi-vendor) from $2,500 USD.' },
      { q: 'Which payment gateway should I use?', a: 'For US customers: Stripe or PayPal. For international: both. We handle the full integration.' },
      { q: 'Can I manage products myself?', a: 'Yes. We provide an intuitive dashboard where you can add, edit, and remove products without any coding knowledge.' },
    ],
    priceRangeUsd: '$1,500 - $5,000 USD',
    deliveryTimeEn: '3-6 weeks',
  },
  {
    id: 'consultoria-tech',
    name: 'Consultoría Tecnológica',
    h1: 'Consultoría Tech en {ciudad}',
    h2: 'Asesoría experta para proyectos digitales en {ciudad}',
    description: '¿No sabes por dónde empezar tu proyecto en {ciudad}? Te ayudo a elegir el stack correcto y a diseñar una arquitectura escalable.',
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
    deliveryTime: '3-10 días',
    nameEn: 'Tech Consulting',
    h1En: 'Tech Consulting Services in {city}',
    h2En: 'Expert Guidance for Digital Projects in {city}',
    descriptionEn: 'Not sure where to start your project in {city}? Independent expert advice on the right tech stack and a scalable architecture.',
    keywordsEn: ['tech consulting {city}', 'software architect {city}', 'cto as a service {city}', 'technology advisor {city}', 'it consulting {city}'],
    benefitsEn: [
      'Right tech stack for your specific needs',
      'Scalable architecture from day one',
      'Realistic budget and clear roadmap',
      'Avoid costly mistakes from the start',
      'Vendor-agnostic recommendations',
    ],
    processEn: [
      'Diagnosis: We understand your vision, constraints, and goals',
      'Analysis: We evaluate technology options objectively',
      'Proposal: We deliver a detailed technical document',
      'Support: Available for follow-up questions post-delivery',
    ],
    faqsEn: [
      { q: 'How much does tech consulting cost?', a: 'Basic audit from $200 USD. Full consulting with technical documentation from $500 USD.' },
      { q: 'Do I need to hire you for development afterwards?', a: 'Not required. Our consulting is independent, though many clients prefer us to execute as well.' },
      { q: 'Do I need technical knowledge?', a: 'No. We explain everything in plain language so you can make informed decisions.' },
    ],
    priceRangeUsd: '$200 - $1,250 USD',
    deliveryTimeEn: '3-10 business days',
  },
  {
    id: 'landing-page',
    name: 'Landing Pages de Alta Conversión',
    h1: 'Landing Pages Profesionales en {ciudad}',
    h2: 'Páginas de aterrizaje que convierten visitantes en clientes en {ciudad}',
    description: 'Landing pages optimizadas para conversión en {ciudad}: A/B testing, formularios inteligentes y analítica para maximizar tus ventas.',
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
    deliveryTime: '3-7 días',
    nameEn: 'High-Converting Landing Pages',
    h1En: 'High-Converting Landing Pages in {city}',
    h2En: 'Landing Pages That Turn Visitors Into Customers in {city}',
    descriptionEn: 'Conversion-optimized landing pages in {city}: A/B testing, smart forms, and behavior analytics to maximize your sales.',
    keywordsEn: ['landing page {city}', 'landing page designer {city}', 'high converting landing page {city}', 'lead generation page {city}', 'sales page developer {city}'],
    benefitsEn: [
      'Conversion-focused design built for measurable results',
      'Lightning-fast load times for better user experience',
      'Optimized lead capture forms',
      'Analytics and conversion tracking integration',
      'Mobile-first responsive design',
    ],
    processEn: [
      'Research: We analyze your audience and competitors',
      'Copywriting: We write persuasive, keyword-rich copy',
      'Design: We create a conversion-optimized layout',
      'Launch: We set up tracking and publish',
    ],
    faqsEn: [
      { q: 'How much does a landing page cost?', a: 'Professional landing pages from $300 USD. With A/B testing and advanced optimization from $500 USD.' },
      { q: 'Landing page or full website?', a: 'If you have one specific goal (sell a product, capture leads), go landing page. For full institutional presence, choose a website.' },
      { q: 'Does it include hosting?', a: 'We include hosting setup on your account. If you don\'t have hosting yet, we recommend the best options for your budget.' },
    ],
    priceRangeUsd: '$300 - $750 USD',
    deliveryTimeEn: '3-7 business days',
  },
  {
    id: 'aplicacion-movil',
    name: 'Aplicaciones Web Progresivas (PWA)',
    h1: 'Aplicaciones Web Progresivas en {ciudad}',
    h2: 'Apps que funcionan en móvil y desktop para negocios en {ciudad}',
    description: 'Progressive Web Apps (PWA) que funcionan como apps nativas sin pasar por las tiendas. Presencia mobile en {ciudad} a menor costo.',
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
    deliveryTime: '3-6 semanas',
    nameEn: 'Progressive Web Apps (PWA)',
    h1En: 'Progressive Web App Development in {city}',
    h2En: 'Apps That Work on Mobile and Desktop for Businesses in {city}',
    descriptionEn: 'Progressive Web Apps (PWA) that work like native apps without app stores. Mobile presence for businesses in {city} at a lower cost.',
    keywordsEn: ['pwa development {city}', 'web app developer {city}', 'progressive web app {city}', 'mobile web app {city}', 'app development {city}'],
    benefitsEn: [
      'Works like a native app without mandatory installation',
      'Offline content access for users',
      'Push notifications on mobile devices',
      'Single codebase for web and mobile',
      'No App Store or Play Store commissions',
    ],
    processEn: [
      'Analysis: We define core app features and user flows',
      'Design: We create a native app-like interface',
      'Development: Built with React and full PWA feature set',
      'Publishing: Configured, optimized, and deployed',
    ],
    faqsEn: [
      { q: 'What is a PWA?', a: 'A web app that behaves like a native app: home screen icon, offline access, push notifications — without going through app stores.' },
      { q: 'PWA or native app?', a: 'PWA is better for: limited budgets, fast launch, dynamic content. Native app for: games, hardware-specific features, mass-market scale.' },
      { q: 'Does it work on iPhone?', a: 'Yes, with some limitations vs Android. iOS 16+ supports PWAs increasingly well.' },
    ],
    priceRangeUsd: '$1,000 - $3,000 USD',
    deliveryTimeEn: '3-6 weeks',
  },
  {
    id: 'seo-tecnico',
    name: 'SEO Técnico y Posicionamiento Web',
    h1: 'SEO Técnico Profesional en {ciudad}',
    h2: 'Posicionamiento real en Google para negocios de {ciudad}',
    description: 'Auditoría y optimización SEO técnica en {ciudad}: Core Web Vitals, schema.org, velocidad y sitemap. Lo que Google realmente premia.',
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
    deliveryTime: '1-4 semanas',
    nameEn: 'Technical SEO',
    h1En: 'Technical SEO Services in {city}',
    h2En: 'Real Google Rankings for Businesses in {city}',
    descriptionEn: 'Technical SEO audit and optimization in {city}: Core Web Vitals, schema.org, speed, and sitemaps. What Google actually rewards.',
    keywordsEn: ['technical seo {city}', 'seo consultant {city}', 'seo services {city}', 'local seo {city}', 'google ranking expert {city}'],
    benefitsEn: [
      'Complete SEO audit of your current site',
      'Core Web Vitals optimization',
      'Schema.org rich snippets implementation',
      'Sitemap and robots.txt optimization',
      'Monthly ranking and organic traffic report',
    ],
    processEn: [
      'Audit: We analyze your site with professional-grade tools',
      'Diagnosis: We identify and prioritize critical technical issues',
      'Implementation: We fix errors and optimize systematically',
      'Monitoring: We track ranking improvements over time',
    ],
    faqsEn: [
      { q: 'How long until I see results?', a: 'Technical fixes: 2-4 weeks. Competitive keyword rankings: 3-6 months of consistent work.' },
      { q: 'Do you guarantee first position on Google?', a: 'No one can guarantee that. We guarantee implementing all technical best practices that give you the best chance to rank.' },
      { q: 'Does it include content creation?', a: 'Technical SEO does not include content. For content marketing and link building, we offer a separate service.' },
    ],
    priceRangeUsd: '$500 - $2,000 USD',
    deliveryTimeEn: '1-4 weeks',
  },
  {
    id: 'integracion-apis',
    name: 'Integración de APIs y Sistemas',
    h1: 'Integración de APIs y Sistemas en {ciudad}',
    h2: 'Conectamos tus herramientas digitales para que trabajen juntas en {ciudad}',
    description: 'Integro tu web o sistema con cualquier API: pagos (Stripe, PayPal, Wompi), CRMs, WhatsApp Business y más, para empresas en {ciudad}.',
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
    deliveryTime: '2-6 semanas',
    nameEn: 'API & Systems Integration',
    h1En: 'API & Systems Integration Services in {city}',
    h2En: 'Connecting Your Digital Tools So They Work Together in {city}',
    descriptionEn: 'We integrate your system with any API: payments (Stripe, PayPal), CRMs, WhatsApp Business, and more, for businesses in {city}.',
    keywordsEn: ['api integration {city}', 'system integration {city}', 'stripe integration developer {city}', 'crm integration {city}', 'saas integration developer {city}'],
    benefitsEn: [
      'Seamless connection between your current systems',
      'Automated data flow and synchronization',
      'Real-time data sync across platforms',
      'Secure credential and API token management',
      'Complete technical documentation delivered',
    ],
    processEn: [
      'Mapping: We understand which systems need to connect',
      'Analysis: We review APIs and technical documentation',
      'Development: We build the necessary connectors',
      'Testing: Thorough end-to-end testing before production',
    ],
    faqsEn: [
      { q: 'What systems can you integrate?', a: 'Virtually any modern API: Stripe, PayPal, Salesforce, HubSpot, Zoho, WhatsApp Business API, Make, and more.' },
      { q: 'What happens if the external API fails?', a: 'We implement error handling, automatic retries, and notifications so you know immediately if something fails.' },
      { q: 'Is it secure?', a: 'Yes. Credentials are stored encrypted, we use environment variables, and follow OWASP security best practices.' },
    ],
    priceRangeUsd: '$750 - $3,750 USD',
    deliveryTimeEn: '2-6 weeks',
  },
  {
    id: 'mantenimiento-web',
    name: 'Mantenimiento y Soporte Web',
    h1: 'Mantenimiento Web Profesional en {ciudad}',
    h2: 'Tu sitio web siempre actualizado, seguro y funcionando en {ciudad}',
    description: 'Mantenimiento web mensual en {ciudad}: actualizaciones de seguridad, backups automáticos, rendimiento y soporte técnico prioritario.',
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
    deliveryTime: 'Plan continuo',
    nameEn: 'Web Maintenance & Support',
    h1En: 'Professional Web Maintenance & Support in {city}',
    h2En: 'Your Website Always Updated, Secure, and Running in {city}',
    descriptionEn: 'Monthly web maintenance in {city}: security updates, automatic backups, performance optimization, and priority support.',
    keywordsEn: ['web maintenance {city}', 'website support {city}', 'website management {city}', 'website maintenance service {city}', 'site uptime monitoring {city}'],
    benefitsEn: [
      'Regular security patches and updates',
      'Daily or weekly automatic backups',
      '24/7 uptime monitoring with alerts',
      'Priority technical support',
      'Ongoing performance optimization',
    ],
    processEn: [
      'Audit: We review the current state of your site',
      'Setup: We configure backups and monitoring tools',
      'Maintenance: Monthly updates, patches, and improvements',
      'Support: Fast response to incidents and technical questions',
    ],
    faqsEn: [
      { q: 'How much does web maintenance cost?', a: 'Plans from $100 USD/month for simple sites. Complex sites or e-commerce from $300 USD/month.' },
      { q: 'What does the basic plan include?', a: 'Weekly backups, security updates, uptime monitoring, email support with 24h response time.' },
      { q: 'Can you maintain a site you didn\'t build?', a: 'Yes, but we first conduct an audit to evaluate code quality and determine if we can take it on.' },
    ],
    priceRangeUsd: '$100 - $750 USD/month',
    deliveryTimeEn: 'Ongoing monthly plan',
  }
];
