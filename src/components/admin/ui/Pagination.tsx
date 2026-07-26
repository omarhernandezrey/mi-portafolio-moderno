import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  /** Base path sin query, ej. /admin/leads */
  basePath: string;
  /** Query params a preservar (sin page) */
  query?: Record<string, string | undefined>;
}

function buildHref(
  basePath: string,
  page: number,
  query: Record<string, string | undefined>
): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v) params.set(k, v);
  }
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export default function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  basePath,
  query = {},
}: PaginationProps) {
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const btnBase =
    'px-4 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all inline-flex items-center gap-1';
  const enabled =
    'bg-white/5 border-white/10 text-text-muted hover:text-white-custom hover:border-primary/30';
  const disabled = 'bg-white/5 border-white/10 text-text-muted cursor-not-allowed opacity-40';

  return (
    <div className="p-4 sm:p-6 lg:p-8 border-t border-white/5 bg-background/20 flex flex-col sm:flex-row items-center justify-between gap-3">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/40">
        Mostrando {from}–{to} de {total}
      </span>
      <div className="flex gap-2">
        {hasPrev ? (
          <Link
            href={buildHref(basePath, page - 1, query)}
            className={`${btnBase} ${enabled}`}
            prefetch={false}
          >
            <ChevronLeft size={14} />
            Anterior
          </Link>
        ) : (
          <span className={`${btnBase} ${disabled}`}>
            <ChevronLeft size={14} />
            Anterior
          </span>
        )}
        <span className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-text-muted/60 self-center">
          {page} / {totalPages || 1}
        </span>
        {hasNext ? (
          <Link
            href={buildHref(basePath, page + 1, query)}
            className={`${btnBase} ${enabled}`}
            prefetch={false}
          >
            Siguiente
            <ChevronRight size={14} />
          </Link>
        ) : (
          <span className={`${btnBase} ${disabled}`}>
            Siguiente
            <ChevronRight size={14} />
          </span>
        )}
      </div>
    </div>
  );
}
