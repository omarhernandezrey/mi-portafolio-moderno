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
    // Prioridad: localStorage -> navigator -> default
    const savedLanguage = localStorage.getItem('i18nextLng');
    if (savedLanguage && ['es', 'en'].includes(savedLanguage)) {
      return savedLanguage;
    }
    
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.includes('es')) return 'es';
    if (browserLang.includes('en')) return 'en';
    
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
  debug: false, // Desactivar debug para producción
  
  // Configuración de namespace
  defaultNS: 'common',
  ns: ['common'],
  
  // Configuración de interpolación
  interpolation: {
    escapeValue: false, // React ya escapa por defecto
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
  
  // Desactivar detección automática para evitar diferencias SSR/Cliente
  detection: {
    order: [], // No detectar automáticamente
    caches: [], // No cachear automáticamente
  },
};

// Inicializar i18next
i18n
  .use(initReactI18next)
  .init(initConfig)
  .then(() => {
    // Solo en el cliente, después de la hidratación
    if (typeof window !== 'undefined') {
      // Pequeño delay para asegurar que la hidratación esté completa
      setTimeout(() => {
        const clientLanguage = detectClientLanguage();
        if (clientLanguage !== 'es') {
          i18n.changeLanguage(clientLanguage);
        }
      }, 100);
    }
  })
  .catch((error) => {
    console.error('Error initializing i18n:', error);
  });

export default i18n;