import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { serviciosProgramaticos } from '@/data/servicios';
import { ciudades, CIUDADES_INDEXABLES } from '@/data/ciudades';
import OpenChatButton from '@/components/shared/OpenChatButton';
import { ArrowRight, CheckCircle, Clock, DollarSign, HelpCircle, MapPin } from 'lucide-react';
import Footer from '@/components/shared/Footer';
import JsonLd from '@/components/seo/JsonLd';
import { buildMetadata, withBrand, SITE_URL as BASE_URL } from '@/lib/seo';

interface Props {
  params: Promise<{ servicio: string }>;
}

// Convierte los textos plantilla "{ciudad}" en versión genérica del servicio
function generico(texto: string): string {
  return texto
    .replace(/\s+en\s+\{ciudad\}/g, '')
    .replace(/\{ciudad\}/g, 'Colombia')
    .replace(/\{country\}/g, 'Colombia y USA');
}

export async function generateStaticParams() {
  return serviciosProgramaticos.map((servicio) => ({ servicio: servicio.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { servicio: servicioId } = await params;
  const servicio = serviciosProgramaticos.find((s) => s.id === servicioId);
  if (!servicio) return {};

  const h1 = generico(servicio.h1);
  return buildMetadata({
    title: withBrand(h1),
    description: generico(servicio.description),
    path: `/servicios/${servicio.id}`,
    ogSubtitle: servicio.priceRange.split('(')[0].trim(),
    keywords: servicio.keywords.map((k) => generico(k)),
  });
}

export default async function ServicioPilarPage({ params }: Props) {
  const { servicio: servicioId } = await params;
  const servicio = serviciosProgramaticos.find((s) => s.id === servicioId);
  if (!servicio) notFound();

  const h1 = generico(servicio.h1);
  const h2 = generico(servicio.h2);
  const description = generico(servicio.description);
  const faqs = servicio.faqs.map((f) => ({ q: generico(f.q), a: f.a }));
  const ciudadesConPagina = ciudades.filter((c) =>
    (CIUDADES_INDEXABLES as readonly string[]).includes(c.id)
  );
  const url = `${BASE_URL}/servicios/${servicio.id}`;

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': url,
    name: servicio.name,
    url,
    description,
    serviceType: servicio.name,
    provider: { '@type': 'Person', '@id': `${BASE_URL}/#person` },
    areaServed: ['CO', 'US', 'MX', 'AR', 'CL', 'PE'],
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      priceRange: servicio.priceRangeUsd ?? servicio.priceRange,
    },
    inLanguage: 'es',
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Servicios', item: `${BASE_URL}/servicios` },
      { '@type': 'ListItem', position: 3, name: servicio.name, item: url },
    ],
  };

  const chatMsg = `Hola Omar, vengo de la página de ${servicio.name}. Me gustaría saber más sobre este servicio.`;

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col selection:bg-primary/30">
      <JsonLd data={serviceSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* Hero */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden border-b border-white/5 bg-card-bg/20 backdrop-blur-sm">
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-20">
          <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-[1400px] mx-auto px-4 md:px-8 relative z-10 text-center space-y-12">
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest italic">
              Colombia &amp; Remoto USA · LATAM
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white-custom tracking-tighter leading-[0.95] italic">
              {h1}
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
              message={chatMsg}
              className="group inline-flex items-center gap-4 bg-primary text-background px-10 py-5 rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl shadow-primary/20"
            >
              Cotizar mi proyecto
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </OpenChatButton>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 border-t border-white/5 bg-background/50">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted opacity-40">Ventajas</h2>
            <h3 className="text-3xl md:text-4xl font-black text-white-custom tracking-tighter italic">
              Por qué elegir mi servicio de {servicio.name}
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

      {/* Process */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted opacity-40">Proceso</h2>
            <h3 className="text-3xl md:text-4xl font-black text-white-custom tracking-tighter italic">
              Cómo trabajamos
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

      {/* Price & Time */}
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

      {/* FAQs */}
      <section className="py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center space-y-4 mb-16">
            <HelpCircle className="w-12 h-12 text-primary mx-auto" />
            <h2 className="text-3xl md:text-4xl font-black text-white-custom tracking-tighter italic">
              Preguntas frecuentes sobre {servicio.name}
            </h2>
          </div>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-card-bg rounded-2xl p-6 border border-white/5">
                <h3 className="text-lg font-bold text-white-custom italic mb-3">{faq.q}</h3>
                <p className="text-sm text-text-muted/70 font-medium leading-relaxed italic">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="py-24 bg-card-bg/30 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 space-y-10">
          <div className="text-center space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted opacity-40">Cobertura</h2>
            <h3 className="text-2xl md:text-3xl font-black text-white-custom tracking-tighter italic">
              {servicio.name} por ciudad
            </h3>
            <p className="text-sm text-text-muted/60 max-w-xl mx-auto">
              Trabajo 100% remoto para toda Colombia, USA y LATAM. Información local para estas ciudades:
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {ciudadesConPagina.map((ciudad) => (
              <Link
                key={ciudad.id}
                href={`/servicios/${servicio.id}/${ciudad.id}`}
                className="group flex items-center gap-2 p-4 bg-card-bg rounded-2xl border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <MapPin size={14} className="text-primary shrink-0" />
                <span className="text-sm font-bold text-text-muted group-hover:text-white-custom transition-colors">
                  {ciudad.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Other Services */}
      <section className="py-24 bg-background border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted opacity-40">Catálogo</h2>
            <h3 className="text-2xl md:text-3xl font-black text-white-custom tracking-tighter italic">
              Otros servicios
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviciosProgramaticos
              .filter((s) => s.id !== servicio.id)
              .slice(0, 6)
              .map((s) => (
                <Link
                  key={s.id}
                  href={`/servicios/${s.id}`}
                  className="group bg-card-bg rounded-2xl p-5 border border-white/5 hover:border-primary/30 transition-all flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-bold text-white-custom group-hover:text-primary transition-colors italic mb-1">
                      {s.name}
                    </p>
                    <p className="text-[10px] text-text-muted/50">
                      {s.priceRange.split('(')[0].trim()}
                    </p>
                  </div>
                  <ArrowRight size={14} className="text-text-muted/30 group-hover:text-primary transition-colors shrink-0" />
                </Link>
              ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/servicios"
              className="inline-flex items-center gap-2 text-sm font-bold text-text-muted/60 hover:text-primary transition-colors"
            >
              Ver todos los servicios
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
