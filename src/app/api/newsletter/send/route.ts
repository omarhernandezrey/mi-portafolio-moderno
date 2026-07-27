import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { sendNewsletterEdition } from '@/lib/chatbot/email';
import { requireCronAuth } from '@/lib/cronAuth';
import { notifyTelegram } from '@/lib/chatbot/telegram';

export const maxDuration = 30;
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export const dynamic = 'force-dynamic';

// Tope por corrida: con ~1s/10 envíos + latencia Resend, esto cabe en maxDuration=30s.
// Los que queden fuera se enviarán en la siguiente corrida (columna last_edition_slug).
const MAX_PER_RUN = 120;

export async function GET(req: NextRequest) {
  return handleSend(req);
}

export async function POST(req: NextRequest) {
  return handleSend(req);
}

async function handleSend(req: NextRequest) {
  const authError = requireCronAuth(req);
  if (authError) return authError;

  try {
    // 1. Obtener el newsletter más reciente de content/newsletters/
    const newsletterDir = path.join(process.cwd(), 'content', 'newsletters');
    if (!fs.existsSync(newsletterDir)) {
      return NextResponse.json({ error: 'Directorio de newsletters no encontrado' }, { status: 404 });
    }

    const files = fs.readdirSync(newsletterDir).filter(f => f.endsWith('.md')).sort().reverse();
    if (files.length === 0) {
      return NextResponse.json({ error: 'No hay newsletters para enviar' }, { status: 404 });
    }

    const latestFile = files[0];
    const fileContent = fs.readFileSync(path.join(newsletterDir, latestFile), 'utf-8');
    const { data: frontmatter, content } = matter(fileContent);
    const title = frontmatter.title || `Newsletter ${latestFile.replace(/\.md$/, '')}`;

    const htmlContent = `
      <h1>${title}</h1>
      <div>${content.replace(/\n/g, '<br/>')}</div>
    `;

    // 2. Suscriptores confirmados pendientes de ESTA edición
    const editionSlug = latestFile.replace(/\.md$/, '');
    const { data: subscribers, error: fetchError } = await supabaseServer
      .from('subscribers')
      .select('id, email')
      .eq('confirmed', true)
      .or(`last_edition_slug.is.null,last_edition_slug.neq.${editionSlug}`)
      .limit(MAX_PER_RUN);

    if (fetchError) throw fetchError;

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ message: 'No hay suscriptores pendientes de esta edición.' });
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const sub of subscribers) {
      const sent = await sendNewsletterEdition(sub.email, title, htmlContent, sub.id);
      if (sent) {
        sentCount++;
        // Checkpoint: marca la edición enviada para no duplicar si la función muere
        await supabaseServer
          .from('subscribers')
          .update({ last_edition_slug: editionSlug })
          .eq('id', sub.id);
      } else {
        failedCount++;
      }

      if (sentCount % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    await notifyTelegram(`📰 *Newsletter enviada*: "${title}" a ${sentCount} suscriptores (${failedCount} fallidos).`);

    return NextResponse.json({ success: true, sent: sentCount, failed: failedCount, remaining: Math.max(0, subscribers.length - sentCount - failedCount) });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Newsletter send error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
