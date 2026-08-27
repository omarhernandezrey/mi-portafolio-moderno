"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import FeedComposer from "./FeedComposer";
import FeedPostCard from "./FeedPostCard";
import type { FeedPost } from "@/lib/feed";

export default function FeedList({
  initialPosts,
  initialHasMore,
}: {
  initialPosts: FeedPost[];
  initialHasMore: boolean;
}) {
  const { t } = useTranslation();
  const [posts, setPosts] = useState(initialPosts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/feed/posts?page=${nextPage}&limit=10`);
      if (!res.ok) return;
      const data = await res.json();
      setPosts((prev) => [...prev, ...data.posts]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePosted = (post: FeedPost) => {
    setPosts((prev) => [post, ...prev]);
  };

  return (
    <div>
      <FeedComposer onPosted={handlePosted} />

      {posts.length === 0 ? (
        <p className="text-center text-sm py-10" style={{ color: "var(--muted-color)" }}>
          {t("feed.noPosts")}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30, delay: Math.min(i, 6) * 0.03 }}
              >
                <FeedPostCard post={post} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="rounded-full px-6 py-2.5 text-sm font-bold border transition-colors disabled:opacity-50"
            style={{
              borderColor: "color-mix(in srgb, var(--primary-color) 40%, transparent)",
              color: "var(--primary-color)",
            }}
          >
            {loadingMore ? t("feed.loadingMore") : t("feed.loadMore")}
          </button>
        </div>
      )}
    </div>
  );
}
