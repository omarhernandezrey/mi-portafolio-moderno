import React from 'react';
import { Metadata } from 'next';
import { ArrowLeft, Scale, Globe } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/shared/Footer';

export const metadata: Metadata = {
  title: 'Privacy Protocol & Data Protection | Omar Hernández',
  alternates: {
    canonical: 'https://omarhernandezrey.com/privacy',
    languages: {
      'en': 'https://omarhernandezrey.com/privacy',
      'es': 'https://omarhernandezrey.com/privacidad',
      'x-default': 'https://omarhernandezrey.com/privacidad',
    },
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col selection:bg-primary/30 font-main">
      
      <main className="flex-1 max-w-[900px] mx-auto px-4 md:px-8 pt-32 pb-32 space-y-16">
        
        {/* Document Header */}
        <header className="space-y-8 border-b border-white/5 pb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest italic">
                Global Compliance Standards
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white-custom tracking-tighter leading-none italic uppercase">
                Privacy <br />
                <span className="text-primary text-outline-primary">Protocol</span>
              </h1>
            </div>
            
            <div className="bg-card-bg/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl text-right md:min-w-[200px]">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted opacity-40 mb-1">Last Revision</div>
              <div className="text-sm font-bold text-white-custom italic">April 15, 2026</div>
              <div className="flex items-center justify-end gap-2 text-[10px] text-primary font-black uppercase tracking-tighter mt-2">
                <Globe size={12} />
                Global Availability
              </div>
            </div>
          </div>
        </header>

        {/* Regulatory Content */}
        <div className="bg-card-bg rounded-[48px] border border-white/5 p-8 md:p-16 shadow-2xl space-y-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
            <Scale size={200} className="-rotate-12" />
          </div>

          <section className="space-y-6 relative z-10">
            <p className="text-lg text-text-muted font-medium leading-relaxed italic opacity-80">
              In accordance with <strong>Law 1581 of 2012</strong> (Habeas Data Law) of the Republic of Colombia and international GDPR principles, I, <strong>Omar Hernández Rey</strong>, hereby establish the following protocols for the processing of personal information collected within this digital ecosystem.
            </p>
          </section>

          <section className="space-y-8 relative z-10">
            <LegalBlock 
              number="01" 
              title="Data Controller" 
              content="The entity responsible for the administration and custody of your data assets is Omar Hernández Rey, with operational residence in Bogotá, Colombia. For any rectification, inquiry, or deletion request, the following communication channel is enabled: hernandezreyomar@gmail.com."
            />
            
            <LegalBlock 
              number="02" 
              title="Scope of Data Collection" 
              content="Our AI system and contact terminals capture the following metadata:"
              list={[
                'Corporate Identity (Full Name)',
                'Communication Channels (Email, WhatsApp)',
                'Organizational Context (Company/Entity name)',
                'Technical Transcription of project requirements and objectives'
              ]}
            />

            <LegalBlock 
              number="03" 
              title="Operational Purpose" 
              content="Captured information is utilized under optimization protocols for:"
              list={[
                'Technical feasibility analysis and inquiry response',
                'Generation of commercial proposals and technical dossiers',
                'Logistical coordination of discovery sessions',
                'Maintaining communication integrity throughout the project lifecycle'
              ]}
            />

            <LegalBlock 
              number="04" 
              title="Third-Party Infrastructure" 
              content="To ensure service resilience, data is processed within high-security infrastructures:"
              list={[
                'Supabase: Relational storage with encryption at rest.',
                'Groq / Meta AI: Natural language processing via open-source models.'
              ]}
              extra="Under no circumstances is metadata commercialized for third-party advertising purposes."
            />

            <LegalBlock 
              number="05" 
              title="Subject Rights" 
              content="According to current regulations, you maintain sovereignty over your data for:"
              list={[
                'Immediate knowledge, update, and rectification.',
                'Request for permanent deletion (Right to be Forgotten).',
                'Unilateral revocation of processing consent.'
              ]}
            />
          </section>

          <footer className="pt-16 border-t border-white/5 text-center">
            <p className="text-[11px] text-text-muted/40 font-medium italic leading-relaxed uppercase tracking-[0.1em]">
              By interacting with the intelligent assistant or contact protocols, <br />
              you freely and consciously authorize the processing of your information under these guidelines.
            </p>
          </footer>
        </div>

        {/* Global Navigation */}
        <div className="flex justify-center gap-8 pt-8">
          <Link 
            href="/"
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-text-muted hover:text-primary transition-all"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Control Center
          </Link>
          <Link 
            href="/privacidad"
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-text-muted hover:text-primary transition-all"
          >
            Versión en Español
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}

function LegalBlock({ number, title, content, list, extra }: { number: string, title: string, content: string, list?: string[], extra?: string }) {
  return (
    <div className="space-y-6 group">
      <div className="flex items-center gap-6">
        <div className="text-[32px] font-black text-primary/10 italic group-hover:text-primary/30 transition-colors leading-none">{number}</div>
        <h2 className="text-2xl font-black text-white-custom italic tracking-tight uppercase leading-none">{title}</h2>
      </div>
      <div className="pl-12 space-y-4">
        <p className="text-sm text-text-muted font-medium leading-relaxed italic opacity-70">{content}</p>
        {list && (
          <ul className="space-y-3">
            {list.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-xs text-text-muted font-bold opacity-60">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/30 mt-1.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        )}
        {extra && <p className="text-xs text-primary/60 font-black uppercase tracking-widest italic">{extra}</p>}
      </div>
    </div>
  );
}
