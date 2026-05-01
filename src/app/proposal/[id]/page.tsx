import React from 'react';
import { supabaseServer } from '@/lib/supabaseServer';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { clientEnv } from '@/config/env';
import { generateProposalMarkdown } from '@/lib/proposals/generate';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { FileText, Calendar, Wallet, ShieldCheck, Printer, ArrowRight, Star, Clock, User } from 'lucide-react';

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
    project_name: lead.service_requested || 'Estrategia Digital',
    industry: (lead as { industry?: string }).industry || 'General',
    pain_points: lead.notes || 'Optimización de infraestructura digital',
    price: budget,
    timeline: lead.timeline || 'Consolidado a convenir',
    date,
    calcom_url: clientEnv.NEXT_PUBLIC_CALCOM_CONSULT_URL
  });

  return (
    <main className="min-h-screen py-16 px-4 md:py-24 md:px-8 bg-background text-text-main selection:bg-primary/30">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Navigation / Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 print:hidden">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Technical Dossier</p>
              <h2 className="text-sm font-bold text-text-muted italic">ID: {id.substring(0, 12).toUpperCase()}</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => typeof window !== 'undefined' && window.print()}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white-custom transition-all"
            >
              <Printer size={14} />
              Exportar Dossier
            </button>
            <Link 
              href={clientEnv.NEXT_PUBLIC_CALCOM_CONSULT_URL} 
              target="_blank"
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary text-background text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/20"
            >
              Agendar Kickoff
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Main Proposal Container */}
        <div className="bg-card-bg rounded-[60px] border border-white/5 shadow-2xl overflow-hidden relative backdrop-blur-xl print:border-none print:shadow-none print:rounded-none">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary opacity-50" />
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-accent/5 blur-[100px] rounded-full pointer-events-none" />

          <div className="p-10 md:p-20 space-y-20 relative z-10">
            
            {/* Dossier Header */}
            <header className="flex flex-col md:flex-row justify-between items-start gap-10 border-b border-white/5 pb-16">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest italic">
                  Propuesta de Valor v3.2
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-white-custom tracking-tighter leading-[0.9] italic">
                  Estrategia de <br />
                  <span className="text-primary">Ingeniería Digital</span>
                </h1>
                <div className="flex flex-wrap gap-8 pt-4">
                  <HeaderMeta icon={<User size={14} />} label="Previsionado para" value={customerName} />
                  <HeaderMeta icon={<Calendar size={14} />} label="Fecha de Emisión" value={date} />
                  <HeaderMeta icon={<ShieldCheck size={14} />} label="Estatus" value="Altamente Recomendado" color="text-primary" />
                </div>
              </div>
              
              <div className="text-right space-y-1">
                <p className="text-3xl font-black text-white-custom italic tracking-tight">Omar Hernández</p>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Expert Software Engineer</p>
                <div className="pt-4 flex flex-col gap-1 text-[10px] text-text-muted font-medium opacity-40 uppercase tracking-widest">
                  <span>Full-Stack Development</span>
                  <span>AI Systems Architect</span>
                  <span>Performance Consultant</span>
                </div>
              </div>
            </header>

            {/* Document Content (MDX) */}
            <article className="prose prose-invert prose-primary max-w-none prose-h1:text-4xl prose-h1:font-black prose-h1:tracking-tighter prose-h1:italic prose-h2:text-2xl prose-h2:font-black prose-h2:tracking-tight prose-h2:italic prose-h2:mt-16 prose-h2:pb-4 prose-h2:border-b prose-h2:border-white/5 prose-h3:text-lg prose-h3:font-bold prose-h3:text-primary prose-h3:mt-10 prose-p:text-text-muted prose-p:text-base prose-p:leading-relaxed prose-p:font-medium prose-li:text-text-muted prose-li:font-medium prose-strong:text-white-custom prose-strong:font-black prose-blockquote:bg-white/[0.02] prose-blockquote:border-primary prose-blockquote:border-l-4 prose-blockquote:rounded-2xl prose-blockquote:p-8 prose-blockquote:italic prose-hr:border-white/5 [&>ul]:space-y-3 [&>ul]:list-square print:prose-p:text-black print:prose-headings:text-black">
              <MDXRemote source={markdown} />
            </article>

            {/* Investment Summary Highlight */}
            <section className="bg-background/50 rounded-[40px] border border-white/5 p-12 flex flex-col md:flex-row items-center justify-between gap-10 shadow-inner group/invest hover:border-primary/20 transition-all duration-500">
              <div className="space-y-4 max-w-md">
                <h3 className="text-2xl font-black text-white-custom italic tracking-tight flex items-center gap-3">
                  <Star className="text-primary animate-pulse" size={24} />
                  Inversión Estratégica
                </h3>
                <p className="text-sm text-text-muted font-medium italic opacity-70">
                  Valores calculados según complejidad técnica y retorno de inversión estimado para el sector {(lead as { industry?: string }).industry || 'General'}.
                </p>
              </div>
              <div className="text-center md:text-right">
                <div className="text-6xl font-black text-white-custom tracking-tighter flex items-baseline justify-end gap-2 group-hover/invest:scale-110 transition-transform duration-500">
                  <span className="text-xl text-primary opacity-40">$</span>
                  {budget}
                  <span className="text-xs font-bold text-text-muted/40 tracking-widest uppercase">USD</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mt-2 italic">Estimado Base Consolidado</p>
              </div>
            </section>

            {/* Dossier Footer */}
            <footer className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-end gap-10 text-text-muted/40 font-medium text-[10px] uppercase tracking-[0.2em] italic">
              <div className="space-y-1">
                <p>© 2026 Omar Hernández Rey • Portfolio Identity System</p>
                <p>Propiedad Intelectual y Técnica Confidencial</p>
              </div>
              <div className="text-right space-y-1">
                <p>Medellín/Bogotá, Colombia</p>
                <p>Remote Worldwide Availability</p>
              </div>
            </footer>
          </div>
        </div>

        {/* Global Security / Trust Bar */}
        <div className="flex flex-wrap justify-center gap-12 pt-8 opacity-20 hover:opacity-40 transition-opacity print:hidden">
          <TrustItem icon={<ShieldCheck size={16} />} text="Secure Protocol" />
          <TrustItem icon={<Wallet size={16} />} text="Verified Escrow" />
          <TrustItem icon={<Clock size={16} />} text="Agile Delivery" />
          <TrustItem icon={<Star size={16} />} text="Top Rated Service" />
        </div>
      </div>

      {/* Global Print Background Override */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; color: black !important; }
          main { padding: 0 !important; }
          .bg-card-bg { background: white !important; }
          .text-white-custom { color: black !important; }
          .text-text-muted { color: #333 !important; }
          .text-primary { color: black !important; border-bottom: 2px solid #000; }
        }
      `}} />
    </main>
  );
}

function HeaderMeta({ icon, label, value, color = "text-text-muted/60" }: { icon: React.ReactNode, label: string, value: string, color?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-black uppercase tracking-widest text-text-muted/30 italic flex items-center gap-2">
        {icon}
        {label}
      </p>
      <p className={`text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}

function TrustItem({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-2 font-black text-[9px] uppercase tracking-[0.4em]">
      {icon}
      {text}
    </div>
  );
}
