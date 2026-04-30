import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { sendNewsletterEdition } from '@/lib/chatbot/email';
import { serverEnv } from '@/config/env';
import { notifyTelegram } from '@/lib/chatbot/telegram';

export const maxDuration = 30;
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${serverEnv.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

    // Simple placeholder para renderizar MDX a HTML (en un entorno edge/server real esto puede ser complejo)
    // Para simplificar, asumiremos que el contenido es HTML-friendly o usaremos un parser simple.
    // Usaremos una aproximación simple para este MVP.
    const htmlContent = `
      <h1>${frontmatter.title}</h1>
      <div>${content.replace(/\n/g, '<br/>')}</div>
    `;

    // 2. Obtener todos los suscriptores confirmados
    const { data: subscribers, error: fetchError } = await supabaseServer
      .from('subscribers')
      .select('id, email')
      .eq('confirmed', true);

    if (fetchError) throw fetchError;

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ message: 'No hay suscriptores confirmados.' });
    }

    const results = [];
    let sentCount = 0;

    // 3. Enviar en batches si son muchos (aquí implementamos envío secuencial simple)
    for (const sub of subscribers) {
      const sent = await sendNewsletterEdition(sub.email, frontmatter.title, htmlContent, sub.id);
      if (sent) {
        sentCount++;
        results.push({ email: sub.email, status: 'sent' });
      } else {
        results.push({ email: sub.email, status: 'failed' });
      }
      
      // Batch delay para evitar rate limits si hay más de 10
      if (sentCount % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    await notifyTelegram(`📰 *Newsletter enviada*: "${frontmatter.title}" a ${sentCount} suscriptores.`);

    return NextResponse.json({ success: true, sent: sentCount, results });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Newsletter send error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
