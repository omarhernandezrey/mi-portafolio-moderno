import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabaseServer";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import { hashClientId } from "@/lib/feed/spam";
import { getFeedComments } from "@/lib/feed";

const createCommentSchema = z.object({
  author_name: z.string().trim().min(2).max(80),
  author_email: z.string().trim().email().max(254),
  body: z.string().trim().min(1).max(1000),
  website: z.string().optional(), // honeypot
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const limit = Number(searchParams.get("limit") ?? "20") || 20;

  const result = await getFeedComments(id, { page, limit });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;

    const { allowed } = checkRateLimit(`feed-comment:${clientIp(req.headers)}`, 8, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ error: "Demasiados comentarios. Intenta más tarde." }, { status: 429 });
    }

    const body = await req.json();
    const result = createCommentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const { author_name, author_email, body: content, website } = result.data;

    if (website) {
      return NextResponse.json({ success: true, id: crypto.randomUUID() }, { status: 200 });
    }

    // El post debe existir y estar publicado — evita comentarios "huérfanos"
    // en posts ocultos/borrados.
    const { data: post } = await supabaseServer
      .from("feed_posts")
      .select("id")
      .eq("id", postId)
      .eq("status", "published")
      .maybeSingle();

    if (!post) {
      return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 });
    }

    const ip_hash = hashClientId(req.headers);

    const { data, error } = await supabaseServer
      .from("feed_comments")
      .insert({ post_id: postId, author_name, author_email, body: content, ip_hash })
      .select("id")
      .single();

    if (error) {
      console.error("create feed comment error:", error);
      return NextResponse.json({ error: "Error en la base de datos" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/feed/posts/[id]/comments error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
