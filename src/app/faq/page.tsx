import React from 'react';
import { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { HelpCircle, MessageCircle, ChevronRight, Zap, Shield, Wallet, Clock, UserCheck } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/shared/Footer';

export const metadata: Metadata = {
  title: 'Protocolos y Consultas Frecuentes | Omar Hernández',
  description: 'Respuestas a las dudas más comunes sobre mis servicios de desarrollo web e ingeniería de software.',
};

const CATEGORIES = [
  {
    title: 'Comercial & Estrategia',
    icon: <Wallet size={20} />,
    faqs: [
      {
        q: '¿Cuál es el modelo de inversión para una landing page?',
        a: 'El rango para una landing page estática optimizada para conversión de alto rendimiento oscila entre $300 y $600 USD. Este valor se determina según la complejidad arquitectónica y las integraciones de marketing requeridas.'
      },
      {
        q: '¿Qué protocolos de pago están habilitados?',
        a: 'Operamos con PayPal para transacciones internacionales (USD/EUR). En Colombia, procesamos vía Wompi (Tarjetas, PSE, Nequi, Bancolombia) y transferencias directas. Se requiere un anticipo del 50% para la activación del cronograma.'
      },
      {
        q: '¿Se realiza mantenimiento post-lanzamiento?',
        a: 'Sí, disponemos de planes de mantenimiento proactivo desde $100 USD mensuales. Estos cubren auditorías de seguridad, respaldos redundantes, optimización de performance y actualizaciones menores de contenido.'
      }
    ]
  },
  {
    title: 'Técnica & Ejecución',
    icon: <Zap size={20} />,
    faqs: [
      {
        q: '¿Cuál es el stack tecnológico de referencia?',
        a: 'Desarrollamos exclusivamente sobre Next.js 15+ y React. Esta decisión arquitectónica garantiza los más altos estándares de velocidad (Core Web Vitals), seguridad y escalabilidad orgánica, superando a cualquier CMS convencional.'
      },
      {
        q: '¿Se incluye el diseño UI/UX en el flujo?',
        a: 'Totalmente. El proceso integra una fase de diseño en Figma centrada en la conversión de negocio y la experiencia del usuario final, alineada con la identidad de marca preexistente o nueva.'
      },
      {
        q: '¿Cuál es la política de propiedad intelectual?',
        a: 'Al completar el ciclo de inversión (pago total), se realiza la transferencia completa del código fuente y los derechos de propiedad intelectual al cliente. Tu software es un activo de tu empresa.'
      }
    ]
  },
  {
    title: 'Operaciones & Logística',
    icon: <Clock size={20} />,
    faqs: [
      {
        q: '¿Cuáles son los tiempos de entrega estándar?',
        a: 'Un MVP (Producto Mínimo Viable) se consolida en un periodo de 4 a 6 semanas. Proyectos de despliegue rápido como landing pages pueden ser operativos en un rango de 3 a 7 días hábiles.'
      },
      {
        q: '¿Cómo se gestiona el hosting y el dominio?',
        a: 'Asesoramos en la configuración de infraestructura Cloud (Vercel, AWS o Google Cloud) a nombre del cliente. Esto asegura que la entidad mantenga el control administrativo y financiero total de sus recursos.'
      },
      {
        q: '¿Existe garantía de estabilidad?',
        a: 'Entregamos cada proyecto con un protocolo de garantía de 30 días post-despliegue. Durante este periodo, se resuelven de forma prioritaria cualquier inconsistencia técnica detectada en el entorno productivo.'
      }
    ]
  }
];

export default function FAQPage() {
  const allFaqs = CATEGORIES.flatMap(c => c.faqs);
  
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": allFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col selection:bg-primary/30 font-main">
      
      <main className="flex-1 py-32 px-4 md:px-8">
        <JsonLd data={faqData} />
        
        <div className="max-w-5xl mx-auto space-y-24">
          
          {/* Section Header */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest italic">
              Customer Support Center
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white-custom tracking-tighter italic leading-none">
              Protocolos y <br />
              <span className="text-primary text-outline-primary">Consultas</span>
            </h1>
            <p className="text-text-muted text-sm font-medium max-w-2xl mx-auto opacity-70 italic">
              Estandarización de procesos y respuestas técnicas para garantizar la máxima transparencia en cada hito del desarrollo.
            </p>
          </div>

          {/* FAQ Grid */}
          <div className="grid grid-cols-1 gap-20">
            {CATEGORIES.map((category, idx) => (
              <section key={idx} className="space-y-12">
                <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-inner">
                    {category.icon}
                  </div>
                  <h2 className="text-2xl font-black text-white-custom tracking-tight italic uppercase leading-none">{category.title}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {category.faqs.map((faq, i) => (
                    <div key={i} className="group space-y-4">
                      <h3 className="text-lg font-bold text-white-custom group-hover:text-primary transition-colors flex items-start gap-3 leading-tight italic">
                        <ChevronRight size={18} className="text-primary mt-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                        {faq.q}
                      </h3>
                      <p className="text-sm text-text-muted/70 font-medium leading-relaxed pl-8 border-l border-white/5 group-hover:border-primary/20 transition-colors italic">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Global CTA */}
          <section className="bg-card-bg rounded-[60px] border border-white/5 p-12 md:p-20 shadow-2xl relative overflow-hidden text-center group hover:border-primary/20 transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent opacity-30" />
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="max-w-2xl mx-auto space-y-10 relative z-10">
              <div className="mx-auto w-20 h-20 rounded-[32px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <HelpCircle size={40} />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-black text-white-custom tracking-tighter italic">
                  ¿Tu requerimiento no está listado?
                </h2>
                <p className="text-text-muted text-sm font-medium italic opacity-70 leading-relaxed">
                  Cada proyecto digital es único. Iniciemos un canal de comunicación directo para analizar tu arquitectura técnica y objetivos de negocio de forma personalizada.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Link 
                  href="/calculadora"
                  className="bg-white/5 hover:bg-white/10 text-white-custom px-10 py-5 rounded-[24px] border border-white/10 font-black text-[10px] uppercase tracking-[0.3em] transition-all"
                >
                  Auditar Presupuesto
                </Link>
                <a 
                  href="https://wa.me/573219052878" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-primary hover:scale-105 text-background px-10 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
                >
                  <MessageCircle size={16} fill="currentColor" />
                  WhatsApp Directo
                </a>
              </div>
            </div>
          </section>

          {/* Global Trust Bar */}
          <div className="flex flex-wrap justify-center gap-12 pt-8 opacity-20 border-t border-white/5">
            <TrustItem icon={<Shield size={14} />} text="Protocolo Seguro" />
            <TrustItem icon={<UserCheck size={14} />} text="Identidad Verificada" />
            <TrustItem icon={<Clock size={14} />} text="Alta Disponibilidad" />
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

function TrustItem({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-2 font-black text-[9px] uppercase tracking-[0.4em] text-text-muted italic">
      {icon}
      {text}
    </div>
  );
}
