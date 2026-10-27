import { Briefcase, Code2, Search, ShoppingBag, Wallet, type LucideIcon } from 'lucide-react';
import type { PostMetadata } from '@/lib/blog';
import { getPrimaryTopic, type BlogTopicIcon } from '@/data/blogTopics';

const TOPIC_ICONS: Record<BlogTopicIcon, LucideIcon> = {
  code: Code2,
  pricing: Wallet,
  ecommerce: ShoppingBag,
  seo: Search,
  business: Briefcase,
};

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (Math.imul(31, hash) + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

interface PostCoverProps {
  post: PostMetadata;
  locale: 'es' | 'en';
  index: number;
  variant?: 'featured' | 'card';
  className?: string;
}

/**
 * Portada generativa y determinista para cada ensayo: no depende de
 * imágenes externas ni de un CMS. El hash del slug decide la composición,
 * así que cada post tiene una pieza visual estable entre builds.
 */
export default function PostCover({ post, locale, index, variant = 'card', className }: PostCoverProps) {
  const topic = getPrimaryTopic(post, locale);
  const Icon = TOPIC_ICONS[topic?.icon ?? 'code'];
  const seed = hashString(post.slug);

  const x1 = 10 + (seed % 62);
  const y1 = 8 + ((seed >> 4) % 54);
  const x2 = 22 + ((seed >> 8) % 62);
  const y2 = 18 + ((seed >> 12) % 58);
  const angle = 105 + (seed % 150);
  const gridSize = 26 + (seed % 3) * 12;
  const ringSize = 38 + ((seed >> 6) % 30);
  const ringX = 8 + ((seed >> 10) % 66);
  const ringY = 14 + ((seed >> 14) % 56);
  const indexLabel = String(index).padStart(2, '0');
  const reference = post.slug.replace(/-/g, '·').slice(0, 10).toUpperCase();
  const year = post.date.slice(0, 4);

  return (
    <div
      aria-hidden="true"
      className={`relative isolate overflow-hidden bg-[#080d12] text-white ${className ?? ''}`}
    >
      {/* Mesh de color derivado de la paleta activa */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at ${x1}% ${y1}%, color-mix(in srgb, var(--primary-color) 42%, transparent) 0%, transparent 46%),
            radial-gradient(circle at ${x2}% ${y2}%, color-mix(in srgb, var(--accent-color) 30%, transparent) 0%, transparent 44%),
            linear-gradient(${angle}deg, #070c11 0%, #0d131a 52%, #070c11 100%)
          `,
        }}
      />

      {/* Retícula técnica */}
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            'linear-gradient(color-mix(in srgb, var(--primary-color) 55%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--primary-color) 55%, transparent) 1px, transparent 1px)',
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />

      {/* Anillos orbitales */}
      <div
        className="absolute rounded-full border transition-transform duration-700 group-hover:scale-105"
        style={{
          width: `${ringSize}%`,
          aspectRatio: '1 / 1',
          left: `${ringX}%`,
          top: `${ringY}%`,
          borderColor: 'color-mix(in srgb, var(--primary-color) 22%, transparent)',
        }}
      />
      <div
        className="absolute rounded-full border transition-transform duration-700 group-hover:scale-110"
        style={{
          width: `${ringSize * 0.62}%`,
          aspectRatio: '1 / 1',
          left: `${ringX + 6}%`,
          top: `${ringY + 8}%`,
          borderColor: 'color-mix(in srgb, var(--primary-color) 12%, transparent)',
        }}
      />

      {/* Línea diagonal */}
      <div className="absolute -inset-x-12 top-[58%] h-px -rotate-[16deg] bg-white/10 transition-transform duration-700 group-hover:translate-y-2" />

      {/* Índice tipográfico */}
      <span
        className="pointer-events-none absolute -bottom-[7%] right-[2%] z-[1] select-none font-display font-medium italic leading-none transition-transform duration-700 group-hover:-translate-y-1 group-hover:scale-[1.02]"
        style={{
          fontSize: variant === 'featured' ? 'clamp(9rem, 20vw, 18rem)' : 'clamp(6.5rem, 13vw, 11rem)',
          color: 'color-mix(in srgb, var(--primary-color) 9%, transparent)',
          WebkitTextStroke: '1.5px color-mix(in srgb, var(--primary-color) 55%, transparent)',
        }}
      >
        {indexLabel}
      </span>

      {/* Cabecera */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 p-4 sm:p-5">
        <span className="font-mono-label text-[7px] text-white/45 sm:text-[8px]">
          The Engineering Journal
        </span>
        <span className="font-mono-label text-[7px] text-white/45 sm:text-[8px]">
          {locale === 'en' ? 'EN' : 'ES'} · {year}
        </span>
      </div>

      {/* Sello del tema */}
      <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 sm:left-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] backdrop-blur-sm transition-colors duration-500 group-hover:border-primary sm:h-12 sm:w-12">
          <Icon size={22} strokeWidth={1.25} className="text-primary" />
        </div>
        <p className="mt-2.5 font-mono-label text-[7px] text-white/35">
          {locale === 'en' ? `Note ${indexLabel}` : `Ensayo ${indexLabel}`}
        </p>
      </div>

      {/* Pie */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 p-4 sm:p-5">
        <span className="max-w-[58%] truncate rounded-full border border-white/15 bg-black/25 px-2.5 py-1 font-mono-label text-[7px] text-white/70 backdrop-blur-sm sm:text-[8px]">
          #{post.tags[0] ?? topic?.label ?? (locale === 'en' ? 'essay' : 'ensayo')}
        </span>
        <span className="font-mono-label text-[7px] text-white/30 sm:text-[8px]">
          Ref. {reference}
        </span>
      </div>
    </div>
  );
}
