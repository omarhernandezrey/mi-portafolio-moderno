'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { ChevronDown, List } from 'lucide-react';
import type { BlogHeading } from '@/lib/blogToc';

interface ArticleTocProps {
  items: BlogHeading[];
  locale: 'es' | 'en';
}

export default function ArticleToc({ items, locale }: ArticleTocProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const label = locale === 'en' ? 'Contents' : 'Contenido';
  const countLabel = String(items.length).padStart(2, '0');

  useEffect(() => {
    if (items.length === 0) return;

    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const renderList = (mobile = false) => (
    <ol className="mt-3 space-y-0.5">
      {items.map((item, index) => {
        const active = activeId === item.id;

        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={() => {
                setActiveId(item.id);
                if (mobile) detailsRef.current?.removeAttribute('open');
              }}
              className={clsx(
                'group flex gap-3 border-l py-2 pl-3 pr-2 text-[12px] leading-snug transition-colors',
                item.level === 3 && 'pl-6',
                active
                  ? 'border-primary text-primary'
                  : 'border-white/10 text-muted-45 hover:border-white/25 hover:text-white-custom',
              )}
            >
              <span className="mt-0.5 font-mono-label text-[7px] opacity-50">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span>{item.text}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );

  return (
    <>
      <nav aria-label={label} className="hidden lg:sticky lg:top-28 lg:block">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <p className="font-mono-label text-[8px] text-primary-60">{label}</p>
          <span className="font-mono-label text-[7px] text-muted-30">{countLabel}</span>
        </div>
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-hide">{renderList()}</div>
      </nav>

      <details
        ref={detailsRef}
        className="group rounded-2xl border border-white/10 bg-card-25 lg:hidden"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2 font-mono-label text-[8px] text-primary-60">
            <List size={13} />
            {label}
          </span>
          <span className="inline-flex items-center gap-2 font-mono-label text-[7px] text-muted-30">
            {countLabel}
            <ChevronDown size={13} className="transition-transform group-open:rotate-180" />
          </span>
        </summary>
        <div className="border-t border-white/10 px-3 pb-3">{renderList(true)}</div>
      </details>
    </>
  );
}
