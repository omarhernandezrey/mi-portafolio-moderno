import { NextRequest, NextResponse } from "next/server";
import { getFeedPostById } from "@/lib/feed";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getFeedPostById(id);
  if (!post) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json({ post });
}
