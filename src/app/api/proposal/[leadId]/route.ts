import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { generateProposalMarkdown } from '@/lib/proposals/generate';
import { clientEnv } from '@/config/env';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const { leadId } = await params;

    if (!leadId) {
      return new NextResponse('ID de lead requerido', { status: 400 });
    }

    // 1. Obtener datos del lead
    const { data: lead, error } = await supabaseServer
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error || !lead) {
      console.error('Error fetching lead for proposal:', error);
      return new NextResponse('Lead no encontrado', { status: 404 });
    }

    // 2. Generar Contenido
    const customerName = lead.name || 'Valorado Cliente';
    const budget = lead.budget || 'A convenir';
    const date = new Date(lead.created_at).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const markdown = generateProposalMarkdown({
      customer_name: customerName,
      project_name: lead.service_requested || 'Proyecto IT',
      industry: (lead as { industry?: string }).industry || 'General',
      pain_points: lead.notes || 'Optimización de procesos digitales',
      price: budget,
      timeline: lead.timeline || '4 semanas',
      date,
      calcom_url: clientEnv.NEXT_PUBLIC_CALCOM_CONSULT_URL
    });

    // Conversión ultra-simple de MD a HTML para este endpoint legacy/fallback
    const contentHtml = markdown
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-black mb-6">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-8 mb-4">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-6 mb-2">$1</h3>')
      .replace(/^\- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^\> (.*$)/gm, '<blockquote class="border-l-4 border-blue-500 pl-4 italic my-4">$1</blockquote>')
      .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');

    // 3. Generar HTML completo
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Propuesta de Servicios - Omar Hernández</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @media print {
            .no-print { display: none; }
            body { background: white; color: black; }
          }
          body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #1e293b; }
          .proposal-card { max-width: 800px; margin: 40px auto; background: white; padding: 60px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-radius: 8px; border-top: 8px solid #3b82f6; }
        </style>
      </head>
      <body>
        <div class="no-print fixed top-4 right-4 flex gap-2">
          <button onclick="window.print()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg transition-all">
            🖨️ Imprimir / Guardar PDF
          </button>
          <a href="/admin/leads/${lead.id}" class="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-bold transition-all">
            🏠 Volver al Lead
          </a>
        </div>

        <div class="proposal-card">
          <header class="flex justify-between items-start mb-12">
            <div>
              <h1 class="text-3xl font-black text-slate-900 mb-1 tracking-tight uppercase">Propuesta Comercial</h1>
              <p class="text-slate-500 font-medium text-xs">Ref: #${lead.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div class="text-right">
              <div class="text-xl font-bold text-blue-600">Omar Hernández</div>
              <div class="text-xs text-slate-500 font-medium leading-relaxed">Software Engineer<br>Bogotá, Colombia</div>
            </div>
          </header>

          <article class="prose prose-slate max-w-none">
            ${contentHtml}
          </article>

          <footer class="mt-12 pt-12 border-t border-slate-100 text-center">
            <p class="text-slate-400 text-[10px] italic mb-4 leading-relaxed">Esta propuesta es confidencial y ha sido generada automáticamente para ${lead.name}.<br>Sujeta a los términos y condiciones del contrato de servicios de Omar Hernández.</p>
          </footer>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    console.error('Proposal route error:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}
