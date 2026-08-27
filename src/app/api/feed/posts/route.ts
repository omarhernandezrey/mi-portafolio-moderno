import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabaseServer";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";
import { hashClientId } from "@/lib/feed/spam";
import { getFeedPosts, type FeedCategory } from "@/lib/feed";

const CATEGORIES = ["general", "status", "curso", "skill", "proyecto", "postulacion"] as const;

const createPostSchema = z.object({
  author_name: z.string().trim().min(2).max(80),
  author_email: z.string().trim().email().max(254),
  lang: z.enum(["es", "en"]),
  category: z.enum(CATEGORIES).optional().default("general"),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(1).max(5000),
  link_url: z.string().trim().url().max(500).optional().or(z.literal("")),
  image_data_urls: z.array(z.string()).max(6).optional(), // hasta 6 imágenes "data:image/png;base64,...."
  website: z.string().optional(), // honeypot
});

const IMAGE_DATA_URL_RE = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

async function uploadPostImage(dataUrl: string): Promise<string | null> {
  const match = dataUrl.match(IMAGE_DATA_URL_RE);
  if (!match) return null;

  const [, mime, base64] = match;
  const buffer = Buffer.from(base64, "base64");
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_IMAGE_BYTES) return null;

  const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  const path = `posts/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabaseServer.storage
    .from("feed-images")
    .upload(path, buffer, { contentType: mime, upsert: false });

  if (error) {
    console.error("uploadPostImage error:", error);
    return null;
  }

  const { data } = supabaseServer.storage.from("feed-images").getPublicUrl(path);
  return data.publicUrl ?? null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const limit = Number(searchParams.get("limit") ?? "10") || 10;
  const lang = searchParams.get("lang");
  const category = searchParams.get("category");

  const result = await getFeedPosts({
    page,
    limit,
    lang: lang === "es" || lang === "en" ? lang : undefined,
    category: (CATEGORIES as readonly string[]).includes(category ?? "")
      ? (category as FeedCategory)
      : undefined,
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  try {
    const { allowed } = checkRateLimit(`feed-post:${clientIp(req.headers)}`, 3, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ error: "Demasiadas publicaciones. Intenta más tarde." }, { status: 429 });
    }

    const body = await req.json();
    const result = createPostSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const { author_name, author_email, lang, category, title, body: content, link_url, image_data_urls, website } =
      result.data;

    // Honeypot: si el campo oculto viene relleno, es un bot — respondemos
    // éxito falso sin insertar nada, para no delatar la detección.
    if (website) {
      return NextResponse.json({ success: true, id: crypto.randomUUID() }, { status: 200 });
    }

    const uploaded = image_data_urls?.length
      ? await Promise.all(image_data_urls.map((d) => uploadPostImage(d)))
      : [];
    const image_urls = uploaded.filter((url): url is string => Boolean(url));

    // Si el visitante adjuntó imágenes pero NINGUNA se pudo subir (ej. bucket
    // de Storage no disponible), es mejor fallar con un error claro que
    // publicar en silencio un post sin las imágenes que el usuario esperaba.
    if (image_data_urls?.length && image_urls.length === 0) {
      return NextResponse.json({ error: "No se pudieron subir las imágenes. Intenta de nuevo." }, { status: 502 });
    }

    const ip_hash = hashClientId(req.headers);

    const { data, error } = await supabaseServer
      .from("feed_posts")
      .insert({
        author_role: "visitor",
        author_name,
        author_email,
        lang,
        category,
        title: title || null,
        body: content,
        link_url: link_url || null,
        image_urls,
        ip_hash,
      })
      .select("id")
      .single();

    if (error) {
      console.error("create feed post error:", error);
      return NextResponse.json({ error: "Error en la base de datos" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/feed/posts error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
