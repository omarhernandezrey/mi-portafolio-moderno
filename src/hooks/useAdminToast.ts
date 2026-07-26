'use client';

import { useMemo } from 'react';
import { useToast } from '@/components/ui/Toast';

type ToastKind = 'success' | 'error' | 'info' | 'warning';

function cleanMessage(message: string): string {
  return message.replace(/^[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\s]+/u, '').trim() || message;
}

/**
 * API unificada de toasts para el admin (compatible con el estilo Notyf).
 * Usa ToastProvider del design system del panel.
 */
export function useAdminToast() {
  const { showToast } = useToast();

  return useMemo(
    () => ({
      success: (message: string) => showToast(cleanMessage(message), 'success'),
      error: (message: string) => showToast(cleanMessage(message), 'error'),
      info: (message: string) => showToast(cleanMessage(message), 'info'),
      warning: (message: string) => showToast(cleanMessage(message), 'warning'),
      open: (opts: { type?: string; message: string }) => {
        const type = (['success', 'error', 'info', 'warning'].includes(opts.type || '')
          ? opts.type
          : 'info') as ToastKind;
        showToast(cleanMessage(opts.message), type);
      },
    }),
    [showToast]
  );
}
