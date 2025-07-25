"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

interface I18nContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
  isReady: boolean;
  isHydrated: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

interface I18nProviderProps {
  children: React.ReactNode;
}

// Detectar idioma inicial del lado del cliente
const getInitialClientLanguage = (): string => {
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

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const { t, i18n: i18nInstance } = useTranslation('common');
  
  // Estado del idioma actual
  const [currentLanguage, setCurrentLanguage] = useState<string>('es');
  
  // Detectar hidratación
  useEffect(() => {
    const initialLang = getInitialClientLanguage();
    setIsHydrated(true);
    
    // Cambiar idioma si es diferente al inicial
    if (initialLang !== 'es' && i18nInstance.isInitialized) {
      i18nInstance.changeLanguage(initialLang).then(() => {
        setCurrentLanguage(initialLang);
      });
    } else {
      setCurrentLanguage('es');
    }
  }, [i18nInstance]);
  
  // Sincronizar con cambios de i18n
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng);
    };

    if (i18nInstance.isInitialized) {
      i18nInstance.on('languageChanged', handleLanguageChange);
      setCurrentLanguage(i18nInstance.language);
    }

    return () => {
      if (i18nInstance.isInitialized) {
        i18nInstance.off('languageChanged', handleLanguageChange);
      }
    };
  }, [i18nInstance]);

  // Función para cambiar idioma
  const setLanguage = useCallback(async (lang: string) => {
    try {
      await i18nInstance.changeLanguage(lang);
      setCurrentLanguage(lang);
      
      // Guardar en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('i18nextLng', lang);
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  }, [i18nInstance]);

  // Memoizar el valor del contexto
  const contextValue = useMemo<I18nContextType>(() => ({
    language: isHydrated ? currentLanguage : 'es',
    setLanguage,
    t: (key: string, options?: Record<string, unknown>) => {
      try {
        return t(key, options);
      } catch {
        // Fallback con interpolación manual si hay error
        let text = key;
        if (options) {
          Object.entries(options).forEach(([placeholder, value]) => {
            const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
            text = text.replace(regex, String(value));
          });
        }
        return text;
      }
    },
    isReady: i18nInstance.isInitialized && isHydrated,
    isHydrated,
  }), [currentLanguage, isHydrated, t, i18nInstance.isInitialized, setLanguage]);

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};