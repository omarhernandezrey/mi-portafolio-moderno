"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import type { ReactionType } from "@/lib/feed";

export const REACTIONS: { type: ReactionType; emoji: string; labelKey: string }[] = [
  { type: "like", emoji: "👍", labelKey: "feed.reaction.like" },
  { type: "love", emoji: "❤️", labelKey: "feed.reaction.love" },
  { type: "haha", emoji: "😆", labelKey: "feed.reaction.haha" },
  { type: "wow", emoji: "😮", labelKey: "feed.reaction.wow" },
  { type: "sad", emoji: "😢", labelKey: "feed.reaction.sad" },
  { type: "angry", emoji: "😠", labelKey: "feed.reaction.angry" },
];

const storageKey = (postId: string) => `feedReaction:${postId}`;
const LONG_PRESS_MS = 450;
const CLOSE_DELAY_MS = 300;

export default function ReactionButton({
  postId,
  initialCount,
}: {
  postId: string;
  initialCount: number;
}) {
  const { t } = useTranslation();
  const [count, setCount] = useState(initialCount);
  const [myReaction, setMyReaction] = useState<ReactionType | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey(postId));
      if (stored) setMyReaction(stored as ReactionType);
    } catch {
      // Storage inaccesible (privado/bloqueado) — degradamos sin recordar la reacción.
    }
  }, [postId]);

  const send = async (reaction: ReactionType) => {
    if (busy) return;
    setBusy(true);
    setPickerOpen(false);
    const previous = myReaction;
    const removing = previous === reaction;
    setMyReaction(removing ? null : reaction);
    setCount((c) => (removing ? Math.max(c - 1, 0) : previous ? c : c + 1));

    try {
      const res = await fetch(`/api/feed/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction }),
      });
      if (!res.ok) throw new Error("reaction failed");
      const data = await res.json();
      const finalReaction = (data.reaction ?? null) as ReactionType | null;
      setMyReaction(finalReaction);
      // El conteo final siempre lo confirma el servidor — evita que clics
      // rápidos sucesivos desincronicen el número mostrado localmente.
      if (typeof data.likes_count === "number") setCount(data.likes_count);
      try {
        if (finalReaction) localStorage.setItem(storageKey(postId), finalReaction);
        else localStorage.removeItem(storageKey(postId));
      } catch {
        // Ídem: sin persistencia local, la UI sigue funcionando igual.
      }
    } catch {
      setMyReaction(previous);
      setCount(initialCount);
    } finally {
      setBusy(false);
    }
  };

  const openPicker = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setPickerOpen(true);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setPickerOpen(false), CLOSE_DELAY_MS);
  };

  const handleTouchStart = () => {
    longPressTriggered.current = false;
    touchTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setPickerOpen(true);
    }, LONG_PRESS_MS);
  };
  const handleTouchEnd = () => {
    if (touchTimer.current) clearTimeout(touchTimer.current);
  };
  const handleClick = () => {
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }
    send(myReaction ?? "like");
  };

  const active = REACTIONS.find((r) => r.type === myReaction);

  return (
    <div className="relative inline-flex items-center gap-1.5" onMouseLeave={scheduleClose}>
      {pickerOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setPickerOpen(false)} />
          <div
            onMouseEnter={openPicker}
            className="absolute bottom-full left-0 mb-2 flex items-center gap-1 rounded-full px-2 py-1.5 shadow-lg border z-20"
            style={{
              backgroundColor: "var(--card-bg-color)",
              borderColor: "color-mix(in srgb, var(--muted-color) 20%, transparent)",
            }}
          >
            {REACTIONS.map((r) => (
              <button
                key={r.type}
                type="button"
                onClick={() => send(r.type)}
                title={t(r.labelKey)}
                className="text-xl leading-none p-1 hover:scale-125 transition-transform"
              >
                {r.emoji}
              </button>
            ))}
          </div>
        </>
      )}

      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={openPicker}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        disabled={busy}
        aria-label={t(active?.labelKey ?? "feed.reaction.like")}
        className="inline-flex items-center gap-1.5 text-sm font-medium transition-all disabled:cursor-default"
        style={{ color: active ? "var(--primary-color)" : "var(--muted-color)" }}
      >
        <span className="text-base leading-none">{active?.emoji ?? "👍"}</span>
        <span>{t(active?.labelKey ?? "feed.reaction.like")}</span>
      </button>

      {count > 0 && (
        <span className="text-sm" style={{ color: "var(--muted-color)" }}>
          {count}
        </span>
      )}
    </div>
  );
}
