import Link from 'next/link';
import { ArrowLeft, MessageSquare, Mail } from 'lucide-react';
import { supabaseServer } from '@/lib/supabaseServer';
import PageHeader from '@/components/admin/ui/PageHeader';
import EmptyState from '@/components/admin/ui/EmptyState';
import FeedCommentRowActions from '@/components/admin/FeedCommentRowActions';
import { DEFAULT_PAGE_SIZE } from '@/lib/admin/types';
import { parsePage, pageRange } from '@/lib/admin/query';
import { getAdminRole } from '@/lib/admin/auth';
import { hasMinRole } from '@/lib/admin/roles';

export const dynamic = 'force-dynamic';

interface AdminFeedComment {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string;
  body: string;
  status: 'published' | 'hidden';
  created_at: string;
}

async function getAdminFeedComments(status: string, page: number, pageSize: number) {
  const { from, to } = pageRange(page, pageSize);

  let query = supabaseServer
    .from('feed_comments')
    .select('id, post_id, author_name, author_email, body, status, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (status === 'published' || status === 'hidden') query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) console.error('Error fetching feed comments:', error);

  return { comments: (data ?? []) as AdminFeedComment[], total: count ?? 0 };
}

export default async function AdminFeedCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status || '';
  const page = parsePage(params.page);
  const { comments, total } = await getAdminFeedComments(statusFilter, page, DEFAULT_PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE));

  const role = await getAdminRole();
  const canWrite = hasMinRole(role ?? 'viewer', 'assistant');
  const canDelete = hasMinRole(role ?? 'viewer', 'owner');

  return (
    <div className="space-y-6 sm:space-y-10">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/feed"
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-white-custom transition-all"
        >
          <ArrowLeft size={18} />
        </Link>
        <PageHeader overline="Feed Público" title="Comentarios" description="Moderación de comentarios del feed de comunidad." />
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/admin/feed/comments"
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
            !statusFilter ? 'bg-primary text-background border-primary' : 'bg-white/5 border-white/10 text-text-muted hover:text-white-custom'
          }`}
        >
          Todos
        </Link>
        <Link
          href="/admin/feed/comments?status=published"
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
            statusFilter === 'published' ? 'bg-primary text-background border-primary' : 'bg-white/5 border-white/10 text-text-muted hover:text-white-custom'
          }`}
        >
          Publicados
        </Link>
        <Link
          href="/admin/feed/comments?status=hidden"
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
            statusFilter === 'hidden' ? 'bg-primary text-background border-primary' : 'bg-white/5 border-white/10 text-text-muted hover:text-white-custom'
          }`}
        >
          Ocultos
        </Link>
      </div>

      <div className="bg-card-bg rounded-[32px] border border-white/5 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0 min-w-[720px]">
            <thead>
              <tr className="bg-background/40">
                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Autor</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Comentario</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Publicación</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5 text-center">Estatus</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <tr key={comment.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-white-custom text-sm">{comment.author_name}</div>
                      <div className="flex items-center gap-1 text-[10px] text-text-muted/50">
                        <Mail size={10} />
                        {comment.author_email}
                      </div>
                    </td>
                    <td className="px-6 py-5 max-w-sm">
                      <p className="text-xs text-text-muted line-clamp-2">{comment.body}</p>
                    </td>
                    <td className="px-6 py-5">
                      <Link
                        href={`/comunidad/${comment.post_id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                      >
                        Ver post
                      </Link>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                          comment.status === 'published'
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                            : 'text-text-muted bg-white/5 border-white/10'
                        }`}
                      >
                        {comment.status === 'published' ? 'Publicado' : 'Oculto'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <FeedCommentRowActions
                        commentId={comment.id}
                        status={comment.status}
                        canWrite={canWrite}
                        canDelete={canDelete}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <EmptyState icon={<MessageSquare size={40} />} title="Sin comentarios" description="No se encontraron comentarios con este filtro." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="p-4 sm:p-6 border-t border-white/5 bg-background/20 flex items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/40">
              Página {page} / {totalPages} · {total} comentarios
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/feed/comments?${statusFilter ? `status=${statusFilter}&` : ''}page=${page - 1}`}
                  className="px-4 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest bg-white/5 border-white/10 text-text-muted hover:text-white-custom transition-all"
                >
                  Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/feed/comments?${statusFilter ? `status=${statusFilter}&` : ''}page=${page + 1}`}
                  className="px-4 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest bg-white/5 border-white/10 text-text-muted hover:text-white-custom transition-all"
                >
                  Siguiente
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
