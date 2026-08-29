import { SERVICES_CATALOG } from '../services/catalog';

export interface CalculatorStep {
  id: string;
  title: { es: string; en: string };
  options: CalculatorOption[];
}

export interface CalculatorOption {
  id: string;
  label: { es: string; en: string };
  description?: { es: string; en: string };
  priceImpact: number; // Precio base o adicional
  impactType: 'base' | 'add' | 'multiplier';
}

export const CALCULATOR_STEPS: CalculatorStep[] = [
  {
    id: 'project-type',
    title: { 
      es: '¿Qué tipo de proyecto tienes en mente?', 
      en: 'What type of project do you have in mind?'
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
      en: 'What features do you need?'
    },
    options: [
      {
        id: 'auth',
        label: { es: 'Autenticación de usuarios', en: 'User Authentication' },
        description: { es: 'Login, registro y perfiles', en: 'Login, registration, and profiles' },
        priceImpact: 400,
        impactType: 'add'
      },
      {
        id: 'payments',
        label: { es: 'Pasarela de pagos', en: 'Payment Gateway' },
        description: { es: 'Stripe, PayPal, Mercado Pago', en: 'Stripe, PayPal, Mercado Pago' },
        priceImpact: 500,
        impactType: 'add'
      },
      {
        id: 'cms',
        label: { es: 'Gestor de contenidos (CMS)', en: 'Content Management (CMS)' },
        description: { es: 'Panel para editar textos e imágenes', en: 'Panel to edit text and images' },
        priceImpact: 300,
        impactType: 'add'
      },
      {
        id: 'multilanguage',
        label: { es: 'Multi-idioma', en: 'Multi-language' },
        description: { es: 'Soporte para varios idiomas', en: 'Support for multiple languages' },
        priceImpact: 250,
        impactType: 'add'
      },
      {
        id: 'seo-advanced',
        label: { es: 'SEO Avanzado', en: 'Advanced SEO' },
        description: { es: 'Optimización profunda para Google', en: 'Deep optimization for Google' },
        priceImpact: 200,
        impactType: 'add'
      }
    ]
  },
  {
    id: 'urgency',
    title: { 
      es: '¿Cuál es tu plazo deseado?', 
      en: 'What is your desired timeline?'
    },
    options: [
      {
        id: 'normal',
        label: { es: 'Normal (Ritmo estándar)', en: 'Normal (Standard pace)' },
        priceImpact: 1,
        impactType: 'multiplier'
      },
      {
        id: 'fast',
        label: { es: 'Rápido (Prioridad alta)', en: 'Fast (High priority)' },
        priceImpact: 1.25,
        impactType: 'multiplier'
      },
      {
        id: 'urgent',
        label: { es: 'Urgente (Entrega inmediata)', en: 'Urgent (Immediate delivery)' },
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
