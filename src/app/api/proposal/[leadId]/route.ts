import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

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

    // 2. Generar HTML de la propuesta
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
          <a href="/" class="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg font-bold transition-all">
            🏠 Volver
          </a>
        </div>

        <div class="proposal-card">
          <header class="flex justify-between items-start mb-12">
            <div>
              <h1 class="text-3xl font-black text-slate-900 mb-1 tracking-tight">PROPUESTA COMERCIAL</h1>
              <p class="text-slate-500 font-medium">Ref: #${lead.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div class="text-right">
              <div class="text-xl font-bold text-blue-600">Omar Hernández</div>
              <div class="text-sm text-slate-500 font-medium leading-relaxed">Software Engineer<br>Bogotá, Colombia<br>hernandezreyomar@gmail.com</div>
            </div>
          </header>

          <section class="mb-12 grid grid-cols-2 gap-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">CLIENTE</h3>
              <div class="font-bold text-slate-900 text-lg">${lead.name || 'Invitado'}</div>
              <div class="text-slate-600">${lead.email || ''}</div>
              <div class="text-slate-600 italic mt-1">${lead.company || ''}</div>
            </div>
            <div>
              <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">FECHA</h3>
              <div class="font-bold text-slate-900">${new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div class="text-slate-500 text-sm mt-1">Válida por 15 días corridos</div>
            </div>
          </section>

          <section class="mb-12">
            <h3 class="text-lg font-bold text-slate-900 mb-6 border-b pb-2 border-slate-200">Alcance del Proyecto</h3>
            <div class="space-y-6">
              <div class="flex gap-4">
                <div class="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                <div>
                  <h4 class="font-bold text-slate-800">Servicio Solicitado</h4>
                  <p class="text-slate-600 text-lg">${lead.service_requested || 'Desarrollo a medida'}</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                <div>
                  <h4 class="font-bold text-slate-800">Contexto y Objetivos</h4>
                  <p class="text-slate-600 leading-relaxed">${lead.notes || 'Desarrollo de solución personalizada basada en requerimientos previos.'}</p>
                </div>
              </div>
            </div>
          </section>

          <section class="mb-12">
            <h3 class="text-lg font-bold text-slate-900 mb-6 border-b pb-2 border-slate-200">Resumen de Inversión</h3>
            <table class="w-full text-left">
              <thead>
                <tr class="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th class="py-4">Concepto</th>
                  <th class="py-4">Plazo Estimado</th>
                  <th class="py-4 text-right">Monto</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr>
                  <td class="py-6 font-medium text-slate-900">Desarrollo y Entrega: ${lead.service_requested}</td>
                  <td class="py-6 text-slate-600">${lead.timeline || 'A definir'}</td>
                  <td class="py-6 text-right font-bold text-slate-900">${lead.budget || 'Bajo cotización'}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="bg-blue-50/50">
                  <td colspan="2" class="py-6 px-4 font-black text-slate-900 text-right">TOTAL ESTIMADO:</td>
                  <td class="py-6 px-4 text-right font-black text-xl text-blue-600 tracking-tight">${lead.budget || 'TBD'}</td>
                </tr>
              </tfoot>
            </table>
          </section>

          <section class="mb-12 p-8 bg-slate-900 text-white rounded-xl shadow-inner">
            <h3 class="text-lg font-bold mb-4 flex items-center gap-2 text-blue-400">✅ Próximos Pasos</h3>
            <ol class="space-y-3 text-slate-300 text-sm list-decimal list-inside">
              <li>Aceptar esta propuesta vía email o confirmando por WhatsApp.</li>
              <li>Abono inicial del 50% para dar inicio formal al proyecto.</li>
              <li>Reunión de kickoff de 30 min para alineación de requerimientos.</li>
              <li>Acceso a tablero de gestión de proyecto (Trello/Notion).</li>
            </ol>
          </section>

          <footer class="pt-12 border-t border-slate-100 text-center">
            <p class="text-slate-400 text-xs italic mb-4 leading-relaxed">Esta propuesta es confidencial y ha sido generada automáticamente para ${lead.name}.<br>Sujeta a los términos y condiciones del contrato de servicios de Omar Hernández.</p>
            <div class="flex justify-center items-center gap-4 grayscale opacity-50 scale-75">
              <img src="/next.svg" alt="Next.js" class="h-4">
              <img src="/vercel.svg" alt="Vercel" class="h-4">
            </div>
          </footer>
        </div>

        <div class="text-center py-12 text-slate-400 text-xs font-medium uppercase tracking-widest">
          Desarrollado con pasión por Omar Hernández &copy; ${new Date().getFullYear()}
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
