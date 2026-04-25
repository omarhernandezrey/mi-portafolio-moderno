import React from 'react';
import { supabaseServer } from '@/lib/supabaseServer';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { clientEnv } from '@/config/env';
import { generateProposalMarkdown } from '@/lib/proposals/generate';
import { MDXRemote } from 'next-mdx-remote/rsc';

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

  // 3. Generar contenido basado en industria
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

  return (
    <main className="min-h-screen py-20 px-6 bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-200 print:shadow-none print:border-none">
        {/* Header Decorativo */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-4 p-0"></div>
        
        <div className="p-12 space-y-12">
          {/* Título y Logo */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h1 className="text-3xl font-black uppercase tracking-tighter text-indigo-900">Propuesta Comercial</h1>
              <p className="text-gray-500 font-medium">Ref: {id.substring(0, 8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-indigo-700 text-xl">Omar Hernández Rey</p>
              <p className="text-sm text-gray-500">Full Stack Developer</p>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Cuerpo de la Propuesta Renderizado desde MDX */}
          <article className="prose prose-slate prose-indigo max-w-none 
            prose-headings:text-indigo-900 prose-headings:font-black
            prose-strong:text-indigo-700 prose-blockquote:border-indigo-200
            prose-blockquote:bg-indigo-50/30 prose-blockquote:p-4 prose-blockquote:rounded-xl">
            <MDXRemote source={markdown} />
          </article>

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
