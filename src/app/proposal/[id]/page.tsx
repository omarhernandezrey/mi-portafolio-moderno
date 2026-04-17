import React from 'react';
import { supabaseServer } from '@/lib/supabaseServer';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { clientEnv } from '@/config/env';

interface ProposalPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProposalPage({ params }: ProposalPageProps) {
  const { id } = await params;

  // 1. Obtener datos del lead
  const { data: lead, error } = await supabaseServer
    .from('leads')
    .select('*, conversation_id (visitor_name)')
    .eq('id', id)
    .single();

  if (error || !lead) {
    notFound();
  }

  // 2. Lógica de placeholders (fallback si faltan datos)
  const visitorName = (lead.conversation_id as { visitor_name?: string } | null)?.visitor_name;
  const customerName = lead.name || visitorName || 'Valorado Cliente';
  const budget = lead.budget || 'A convenir';
  const date = new Date(lead.created_at).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <main className="min-h-screen py-20 px-6 bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-200 print:shadow-none print:border-none">
        {/* Header Decorativo */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-4 p-0"></div>
        
        <div className="p-12 space-y-12">
          {/* Título y Logo */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h1 className="text-3xl font-black uppercase tracking-tighter text-indigo-900">Propuesta de Proyecto</h1>
              <p className="text-gray-500 font-medium">Ref: {id.substring(0, 8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-indigo-700 text-xl">Omar Hernández Rey</p>
              <p className="text-sm text-gray-500">Full Stack Developer</p>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Información Principal */}
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <p className="text-gray-400 uppercase text-[10px] font-bold tracking-widest mb-1">Para</p>
              <p className="font-bold text-lg">{customerName}</p>
              <p className="text-gray-600">{lead.company || 'Empresa Independiente'}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 uppercase text-[10px] font-bold tracking-widest mb-1">Fecha de Emisión</p>
              <p className="font-bold text-lg">{date}</p>
              <p className="text-gray-600">Válida por 15 días</p>
            </div>
          </div>

          {/* Cuerpo de la Propuesta */}
          <section className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-indigo-900 border-b-2 border-indigo-50 pb-2">1. Objetivo del Proyecto</h2>
              <p className="text-gray-700 leading-relaxed italic">
                &ldquo;{lead.notes || 'Desarrollar una solución tecnológica a medida que impulse los objetivos comerciales del cliente.'}&rdquo;
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-indigo-900 border-b-2 border-indigo-50 pb-2">2. Alcance Técnico</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Desarrollo con Next.js 15 y React 19',
                  'Diseño UI/UX Responsivo y Moderno',
                  'Optimización SEO y Performance (Lighthouse 90+)',
                  'Integración de Base de Datos / Backend',
                  'Despliegue en producción (Vercel/AWS)',
                  'Soporte post-lanzamiento (30 días)'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-600 bg-indigo-50/50 p-3 rounded-xl">
                    <div className="h-1.5 w-1.5 bg-indigo-600 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 bg-indigo-900 text-white p-8 rounded-3xl shadow-lg">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-xl font-bold opacity-80 uppercase tracking-widest text-sm mb-4">Inversión Estimada</h2>
                  <p className="text-4xl font-black">${budget} <span className="text-lg font-normal opacity-60">USD</span></p>
                </div>
                <div className="text-right space-y-1 text-xs opacity-70">
                  <p>50% Anticipo de inicio</p>
                  <p>50% Contra entrega final</p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer de la Propuesta */}
          <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-gray-100 print:hidden">
            <p className="text-xs text-gray-400 text-center md:text-left max-w-xs">
              ¿Listo para empezar? Haz clic en el botón para agendar la llamada de inicio o contáctame por WhatsApp.
            </p>
            <div className="flex gap-4">
              <Link 
                href={clientEnv.NEXT_PUBLIC_CALCOM_CONSULT_URL} 
                target="_blank"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold text-sm transition-all shadow-lg active:scale-95"
              >
                Agendar Inicio
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 flex justify-center gap-4 print:hidden">
        {/* Usamos un componente de cliente interno para el print si fuera necesario, 
            pero para simplicidad usamos un tag normal */}
        <button 
          className="text-gray-400 hover:text-indigo-600 text-sm font-medium transition-colors"
          onClick={() => typeof window !== 'undefined' && window.print()}
        >
          🖨️ Imprimir o Guardar como PDF
        </button>
      </div>
    </main>
  );
}
