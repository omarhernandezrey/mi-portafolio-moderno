'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import {
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Clock3,
  Command,
  Search,
  X,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { PostMetadata } from '@/lib/blog';
import { BLOG_TOPICS, getPostTopics, getPrimaryTopic } from '@/data/blogTopics';
import ScrollReveal from '@/components/shared/ScrollReveal';
import PostCover from './PostCover';

type SortOption = 'newest' | 'oldest' | 'longest';

interface BlogArchiveProps {
  posts: PostMetadata[];
  locale: 'es' | 'en';
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function formatDate(date: string, locale: 'es' | 'en', options: Intl.DateTimeFormatOptions): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-CO', options);
}

function sortPosts(posts: PostMetadata[], sort: SortOption): PostMetadata[] {
  return [...posts].sort((a, b) => {
    if (sort === 'oldest') return a.date.localeCompare(b.date);
    if (sort === 'longest') {
      return (b.readingTime ?? 0) - (a.readingTime ?? 0) || b.date.localeCompare(a.date);
    }
    return b.date.localeCompare(a.date);
  });
}

function TopicChip({
  active,
  count,
  label,
  onClick,
}: {
  active: boolean;
  count: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={clsx(
        'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 font-mono-label text-[8px] transition-colors duration-300',
        active
          ? 'border-primary bg-primary text-background'
          : 'border-white/10 bg-white/[0.02] text-muted-60 hover:border-white/25 hover:text-white-custom',
      )}
    >
      {label}
      <span className={active ? 'text-background-60' : 'text-muted-30'}>{count}</span>
    </button>
  );
}

