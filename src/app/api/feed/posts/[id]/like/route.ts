import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabaseServer";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import { hashClientId } from "@/lib/feed/spam";

const REACTIONS = ["like", "love", "haha", "wow", "sad", "angry"] as const;

const reactionSchema = z.object({
  reaction: z.enum(REACTIONS).optional().default("like"),
});

async function currentLikesCount(postId: string): Promise<number> {
  const { data } = await supabaseServer.from("feed_posts").select("likes_count").eq("id", postId).maybeSingle();
  return data?.likes_count ?? 0;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;

    const { allowed } = checkRateLimit(`feed-like:${clientIp(req.headers)}`, 20, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const result = reactionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Reacción inválida" }, { status: 400 });
    }
    const { reaction } = result.data;
    const fingerprint = hashClientId(req.headers);

    const { data: existing } = await supabaseServer
      .from("feed_likes")
      .select("id, reaction")
      .eq("post_id", postId)
      .eq("fingerprint", fingerprint)
      .maybeSingle();

    // Mismo emoji que ya tenía -> quitar la reacción (como en Facebook).
    if (existing && existing.reaction === reaction) {
      const { error } = await supabaseServer.from("feed_likes").delete().eq("id", existing.id);
      if (error) {
        console.error("remove feed reaction error:", error);
        return NextResponse.json({ error: "Error en la base de datos" }, { status: 500 });
      }
      return NextResponse.json({ success: true, reaction: null, likes_count: await currentLikesCount(postId) });
    }

    // Ya tenía otra reacción -> la cambia.
    if (existing) {
      const { error } = await supabaseServer
        .from("feed_likes")
        .update({ reaction })
        .eq("id", existing.id);
      if (error) {
        console.error("update feed reaction error:", error);
        return NextResponse.json({ error: "Error en la base de datos" }, { status: 500 });
      }
      return NextResponse.json({ success: true, reaction, likes_count: await currentLikesCount(postId) });
    }

    // Primera reacción de este visitante en este post.
    const { error } = await supabaseServer.from("feed_likes").insert({ post_id: postId, fingerprint, reaction });
    if (error) {
      if (error.code === "23505") {
        // Carrera con otra request concurrente del mismo visitante — no falla, solo informa.
        return NextResponse.json({ success: true, reaction, likes_count: await currentLikesCount(postId) });
      }
      console.error("create feed reaction error:", error);
      return NextResponse.json({ error: "Error en la base de datos" }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, reaction, likes_count: await currentLikesCount(postId) },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/feed/posts/[id]/like error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
