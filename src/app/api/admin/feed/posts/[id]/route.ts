import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireAdmin } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/admin/audit";

const patchSchema = z.object({
  status: z.enum(["published", "hidden"]).optional(),
  pinned: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const result = patchSchema.safeParse(body);
  if (!result.success || Object.keys(result.data).length === 0) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  // Fijar/desfijar (pinned) es más sensible (afecta el orden para todos los
  // visitantes) — se reserva a 'owner'; ocultar/mostrar alcanza con 'assistant'.
  const needsOwner = result.data.pinned !== undefined;
  const auth = await requireAdmin(needsOwner ? "owner" : "assistant");
  if (!auth.ok) return auth.response;

  const { data, error } = await supabaseServer
    .from("feed_posts")
    .update(result.data)
    .eq("id", id)
    .select("id, status, pinned")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAuditLog(auth.actor, {
    action: "feed_post.update",
    resourceType: "feed_post",
    resourceId: id,
    metadata: result.data,
  });

  return NextResponse.json({ post: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("owner");
  if (!auth.ok) return auth.response;

  const { id } = await params;

  // on delete cascade en feed_comments/feed_likes se encarga de los hijos.
  const { error } = await supabaseServer.from("feed_posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAuditLog(auth.actor, {
    action: "feed_post.delete",
    resourceType: "feed_post",
    resourceId: id,
  });

  return NextResponse.json({ success: true });
}
