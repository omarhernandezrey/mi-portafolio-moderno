"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import CommentForm from "./CommentForm";
import type { FeedComment } from "@/lib/feed";

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
  return date.toLocaleDateString(locale, { month: "short", year: "numeric" });
}

export default function CommentSection({
  postId,
  initialComments,
  initialHasMore,
}: {
  postId: string;
  initialComments: FeedComment[];
  initialHasMore: boolean;
}) {
  const { t, language } = useTranslation();
  const [comments, setComments] = useState(initialComments);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/feed/posts/${postId}/comments?page=${nextPage}&limit=20`);
      if (!res.ok) return;
      const data = await res.json();
      setComments((prev) => [...prev, ...data.comments]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePosted = (comment: FeedComment) => {
    setComments((prev) => [...prev, comment]);
  };

  return (
    <section
      className="rounded-2xl border p-5 sm:p-6"
      style={{
        backgroundColor: "var(--card-bg-color)",
        borderColor: "color-mix(in srgb, var(--muted-color) 15%, transparent)",
      }}
    >
      <h2 className="font-display italic text-lg font-medium mb-4" style={{ color: "var(--text-color)" }}>
        {t("feed.commentsTitle")} ({comments.length})
      </h2>

      {comments.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--muted-color)" }}>
          {t("feed.noComments")}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-xl px-4 py-3"
              style={{ backgroundColor: "color-mix(in srgb, var(--muted-color) 6%, transparent)" }}
            >
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="font-bold text-sm truncate min-w-0" style={{ color: "var(--text-color)" }}>
                  {comment.author_name}
                </span>
                <span className="text-xs shrink-0" style={{ color: "var(--muted-color)" }}>
                  {relativeTime(comment.created_at, language === "en" ? "en" : "es")}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap break-words" style={{ color: "var(--text-color)" }}>
                {comment.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="text-xs font-bold hover:underline disabled:opacity-50"
            style={{ color: "var(--primary-color)" }}
          >
            {loadingMore ? t("feed.loadingMore") : t("feed.loadMore")}
          </button>
        </div>
      )}

      <CommentForm postId={postId} onPosted={handlePosted} />
    </section>
  );
}
