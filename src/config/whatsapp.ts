/**
 * Configuración única del canal de contacto por WhatsApp.
 * Ningún componente debe hardcodear el número ni construir la URL a mano.
 */

import { clientEnv } from '@/config/env';

/** Número destino en formato E.164 sin '+', apto para enlaces wa.me. */
export const WHATSAPP_NUMBER: string =
  clientEnv.NEXT_PUBLIC_WHATSAPP_NUMBER || '573219052878';

export type Locale = 'es' | 'en';

/** Intenciones del menú rápido del botón flotante. */
export type WhatsAppIntent = 'quote' | 'service' | 'support' | 'call';

export const WHATSAPP_INTENTS: readonly WhatsAppIntent[] = [
  'quote',
  'service',
  'support',
  'call',
] as const;

/** Construye el enlace wa.me con el mensaje ya URL-encoded. */
export function buildWhatsAppUrl(message: string): string {
  const text = encodeURIComponent(message.trim());
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

// ─── Mensaje contextual según la sección desde donde se abre ──────────────────

type LocalizedText = Record<Locale, string>;

/** Prefijo de contexto por ruta (sin el prefijo de locale). Orden = prioridad. */
const CONTEXT_BY_PATH: ReadonlyArray<readonly [string, LocalizedText]> = [
  [
    '/servicios',
    {
      es: 'Hola Omar, vengo de la página de servicios de tu portafolio',
      en: "Hi Omar, I'm coming from the services page of your portfolio",
    },
  ],
  [
    '/blog',
    {
      es: 'Hola Omar, estaba leyendo tu blog',
      en: 'Hi Omar, I was reading your blog',
    },
  ],
  [
    '/comunidad',
    {
      es: 'Hola Omar, vengo de la sección Comunidad de tu portafolio',
      en: 'Hi Omar, I\'m coming from the Community section of your portfolio',
    },
  ],
  [
    '/recursos',
    {
      es: 'Hola Omar, vengo de la sección de recursos de tu portafolio',
      en: "Hi Omar, I'm coming from the resources section of your portfolio",
    },
  ],
  [
    '/calculadora',
    {
      es: 'Hola Omar, usé la calculadora de presupuesto de tu portafolio',
      en: 'Hi Omar, I used the budget calculator on your portfolio',
    },
  ],
];

const DEFAULT_CONTEXT: LocalizedText = {
  es: 'Hola Omar, vengo de tu portafolio',
  en: 'Hi Omar, I\'m coming from your portfolio',
};

const INTENT_PHRASES: Record<WhatsAppIntent, LocalizedText> = {
  quote: {
    es: 'Quiero cotizar un proyecto web. ¿Podemos hablar?',
    en: 'I want to get a quote for a web project. Can we talk?',
  },
  service: {
    es: 'Quiero consultar sobre uno de tus servicios.',
    en: 'I have a question about one of your services.',
  },
  support: {
    es: 'Necesito soporte con un proyecto existente.',
    en: 'I need support with an existing project.',
  },
  call: {
    es: 'Me gustaría agendar una llamada corta contigo.',
    en: "I'd like to schedule a short call with you.",
  },
};

function resolveContext(pathname: string): LocalizedText {
  for (const [prefix, text] of CONTEXT_BY_PATH) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return text;
  }
  return DEFAULT_CONTEXT;
}

/** Mensaje precargado para una intención concreta del menú rápido. */
export function getIntentMessage(
  pathname: string,
  locale: Locale,
  intent: WhatsAppIntent,
): string {
  const context = resolveContext(pathname)[locale];
  const phrase = INTENT_PHRASES[intent][locale];
  return `${context}. ${phrase}`;
}

/** Mensaje precargado genérico (CTAs inline, sin menú de intención). */
export function getContextualMessage(pathname: string, locale: Locale): string {
  const context = resolveContext(pathname)[locale];
  const tail =
    locale === 'en'
      ? 'I want to know more about how you can help me.'
      : 'Quiero saber más sobre cómo puedes ayudarme.';
  return `${context}. ${tail}`;
}
