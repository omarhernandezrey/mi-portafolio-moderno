"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function ShareButton({ url, title }: { url: string; title: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleShare = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({ url, title });
          return;
        } catch {
          // Usuario canceló el share nativo o no está soportado — seguimos al fallback.
        }
      }
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard bloqueado — no hay más fallback razonable, se ignora silenciosamente.
      }
    } finally {
      setBusy(false);
    }
  };

  const label = copied ? t("feed.linkCopied") : t("feed.share");

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={busy}
      aria-label={label}
      title={label}
      className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-lg transition-all disabled:opacity-60 hover:bg-[color-mix(in_srgb,var(--muted-color)_10%,transparent)] focus-visible:outline-none focus-visible:ring-2 active:scale-95"
      style={{
        color: copied ? "var(--primary-color)" : "var(--muted-color)",
        ["--tw-ring-color" as string]: "var(--primary-color)",
      }}
    >
      {copied ? <Check size={18} /> : <Share2 size={18} />}
    </button>
  );
}
