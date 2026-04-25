export interface ServicioProgramatico {
  id: string;
  name: string;
  h1: string;
  h2: string;
  description: string;
  keywords: string[];
}

export const serviciosProgramaticos: ServicioProgramatico[] = [
  {
    id: 'desarrollo-web',
    name: 'Desarrollo Web',
    h1: 'Desarrollo Web Profesional en {ciudad}',
    h2: 'Creamos sitios web de alto rendimiento para negocios en {ciudad}',
    description: 'Ofrecemos soluciones de desarrollo web a medida utilizando Next.js y React. Potenciamos tu presencia digital en {ciudad} con sitios optimizados para SEO y conversión.',
    keywords: ['desarrollo web {ciudad}', 'programador web {ciudad}', 'diseño web {ciudad}']
  },
  {
    id: 'chatbot-ia',
    name: 'Chatbots con IA',
    h1: 'Chatbots con Inteligencia Artificial en {ciudad}',
    h2: 'Automatiza tus ventas 24/7 en {ciudad} con IA',
    description: 'Implementamos agentes de IA inteligentes que captan leads y cierran ventas por ti en {ciudad}. Soluciones innovadoras para empresas que buscan escala en {country}.',
    keywords: ['chatbot ia {ciudad}', 'automatización ventas {ciudad}', 'agente ai {ciudad}']
  },
  {
    id: 'automatizacion',
    name: 'Automatización de Procesos',
    h1: 'Automatización de Procesos en {ciudad}',
    h2: 'Elimina tareas repetitivas y escala tu negocio en {ciudad}',
    description: 'Conectamos tus herramientas favoritas para que tu negocio en {ciudad} funcione solo. Desde integraciones con Notion hasta workflows complejos en la nube.',
    keywords: ['automatización {ciudad}', 'software a medida {ciudad}', 'integraciones api {ciudad}']
  },
  {
    id: 'e-commerce',
    name: 'E-commerce',
    h1: 'Tiendas Online de Alto Impacto en {ciudad}',
    h2: 'Vende tus productos en {ciudad} y todo {country} con facilidad',
    description: 'Desarrollamos tiendas virtuales rápidas y seguras. Ayudamos a emprendedores de {ciudad} a llevar sus productos al mundo digital con pasarelas de pago integradas.',
    keywords: ['tienda online {ciudad}', 'e-commerce {ciudad}', 'vender por internet {ciudad}']
  },
  {
    id: 'consultoria-tech',
    name: 'Consultoría Tecnológica',
    h1: 'Consultoría Tech en {ciudad}',
    h2: 'Asesoría experta para proyectos digitales en {ciudad}',
    description: '¿No sabes por dónde empezar tu proyecto en {ciudad}? Te ayudamos a elegir el stack tecnológico correcto y a diseñar una arquitectura escalable.',
    keywords: ['consultor it {ciudad}', 'arquitecto software {ciudad}', 'asesoría tech {ciudad}']
  }
];
