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
  }, []);

  return (
    <I18nProvider>
      {children}
    </I18nProvider>
  );
}