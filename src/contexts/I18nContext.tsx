"use client";

import React, { createContext, useContext, useMemo, useCallback, useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

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

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const locale = useLocale();
  const t = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  // El locale viene de la URL (resuelto en servidor) — cambiar de idioma
  // ahora navega a la misma página en el otro locale, no solo cambia estado.
  const setLanguage = useCallback((lang: string) => {
    if (lang === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: lang });
    });
  }, [locale, pathname, router, startTransition]);

  const translate = useCallback((key: string, options?: Record<string, unknown>) => {
    try {
      return t(key, options as Record<string, string | number | Date>);
    } catch {
      let text = key;
      if (options) {
        Object.entries(options).forEach(([placeholder, value]) => {
          const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
          text = text.replace(regex, String(value));
        });
      }
      return text;
    }
  }, [t]);

  const contextValue = useMemo<I18nContextType>(() => ({
    language: locale,
    setLanguage,
    t: translate,
    // El locale se resuelve en servidor antes del primer render — ya no
    // existe el hueco de hidratación que este flag existía para tapar.
    isReady: true,
    isHydrated: true,
  }), [locale, setLanguage, translate]);

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};
