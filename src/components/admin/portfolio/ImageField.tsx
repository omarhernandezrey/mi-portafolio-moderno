'use client';

import React, { useId } from 'react';
import { Upload, X } from 'lucide-react';
import { Input, AdminButton } from '@/components/admin/ui';

export interface ImageFieldProps {
  label: string;
  hint?: string;
  /** URL ya guardada (subida o pegada). */
  urlValue: string;
  onUrlChange: (v: string) => void;
  /** Data URL de un archivo recién elegido, aún sin subir. '' si no hay ninguno pendiente. */
  pendingDataUrl: string;
  onFileChange: (dataUrl: string) => void;
  error?: string;
}

const MAX_BYTES = 2 * 1024 * 1024;

/**
 * Logo o certificado por **archivo o por URL** (T-11). Subir un archivo dejo
 * un data URL pendiente que gana sobre cualquier URL escrita hasta que el
 * formulario se guarda; escribir una URL después de elegir un archivo
 * cancela esa subida pendiente, nunca se mandan las dos a la vez.
 */
export function ImageField({ label, hint, urlValue, onUrlChange, pendingDataUrl, onFileChange, error }: ImageFieldProps) {
  const fileId = useId();
  const vistaPrevia = pendingDataUrl || urlValue;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_BYTES) {
      onFileChange('');
      return;
    }
    const lector = new FileReader();
    lector.onload = () => onFileChange(String(lector.result ?? ''));
    lector.readAsDataURL(file);
  }

  function quitar() {
    onFileChange('');
    onUrlChange('');
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-label font-semibold text-admin-ink">{label}</span>

      {vistaPrevia && (
        <div className="flex items-center gap-3">
          {/* Vista previa: data URL o imagen ya subida/pegada, ninguna de las dos pasa por next/image. */}
          <img
            src={vistaPrevia}
            alt=""
            className="h-16 w-16 shrink-0 rounded-field border border-admin-line object-contain bg-admin-raised/50 p-1"
          />
          <AdminButton type="button" variant="ghost" size="sm" icon={<X size={14} />} onClick={quitar}>
            Quitar
          </AdminButton>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-2">
        <label
          htmlFor={fileId}
          className="flex h-11 cursor-pointer items-center gap-2 rounded-field border border-admin-line bg-admin-bg/60 px-3.5 text-sm font-semibold text-admin-ink transition-colors hover:border-primary/30"
        >
          <Upload size={15} />
          Subir archivo
        </label>
        <input id={fileId} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="sr-only" />

        <Input
          label="O pegar una URL"
          value={pendingDataUrl ? '' : urlValue}
          disabled={Boolean(pendingDataUrl)}
          onChange={(e) => {
            onFileChange('');
            onUrlChange(e.target.value);
          }}
          error={error}
          placeholder="https://…"
          containerClassName="min-w-[14rem] flex-1"
        />
      </div>

      {hint && <p className="text-xs text-admin-muted">{hint}</p>}
    </div>
  );
}
