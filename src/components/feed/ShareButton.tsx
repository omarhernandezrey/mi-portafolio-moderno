"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function ShareButton({ url, title }: { url: string; title: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
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
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 text-sm font-medium transition-all"
      style={{ color: copied ? "var(--primary-color)" : "var(--muted-color)" }}
    >
      {copied ? <Check size={15} /> : <Share2 size={15} />}
      <span>{copied ? t("feed.linkCopied") : t("feed.share")}</span>
    </button>
  );
}
