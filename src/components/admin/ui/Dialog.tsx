'use client';

import React from 'react';
import {
  Dialog as HeadlessDialog,
  DialogPanel,
  DialogTitle,
  Description,
} from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminButton } from './AdminButton';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  /** `md` para formularios, `sm` para confirmaciones. */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Diálogo del panel.
 *
 * En móvil entra como **hoja desde abajo** y ocupa el ancho completo con las
 * esquinas superiores redondeadas; desde `sm` se centra como ventana. Es la
 * diferencia entre un modal que se usa con el pulgar y uno que obliga a
 * estirar el dedo hasta el centro de la pantalla. `max-h` con `dvh` para que
 * la barra del navegador móvil no recorte el pie.
 *
 * Headless UI aporta el foco atrapado, el retorno del foco al cerrar, el
 * bloqueo de scroll y `aria-modal`.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}: DialogProps) {
  return (
    <HeadlessDialog open={open} onClose={onClose} className="relative z-100">
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div className="fixed inset-0 flex items-end justify-center sm:items-center sm:p-4">
        <DialogPanel
          className={cn(
            'admin-shell flex max-h-[90dvh] w-full flex-col overflow-hidden',
            'rounded-t-panel border border-admin-line bg-admin-surface shadow-e4',
            'sm:rounded-panel',
            size === 'sm' && 'sm:max-w-md',
            size === 'md' && 'sm:max-w-xl',
            size === 'lg' && 'sm:max-w-3xl',
            className,
          )}
        >
          {/* Asa visual de la hoja: comunica «esto se arrastra/cierra» en
              móvil. Decorativa, el cierre real está en el botón y el backdrop. */}
          <div className="flex justify-center pt-2.5 sm:hidden">
            <span
              aria-hidden="true"
              className="h-1 w-10 rounded-full bg-admin-line"
            />
          </div>

          <div className="flex items-start justify-between gap-4 px-5 pb-4 pt-4 sm:px-7 sm:pt-6">
            <div className="flex flex-col gap-1">
              <DialogTitle className="font-display text-section text-admin-ink">
                {title}
              </DialogTitle>
              {description && (
                <Description className="text-xs leading-relaxed text-admin-muted">
                  {description}
                </Description>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="-mr-1 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-admin-muted transition-colors duration-fast hover:bg-white/[0.06] hover:text-admin-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {children && (
            <div className="flex-1 overflow-y-auto px-5 pb-5 sm:px-7">
              {children}
            </div>
          )}

          {footer && (
            <div className="flex flex-col-reverse gap-2 border-t border-admin-line px-5 py-4 pb-safe sm:flex-row sm:justify-end sm:px-7">
              {footer}
            </div>
          )}
        </DialogPanel>
      </div>
    </HeadlessDialog>
  );
}

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger` para borrados: tiñe el botón de confirmar. */
  tone?: 'default' | 'danger';
  busy?: boolean;
}

/**
 * Confirmación para acciones destructivas.
 *
 * El botón de cancelar va **primero en el DOM** y el de confirmar al final:
 * en móvil la columna se invierte (`flex-col-reverse`) para que «Cancelar»
 * quede abajo, a mano, y confirmar exija subir el dedo. Un borrado no debe
 * ser el botón más fácil de pulsar.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'default',
  busy = false,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <AdminButton variant="ghost" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </AdminButton>
          <AdminButton
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Procesando…' : confirmLabel}
          </AdminButton>
        </>
      }
    />
  );
}
