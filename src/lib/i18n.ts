import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importar recursos de traducción
import esCommon from '@/locales/es/common.json';
import enCommon from '@/locales/en/common.json';

// Configuración de recursos
const resources = {
  es: {
    common: esCommon,
  },
  en: {
    common: enCommon,
  },
};

// Función para detectar idioma solo en el cliente
const detectClientLanguage = (): string => {
  if (typeof window === 'undefined') return 'es';
  
  try {
    // Prioridad: localStorage (elección explícita del usuario) -> español por defecto
    const savedLanguage = localStorage.getItem('i18nextLng');
    if (savedLanguage && ['es', 'en'].includes(savedLanguage)) {
      return savedLanguage;
    }
    
    // Siempre iniciar en español por defecto, no detectar automáticamente del navegador
    return 'es';
  } catch {
    return 'es';
  }
};

// Configuración de inicialización
const initConfig = {
  resources,
  lng: 'es', // Siempre español para SSR
  fallbackLng: 'es',
  debug: false, // Debug desactivado para producción
  
  // Configuración de namespace
  defaultNS: 'common',
  ns: ['common'],
  
  // Configuración de interpolación
  interpolation: {
    escapeValue: false, // React ya escapa por defecto
    prefix: '{',
    suffix: '}',
    formatSeparator: ',',
    unescapePrefix: '-',
    nestingPrefix: '$t(',
    nestingSuffix: ')',
    nestingOptionsSeparator: ',',
    defaultVariables: {},
  },
  
  // Configuración de reactividad para evitar problemas de hidratación
  react: {
    useSuspense: false,
    bindI18n: 'languageChanged',
    bindI18nStore: 'added',
    transEmptyNodeValue: '',
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'span'],
  },
  
  // Configuración de detección mínima para el cliente
  detection: {
    order: ['localStorage'], // Solo usar localStorage en el cliente
    lookupLocalStorage: 'i18nextLng',
    caches: ['localStorage'],
  },
};

// Inicializar i18next
i18n
  .use(initReactI18next)
  .init(initConfig)
  .then(() => {
    // Solo en el cliente, después de la hidratación
    if (typeof window !== 'undefined') {
      const clientLanguage = detectClientLanguage();
      if (clientLanguage !== i18n.language) {
        i18n.changeLanguage(clientLanguage).catch((error) => {
          console.error('Error setting initial client language:', error);
        });
      }
    }
  })
  .catch((error) => {
    console.error('Error initializing i18n:', error);
  });

export default i18n;