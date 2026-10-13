import { supabaseServer } from "@/lib/supabaseServer";

export type FeedCategory =
  | "general"
  | "status"
  | "curso"
  | "skill"
  | "proyecto"
  | "postulacion";

export type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

export interface FeedPost {
  id: string;
  author_role: "owner" | "visitor";
  author_name: string;
  lang: "es" | "en";
  category: FeedCategory;
  title: string | null;
  body: string;
  image_urls: string[];
  link_url: string | null;
  pinned: boolean;
  likes_count: number;
  reaction_counts: Partial<Record<ReactionType, number>>;
  comments_count: number;
  created_at: string;
  isNew?: boolean;
}

export interface FeedComment {
  id: string;
  post_id: string;
  author_name: string;
  body: string;
  created_at: string;
}

// Columnas públicas explícitas — nunca seleccionar `*` para no exponer
// author_email/ip_hash/status en las respuestas públicas.
const PUBLIC_POST_COLUMNS =
  "id, author_role, author_name, lang, category, title, body, image_urls, link_url, pinned, likes_count, reaction_counts, comments_count, created_at";
const PUBLIC_COMMENT_COLUMNS = "id, post_id, author_name, body, created_at";

async function getLatestCoursePostIds(): Promise<Set<string>> {
  const newestByLanguage = await Promise.all((["es", "en"] as const).map((lang) =>
    supabaseServer
      .from("feed_posts")
      .select("id, created_at")
      .eq("status", "published")
      .eq("author_role", "owner")
      .eq("category", "curso")
      .eq("lang", lang)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ));

  return new Set(newestByLanguage.flatMap(({ data, error }) => {
    if (error || !data) return [];
    return [data.id];
  }));
}

export async function getFeedPosts(opts: {
  page?: number;
  limit?: number;
  lang?: "es" | "en";
  category?: FeedCategory;
} = {}): Promise<{ posts: FeedPost[]; hasMore: boolean }> {
  const page = Math.max(opts.page ?? 1, 1);
  const limit = Math.min(Math.max(opts.limit ?? 10, 1), 50);
  const from = (page - 1) * limit;
  const to = from + limit; // pedimos uno de más para saber si hay más páginas

  let query = supabaseServer
    .from("feed_posts")
    .select(PUBLIC_POST_COLUMNS)
    .eq("status", "published")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (opts.lang) query = query.eq("lang", opts.lang);
  if (opts.category) query = query.eq("category", opts.category);

  const [{ data, error }, latestCoursePostIds] = await Promise.all([
    query,
    getLatestCoursePostIds(),
  ]);
  if (error) {
    console.error("getFeedPosts error:", error);
    return { posts: [], hasMore: false };
  }

  const rows = ((data ?? []) as unknown as FeedPost[]).map((post) => ({
    ...post,
    isNew: latestCoursePostIds.has(post.id),
  }));
  const hasMore = rows.length > limit;
  return { posts: hasMore ? rows.slice(0, limit) : rows, hasMore };
}

export async function getFeedPostById(id: string): Promise<FeedPost | null> {
  const [{ data, error }, latestCoursePostIds] = await Promise.all([
    supabaseServer
      .from("feed_posts")
      .select(PUBLIC_POST_COLUMNS)
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle(),
    getLatestCoursePostIds(),
  ]);

  if (error) {
    console.error("getFeedPostById error:", error);
    return null;
  }
  if (!data) return null;
  const post = data as unknown as FeedPost;
  return { ...post, isNew: latestCoursePostIds.has(post.id) };
}

export async function getFeedComments(
  postId: string,
  opts: { page?: number; limit?: number } = {}
): Promise<{ comments: FeedComment[]; hasMore: boolean }> {
  const page = Math.max(opts.page ?? 1, 1);
  const limit = Math.min(Math.max(opts.limit ?? 20, 1), 50);
  const from = (page - 1) * limit;
  const to = from + limit;

  const { data, error } = await supabaseServer
    .from("feed_comments")
    .select(PUBLIC_COMMENT_COLUMNS)
    .eq("post_id", postId)
    .eq("status", "published")
    .order("created_at", { ascending: true })
    .range(from, to);

  if (error) {
    console.error("getFeedComments error:", error);
    return { comments: [], hasMore: false };
  }

  const rows = (data ?? []) as unknown as FeedComment[];
  const hasMore = rows.length > limit;
  return { comments: hasMore ? rows.slice(0, limit) : rows, hasMore };
}
