import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serviciosProgramaticos } from '@/data/servicios';
import { ciudades } from '@/data/ciudades';
import OpenChatButton from '@/components/shared/OpenChatButton';
import { ArrowRight, Shield, Zap, Globe, Target, UserCheck, CheckCircle, Clock, DollarSign, HelpCircle } from 'lucide-react';
import Footer from '@/components/shared/Footer';
import JsonLd from '@/components/seo/JsonLd';

interface Props {
  params: Promise<{
    servicio: string;
    ciudad: string;
  }>;
}

export async function generateStaticParams() {
  const paths = [];
  for (const servicio of serviciosProgramaticos) {
    for (const ciudad of ciudades) {
      paths.push({
        servicio: servicio.id,
        ciudad: ciudad.id,
      });
    }
  }
  return paths;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { servicio: servicioId, ciudad: ciudadId } = await params;
  const servicio = serviciosProgramaticos.find(s => s.id === servicioId);
  const ciudad = ciudades.find(c => c.id === ciudadId);

  if (!servicio || !ciudad) return {};

  const title = servicio.h1.replace('{ciudad}', ciudad.name);
  const description = servicio.description
    .replace('{ciudad}', ciudad.name)
    .replace('{country}', ciudad.country);

  return {
    title,
    description,
    alternates: {
      canonical: `https://omarhernandezrey.com/servicios/${servicioId}/${ciudadId}`,
    },
    openGraph: {
      title,
      description,
      url: `https://omarhernandezrey.com/servicios/${servicioId}/${ciudadId}`,
      images: [
        {
          url: `https://omarhernandezrey.com/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(servicio.name + ' en ' + ciudad.name)}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`https://omarhernandezrey.com/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(servicio.name + ' en ' + ciudad.name)}`],
    },
  };
}

export default async function ServicioCiudadPage({ params }: Props) {
  const { servicio: servicioId, ciudad: ciudadId } = await params;
  const servicio = serviciosProgramaticos.find(s => s.id === servicioId);
  const ciudad = ciudades.find(c => c.id === ciudadId);

  if (!servicio || !ciudad) {
    notFound();
  }

  const h1 = servicio.h1.replace('{ciudad}', ciudad.name);
  const h2 = servicio.h2.replace('{ciudad}', ciudad.name);
  const description = servicio.description
    .replace('{ciudad}', ciudad.name)
    .replace('{country}', ciudad.country);

  const initialChatMessage = `Hola Omar, vengo de la página de ${servicio.name} en ${ciudad.name}. Me gustaría saber más sobre este servicio.`;

  // Schema LocalBusiness + Service
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": `https://omarhernandezrey.com/servicios/${servicioId}/${ciudadId}`,
    "name": `Omar Hernández Rey — ${servicio.name} en ${ciudad.name}`,
    "url": `https://omarhernandezrey.com/servicios/${servicioId}/${ciudadId}`,
    "telephone": "+573219052878",
    "priceRange": "$$-$$$",
    "description": description,
    "areaServed": {
      "@type": "City",
      "name": ciudad.name,
      "addressCountry": ciudad.country === 'Colombia' ? 'CO' : ciudad.country === 'United States' ? 'US' : ciudad.country
    },
    "provider": {
      "@type": "Person",
      "@id": "https://omarhernandezrey.com/#person"
    },
    "serviceType": servicio.name,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "priceRange": "500-15000"
    }
  };

  // Schema BreadcrumbList
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://omarhernandezrey.com" },
      { "@type": "ListItem", "position": 2, "name": "Servicios", "item": "https://omarhernandezrey.com/servicios" },
      { "@type": "ListItem", "position": 3, "name": servicio.name, "item": `https://omarhernandezrey.com/servicios/${servicioId}` },
      { "@type": "ListItem", "position": 4, "name": ciudad.name, "item": `https://omarhernandezrey.com/servicios/${servicioId}/${ciudadId}` }
    ]
  };

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col selection:bg-primary/30">
      <JsonLd data={localBusinessSchema} />
      <JsonLd data={breadcrumbSchema} />
      
      {/* Hero Architecture */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden border-b border-white/5 bg-card-bg/20 backdrop-blur-sm">
        {/* Visual Matrix */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-20">
          <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10 text-center space-y-12">
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest italic">
              Regional Engineering Hub • {ciudad.name}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-8xl font-black text-white-custom tracking-tighter leading-[0.9] italic">
              {h1.split(' en ')[0]}{' '}
              <span className="text-primary italic">en {ciudad.name}</span>
            </h1>
            <h2 className="text-xl md:text-2xl font-bold text-text-muted italic opacity-60 tracking-tight leading-relaxed max-w-2xl mx-auto">
              {h2}
            </h2>
            <p className="text-lg text-text-muted/70 font-medium leading-relaxed max-w-2xl mx-auto italic">
              {description}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <OpenChatButton 
              message={initialChatMessage}
              className="group inline-flex items-center gap-4 bg-primary text-background px-10 py-5 rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl shadow-primary/20"
            >
              Auditar Proyecto en {ciudad.name}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </OpenChatButton>
          </div>
        </div>
      </section>

      {/* Strategic Value Proposition */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 space-y-24">
          <div className="text-center space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted opacity-40">Methodology & Performance</h2>
            <h3 className="text-3xl md:text-5xl font-black text-white-custom tracking-tighter italic">
              Infraestructura diseñada para <br />
              <span className="text-primary text-outline-primary">el mercado de {ciudad.name}</span>
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <ValueCard 
              icon={<Globe size={32} />} 
              title="Relevancia Geográfica"
              description={`Optimizamos su arquitectura digital para los protocolos de búsqueda específicos de ${ciudad.name}, asegurando que su entidad tecnológica conecte de forma prioritaria con clientes en ${ciudad.country}.`}
            />
            <ValueCard 
              icon={<Zap size={32} />} 
              title="Eficiencia de Ejecución"
              description={`No solo consolidamos código; desplegamos activos financieros. Desde ${servicio.id === 'chatbot-ia' ? 'agentes inteligentes autónomos' : 'sistemas de carga ultra-rápida'} para la competencia local en ${ciudad.name}.`}
            />
          </div>

          <div className="mt-12 md:mt-20 p-8 md:p-12 lg:p-20 rounded-[32px] md:rounded-[60px] bg-card-bg border border-white/5 text-center shadow-2xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity blur-[80px]" />
            <div className="max-w-2xl mx-auto space-y-8 relative z-10">
              <p className="text-lg md:text-xl text-text-muted font-medium italic opacity-70 leading-relaxed">
                &ldquo;Nuestra misión operativa es que las organizaciones en {ciudad.name} dejen de tener simples sitios web y comiencen a operar máquinas de conversión automatizadas bajo estándares de clase mundial.&rdquo;
              </p>
              <div className="flex items-center justify-center gap-4 pt-6">
                <div className="w-12 h-px bg-primary/30" />
                <OpenChatButton 
                  message={initialChatMessage}
                  className="text-primary font-black text-[11px] uppercase tracking-[0.4em] hover:scale-105 transition-transform italic"
                >
                  Consultoría Técnica en {ciudad.name}
                </OpenChatButton>
                <div className="w-12 h-px bg-primary/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 border-t border-white/5 bg-background/50">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted opacity-40">Ventajas</h2>
            <h3 className="text-3xl md:text-4xl font-black text-white-custom tracking-tighter italic">
              Por qué elegir nuestro servicio de <span className="text-primary">{servicio.name}</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicio.benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-4 bg-card-bg rounded-2xl p-6 border border-white/5 hover:border-primary/20 transition-all">
                <CheckCircle className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-text-muted italic">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted opacity-40">Proceso</h2>
            <h3 className="text-3xl md:text-4xl font-black text-white-custom tracking-tighter italic">
              Cómo trabajamos en <span className="text-primary">{ciudad.name}</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {servicio.process.map((step, idx) => {
              const [title, desc] = step.split(': ');
              return (
                <div key={idx} className="relative">
                  <div className="bg-card-bg rounded-2xl p-6 border border-white/5 h-full">
                    <div className="text-4xl font-black text-primary/20 mb-4">0{idx + 1}</div>
                    <h4 className="text-lg font-bold text-white-custom italic mb-2">{title}</h4>
                    <p className="text-sm text-text-muted/70 font-medium italic">{desc}</p>
                  </div>
                  {idx < 3 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-white/10" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Price & Time Section */}
      <section className="py-24 border-t border-white/5 bg-card-bg/30">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card-bg rounded-3xl p-8 border border-white/5 text-center">
              <DollarSign className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-black text-text-muted uppercase tracking-widest mb-2">Inversión</h3>
              <p className="text-2xl font-black text-white-custom italic">{servicio.priceRange}</p>
            </div>
            <div className="bg-card-bg rounded-3xl p-8 border border-white/5 text-center">
              <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-black text-text-muted uppercase tracking-widest mb-2">Tiempo de Entrega</h3>
              <p className="text-2xl font-black text-white-custom italic">{servicio.deliveryTime}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center space-y-4 mb-16">
            <HelpCircle className="w-12 h-12 text-primary mx-auto" />
            <h2 className="text-3xl md:text-4xl font-black text-white-custom tracking-tighter italic">
              Preguntas frecuentes sobre {servicio.name} en {ciudad.name}
            </h2>
          </div>
          <div className="space-y-6">
            {servicio.faqs.map((faq, idx) => (
              <div key={idx} className="bg-card-bg rounded-2xl p-6 border border-white/5">
                <h3 className="text-lg font-bold text-white-custom italic mb-3">
                  {faq.q.replace('{ciudad}', ciudad.name)}
                </h3>
                <p className="text-sm text-text-muted/70 font-medium leading-relaxed italic">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recursos Útiles - Internal Linking */}
      <section className="py-24 bg-card-bg/30 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted opacity-40">Recursos</h2>
            <h3 className="text-2xl md:text-3xl font-black text-white-custom tracking-tighter italic">
              Artículos útiles para tu proyecto
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="/blog/cuanto-cuesta-sitio-web-colombia-2026" className="group bg-card-bg rounded-2xl p-6 border border-white/5 hover:border-primary/30 transition-all">
              <p className="text-sm font-bold text-white-custom group-hover:text-primary transition-colors italic mb-2">¿Cuánto cuesta un sitio web en Colombia?</p>
              <p className="text-xs text-text-muted/60">Guía completa de precios 2026</p>
            </a>
            <a href="/blog/chatbot-ia-negocio-colombia" className="group bg-card-bg rounded-2xl p-6 border border-white/5 hover:border-primary/30 transition-all">
              <p className="text-sm font-bold text-white-custom group-hover:text-primary transition-colors italic mb-2">Chatbots con IA para negocios</p>
              <p className="text-xs text-text-muted/60">Todo lo que nadie te dice</p>
            </a>
            <a href="/blog/landing-page-vs-sitio-web-colombia" className="group bg-card-bg rounded-2xl p-6 border border-white/5 hover:border-primary/30 transition-all">
              <p className="text-sm font-bold text-white-custom group-hover:text-primary transition-colors italic mb-2">Landing page vs sitio web</p>
              <p className="text-xs text-text-muted/60">¿Cuál necesitas?</p>
            </a>
          </div>
        </div>
      </section>

      {/* Global Trust Protocol */}
      <div className="flex flex-wrap justify-center gap-12 py-16 opacity-20 border-t border-white/5">
        <TrustItem icon={<Shield size={14} />} text="Secure Deployment" />
        <TrustItem icon={<UserCheck size={14} />} text="Verified Consultant" />
        <TrustItem icon={<Target size={14} />} text="Data Driven Strategy" />
      </div>

      <Footer />
    </div>
  );
}

function ValueCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="group bg-card-bg rounded-[28px] md:rounded-[40px] border border-white/5 p-6 md:p-10 shadow-2xl hover:border-primary/20 transition-all duration-500 relative overflow-hidden">
      <div className="absolute -right-4 -top-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
        {icon}
      </div>
      <div className="mb-10 w-20 h-20 rounded-[32px] bg-background/50 border border-white/5 flex items-center justify-center text-primary shadow-inner group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <div className="space-y-4">
        <h4 className="text-2xl font-black text-white-custom italic group-hover:text-primary transition-colors">{title}</h4>
        <p className="text-sm text-text-muted font-medium italic opacity-60 leading-relaxed">
          {description}
        </p>
      </div>
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
