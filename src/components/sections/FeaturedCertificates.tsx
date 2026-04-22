"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import styles from "./FeaturedCertificates.module.css";

export interface FeaturedCertificate {
  id: string;
  title: string;
  institution: string;
  summary: string;
  logo: string;
  certificate?: string | null;
}

interface FeaturedCertificatesProps {
  courses: FeaturedCertificate[];
}

const prefetchedUrls = new Set<string>();

const prefetchCertificate = (url?: string | null) => {
  if (!url || typeof window === "undefined") return;
  if (prefetchedUrls.has(url)) return;
  prefetchedUrls.add(url);
  const img = new window.Image();
  img.decoding = "async";
  img.loading = "eager";
  img.src = url;
};

const slideVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 48 : -48,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -48 : 48,
  }),
};

const FeaturedCertificates: React.FC<FeaturedCertificatesProps> = ({
  courses,
}) => {
  const { t, isHydrated } = useTranslation();
  const count = courses.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartTimeRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const thumbsTrackRef = useRef<HTMLDivElement>(null);

  const activeCourse = useMemo(
    () => courses[activeIndex] ?? null,
    [courses, activeIndex],
  );

  const goTo = useCallback(
    (next: number, overrideDirection?: 1 | -1) => {
      if (count === 0) return;
      const normalized = ((next % count) + count) % count;
      setActiveIndex((prev) => {
        if (normalized === prev) return prev;
        if (overrideDirection != null) {
          setDirection(overrideDirection);
        } else {
          setDirection(normalized > prev ? 1 : -1);
        }
        return normalized;
      });
    },
    [count],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1, 1), [goTo, activeIndex]);
  const goPrev = useCallback(() => goTo(activeIndex - 1, -1), [goTo, activeIndex]);

  useEffect(() => {
    setActiveIndex(0);
    setDirection(1);
  }, [courses]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      if (!el.contains(document.activeElement)) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goPrev, goNext]);

  useEffect(() => {
    const track = thumbsTrackRef.current;
    if (!track) return;
    const thumb = track.querySelector<HTMLElement>(
      `[data-thumb-index="${activeIndex}"]`,
    );
    if (!thumb) return;
    thumb.scrollIntoView({
      block: "nearest",
      inline: "center",
      behavior: "smooth",
    });
  }, [activeIndex]);

  useEffect(() => {
    if (count === 0) return;
    const prev = courses[(activeIndex - 1 + count) % count];
    const next = courses[(activeIndex + 1) % count];
    prefetchCertificate(prev?.certificate);
    prefetchCertificate(next?.certificate);
  }, [activeIndex, courses, count]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartXRef.current = t.clientX;
    touchStartYRef.current = t.clientY;
    touchStartTimeRef.current = Date.now();
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartXRef.current == null || touchStartTimeRef.current == null)
        return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartXRef.current;
      const dy = Math.abs(
        touch.clientY - (touchStartYRef.current ?? touch.clientY),
      );
      const dt = Date.now() - touchStartTimeRef.current;

      const distanceThreshold = Math.max(40, window.innerWidth * 0.08);
      if (Math.abs(dx) > distanceThreshold && dy < 60 && dt < 800) {
        if (dx < 0) {
          goNext();
        } else {
          goPrev();
        }
      }

      touchStartXRef.current = null;
      touchStartYRef.current = null;
      touchStartTimeRef.current = null;
    },
    [goNext, goPrev],
  );

  if (count === 0 || !activeCourse) return null;

  const progress = ((activeIndex + 1) / count) * 100;
  const labelPrev = isHydrated
    ? t("education.carouselPrevious")
    : "Ver certificación anterior";
  const labelNext = isHydrated
    ? t("education.carouselNext")
    : "Ver certificación siguiente";
  const labelView = isHydrated ? t("education.viewCertificate") : "Ver certificado";
  const labelHeader = isHydrated
    ? t("education.highlightsTitle")
    : "Certificaciones destacadas";
  const labelSub = isHydrated
    ? t("education.highlightsSubtitle")
    : "Una selección de logros que resumen mi crecimiento profesional.";
  const labelGoTo = (index: number) =>
    isHydrated
      ? t("education.goToHighlight", { index })
      : `Ir a la certificación ${index}`;

  return (
    <div className={styles.container} ref={rootRef}>
      <header className={styles.header}>
        <h3 className={styles.headerTitle}>{labelHeader}</h3>
        <p className={styles.headerSubtitle}>{labelSub}</p>
      </header>

      <div
        className={styles.stage}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button
          type="button"
          className={`${styles.nav} ${styles.navPrev}`}
          onClick={goPrev}
          disabled={count <= 1}
          aria-label={labelPrev}
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div
          className={styles.canvas}
          role="region"
          aria-live="polite"
          aria-label={labelHeader}
        >
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.article
              key={activeCourse.id}
              className={styles.card}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            >
              {activeCourse.certificate ? (
                <a
                  href={activeCourse.certificate}
                  className={styles.media}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={labelView}
                >
                  <Image
                    src={activeCourse.certificate}
                    alt={activeCourse.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 520px"
                    priority={activeIndex === 0}
                    className={styles.mediaImage}
                  />
                  <span className={styles.mediaHint}>
                    <svg
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M7 17 17 7" />
                      <polyline points="8 7 17 7 17 16" />
                    </svg>
                    {labelView}
                  </span>
                </a>
              ) : (
                <div className={`${styles.media} ${styles.mediaPlaceholder}`}>
                  <div className={styles.placeholderLogo}>
                    <Image
                      src={activeCourse.logo}
                      alt={activeCourse.institution}
                      width={56}
                      height={56}
                    />
                  </div>
                  <span>{activeCourse.institution}</span>
                </div>
              )}

              <div className={styles.content}>
                <span className={styles.counter}>
                  <strong>{String(activeIndex + 1).padStart(2, "0")}</strong>
                  <span aria-hidden="true">/</span>
                  <span>{String(count).padStart(2, "0")}</span>
                </span>
                <span className={styles.badge}>
                  <span className={styles.badgeLogo}>
                    <Image
                      src={activeCourse.logo}
                      alt={activeCourse.institution}
                      width={32}
                      height={32}
                    />
                  </span>
                  {activeCourse.institution}
                </span>
                <h4 className={styles.title}>{activeCourse.title}</h4>
                <p className={styles.summary}>{activeCourse.summary}</p>
                {activeCourse.certificate && (
                  <a
                    className={styles.cta}
                    href={activeCourse.certificate}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {labelView}
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </a>
                )}
              </div>
            </motion.article>
          </AnimatePresence>
        </div>

        <button
          type="button"
          className={`${styles.nav} ${styles.navNext}`}
          onClick={goNext}
          disabled={count <= 1}
          aria-label={labelNext}
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>

        <div className={styles.progress} aria-hidden="true">
          <span
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className={styles.thumbsWrap}>
        <div
          className={styles.thumbsTrack}
          ref={thumbsTrackRef}
          role="tablist"
          aria-label={labelHeader}
        >
          {courses.map((course, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={course.id}
                type="button"
                data-thumb-index={index}
                className={`${styles.thumb} ${isActive ? styles.thumbActive : ""}`}
                role="tab"
                aria-selected={isActive}
                aria-label={labelGoTo(index + 1)}
                onClick={() => goTo(index)}
                onMouseEnter={() => prefetchCertificate(course.certificate)}
                onFocus={() => prefetchCertificate(course.certificate)}
                title={course.title}
              >
                <span className={styles.thumbMedia}>
                  {course.certificate ? (
                    <Image
                      src={course.certificate}
                      alt=""
                      fill
                      sizes="120px"
                      className={styles.thumbImage}
                      loading="lazy"
                    />
                  ) : (
                    <Image
                      src={course.logo}
                      alt=""
                      width={48}
                      height={48}
                      className={styles.thumbLogoImg}
                      loading="lazy"
                    />
                  )}
                </span>
                <span className={styles.thumbCaption}>{course.institution}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeaturedCertificates;
