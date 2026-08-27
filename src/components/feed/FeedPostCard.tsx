"use client";

import { BadgeCheck, MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { SITE_URL } from "@/lib/seo";
import FeedBadge from "./FeedBadge";
import FeedImageGrid from "./FeedImageGrid";
import ReactionButton, { REACTIONS } from "./ReactionButton";
import ShareButton from "./ShareButton";
import type { FeedPost } from "@/lib/feed";

function relativeTime(iso: string, locale: string): string {
  const date = new Date(iso);
  const diffMs = date.getTime() - Date.now();
  const diffMin = Math.round(diffMs / 60000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
  const diffH = Math.round(diffMin / 60);
  if (Math.abs(diffH) < 24) return rtf.format(diffH, "hour");
  const diffD = Math.round(diffH / 24);
  if (Math.abs(diffD) < 30) return rtf.format(diffD, "day");
  const diffMonth = Math.round(diffD / 30);
  if (Math.abs(diffMonth) < 12) return rtf.format(diffMonth, "month");
  // Más de un año: una cuenta de "hace N años" pierde sentido para
  // contenido histórico con fecha estimada — se muestra la fecha absoluta.
  return date.toLocaleDateString(locale, { month: "short", year: "numeric" });
}

const MAX_CARD_CHARS = 280;

export default function FeedPostCard({
  post,
  variant = "card",
}: {
  post: FeedPost;
  variant?: "card" | "full";
}) {
  const { t, language } = useTranslation();
  const isTruncated = variant === "card" && post.body.length > MAX_CARD_CHARS;
  const bodyText = isTruncated ? post.body.slice(0, MAX_CARD_CHARS).trimEnd() + "…" : post.body;
  const postUrl = `${SITE_URL}${post.lang === "en" ? "/en" : ""}/comunidad/${post.id}`;
  const topReactions = REACTIONS.filter((r) => (post.reaction_counts[r.type] ?? 0) > 0)
    .sort((a, b) => (post.reaction_counts[b.type] ?? 0) - (post.reaction_counts[a.type] ?? 0))
    .slice(0, 3);

  return (
    <article
      className="rounded-2xl border p-5 sm:p-6 transition-all"
      style={{
        backgroundColor: "var(--card-bg-color)",
        borderColor: "color-mix(in srgb, var(--muted-color) 15%, transparent)",
      }}
    >
      <header className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
            style={{ backgroundColor: "color-mix(in srgb, var(--primary-color) 15%, transparent)", color: "var(--primary-color)" }}
          >
            {post.author_name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm truncate" style={{ color: "var(--text-color)" }}>
                {post.author_name}
              </span>
              {post.author_role === "owner" && (
                <BadgeCheck size={15} style={{ color: "var(--primary-color)" }} aria-label={t("feed.verified")} />
              )}
            </div>
            <span className="text-xs" style={{ color: "var(--muted-color)" }}>
              {relativeTime(post.created_at, language === "en" ? "en" : "es")}
            </span>
          </div>
        </div>
        <FeedBadge tone="accent">{t(`feed.category.${post.category}`)}</FeedBadge>
      </header>

      {variant === "full" ? (
        <h1 className="font-display italic text-2xl font-medium mb-2" style={{ color: "var(--text-color)" }}>
          {post.title ?? bodyText.slice(0, 80)}
        </h1>
      ) : (
        post.title && (
          <h3 className="font-display italic text-lg font-medium mb-2" style={{ color: "var(--text-color)" }}>
            {post.title}
          </h3>
        )
      )}

      <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3" style={{ color: "var(--text-color)" }}>
        {bodyText}
      </p>

      {isTruncated && (
        <Link
          href={`/comunidad/${post.id}`}
          className="text-xs font-bold hover:underline"
          style={{ color: "var(--primary-color)" }}
        >
          {t("feed.readMore")}
        </Link>
      )}

      <FeedImageGrid images={post.image_urls} alt={post.title ?? bodyText.slice(0, 100)} />

      {post.link_url && (
        <a
          href={post.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-xs truncate hover:underline mb-3"
          style={{ color: "var(--accent-color)" }}
        >
          {post.link_url}
        </a>
      )}

      {(post.likes_count > 0 || post.comments_count > 0) && (
        <div className="flex items-center justify-between text-xs mt-1 mb-1" style={{ color: "var(--muted-color)" }}>
          {post.likes_count > 0 ? (
            <span className="inline-flex items-center gap-1">
              <span className="inline-flex -space-x-1">
                {topReactions.map(({ type, emoji }) => (
                  <span key={type} className="text-sm leading-none">
                    {emoji}
                  </span>
                ))}
              </span>
              {post.likes_count}
            </span>
          ) : (
            <span />
          )}
          {post.comments_count > 0 && <span>{post.comments_count} {t("feed.commentsTitle").toLowerCase()}</span>}
        </div>
      )}

      <footer
        className="flex items-center justify-between gap-2 pt-2 mt-1 border-t"
        style={{ borderColor: "color-mix(in srgb, var(--muted-color) 12%, transparent)" }}
      >
        <ReactionButton postId={post.id} initialCount={post.likes_count} />
        <Link
          href={`/comunidad/${post.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
          style={{ color: "var(--muted-color)" }}
        >
          <MessageCircle size={16} />
          {t("feed.commentsTitle")}
        </Link>
        <ShareButton url={postUrl} title={post.title ?? post.body.slice(0, 60)} />
      </footer>
    </article>
  );
}
