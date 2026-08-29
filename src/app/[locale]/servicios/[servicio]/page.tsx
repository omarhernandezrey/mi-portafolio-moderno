import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { serviciosProgramaticos } from '@/data/servicios';
import { ciudades, CIUDADES_INDEXABLES } from '@/data/ciudades';
import WhatsAppCTA from '@/components/whatsapp/WhatsAppCTA';
import { ArrowRight, CheckCircle, Clock, DollarSign, HelpCircle, MapPin } from 'lucide-react';
import Footer from '@/components/shared/Footer';
import JsonLd from '@/components/seo/JsonLd';
import { buildMetadata, withBrand, SITE_URL as BASE_URL } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string; servicio: string }>;
}

// Convierte los textos plantilla "{ciudad}" en versión genérica del servicio
function generico(texto: string): string {
  return texto
    .replace(/\s+en\s+\{ciudad\}/g, '')
    .replace(/\{ciudad\}/g, 'Colombia')
    .replace(/\{country\}/g, 'Colombia y USA');
}

function genericoEn(texto: string): string {
  return texto
    .replace(/\s+in\s+\{city\}/g, '')
    .replace(/\{city\}/g, 'Colombia')
    .replace(/\{country\}/g, 'Colombia and the US');
}

export async function generateStaticParams() {
  const paths = [];
  for (const locale of ['es', 'en']) {
    for (const servicio of serviciosProgramaticos) {
      paths.push({ locale, servicio: servicio.id });
    }
  }
  return paths;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, servicio: servicioId } = await params;
  const servicio = serviciosProgramaticos.find((s) => s.id === servicioId);
  if (!servicio) return {};

  const isEn = locale === 'en';

  if (isEn && servicio.h1En) {
    const h1 = genericoEn(servicio.h1En);
    return buildMetadata({
      title: withBrand(h1),
      description: genericoEn(servicio.descriptionEn ?? servicio.description),
      path: `/servicios/${servicio.id}`,
      locale: 'en',
      ogSubtitle: (servicio.priceRangeUsd ?? servicio.priceRange).split('(')[0].trim(),
      keywords: (servicio.keywordsEn ?? servicio.keywords).map((k) => genericoEn(k)),
    });
  }

  const h1 = generico(servicio.h1);
  return buildMetadata({
    title: withBrand(h1),
    description: generico(servicio.description),
    path: `/servicios/${servicio.id}`,
    locale: 'es',
    ogSubtitle: servicio.priceRange.split('(')[0].trim(),
    keywords: servicio.keywords.map((k) => generico(k)),
  });
}

