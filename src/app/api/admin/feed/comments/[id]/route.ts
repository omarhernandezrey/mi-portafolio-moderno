import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabaseServer";
import { requireAdmin } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/admin/audit";

const patchSchema = z.object({
  status: z.enum(["published", "hidden"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("assistant");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json();
  const result = patchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from("feed_comments")
    .update({ status: result.data.status })
    .eq("id", id)
    .select("id, status")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAuditLog(auth.actor, {
    action: "feed_comment.update",
    resourceType: "feed_comment",
    resourceId: id,
    metadata: result.data,
  });

  return NextResponse.json({ comment: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin("owner");
  if (!auth.ok) return auth.response;

  const { id } = await params;

  const { error } = await supabaseServer.from("feed_comments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await writeAuditLog(auth.actor, {
    action: "feed_comment.delete",
    resourceType: "feed_comment",
    resourceId: id,
  });

  return NextResponse.json({ success: true });
}
