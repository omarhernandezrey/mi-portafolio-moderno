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
    
    // Si no hay idioma guardado, usar español por defecto
    return 'es';
  } catch {
    return 'es';
  }
};

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const { t, i18n: i18nInstance } = useTranslation('common');
  
  // Estado del idioma actual - inicializar con el idioma de i18n si está disponible
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => 
    i18nInstance.isInitialized ? i18nInstance.language : 'es'
  );
  
  // Detectar hidratación
  useEffect(() => {
    const initialLang = getInitialClientLanguage();
    setIsHydrated(true);
    
    // Cambiar idioma si es diferente al inicial
    if (initialLang !== 'es' && i18nInstance.isInitialized) {
      i18nInstance.changeLanguage(initialLang).then(() => {
        setCurrentLanguage(initialLang);
      }).catch((error) => {
        console.error('Error changing language on hydration:', error);
        setCurrentLanguage('es');
      });
    } else {
      setCurrentLanguage(initialLang);
    }
  }, [i18nInstance]);
  
  // Sincronizar con cambios de i18n
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng);
      
      // Asegurar que localStorage esté sincronizado
      if (typeof window !== 'undefined') {
        localStorage.setItem('i18nextLng', lng);
      }
    };

    if (i18nInstance.isInitialized) {
      // Escuchar cambios de idioma
      i18nInstance.on('languageChanged', handleLanguageChange);
      
      // Sincronizar estado inicial
      const currentLng = i18nInstance.language;
      if (currentLng !== currentLanguage) {
        setCurrentLanguage(currentLng);
      }
    }

    return () => {
      if (i18nInstance.isInitialized) {
        i18nInstance.off('languageChanged', handleLanguageChange);
      }
    };
  }, [i18nInstance, currentLanguage]);

  // Función para cambiar idioma
  const setLanguage = useCallback(async (lang: string) => {
    if (!['es', 'en'].includes(lang)) {
      console.error('Invalid language code:', lang);
      return;
    }

    if (lang === currentLanguage) {
      return;
    }

    try {
      // Forzar el cambio de idioma
      await i18nInstance.changeLanguage(lang);
      
      // Actualizar el estado local
      setCurrentLanguage(lang);
      
      // Guardar en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('i18nextLng', lang);
      }
      
      // Forzar re-render después de un pequeño delay
      setTimeout(() => {
        if (i18nInstance.language !== lang) {
          i18nInstance.changeLanguage(lang);
        }
      }, 50);
    } catch (error) {
      console.error('Error changing language:', error);
      throw error;
    }
  }, [i18nInstance, currentLanguage]);

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