"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { FeedComment } from "@/lib/feed";

export default function CommentForm({
  postId,
  onPosted,
}: {
  postId: string;
  onPosted: (comment: FeedComment) => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "rateLimited">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !body.trim() || status === "submitting") return;

    setStatus("submitting");
    try {
      const res = await fetch(`/api/feed/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: name.trim(),
          author_email: email.trim(),
          body: body.trim(),
          website,
        }),
      });

      if (res.status === 429) {
        setStatus("rateLimited");
        return;
      }
      if (!res.ok) {
        setStatus("error");
        return;
      }

      const data = await res.json();
      onPosted({
        id: data.id,
        post_id: postId,
        author_name: name.trim(),
        body: body.trim(),
        created_at: new Date().toISOString(),
      });
      setBody("");
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("feed.namePlaceholder")}
          required
          maxLength={80}
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
          style={{
            backgroundColor: "var(--background-color)",
            borderColor: "color-mix(in srgb, var(--muted-color) 25%, transparent)",
            color: "var(--text-color)",
          }}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("feed.emailPlaceholder")}
          required
          maxLength={254}
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
          style={{
            backgroundColor: "var(--background-color)",
            borderColor: "color-mix(in srgb, var(--muted-color) 25%, transparent)",
            color: "var(--text-color)",
          }}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t("feed.commentPlaceholder")}
          required
          maxLength={1000}
          className="flex-1 rounded-full border px-4 py-2 text-sm outline-none focus:ring-2"
          style={{
            backgroundColor: "var(--background-color)",
            borderColor: "color-mix(in srgb, var(--muted-color) 25%, transparent)",
            color: "var(--text-color)",
          }}
        />
        <button
          type="submit"
          disabled={status === "submitting" || !name.trim() || !email.trim() || !body.trim()}
          aria-label={t("feed.commentSubmit")}
          className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-opacity disabled:opacity-40"
          style={{ backgroundColor: "var(--primary-color)", color: "#fff" }}
        >
          <Send size={14} />
        </button>
      </div>

      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] w-px h-px opacity-0"
        aria-hidden="true"
      />

      {status === "error" && (
        <p className="text-xs font-medium mt-2" style={{ color: "#e5484d" }}>
          {t("feed.commentError")}
        </p>
      )}
      {status === "rateLimited" && (
        <p className="text-xs font-medium mt-2" style={{ color: "#e5484d" }}>
          {t("feed.rateLimited")}
        </p>
      )}
    </form>
  );
}
