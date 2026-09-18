import { SERVICES_CATALOG } from '../services/catalog';

export type Currency = 'cop' | 'usd';

export interface CalculatorStep {
  id: string;
  title: { es: string; en: string };
  options: CalculatorOption[];
}

export interface CalculatorOption {
  id: string;
  label: { es: string; en: string };
  description?: { es: string; en: string };
  impactType: 'base' | 'addPercent' | 'multiplier';
  /** Solo para impactType 'base': monto absoluto en cada moneda del catálogo. */
  priceImpactCop?: number;
  /** Solo para impactType 'base': monto absoluto en cada moneda del catálogo. */
  priceImpactUsd?: number;
  /**
   * Para 'addPercent': fracción del precio base (ej. 0.15 = +15%).
   * Para 'multiplier': factor multiplicativo (ej. 1.25 = +25%).
   * Ambos son adimensionales, por eso escalan igual en COP y en USD sin
   * necesitar un segundo número por moneda ni una tasa de conversión.
   */
  priceImpact?: number;
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
      impactType: 'base' as const,
      priceImpactCop: s.priceRange.cop.min,
      priceImpactUsd: s.priceRange.usd.min,
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
        impactType: 'addPercent',
        priceImpact: 0.15,
      },
      {
        id: 'payments',
        label: { es: 'Pasarela de pagos', en: 'Payment Gateway' },
        description: { es: 'Stripe, PayPal, Mercado Pago', en: 'Stripe, PayPal, Mercado Pago' },
        impactType: 'addPercent',
        priceImpact: 0.18,
      },
      {
        id: 'cms',
        label: { es: 'Gestor de contenidos (CMS)', en: 'Content Management (CMS)' },
        description: { es: 'Panel para editar textos e imágenes', en: 'Panel to edit text and images' },
        impactType: 'addPercent',
        priceImpact: 0.12,
      },
      {
        id: 'multilanguage',
        label: { es: 'Multi-idioma', en: 'Multi-language' },
        description: { es: 'Soporte para varios idiomas', en: 'Support for multiple languages' },
        impactType: 'addPercent',
        priceImpact: 0.10,
      },
      {
        id: 'seo-advanced',
        label: { es: 'SEO Avanzado', en: 'Advanced SEO' },
        description: { es: 'Optimización profunda para Google', en: 'Deep optimization for Google' },
        impactType: 'addPercent',
        priceImpact: 0.10,
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
        impactType: 'multiplier',
        priceImpact: 1,
      },
      {
        id: 'fast',
        label: { es: 'Rápido (Prioridad alta)', en: 'Fast (High priority)' },
        impactType: 'multiplier',
        priceImpact: 1.25,
      },
      {
        id: 'urgent',
        label: { es: 'Urgente (Entrega inmediata)', en: 'Urgent (Immediate delivery)' },
        impactType: 'multiplier',
        priceImpact: 1.5,
      }
    ]
  }
];

/**
 * Calcula el presupuesto en UNA sola moneda (nunca mezcla COP y USD).
 * total = precio_base(moneda) × (1 + Σ addPercent) × Π multiplier
 */
export const calculateBudget = (
  selections: Record<string, string | string[]>,
  currency: Currency
): number => {
  let base = 0;
  let addPercentSum = 0;
  let multiplier = 1;

  CALCULATOR_STEPS.forEach(step => {
    const selection = selections[step.id];
    if (!selection) return;

    const ids = Array.isArray(selection) ? selection : [selection];
    ids.forEach(id => {
      const option = step.options.find(o => o.id === id);
      if (!option) return;

      if (option.impactType === 'base') {
        base = (currency === 'cop' ? option.priceImpactCop : option.priceImpactUsd) ?? 0;
      } else if (option.impactType === 'addPercent') {
        addPercentSum += option.priceImpact ?? 0;
      } else if (option.impactType === 'multiplier') {
        multiplier *= option.priceImpact ?? 1;
      }
    });
  });

  return Math.round(base * (1 + addPercentSum) * multiplier);
};
