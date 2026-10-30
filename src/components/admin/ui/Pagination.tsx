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
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  if (page > 1) params.set('page', String(page));
  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
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

  const buttonBase =
    'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[10px] font-bold transition-colors';
  const enabled =
    'border-admin-line bg-white/[0.03] text-text-muted hover:border-primary/30 hover:text-primary';
  const disabled =
    'cursor-not-allowed border-admin-line bg-white/[0.02] text-text-muted/30';

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-admin-line bg-white/[0.01] p-4 sm:flex-row sm:px-5">
      <span className="font-mono-label text-[9px] text-text-muted/50">
        Mostrando {from}–{to} de {total}
      </span>
      <div className="flex items-center gap-2">
        {hasPrev ? (
          <Link
            href={buildHref(basePath, page - 1, query)}
            className={`${buttonBase} ${enabled}`}
            prefetch={false}
          >
            <ChevronLeft size={13} />
            Anterior
          </Link>
        ) : (
          <span className={`${buttonBase} ${disabled}`}>
            <ChevronLeft size={13} />
            Anterior
          </span>
        )}
        <span className="px-2 font-mono-label text-[9px] text-text-muted/60">
          {page} / {totalPages || 1}
        </span>
        {hasNext ? (
          <Link
            href={buildHref(basePath, page + 1, query)}
            className={`${buttonBase} ${enabled}`}
            prefetch={false}
          >
            Siguiente
            <ChevronRight size={13} />
          </Link>
        ) : (
          <span className={`${buttonBase} ${disabled}`}>
            Siguiente
            <ChevronRight size={13} />
          </span>
        )}
      </div>
    </div>
  );
}