function FeaturedEssay({
  post,
  locale,
  index,
}: {
  post: PostMetadata;
  locale: 'es' | 'en';
  index: number;
}) {
  const topic = getPrimaryTopic(post, locale);

  return (
    <ScrollReveal y={20}>
      <Link
        href={`/blog/${post.slug}`}
        className="group relative block overflow-hidden rounded-[32px] border border-white/10 bg-card-50 shadow-2xl transition-colors duration-500 hover:border-primary"
      >
        <div className="grid lg:grid-cols-12">
          <div className="order-2 flex flex-col justify-between p-7 sm:p-10 lg:order-1 lg:col-span-7 lg:p-12">
            <div>
              <div className="flex flex-wrap items-center gap-3 font-mono-label text-[8px] text-muted-40">
                <span className="inline-flex items-center gap-2 text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {locale === 'en' ? 'Cover story' : 'Ensayo de portada'}
                </span>
                <span className="h-px w-6 bg-white/15" />
                <span>{topic?.label ?? (locale === 'en' ? 'Essay' : 'Ensayo')}</span>
              </div>

              <h2 className="mt-6 font-display text-3xl font-medium italic leading-[1.04] text-white-custom transition-colors duration-500 group-hover:text-primary sm:text-4xl xl:text-5xl">
                {post.title}
              </h2>

              <p className="mt-5 line-clamp-3 text-sm leading-relaxed text-muted-70 sm:text-base">
                {post.description}
              </p>
            </div>

            <div className="mt-9">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono-label text-[8px] text-muted-40">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={11} />
                  {formatDate(post.date, locale, { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 size={11} />
                  {post.readingTime ?? 5} min
                </span>
                <span>{post.author}</span>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 px-2.5 py-1 font-mono-label text-[7px] text-muted-40"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="inline-flex items-center gap-2 font-mono-label text-[8px] text-muted-60 transition-colors group-hover:text-primary">
                  {locale === 'en' ? 'Read the essay' : 'Leer el ensayo'}
                  <ArrowUpRight
                    size={14}
                    className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </span>
              </div>
            </div>
          </div>

          <div className="order-1 min-h-[260px] overflow-hidden border-b border-white/10 sm:min-h-[320px] lg:order-2 lg:col-span-5 lg:min-h-full lg:border-b-0 lg:border-l">
            <PostCover
              post={post}
              locale={locale}
              index={index}
              variant="featured"
              className="h-full min-h-[260px] sm:min-h-[320px]"
            />
          </div>
        </div>
      </Link>
    </ScrollReveal>
  );
}

function EssayCard({
  post,
  locale,
  index,
}: {
  post: PostMetadata;
  locale: 'es' | 'en';
  index: number;
}) {
  const topic = getPrimaryTopic(post, locale);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-white/10 bg-card-40 transition-all duration-500 hover:-translate-y-1 hover:border-primary hover:bg-white/[0.04]"
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10">
        <PostCover post={post} locale={locale} index={index} className="h-full w-full" />
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 font-mono-label text-[8px] text-muted-40">
          <span className="text-primary-70">{topic?.label ?? (locale === 'en' ? 'Essay' : 'Ensayo')}</span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={10} />
            {formatDate(post.date, locale, { day: '2-digit', month: 'short' })}
          </span>
        </div>

        <h3 className="mt-3 font-display text-xl font-medium italic leading-snug text-white-custom transition-colors duration-300 group-hover:text-primary sm:text-2xl">
          {post.title}
        </h3>

        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-muted-60">
          {post.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <span className="inline-flex items-center gap-1.5 font-mono-label text-[8px] text-muted-40">
            <Clock3 size={11} />
            {post.readingTime ?? 5} min
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono-label text-[8px] text-muted-50 transition-colors group-hover:text-primary">
            {locale === 'en' ? 'Read' : 'Leer'}
            <ArrowUpRight
              size={12}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function BlogArchive({ posts, locale }: BlogArchiveProps) {
  const [query, setQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('newest');
  const [visible, setVisible] = useState(6);
  const searchRef = useRef<HTMLInputElement>(null);

  const topics = BLOG_TOPICS[locale];

  const indexBySlug = useMemo(() => {
    return new Map(posts.map((post, index) => [post.slug, index + 1]));
  }, [posts]);

  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const topic of topics) {
      counts[topic.id] = posts.filter((post) =>
        getPostTopics(post, locale).some((postTopic) => postTopic.id === topic.id),
      ).length;
    }
    return counts;
  }, [posts, locale, topics]);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = normalize(query.trim());
    const topic = activeTopic ? topics.find((item) => item.id === activeTopic) : null;

    const matches = posts.filter((post) => {
      if (topic && !getPostTopics(post, locale).some((postTopic) => postTopic.id === topic.id)) {
        return false;
      }
      if (!normalizedQuery) return true;

      const haystack = normalize(
        [
          post.title,
          post.description,
          post.author,
          ...post.tags,
          ...getPostTopics(post, locale).map((postTopic) => postTopic.label),
        ].join(' '),
      );

      return haystack.includes(normalizedQuery);
    });

    return sortPosts(matches, sort);
  }, [posts, query, activeTopic, sort, locale, topics]);

  const isDefaultView = query.trim() === '' && activeTopic === null && sort === 'newest';
  const featuredPost = isDefaultView ? filteredPosts[0] : undefined;
  const archivePosts = isDefaultView ? filteredPosts.slice(1) : filteredPosts;
  const visiblePosts = archivePosts.slice(0, visible);
  const hasMore = archivePosts.length > visible;

  const startHere = useMemo(() => {
    const picks: PostMetadata[] = [];
    const picked = new Set<string>();
    const priority = locale === 'en' ? ['pricing', 'development', 'seo'] : ['precios', 'desarrollo', 'seo'];

    for (const topicId of priority) {
      const post = posts.find(
        (candidate) =>
          !picked.has(candidate.slug) &&
          getPostTopics(candidate, locale).some((topic) => topic.id === topicId),
      );
      if (post) {
        picks.push(post);
        picked.add(post.slug);
      }
    }

    for (const post of posts) {
      if (picks.length >= 3) break;
      if (!picked.has(post.slug)) {
        picks.push(post);
        picked.add(post.slug);
      }
    }

    return picks.slice(0, 3);
  }, [posts, locale]);

  useEffect(() => {
    setVisible(6);
  }, [query, activeTopic, sort]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;

      const isSearchShortcut =
        (event.key === '/' && !isTyping) ||
        ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k');

      if (!isSearchShortcut) return;
      event.preventDefault();
      searchRef.current?.focus();
      searchRef.current?.select();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleTopicChange = (topicId: string | null) => {
    setActiveTopic(topicId);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      window.setTimeout(() => {
        document.getElementById('archive')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  };

  const clearFilters = () => {
    setQuery('');
    setActiveTopic(null);
    setSort('newest');
  };

  const resultsLabel =
    locale === 'en'
      ? `${filteredPosts.length} ${filteredPosts.length === 1 ? 'essay' : 'essays'}`
      : `${filteredPosts.length} ${filteredPosts.length === 1 ? 'ensayo' : 'ensayos'}`;

  return (
    <section id="archive" className="min-w-0 scroll-mt-24 space-y-8">
      <div className="flex flex-col gap-4 border-t border-white/10 pt-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono-label text-[8px] text-primary-60">
            {locale === 'en' ? 'The Archive' : 'El Archivo'}
          </p>
          <h2 className="mt-2 font-display text-3xl font-medium italic tracking-tight text-white-custom sm:text-4xl">
            {locale === 'en' ? 'Every essay, indexed' : 'Todos los ensayos, indexados'}
          </h2>
        </div>
        <p className="font-mono-label text-[8px] text-muted-40">
          {locale === 'en'
            ? 'Filter by topic, search, or sort the archive'
            : 'Filtra por tema, busca o reordena el archivo'}
        </p>
      </div>

      <div className="space-y-5 border-y border-white/10 py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-40"
            />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={
                locale === 'en' ? 'Search title or topic…' : 'Buscar título o tema…'
              }
              aria-label={locale === 'en' ? 'Search the archive' : 'Buscar en el archivo'}
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] pl-11 pr-20 text-sm text-text-main outline-none transition-colors placeholder:text-muted-35 focus:border-primary focus:bg-white/[0.05]"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={locale === 'en' ? 'Clear search' : 'Limpiar búsqueda'}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-50 transition-colors hover:bg-white/10 hover:text-white-custom"
              >
                <X size={14} />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono-label text-[7px] text-muted-35 sm:flex">
                <Command size={9} /> K
              </kbd>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 lg:justify-end">
            <span aria-live="polite" className="font-mono-label text-[8px] text-muted-40">
              {resultsLabel}
            </span>
            <div className="relative">
              <label htmlFor="blog-sort" className="sr-only">
                {locale === 'en' ? 'Sort essays' : 'Ordenar ensayos'}
              </label>
              <select
                id="blog-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortOption)}
                className="h-10 appearance-none rounded-xl border border-white/10 bg-white/[0.03] pl-3 pr-9 text-[11px] font-bold text-text-muted outline-none transition-colors focus:border-primary [color-scheme:dark]"
              >
                <option value="newest">{locale === 'en' ? 'Newest first' : 'Más recientes'}</option>
                <option value="oldest">{locale === 'en' ? 'Oldest first' : 'Más antiguos'}</option>
                <option value="longest">{locale === 'en' ? 'Longest read' : 'Lectura más larga'}</option>
              </select>
              <ChevronDown
                size={13}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-40"
              />
            </div>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <TopicChip
            active={activeTopic === null}
            count={posts.length}
            label={locale === 'en' ? 'All topics' : 'Todos los temas'}
            onClick={() => handleTopicChange(null)}
          />
          {topics.map((topic) => (
            <TopicChip
              key={topic.id}
              active={activeTopic === topic.id}
              count={topicCounts[topic.id] ?? 0}
              label={topic.label}
              onClick={() => handleTopicChange(topic.id)}
            />
          ))}
        </div>
      </div>

      {featuredPost && (
        <FeaturedEssay
          post={featuredPost}
          locale={locale}
          index={indexBySlug.get(featuredPost.slug) ?? 1}
        />
      )}

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          {visiblePosts.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {visiblePosts.map((post, index) => (
                <ScrollReveal key={post.slug} delay={(index % 2) * 0.06} className="h-full">
                  <EssayCard
                    post={post}
                    locale={locale}
                    index={indexBySlug.get(post.slug) ?? index + 1}
                  />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-white/15 px-6 py-20 text-center">
              <Search size={32} strokeWidth={1} className="mx-auto text-muted-25" />
              <p className="mt-5 font-display text-2xl font-medium italic text-white-custom">
                {locale === 'en' ? 'No essays found' : 'Sin resultados'}
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-55">
                {locale === 'en'
                  ? `Nothing matched “${query}”. Try another term or clear the filters.`
                  : `No encontramos coincidencias para “${query}”. Prueba con otro término o limpia los filtros.`}
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-mono-label text-[8px] text-background transition-transform hover:scale-105"
              >
                {locale === 'en' ? 'Clear filters' : 'Limpiar filtros'}
                <X size={12} />
              </button>
            </div>
          )}

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setVisible((current) => current + 6)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 font-mono-label text-[8px] text-muted-60 transition-colors hover:border-primary hover:text-white-custom"
              >
                {locale === 'en' ? 'Load more essays' : 'Cargar más ensayos'}
                <ArrowDown size={13} />
              </button>
            </div>
          )}
        </div>

        <aside className="min-w-0 lg:col-span-4">
          <div className="space-y-5 lg:sticky lg:top-28">
            <div className="rounded-[26px] border border-white/10 bg-card-40 p-6">
              <div className="flex items-center justify-between">
                <p className="font-mono-label text-[8px] text-primary-60">
                  {locale === 'en' ? 'Topic index' : 'Índice de temas'}
                </p>
                <span className="font-mono-label text-[7px] text-muted-30">
                  {topics.length.toString().padStart(2, '0')}
                </span>
              </div>
              <div className="mt-4 space-y-1">
                <button
                  type="button"
                  onClick={() => handleTopicChange(null)}
                  aria-pressed={activeTopic === null}
                  className={clsx(
                    'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                    activeTopic === null
                      ? 'bg-primary-10 text-primary'
                      : 'text-muted-60 hover:bg-white/5 hover:text-white-custom',
                  )}
                >
                  <span>{locale === 'en' ? 'All essays' : 'Todos los ensayos'}</span>
                  <span className="font-mono-label text-[8px] opacity-50">{posts.length}</span>
                </button>
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => handleTopicChange(topic.id)}
                    aria-pressed={activeTopic === topic.id}
                    className={clsx(
                      'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                      activeTopic === topic.id
                        ? 'bg-primary-10 text-primary'
                        : 'text-muted-60 hover:bg-white/5 hover:text-white-custom',
                    )}
                  >
                    <span>{topic.label}</span>
                    <span className="font-mono-label text-[8px] opacity-50">{topicCounts[topic.id] ?? 0}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[26px] border border-white/10 bg-card-40 p-6">
              <p className="font-mono-label text-[8px] text-primary-60">
                {locale === 'en' ? 'About the author' : 'Sobre el autor'}
              </p>
              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary-25 bg-primary-10 font-display text-xl font-medium italic text-primary">
                  OH
                </div>
                <div>
                  <p className="font-display text-lg font-medium italic text-white-custom">Omar Hernández Rey</p>
                  <p className="mt-0.5 text-[11px] text-muted-55">Full Stack Developer · Bogotá</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-muted-60">
                {locale === 'en'
                  ? 'Field notes from building web products for companies and founders in Colombia and abroad. Code, pricing, SEO, and the decisions behind them.'
                  : 'Notas de campo construyendo productos web para empresas y fundadores en Colombia y el exterior. Código, precios, SEO y las decisiones detrás.'}
              </p>
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
                <div>
                  <p className="font-display text-xl font-medium italic text-white-custom">3+</p>
                  <p className="font-mono-label text-[7px] text-muted-35">
                    {locale === 'en' ? 'Years' : 'Años'}
                  </p>
                </div>
                <div>
                  <p className="font-display text-xl font-medium italic text-white-custom">16+</p>
                  <p className="font-mono-label text-[7px] text-muted-35">
                    {locale === 'en' ? 'Projects' : 'Proyectos'}
                  </p>
                </div>
                <div>
                  <p className="font-display text-xl font-medium italic text-white-custom">24h</p>
                  <p className="font-mono-label text-[7px] text-muted-35">
                    {locale === 'en' ? 'Response' : 'Respuesta'}
                  </p>
                </div>
              </div>
              <Link
                href="/sobre-mi"
                className="mt-5 inline-flex items-center gap-1.5 font-mono-label text-[8px] text-muted-50 transition-colors hover:text-primary"
              >
                {locale === 'en' ? 'Meet the author' : 'Conocer al autor'}
                <ArrowUpRight size={12} />
              </Link>
            </div>

            {startHere.length > 0 && (
              <div className="rounded-[26px] border border-white/10 bg-card-40 p-6">
                <p className="font-mono-label text-[8px] text-primary-60">
                  {locale === 'en' ? 'Start here' : 'Por dónde empezar'}
                </p>
                <div className="mt-3 divide-y divide-white/5">
                  {startHere.map((post, index) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="group flex items-start gap-3 py-3.5 first:pt-2 last:pb-1"
                    >
                      <span className="mt-0.5 font-mono-label text-[8px] text-primary-50">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1 text-sm font-bold leading-snug text-muted-65 transition-colors group-hover:text-white-custom">
                        {post.title}
                      </span>
                      <ArrowUpRight
                        size={12}
                        className="mt-0.5 shrink-0 text-muted-25 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <p className="px-2 font-mono-label text-[7px] leading-relaxed text-muted-25">
              {locale === 'en'
                ? 'Written in MDX · Built with Next.js · No tracking pixels'
                : 'Escrito en MDX · Construido con Next.js · Sin píxeles de seguimiento'}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
