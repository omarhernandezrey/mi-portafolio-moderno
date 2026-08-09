export type OpeningVariant = 'A' | 'B' | 'C' | 'D';

export interface Opening {
  id: OpeningVariant;
  text: {
    es: string;
    en: string
  };
}

export const OPENINGS: Opening[] = [
  {
    id: 'A', // Formal
    text: {
      es: "Hola, soy el asistente virtual de Omar Hernández. ¿En qué puedo ayudarte hoy con tu proyecto tecnológico?",
      en: "Hello, I am Omar Hernández's virtual assistant. How can I help you today with your technology project?"
    }
  },
  {
    id: 'B', // Casual / Amigable
    text: {
      es: "¡Hola! Qué bueno tenerte por aquí. Soy el bot de Omar. ¿Tienes alguna idea en mente que quieras convertir en realidad?",
      en: "Hi there! Great to have you here. I'm Omar's bot. Do you have an idea in mind that you want to turn into reality?"
    }
  },
  {
    id: 'C', // Directo / Orientado a Negocio
    text: {
      es: "Hola. Si buscas un desarrollador Full Stack para escalar tu negocio, estás en el lugar correcto. ¿Qué tipo de solución necesitas?",
      en: "Hello. If you're looking for a Full Stack developer to scale your business, you're in the right place. What kind of solution do you need?"
    }
  },
  {
    id: 'D', // Propuesta de Valor / Urgencia
    text: {
      es: "¡Hola! Omar está ayudando a empresas a digitalizarse con éxito. ¿Quieres saber cómo podemos potenciar tu proyecto en tiempo récord?",
      en: "Hi! Omar is helping companies digitize successfully. Want to know how we can boost your project in record time?"
    }
  }
];

export function getRandomVariant(): OpeningVariant {
  const variants: OpeningVariant[] = ['A', 'B', 'C', 'D'];
  return variants[Math.floor(Math.random() * variants.length)];
}
