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
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-admin-danger/20 bg-card-bg p-8 text-center shadow-[0_24px_60px_-38px_rgba(0,0,0,0.95)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-admin-danger/20 bg-admin-danger/10 text-admin-danger">
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-xl font-black text-admin-ink">Error en el panel</h2>
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
