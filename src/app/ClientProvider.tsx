"use client";

import { useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { I18nProvider } from '@/contexts/I18nContext';
import { ToastProvider } from '@/components/ui/Toast';
import dynamic from 'next/dynamic';

// Importar i18n para inicializar
import '@/lib/i18n';

// Cargar ChatWidget de forma dinámica para optimizar performance (SSR: false)
const ChatWidget = dynamic(() => import('@/components/shared/ChatWidget'), {
  ssr: false,
  loading: () => null,
});

interface ClientProviderProps {
  children: React.ReactNode;
}

export default function ClientProvider({ children }: ClientProviderProps) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 768px)').matches;
  });

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

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
      <ToastProvider>
        <MotionConfig reducedMotion={isMobile ? 'always' : 'never'}>
          {children}
          <ChatWidget />
        </MotionConfig>
      </ToastProvider>
    </I18nProvider>
  );
}
