import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin("viewer");
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("post_id");
  const status = searchParams.get("status");
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const limit = Math.min(Number(searchParams.get("limit") ?? "30") || 30, 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabaseServer
    .from("feed_comments")
    .select("id, post_id, author_name, author_email, body, status, created_at")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (postId) query = query.eq("post_id", postId);
  if (status === "published" || status === "hidden") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ comments: data ?? [] });
}
