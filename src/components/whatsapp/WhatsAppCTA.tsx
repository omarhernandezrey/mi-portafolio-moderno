'use client';

import React from 'react';
import { track } from '@vercel/analytics';
import { usePathname } from '@/i18n/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import {
  buildWhatsAppUrl,
  getContextualMessage,
  type Locale,
} from '@/config/whatsapp';

interface WhatsAppCTAProps {
  /** Mensaje precargado explícito. Si se omite, se genera según la ruta actual. */
  message?: string;
  className?: string;
  /** Etiqueta de la intención para analítica (p. ej. "services-hero"). */
  intent?: string;
  children: React.ReactNode;
}

/**
 * Enlace inline a WhatsApp con mensaje precargado. Reemplazo directo de
 * <OpenChatButton> — misma API (message, className, children).
 */
export default function WhatsAppCTA({
  message,
  className,
  intent = 'inline-cta',
  children,
}: WhatsAppCTAProps) {
  const { language } = useTranslation();
  const pathname = usePathname();
  const locale: Locale = language === 'en' ? 'en' : 'es';

  const text = message ?? getContextualMessage(pathname, locale);

  return (
    <a
      href={buildWhatsAppUrl(text)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => track('whatsapp_click', { intent, page: pathname })}
    >
      {children}
    </a>
  );
}
