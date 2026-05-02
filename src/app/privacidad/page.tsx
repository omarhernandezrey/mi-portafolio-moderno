import React from 'react';
import { Metadata } from 'next';
import { Shield, ArrowLeft, Scale } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/shared/Footer';

export const metadata: Metadata = {
  title: 'Protocolo de Privacidad y Habeas Data | Omar Hernández',
  robots: { index: false, follow: true },
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col selection:bg-primary/30 font-main">
      
      <main className="flex-1 max-w-[900px] mx-auto px-4 md:px-8 pt-32 pb-32 space-y-16">
        
        {/* Document Header */}
        <header className="space-y-8 border-b border-white/5 pb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest italic">
                Legal Compliance Unit
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white-custom tracking-tighter leading-none italic uppercase">
                Protocolo de <br />
                <span className="text-primary text-outline-primary">Privacidad</span>
              </h1>
            </div>
            
            <div className="bg-card-bg/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl text-right md:min-w-[200px]">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted opacity-40 mb-1">Última Revisión</div>
              <div className="text-sm font-bold text-white-custom italic">15 de Abril, 2026</div>
              <div className="flex items-center justify-end gap-2 text-[10px] text-primary font-black uppercase tracking-tighter mt-2">
                <Shield size={12} />
                Vigencia Activa
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
              En cumplimiento estricto de la <strong>Ley 1581 de 2012</strong> (Ley de Habeas Data) de la República de Colombia y los estándares internacionales de protección de datos, yo, <strong>Omar Hernández Rey</strong>, establezco los siguientes protocolos para el tratamiento de la información personal recolectada en este ecosistema digital.
            </p>
          </section>

          <section className="space-y-8 relative z-10">
            <LegalBlock 
              number="01" 
              title="Responsable del Tratamiento" 
              content="La entidad responsable de la administración y custodia de sus activos de información es Omar Hernández Rey, con residencia operativa en Bogotá, Colombia. Para cualquier requerimiento de rectificación, consulta o eliminación, se habilita el canal de comunicación: hernandezreyomar@gmail.com."
            />
            
            <LegalBlock 
              number="02" 
              title="Dimensión de Datos Recopilados" 
              content="Nuestro sistema de IA y terminales de contacto capturan los siguientes metadatos:"
              list={[
                'Identidad corporativa (Nombre y Apellidos)',
                'Canales de comunicación (Email, WhatsApp)',
                'Contexto organizacional (Nombre de empresa/entidad)',
                'Transcripción técnica de requerimientos y objetivos de proyecto'
              ]}
            />

            <LegalBlock 
              number="03" 
              title="Finalidad Operativa" 
              content="La información capturada se utiliza bajo protocolos de optimización para:"
              list={[
                'Análisis de viabilidad técnica y respuesta a consultas',
                'Generación de propuestas comerciales y dossiers técnicos',
                'Coordinación logística de sesiones de descubrimiento',
                'Mantenimiento de la integridad en la comunicación del proyecto'
              ]}
            />

            <LegalBlock 
              number="04" 
              title="Infraestructura de Terceros" 
              content="Para garantizar la resiliencia del servicio, los datos se procesan en infraestructuras de alta seguridad:"
              list={[
                'Supabase: Almacenamiento relacional bajo cifrado en reposo.',
                'Groq / Meta AI: Procesamiento de lenguaje natural bajo modelos open-source.'
              ]}
              extra="Bajo ninguna circunstancia se realiza la comercialización de metadatos con fines publicitarios de terceros."
            />

            <LegalBlock 
              number="05" 
              title="Derechos del Titular" 
              content="De acuerdo a la normativa vigente, usted mantiene la soberanía sobre sus datos para:"
              list={[
                'Conocimiento, actualización y rectificación inmediata.',
                'Solicitud de supresión definitiva (Derecho al Olvido).',
                'Revocación del consentimiento de tratamiento de forma unilateral.'
              ]}
            />
          </section>

          <footer className="pt-16 border-t border-white/5 text-center">
            <p className="text-[11px] text-text-muted/40 font-medium italic leading-relaxed uppercase tracking-[0.1em]">
              Al interactuar con el asistente inteligente o los protocolos de contacto, <br />
              usted autoriza de forma libre y consciente el tratamiento de su información bajo estas directrices.
            </p>
          </footer>
        </div>

        {/* Global Navigation */}
        <div className="flex justify-center pt-8">
          <Link 
            href="/"
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-text-muted hover:text-primary transition-all"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Volver al Centro de Control
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
