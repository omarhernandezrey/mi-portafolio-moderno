"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon, Link2, Send, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { FeedPost } from "@/lib/feed";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_IMAGES = 6;

export default function FeedComposer({
  onPosted,
}: {
  onPosted?: (post: FeedPost) => void;
}) {
  const { t, language } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [showLink, setShowLink] = useState(false);
  const [imageDataUrls, setImageDataUrls] = useState<string[]>([]);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error" | "rateLimited">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_IMAGES - imageDataUrls.length);
    for (const file of files) {
      if (file.size > MAX_IMAGE_BYTES) continue;
      const reader = new FileReader();
      reader.onload = () => setImageDataUrls((prev) => [...prev, reader.result as string].slice(0, MAX_IMAGES));
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImageDataUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setBody("");
    setLinkUrl("");
    setShowLink(false);
    setImageDataUrls([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !body.trim() || status === "submitting") return;

    setStatus("submitting");
    try {
      const res = await fetch("/api/feed/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: name.trim(),
          author_email: email.trim(),
          lang: language === "en" ? "en" : "es",
          body: body.trim(),
          link_url: linkUrl.trim() || undefined,
          image_data_urls: imageDataUrls.length ? imageDataUrls : undefined,
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
      setStatus("success");
      resetForm();
      if (onPosted && data.id) {
        onPosted({
          id: data.id,
          author_role: "visitor",
          author_name: name.trim(),
          lang: language === "en" ? "en" : "es",
          category: "general",
          title: null,
          body: body.trim(),
          image_urls: imageDataUrls,
          link_url: linkUrl.trim() || null,
          pinned: false,
          likes_count: 0,
          reaction_counts: {},
          comments_count: 0,
          created_at: new Date().toISOString(),
        });
      }
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border p-5 sm:p-6 mb-6"
      style={{
        backgroundColor: "var(--card-bg-color)",
        borderColor: "color-mix(in srgb, var(--muted-color) 15%, transparent)",
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("feed.namePlaceholder")}
          required
          maxLength={80}
          className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2"
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
          className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2"
          style={{
            backgroundColor: "var(--background-color)",
            borderColor: "color-mix(in srgb, var(--muted-color) 25%, transparent)",
            color: "var(--text-color)",
          }}
        />
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={t("feed.composerPlaceholder")}
        required
        minLength={1}
        maxLength={5000}
        rows={3}
        className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 resize-none mb-3"
        style={{
          backgroundColor: "var(--background-color)",
          borderColor: "color-mix(in srgb, var(--muted-color) 25%, transparent)",
          color: "var(--text-color)",
        }}
      />

      {showLink && (
        <input
          type="url"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder={t("feed.linkPlaceholder")}
          maxLength={500}
          className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 mb-3"
          style={{
            backgroundColor: "var(--background-color)",
            borderColor: "color-mix(in srgb, var(--muted-color) 25%, transparent)",
            color: "var(--text-color)",
          }}
        />
      )}

      {imageDataUrls.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {imageDataUrls.map((src, i) => (
            <div key={i} className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-24 w-24 object-cover rounded-xl border" style={{ borderColor: "color-mix(in srgb, var(--muted-color) 20%, transparent)" }} />
              <button
                type="button"
                onClick={() => removeImage(i)}
                aria-label={t("feed.removeImage")}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--primary-color)", color: "#fff" }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Honeypot anti-spam: campo oculto, invisible para humanos */}
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

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImageChange}
            className="hidden"
            id="feed-composer-image"
            disabled={imageDataUrls.length >= MAX_IMAGES}
          />
          <label
            htmlFor="feed-composer-image"
            aria-label={t("feed.addImage")}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:opacity-80 ${imageDataUrls.length >= MAX_IMAGES ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
            style={{ color: "var(--muted-color)" }}
          >
            <ImageIcon size={18} />
          </label>
          <button
            type="button"
            onClick={() => setShowLink((v) => !v)}
            aria-label={t("feed.linkPlaceholder")}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
            style={{ color: showLink ? "var(--primary-color)" : "var(--muted-color)" }}
          >
            <Link2 size={18} />
          </button>
        </div>

        <motion.button
          type="submit"
          disabled={status === "submitting" || !name.trim() || !email.trim() || !body.trim()}
          whileTap={{ scale: 0.96 }}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-opacity disabled:opacity-40"
          style={{ backgroundColor: "var(--primary-color)", color: "#fff" }}
        >
          <Send size={15} />
          {status === "submitting" ? t("feed.submitting") : t("feed.submit")}
        </motion.button>
      </div>

      {status === "success" && (
        <p className="text-xs font-medium mt-3" style={{ color: "var(--primary-color)" }}>
          {t("feed.postSuccess")}
        </p>
      )}
      {status === "error" && (
        <p className="text-xs font-medium mt-3" style={{ color: "#e5484d" }}>
          {t("feed.postError")}
        </p>
      )}
      {status === "rateLimited" && (
        <p className="text-xs font-medium mt-3" style={{ color: "#e5484d" }}>
          {t("feed.rateLimited")}
        </p>
      )}
    </form>
  );
}
