"use client";

import { useEffect } from 'react';
import { I18nProvider } from '@/contexts/I18nContext';

// Importar i18n para inicializar
import '@/lib/i18n';

interface ClientProviderProps {
  children: React.ReactNode;
}

export default function ClientProvider({ children }: ClientProviderProps) {
  useEffect(() => {
    // Asegurar que i18n esté inicializado en el cliente
    import('@/lib/i18n');
    
    // SOLUCIÓN: Forzar scroll funcional
    const forceScrollEnabled = () => {
      // Restaurar overflow en html y body
      document.documentElement.style.setProperty('overflow', 'visible', 'important');
      document.documentElement.style.setProperty('overflow-y', 'scroll', 'important');
      document.documentElement.style.setProperty('overflow-x', 'hidden', 'important');
      
      document.body.style.setProperty('overflow', 'visible', 'important');
      document.body.style.setProperty('overflow-y', 'auto', 'important');
      document.body.style.setProperty('overflow-x', 'hidden', 'important');
      document.body.style.setProperty('height', 'auto', 'important');
    };
    
    // Ejecutar en diferentes momentos
    forceScrollEnabled();
    setTimeout(forceScrollEnabled, 100);
    setTimeout(forceScrollEnabled, 500);
    
    return () => {
      // Cleanup si es necesario
    };
  }, []);

  return (
    <I18nProvider>
      {children}
    </I18nProvider>
  );
}