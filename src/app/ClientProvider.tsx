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
    
    // SOLUCIÓN: Forzar scroll funcional (ejecutar después de la hidratación)
    const forceScrollEnabled = () => {
      // Usar requestAnimationFrame para evitar problemas de hidratación
      requestAnimationFrame(() => {
        const htmlEl = document.documentElement;
        const bodyEl = document.body;
        
        // Solo aplicar si no ya están configurados
        if (htmlEl.style.overflow !== 'scroll') {
          htmlEl.style.overflow = 'visible';
          htmlEl.style.overflowY = 'scroll';
          htmlEl.style.overflowX = 'hidden';
        }
        
        if (bodyEl.style.overflow !== 'auto') {
          bodyEl.style.overflow = 'visible';
          bodyEl.style.overflowY = 'auto';
          bodyEl.style.overflowX = 'hidden';
          bodyEl.style.height = 'auto';
        }
      });
    };
    
    // Ejecutar después de la hidratación completa
    setTimeout(forceScrollEnabled, 0);
    setTimeout(forceScrollEnabled, 100);
    
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