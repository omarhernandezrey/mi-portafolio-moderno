import { SERVICES_CATALOG } from '../chatbot/data/catalog';

export interface CalculatorStep {
  id: string;
  title: { es: string; en: string; pt: string };
  options: CalculatorOption[];
}

export interface CalculatorOption {
  id: string;
  label: { es: string; en: string; pt: string };
  description?: { es: string; en: string; pt: string };
  priceImpact: number; // Precio base o adicional
  impactType: 'base' | 'add' | 'multiplier';
}

export const CALCULATOR_STEPS: CalculatorStep[] = [
  {
    id: 'project-type',
    title: { 
      es: '¿Qué tipo de proyecto tienes en mente?', 
      en: 'What type of project do you have in mind?',
      pt: 'Que tipo de projeto você tem em mente?' 
    },
    options: SERVICES_CATALOG.filter(s => ['landing-page', 'corporate-web', 'ecommerce', 'web-app-mvp'].includes(s.id)).map(s => ({
      id: s.id,
      label: s.name,
      description: s.description,
      priceImpact: typeof s.priceRange.min === 'number' ? s.priceRange.min : 0,
      impactType: 'base'
    }))
  },
  {
    id: 'features',
    title: { 
      es: '¿Qué funcionalidades necesitas?', 
      en: 'What features do you need?',
      pt: 'Quais funcionalidades você precisa?' 
    },
    options: [
      {
        id: 'auth',
        label: { es: 'Autenticación de usuarios', en: 'User Authentication', pt: 'Autenticação de usuários' },
        description: { es: 'Login, registro y perfiles', en: 'Login, registration, and profiles', pt: 'Login, registro e perfis' },
        priceImpact: 400,
        impactType: 'add'
      },
      {
        id: 'payments',
        label: { es: 'Pasarela de pagos', en: 'Payment Gateway', pt: 'Checkout de pagamentos' },
        description: { es: 'Stripe, PayPal, Mercado Pago', en: 'Stripe, PayPal, Mercado Pago', pt: 'Stripe, PayPal, Mercado Pago' },
        priceImpact: 500,
        impactType: 'add'
      },
      {
        id: 'cms',
        label: { es: 'Gestor de contenidos (CMS)', en: 'Content Management (CMS)', pt: 'Gestor de conteúdo (CMS)' },
        description: { es: 'Panel para editar textos e imágenes', en: 'Panel to edit text and images', pt: 'Painel para editar textos e imagens' },
        priceImpact: 300,
        impactType: 'add'
      },
      {
        id: 'multilanguage',
        label: { es: 'Multi-idioma', en: 'Multi-language', pt: 'Multi-idioma' },
        description: { es: 'Soporte para varios idiomas', en: 'Support for multiple languages', pt: 'Suporte para vários idiomas' },
        priceImpact: 250,
        impactType: 'add'
      },
      {
        id: 'seo-advanced',
        label: { es: 'SEO Avanzado', en: 'Advanced SEO', pt: 'SEO Avançado' },
        description: { es: 'Optimización profunda para Google', en: 'Deep optimization for Google', pt: 'Otimização profunda para o Google' },
        priceImpact: 200,
        impactType: 'add'
      }
    ]
  },
  {
    id: 'urgency',
    title: { 
      es: '¿Cuál es tu plazo deseado?', 
      en: 'What is your desired timeline?',
      pt: 'Qual é o seu prazo desejado?' 
    },
    options: [
      {
        id: 'normal',
        label: { es: 'Normal (Ritmo estándar)', en: 'Normal (Standard pace)', pt: 'Normal (Ritmo padrão)' },
        priceImpact: 1,
        impactType: 'multiplier'
      },
      {
        id: 'fast',
        label: { es: 'Rápido (Prioridad alta)', en: 'Fast (High priority)', pt: 'Rápido (Prioridade alta)' },
        priceImpact: 1.25,
        impactType: 'multiplier'
      },
      {
        id: 'urgent',
        label: { es: 'Urgente (Entrega inmediata)', en: 'Urgent (Immediate delivery)', pt: 'Urgente (Entrega imediata)' },
        priceImpact: 1.5,
        impactType: 'multiplier'
      }
    ]
  }
];

export const calculateBudget = (selections: Record<string, string | string[]>): number => {
  let total = 0;
  let multiplier = 1;

  CALCULATOR_STEPS.forEach(step => {
    const selection = selections[step.id];
    if (!selection) return;

    if (Array.isArray(selection)) {
      selection.forEach(id => {
        const option = step.options.find(o => o.id === id);
        if (option) {
          if (option.impactType === 'base' || option.impactType === 'add') {
            total += option.priceImpact;
          } else if (option.impactType === 'multiplier') {
            multiplier *= option.priceImpact;
          }
        }
      });
    } else {
      const option = step.options.find(o => o.id === selection);
      if (option) {
        if (option.impactType === 'base' || option.impactType === 'add') {
          total += option.priceImpact;
        } else if (option.impactType === 'multiplier') {
          multiplier *= option.priceImpact;
        }
      }
    }
  });

  return Math.round(total * multiplier);
};
