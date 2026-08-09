import React from 'react';
import { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { Shield, ArrowLeft, Scale, Globe } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import Footer from '@/components/shared/Footer';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';

  return buildMetadata(
    isEn
      ? {
          title: 'Privacy Policy & Data Protection | Omar Hernández Rey',
          description: 'Privacy policy and personal data protection for omarhernandezrey.com: what we collect, why we collect it, and your rights under Colombian Law 1581.',
          path: '/privacidad',
          locale: 'en',
        }
      : {
          title: 'Política de Privacidad y Habeas Data | Omar Hernández Rey',
          description: 'Política de tratamiento de datos personales de omarhernandezrey.com conforme a la Ley 1581 de 2012 de Colombia: derechos, finalidades y contacto.',
          path: '/privacidad',
          locale: 'es',
        }
  );
}

export default async function PrivacidadPage({ params }: Props) {
  const { locale } = await params;
  const isEn = locale === 'en';

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col selection:bg-primary/30 font-main">

      <main className="flex-1 max-w-[60rem] mx-auto px-[var(--grid-margin)] pt-32 pb-32 space-y-16">

        {/* Document Header */}
        <header className="space-y-8 border-b border-white/5 pb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="font-mono-label inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[0.65rem]">
                {isEn ? 'Global Compliance Standards' : 'Legal Compliance Unit'}
              </div>
              <h1 className="font-display italic text-4xl md:text-6xl font-medium text-white-custom tracking-tight leading-none">
                {isEn ? (
                  <>Privacy <br /><span className="text-primary">Protocol</span></>
                ) : (
                  <>Protocolo de <br /><span className="text-primary">Privacidad</span></>
                )}
              </h1>
            </div>

            <div className="bg-card-bg/40 border border-white/5 p-6 rounded-[24px] backdrop-blur-xl text-right md:min-w-[200px]">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted opacity-40 mb-1">{isEn ? 'Last Revision' : 'Última Revisión'}</div>
              <div className="text-sm font-bold text-white-custom italic">{isEn ? 'April 15, 2026' : '15 de Abril, 2026'}</div>
              <div className="flex items-center justify-end gap-2 text-[10px] text-primary font-black uppercase tracking-tighter mt-2">
                {isEn ? <Globe size={12} /> : <Shield size={12} />}
                {isEn ? 'Global Availability' : 'Vigencia Activa'}
              </div>
            </div>
          </div>
        </header>

        {/* Regulatory Content */}
        <div className="bg-card-bg rounded-[48px] border border-white/5 p-8 md:p-16 shadow-2xl space-y-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
            <Scale size={200} className="-rotate-12" />
          </div>

          {isEn ? (
            <>
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
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Global Navigation */}
        <div className="flex justify-center gap-8 pt-8">
          <Link
            href="/"
            locale={locale}
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-text-muted hover:text-primary transition-all"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            {isEn ? 'Back to Control Center' : 'Volver al Centro de Control'}
          </Link>
          <Link
            href="/privacidad"
            locale={isEn ? 'es' : 'en'}
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-text-muted hover:text-primary transition-all"
          >
            {isEn ? 'Versión en Español' : 'English Version'}
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
        <h2 className="font-display italic text-2xl font-medium text-white-custom tracking-tight leading-none">{title}</h2>
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
