'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[admin error boundary]', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-card-bg border border-red-500/20 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-xl font-black text-white-custom">Error en el panel</h2>
        <p className="text-sm text-text-muted leading-relaxed">
          Algo falló al cargar esta sección. Puedes reintentar sin perder la sesión.
        </p>
        {error.digest && (
          <p className="text-[10px] font-mono text-text-muted/40">digest: {error.digest}</p>
        )}
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-background text-sm font-black hover:scale-105 transition-all"
        >
          <RefreshCw size={16} />
          Reintentar
        </button>
      </div>
    </div>
  );
}
