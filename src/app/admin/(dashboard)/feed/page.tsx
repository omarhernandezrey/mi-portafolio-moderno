import Link from 'next/link';
import { MessageSquare, Plus, Search, Heart, Pin, User } from 'lucide-react';
import { supabaseServer } from '@/lib/supabaseServer';
import PageHeader from '@/components/admin/ui/PageHeader';
import EmptyState from '@/components/admin/ui/EmptyState';
import FeedPostRowActions from '@/components/admin/FeedPostRowActions';
import { DEFAULT_PAGE_SIZE } from '@/lib/admin/types';
import { parsePage, pageRange } from '@/lib/admin/query';
import { getAdminRole } from '@/lib/admin/auth';
import { hasMinRole } from '@/lib/admin/roles';

export const dynamic = 'force-dynamic';

interface AdminFeedPost {
  id: string;
  author_role: 'owner' | 'visitor';
  author_name: string;
  lang: 'es' | 'en';
  category: string;
  title: string | null;
  body: string;
  status: 'published' | 'hidden';
  pinned: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

async function getAdminFeedPosts(status: string, page: number, pageSize: number) {
  const { from, to } = pageRange(page, pageSize);

  let query = supabaseServer
    .from('feed_posts')
    .select(
      'id, author_role, author_name, lang, category, title, body, status, pinned, likes_count, comments_count, created_at',
      { count: 'exact' }
    )
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (status === 'published' || status === 'hidden') query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) console.error('Error fetching feed posts:', error);

  return { posts: (data ?? []) as AdminFeedPost[], total: count ?? 0 };
}

export default async function AdminFeedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status || '';
  const page = parsePage(params.page);
  const { posts, total } = await getAdminFeedPosts(statusFilter, page, DEFAULT_PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE));

  const role = await getAdminRole();
  const canWrite = hasMinRole(role ?? 'viewer', 'assistant');
  const canPin = hasMinRole(role ?? 'viewer', 'owner');

  return (
    <div className="space-y-6 sm:space-y-10">
      <PageHeader
        overline="Feed Público"
        title="Comunidad"
        description="Moderación de publicaciones del feed de comunidad."
        actions={
          canWrite && (
            <Link
              href="/admin/feed/new"
              className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-primary text-background text-sm font-black hover:scale-105 transition-all shadow-lg shadow-primary/20"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Nueva publicación</span>
              <span className="sm:hidden">Nueva</span>
            </Link>
          )
        }
      />

      <div className="flex items-center gap-3">
        <Link
          href="/admin/feed"
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
            !statusFilter ? 'bg-primary text-background border-primary' : 'bg-white/5 border-white/10 text-text-muted hover:text-white-custom'
          }`}
        >
          Todos
        </Link>
        <Link
          href="/admin/feed?status=published"
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
            statusFilter === 'published' ? 'bg-primary text-background border-primary' : 'bg-white/5 border-white/10 text-text-muted hover:text-white-custom'
          }`}
        >
          Publicados
        </Link>
        <Link
          href="/admin/feed?status=hidden"
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
            statusFilter === 'hidden' ? 'bg-primary text-background border-primary' : 'bg-white/5 border-white/10 text-text-muted hover:text-white-custom'
          }`}
        >
          Ocultos
        </Link>
        <Link
          href="/admin/feed/comments"
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-white/5 border-white/10 text-text-muted hover:text-white-custom transition-all"
        >
          <MessageSquare size={13} />
          Ver comentarios
        </Link>
      </div>

      <div className="bg-card-bg rounded-[32px] border border-white/5 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0 min-w-[720px]">
            <thead>
              <tr className="bg-background/40">
                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Autor</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Contenido</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5">Categoría</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5 text-center">Likes / Comentarios</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5 text-center">Estatus</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted/60 border-b border-white/5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <User size={14} className="opacity-50" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-white-custom text-sm">
                            {post.author_name}
                            {post.pinned && <Pin size={11} className="text-primary" />}
                          </div>
                          <div className="text-[10px] text-text-muted/50 uppercase font-black tracking-widest">
                            {post.author_role === 'owner' ? 'Verificado' : 'Visitante'} · {post.lang}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 max-w-xs">
                      {post.title && <div className="text-sm font-bold text-white-custom truncate">{post.title}</div>}
                      <div className="text-xs text-text-muted truncate">{post.body}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-3 text-xs font-bold text-text-muted">
                        <span className="flex items-center gap-1"><Heart size={12} />{post.likes_count}</span>
                        <span className="flex items-center gap-1"><MessageSquare size={12} />{post.comments_count}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                          post.status === 'published'
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                            : 'text-text-muted bg-white/5 border-white/10'
                        }`}
                      >
                        {post.status === 'published' ? 'Publicado' : 'Oculto'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <FeedPostRowActions
                        postId={post.id}
                        status={post.status}
                        pinned={post.pinned}
                        canWrite={canWrite}
                        canPin={canPin}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <EmptyState icon={<Search size={40} />} title="Sin publicaciones" description="No se encontraron publicaciones con este filtro." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="p-4 sm:p-6 border-t border-white/5 bg-background/20 flex items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/40">
              Página {page} / {totalPages} · {total} publicaciones
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/feed?${statusFilter ? `status=${statusFilter}&` : ''}page=${page - 1}`}
                  className="px-4 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest bg-white/5 border-white/10 text-text-muted hover:text-white-custom transition-all"
                >
                  Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/feed?${statusFilter ? `status=${statusFilter}&` : ''}page=${page + 1}`}
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