export default async function ServicioPilarPage({ params }: Props) {
  const { locale, servicio: servicioId } = await params;
  const servicio = serviciosProgramaticos.find((s) => s.id === servicioId);
  if (!servicio) notFound();

  const isEn = locale === 'en' && !!servicio.h1En;

  const h1 = isEn ? genericoEn(servicio.h1En!) : generico(servicio.h1);
  const h2 = isEn ? genericoEn(servicio.h2En ?? servicio.h2) : generico(servicio.h2);
  const description = isEn ? genericoEn(servicio.descriptionEn ?? servicio.description) : generico(servicio.description);
  const faqs = isEn
    ? (servicio.faqsEn ?? servicio.faqs).map((f) => ({ q: genericoEn(f.q), a: f.a }))
    : servicio.faqs.map((f) => ({ q: generico(f.q), a: f.a }));
  const benefits = isEn ? servicio.benefitsEn ?? servicio.benefits : servicio.benefits;
  const process = isEn ? servicio.processEn ?? servicio.process : servicio.process;
  const priceRange = isEn ? servicio.priceRangeUsd ?? servicio.priceRange : servicio.priceRange;
  const deliveryTime = isEn ? servicio.deliveryTimeEn ?? servicio.deliveryTime : servicio.deliveryTime;
  const serviceName = isEn ? servicio.nameEn ?? servicio.name : servicio.name;

  const ciudadesConPagina = ciudades.filter((c) =>
    (CIUDADES_INDEXABLES as readonly string[]).includes(c.id)
  );
  const base = isEn ? `${BASE_URL}/en` : BASE_URL;
  const url = `${base}/servicios/${servicio.id}`;

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': url,
    name: serviceName,
    url,
    description,
    serviceType: serviceName,
    provider: { '@type': 'Person', '@id': `${BASE_URL}/#person` },
    areaServed: ['CO', 'US', 'MX', 'AR', 'CL', 'PE'],
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      priceRange,
    },
    inLanguage: isEn ? 'en' : 'es',
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
      { '@type': 'ListItem', position: 1, name: isEn ? 'Home' : 'Inicio', item: base },
      { '@type': 'ListItem', position: 2, name: isEn ? 'Services' : 'Servicios', item: `${base}/servicios` },
      { '@type': 'ListItem', position: 3, name: serviceName, item: url },
    ],
  };

  const chatMsg = isEn
    ? `Hi Omar, I'm reaching out from your ${serviceName} page. I'd like to learn more about this service.`
    : `Hola Omar, vengo de la página de ${servicio.name}. Me gustaría saber más sobre este servicio.`;

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

        <div className="max-w-[90rem] mx-auto px-[var(--grid-margin)] relative z-10 text-center space-y-12">
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="font-mono-label inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[0.65rem]">
              {isEn ? 'Colombia & Remote USA · LATAM' : 'Colombia & Remoto USA · LATAM'}
            </div>
            <h1 className="font-display italic text-4xl sm:text-5xl md:text-7xl font-medium text-white-custom tracking-tight leading-[0.95]">
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
            <WhatsAppCTA
              message={chatMsg}
              className="group inline-flex items-center gap-4 bg-primary text-background px-10 py-5 rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl shadow-primary/20"
            >
              {isEn ? 'Quote my project' : 'Cotizar mi proyecto'}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </WhatsAppCTA>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 border-t border-white/5 bg-background/50">
        <div className="max-w-[90rem] mx-auto px-[var(--grid-margin)]">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-mono-label text-[0.6rem] text-text-muted opacity-40">{isEn ? 'Benefits' : 'Ventajas'}</h2>
            <h3 className="font-display italic text-3xl md:text-4xl font-medium text-white-custom tracking-tight">
              {isEn ? `Why choose my ${serviceName} service` : `Por qué elegir mi servicio de ${serviceName}`}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => (
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
        <div className="max-w-[90rem] mx-auto px-[var(--grid-margin)]">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-mono-label text-[0.6rem] text-text-muted opacity-40">{isEn ? 'Process' : 'Proceso'}</h2>
            <h3 className="font-display italic text-3xl md:text-4xl font-medium text-white-custom tracking-tight">
              {isEn ? 'How I work' : 'Cómo trabajamos'}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((step, idx) => {
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
              <h3 className="text-lg font-black text-text-muted uppercase tracking-widest mb-2">{isEn ? 'Investment' : 'Inversión'}</h3>
              <p className="text-2xl font-black text-white-custom italic">{priceRange}</p>
            </div>
            <div className="bg-card-bg rounded-3xl p-8 border border-white/5 text-center">
              <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-black text-text-muted uppercase tracking-widest mb-2">{isEn ? 'Delivery Time' : 'Tiempo de Entrega'}</h3>
              <p className="text-2xl font-black text-white-custom italic">{deliveryTime}</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center space-y-4 mb-16">
            <HelpCircle className="w-12 h-12 text-primary mx-auto" />
            <h2 className="font-display italic text-3xl md:text-4xl font-medium text-white-custom tracking-tight">
              {isEn ? `Frequently asked questions about ${serviceName}` : `Preguntas frecuentes sobre ${serviceName}`}
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
        <div className="max-w-[90rem] mx-auto px-[var(--grid-margin)] space-y-10">
          <div className="text-center space-y-4">
            <h2 className="font-mono-label text-[0.6rem] text-text-muted opacity-40">{isEn ? 'Coverage' : 'Cobertura'}</h2>
            <h3 className="font-display italic text-2xl md:text-3xl font-medium text-white-custom tracking-tight">
              {isEn ? `${serviceName} by city` : `${servicio.name} por ciudad`}
            </h3>
            <p className="text-sm text-text-muted/60 max-w-xl mx-auto">
              {isEn
                ? '100% remote work for all of Colombia, the US, and LATAM. Local info for these cities:'
                : 'Trabajo 100% remoto para toda Colombia, USA y LATAM. Información local para estas ciudades:'}
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
        <div className="max-w-[90rem] mx-auto px-[var(--grid-margin)]">
          <div className="text-center space-y-4 mb-12">
            <h2 className="font-mono-label text-[0.6rem] text-text-muted opacity-40">{isEn ? 'Catalog' : 'Catálogo'}</h2>
            <h3 className="font-display italic text-2xl md:text-3xl font-medium text-white-custom tracking-tight">
              {isEn ? 'Other Services' : 'Otros servicios'}
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
                      {isEn ? s.nameEn ?? s.name : s.name}
                    </p>
                    <p className="text-[10px] text-text-muted/50">
                      {(isEn ? s.priceRangeUsd ?? s.priceRange : s.priceRange).split('(')[0].trim()}
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
              {isEn ? 'View all services' : 'Ver todos los servicios'}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
