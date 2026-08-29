'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import { Calendar, X } from 'lucide-react';
import { track } from '@vercel/analytics';
import { usePathname } from '@/i18n/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import {
  WHATSAPP_INTENTS,
  getIntentTarget,
  type Locale,
  type WhatsAppIntent,
} from '@/config/whatsapp';

/**
 * Botón flotante de contacto por WhatsApp con menú rápido de intención.
 * Reemplaza al ChatWidget como canal de contacto. No escribe nada en la BD:
 * cada opción abre WhatsApp (o Cal.com para "agendar llamada"); el clic solo
 * se registra como evento de analítica (`whatsapp_click` / `calcom_click`).
 */
export default function WhatsAppFloatingButton() {
  const { t, language } = useTranslation();
  const pathname = usePathname();
  const locale: Locale = language === 'en' ? 'en' : 'es';

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // Cerrar con Esc + clic fuera
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        fabRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  // Mover foco al primer ítem al abrir
  useEffect(() => {
    if (!open || !containerRef.current) return;
    const first = containerRef.current.querySelector<HTMLAnchorElement>(
      '[role="menuitem"]',
    );
    first?.focus();
  }, [open]);

  const handleIntent = useCallback(
    (intent: WhatsAppIntent, channel: 'whatsapp' | 'calcom') => {
      track(channel === 'calcom' ? 'calcom_click' : 'whatsapp_click', {
        intent,
        page: pathname,
      });
      setOpen(false);
    },
    [pathname],
  );

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            aria-label={t('whatsapp.menuTitle')}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="mb-3 w-[min(78vw,272px)] overflow-hidden rounded-2xl border border-[var(--primary-color)]/15 bg-[var(--card-bg-color)] shadow-[0_8px_40px_rgba(0,0,0,0.35)]"
          >
            <div className="flex items-center justify-between gap-2 border-b border-[var(--primary-color)]/15 px-4 py-3">
              <span className="text-xs font-black uppercase tracking-widest text-[var(--primary-color)]">
                {t('whatsapp.menuTitle')}
              </span>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  fabRef.current?.focus();
                }}
                aria-label={t('whatsapp.close')}
                className="rounded-lg p-1 text-[var(--text-color)]/60 transition-colors hover:bg-[var(--primary-color)]/10 hover:text-[var(--text-color)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary-color)]"
              >
                <X size={16} />
              </button>
            </div>

            <ul className="p-2">
              {WHATSAPP_INTENTS.map((intent) => {
                const target = getIntentTarget(pathname, locale, intent);
                return (
                  <li key={intent}>
                    <a
                      role="menuitem"
                      href={target.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleIntent(intent, target.channel)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--text-color)] transition-colors hover:bg-[var(--primary-color)]/10 focus-visible:bg-[var(--primary-color)]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary-color)]"
                    >
                      {target.channel === 'calcom' ? (
                        <Calendar
                          className="shrink-0 text-[var(--primary-color)]"
                          size={18}
                        />
                      ) : (
                        <FaWhatsapp
                          className="shrink-0 text-[#25D366]"
                          size={18}
                        />
                      )}
                      {t(`whatsapp.intent.${intent}`)}
                    </a>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        ref={fabRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('whatsapp.float')}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_30px_rgba(0,0,0,0.3)] ring-1 ring-white/20 transition-transform hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] motion-safe:animate-none sm:h-16 sm:w-16"
      >
        {open ? <X size={24} /> : <FaWhatsapp size={26} />}
      </button>
    </div>
  );
}
