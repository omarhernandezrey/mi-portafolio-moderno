import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireAdmin } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/admin/audit";

const ADMIN_POST_COLUMNS =
  "id, author_role, author_name, author_email, lang, category, title, body, image_urls, link_url, status, pinned, likes_count, reaction_counts, comments_count, created_at";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin("viewer");
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const authorRole = searchParams.get("author_role");
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const limit = Math.min(Number(searchParams.get("limit") ?? "30") || 30, 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseServer
    .from("feed_posts")
    .select(ADMIN_POST_COLUMNS)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status === "published" || status === "hidden") query = query.eq("status", status);
  if (authorRole === "owner" || authorRole === "visitor") query = query.eq("author_role", authorRole);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ posts: data ?? [] });
}

const createCuratedPostSchema = z.object({
  lang: z.enum(["es", "en"]),
  category: z.enum(["general", "status", "curso", "skill", "proyecto", "postulacion"]).default("general"),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(1).max(5000),
  image_urls: z.array(z.string().trim().url().max(500)).max(10).optional().default([]),
  link_url: z.string().trim().url().max(500).optional(),
  pinned: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  const auth = await requireAdmin("owner");
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const result = createCuratedPostSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from("feed_posts")
    .insert({
      ...result.data,
      title: result.data.title || null,
      link_url: result.data.link_url || null,
      author_role: "owner",
      author_name: "Omar Hernández Rey",
    })
    .select(ADMIN_POST_COLUMNS)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAuditLog(auth.actor, {
    action: "feed_post.create",
    resourceType: "feed_post",
    resourceId: data.id,
  });

  return NextResponse.json({ post: data }, { status: 201 });
}
