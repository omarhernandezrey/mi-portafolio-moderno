'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';
import EmptyState from './EmptyState';
import { AdminButton } from './AdminButton';

interface ErrorStateProps {
  title?: string;
  description?: string;
  className?: string;
}

/**
 * Para páginas servidor (`force-dynamic`, sin estado de cliente para
 * refetch): un fallo real de Supabase no puede pintarse igual que "no hay
 * resultados todavía" — eso es un dato falso. "Reintentar" recarga la
 * página completa porque aquí no hay un `cargar()` al que volver a llamar.
 */
export default function ErrorState({
  title = 'No se pudo cargar esta información',
  description = 'Hubo un problema al consultar los datos. Intenta de nuevo en unos segundos.',
  className,
}: ErrorStateProps) {
  return (
    <EmptyState
      icon={<RefreshCw size={22} />}
      title={title}
      description={description}
      className={className}
      action={
        <AdminButton
          size="sm"
          icon={<RefreshCw size={14} />}
          onClick={() => window.location.reload()}
        >
          Reintentar
        </AdminButton>
      }
    />
  );
}
