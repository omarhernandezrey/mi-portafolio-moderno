"use client";

import { useState } from 'react';
import { Link2, Loader2, Check, Copy } from 'lucide-react';
import { useAdminToast } from '@/hooks/useAdminToast';
import { adminFetch } from '@/lib/admin/client-fetch';

export default function OnboardingLinkButton({ leadId }: { leadId: string }) {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const toast = useAdminToast();

  const generate = async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ url: string }>(`/api/admin/leads/${leadId}/onboarding`, {
        method: 'POST',
      });
      setUrl(data.url);
      await navigator.clipboard.writeText(data.url).catch(() => {});
      setCopied(true);
      toast.success('Link de onboarding copiado al portapapeles');
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al generar el link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted/60 ml-2">
        Onboarding del Cliente
      </h4>
      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="flex items-center gap-3 w-full px-6 py-4 rounded-[20px] border text-[10px] font-black uppercase tracking-widest transition-all text-accent hover:bg-accent/10 border-accent/20 disabled:opacity-50 active:scale-[0.98]"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : copied ? (
          <Check size={18} className="text-emerald-400" />
        ) : (
          <Link2 size={18} />
        )}
        {loading ? 'Generando...' : copied ? '¡Copiado!' : 'Generar link de onboarding'}
      </button>
      {url && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-background/50 border border-white/10">
          <code className="flex-1 text-[10px] text-text-muted truncate font-mono">{url}</code>
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(url).catch(() => {});
              toast.success('Copiado');
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted transition-colors"
            aria-label="Copiar link"
          >
            <Copy size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
