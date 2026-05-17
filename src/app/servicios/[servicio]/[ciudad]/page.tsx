import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
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

  const isUS = ciudad.country === 'United States';

  const title = isUS && servicio.h1En
    ? servicio.h1En.replace('{city}', ciudad.name)
    : servicio.h1.replace('{ciudad}', ciudad.name);

  const description = isUS && servicio.descriptionEn
    ? servicio.descriptionEn.replace('{city}', ciudad.name).replace('{country}', ciudad.country)
    : servicio.description.replace('{ciudad}', ciudad.name).replace('{country}', ciudad.country);

  const keywords = isUS && servicio.keywordsEn
    ? servicio.keywordsEn.map(k => k.replace('{city}', ciudad.name))
    : servicio.keywords.map(k => k.replace('{ciudad}', ciudad.name).replace('{country}', ciudad.country));

  const serviceName = isUS && servicio.nameEn ? servicio.nameEn : servicio.name;

  // Smart indexing: priority cities indexables (evita thin content, mantiene calidad)
  const INDEXABLE_CITIES = new Set([
    // Colombia — principales
    'bogota', 'medellin', 'cali', 'barranquilla', 'cartagena',
    'bucaramanga', 'pereira', 'santa-marta',
    // LATAM — hubs tecnológicos
    'ciudad-de-mexico', 'monterrey', 'buenos-aires', 'santiago', 'lima',
    'quito', 'panama', 'santo-domingo', 'montevideo', 'san-jose',
    // USA — tier 1 tech markets
    'new-york', 'los-angeles', 'chicago', 'houston', 'miami', 'dallas',
    'san-francisco', 'seattle', 'boston', 'atlanta', 'washington-dc',
    'austin', 'denver', 'san-diego', 'phoenix', 'portland',
    // USA — tier 2 growing markets
    'orlando', 'tampa', 'charlotte', 'nashville', 'salt-lake-city',
    'minneapolis', 'san-antonio', 'las-vegas',
  ]);
  const isIndexable = INDEXABLE_CITIES.has(ciudadId);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `https://omarhernandezrey.com/servicios/${servicioId}/${ciudadId}`,
    },
    robots: isIndexable ? undefined : { index: false, follow: true },
    openGraph: {
      type: 'website',
      locale: isUS ? 'en_US' : 'es_CO',
      title,
      description,
      url: `https://omarhernandezrey.com/servicios/${servicioId}/${ciudadId}`,
      images: [
        {
          url: `https://omarhernandezrey.com/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(serviceName + (isUS ? ' in ' : ' en ') + ciudad.name)}`,
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
      images: [`https://omarhernandezrey.com/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(serviceName + (isUS ? ' in ' : ' en ') + ciudad.name)}`],
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

  const isUS = ciudad.country === 'United States';

  const h1 = isUS && servicio.h1En
    ? servicio.h1En.replace('{city}', ciudad.name)
    : servicio.h1.replace('{ciudad}', ciudad.name);

  const h2 = isUS && servicio.h2En
    ? servicio.h2En.replace('{city}', ciudad.name)
    : servicio.h2.replace('{ciudad}', ciudad.name);

  const description = isUS && servicio.descriptionEn
    ? servicio.descriptionEn.replace('{city}', ciudad.name).replace('{country}', ciudad.country)
    : servicio.description.replace('{ciudad}', ciudad.name).replace('{country}', ciudad.country);

  const benefits = isUS && servicio.benefitsEn ? servicio.benefitsEn : servicio.benefits;
  const process = isUS && servicio.processEn ? servicio.processEn : servicio.process;
  const faqs = isUS && servicio.faqsEn
    ? servicio.faqsEn.map(f => ({ q: f.q.replace('{city}', ciudad.name), a: f.a }))
    : servicio.faqs.map(f => ({ q: f.q.replace('{ciudad}', ciudad.name), a: f.a }));
  const priceRange = isUS && servicio.priceRangeUsd ? servicio.priceRangeUsd : servicio.priceRange;
  const deliveryTime = isUS && servicio.deliveryTimeEn ? servicio.deliveryTimeEn : servicio.deliveryTime;
  const serviceName = isUS && servicio.nameEn ? servicio.nameEn : servicio.name;

  const splitWord = isUS ? ' in ' : ' en ';
  const h1Parts = h1.split(splitWord);
  const cityLabel = isUS ? `in ${ciudad.name}` : `en ${ciudad.name}`;

  const ui = isUS ? {
    ctaAudit: `Start Project in ${ciudad.name}`,
    infraTitle: `Infrastructure designed for ${ciudad.name}'s market`,
    geoTitle: 'Geographic Relevance',
    geoDesc: `We optimize your digital presence for ${ciudad.name}'s search landscape, ensuring your business connects with high-intent clients across ${ciudad.country}.`,
    effTitle: 'Execution Efficiency',
    effDesc: `We don't just write code — we deploy revenue-generating assets. From ${servicio.id === 'chatbot-ia' ? 'autonomous AI agents' : 'ultra-fast loading systems'} to outcompete in ${ciudad.name}.`,
    quote: `Our mission is to help organizations in ${ciudad.name} stop having simple websites and start operating automated conversion machines at world-class standards.`,
    ctaConsult: `Technical Consulting in ${ciudad.name}`,
    benefitsLabel: 'Benefits',
    benefitsTitle: `Why Choose Our ${serviceName} Service`,
    processLabel: 'Process',
    processTitle: `How We Work in ${ciudad.name}`,
    investLabel: 'Investment',
    deliveryLabel: 'Delivery Time',
    faqTitle: `Frequently Asked Questions About ${serviceName} in ${ciudad.name}`,
    catalogLabel: 'Catalog',
    otherTitle: `Other Services Available in ${ciudad.name}`,
    viewAll: 'View All Services',
    resourcesLabel: 'Resources',
    resourcesTitle: 'Helpful Articles for Your Project',
    chatMsg: `Hi Omar, I'm reaching out from your ${serviceName} page in ${ciudad.name}. I'd like to learn more about this service.`,
    blog1Title: 'Why Hire a Colombian Developer?',
    blog1Sub: 'Quality, Time Zone & Rates 2026',
    blog1Href: '/blog/why-hire-colombian-developer-2026',
    blog2Title: 'Freelance Developer vs Agency',
    blog2Sub: 'Which should you choose?',
    blog2Href: '/blog/freelance-developer-vs-agency-web-project',
    blog3Title: 'Building an MVP in 30 Days',
    blog3Sub: 'Next.js framework explained',
    blog3Href: '/blog/build-mvp-nextjs-30-days-process',
  } : {
    ctaAudit: `Auditar Proyecto en ${ciudad.name}`,
    infraTitle: `Infraestructura diseñada para el mercado de ${ciudad.name}`,
    geoTitle: 'Relevancia Geográfica',
    geoDesc: `Optimizamos su arquitectura digital para los protocolos de búsqueda específicos de ${ciudad.name}, asegurando que su entidad tecnológica conecte de forma prioritaria con clientes en ${ciudad.country}.`,
    effTitle: 'Eficiencia de Ejecución',
    effDesc: `No solo consolidamos código; desplegamos activos financieros. Desde ${servicio.id === 'chatbot-ia' ? 'agentes inteligentes autónomos' : 'sistemas de carga ultra-rápida'} para la competencia local en ${ciudad.name}.`,
    quote: `Nuestra misión operativa es que las organizaciones en ${ciudad.name} dejen de tener simples sitios web y comiencen a operar máquinas de conversión automatizadas bajo estándares de clase mundial.`,
    ctaConsult: `Consultoría Técnica en ${ciudad.name}`,
    benefitsLabel: 'Ventajas',
    benefitsTitle: `Por qué elegir nuestro servicio de ${serviceName}`,
    processLabel: 'Proceso',
    processTitle: `Cómo trabajamos en ${ciudad.name}`,
    investLabel: 'Inversión',
    deliveryLabel: 'Tiempo de Entrega',
    faqTitle: `Preguntas frecuentes sobre ${serviceName} en ${ciudad.name}`,
    catalogLabel: 'Catálogo',
    otherTitle: `Otros servicios disponibles en ${ciudad.name}`,
    viewAll: 'Ver todos los servicios',
    resourcesLabel: 'Recursos',
    resourcesTitle: 'Artículos útiles para tu proyecto',
    chatMsg: `Hola Omar, vengo de la página de ${serviceName} en ${ciudad.name}. Me gustaría saber más sobre este servicio.`,
    blog1Title: '¿Por qué contratar desarrollador colombiano?',
    blog1Sub: 'Calidad, zona horaria y precios 2026',
    blog1Href: '/blog/why-hire-colombian-developer-2026',
    blog2Title: '¿Freelance o agencia de desarrollo?',
    blog2Sub: 'Comparativa real para tu proyecto',
    blog2Href: '/blog/freelance-developer-vs-agency-web-project',
    blog3Title: 'Crear un MVP en 30 días con Next.js',
    blog3Sub: 'Framework y proceso explicado',
    blog3Href: '/blog/build-mvp-nextjs-30-days-process',
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": `https://omarhernandezrey.com/servicios/${servicioId}/${ciudadId}`,
    "name": `Omar Hernández Rey — ${serviceName} in ${ciudad.name}`,
    "url": `https://omarhernandezrey.com/servicios/${servicioId}/${ciudadId}`,
    "telephone": "+573219052878",
    "priceRange": "$$-$$$",
    "description": description,
    "areaServed": {
      "@type": "City",
      "name": ciudad.name,
      "addressCountry": ciudad.country === 'Colombia' ? 'CO' : ciudad.country === 'United States' ? 'US' : ciudad.country,
    },
    "provider": {
      "@type": "Person",
      "@id": "https://omarhernandezrey.com/#person",
    },
    "isPartOf": {
      "@id": "https://omarhernandezrey.com/#organization",
    },
    "serviceType": serviceName,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "priceRange": isUS && servicio.priceRangeUsd ? servicio.priceRangeUsd : "300-5000",
    },
    "inLanguage": isUS ? "en" : "es",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://omarhernandezrey.com" },
      { "@type": "ListItem", "position": 2, "name": "Services", "item": "https://omarhernandezrey.com/servicios" },
      { "@type": "ListItem", "position": 3, "name": `${serviceName} in ${ciudad.name}`, "item": `https://omarhernandezrey.com/servicios/${servicioId}/${ciudadId}` },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col selection:bg-primary/30">
      <JsonLd data={localBusinessSchema} />
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
              Regional Engineering Hub • {ciudad.name}
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-8xl font-black text-white-custom tracking-tighter leading-[0.9] italic">
              {h1Parts[0]}{' '}
              <span className="text-primary italic">{cityLabel}</span>
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
              message={ui.chatMsg}
              className="group inline-flex items-center gap-4 bg-primary text-background px-10 py-5 rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl shadow-primary/20"
            >
              {ui.ctaAudit}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </OpenChatButton>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 space-y-24">
          <div className="text-center space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted opacity-40">Methodology &amp; Performance</h2>
            <h3 className="text-3xl md:text-5xl font-black text-white-custom tracking-tighter italic">
              {ui.infraTitle.split(ciudad.name)[0]}
              <span className="text-primary text-outline-primary">{ciudad.name}</span>
              {ui.infraTitle.split(ciudad.name)[1]}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <ValueCard icon={<Globe size={32} />} title={ui.geoTitle} description={ui.geoDesc} />
            <ValueCard icon={<Zap size={32} />} title={ui.effTitle} description={ui.effDesc} />
          </div>

          <div className="mt-12 md:mt-20 p-8 md:p-12 lg:p-20 rounded-[32px] md:rounded-[60px] bg-card-bg border border-white/5 text-center shadow-2xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity blur-[80px]" />
            <div className="max-w-2xl mx-auto space-y-8 relative z-10">
              <p className="text-lg md:text-xl text-text-muted font-medium italic opacity-70 leading-relaxed">
                &ldquo;{ui.quote}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-4 pt-6">
                <div className="w-12 h-px bg-primary/30" />
                <OpenChatButton
                  message={ui.chatMsg}
                  className="text-primary font-black text-[11px] uppercase tracking-[0.4em] hover:scale-105 transition-transform italic"
                >
                  {ui.ctaConsult}
                </OpenChatButton>
                <div className="w-12 h-px bg-primary/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 border-t border-white/5 bg-background/50">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted opacity-40">{ui.benefitsLabel}</h2>
            <h3 className="text-3xl md:text-4xl font-black text-white-custom tracking-tighter italic">
              {ui.benefitsTitle}
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
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted opacity-40">{ui.processLabel}</h2>
            <h3 className="text-3xl md:text-4xl font-black text-white-custom tracking-tighter italic">
              {ui.processTitle}
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
              <h3 className="text-lg font-black text-text-muted uppercase tracking-widest mb-2">{ui.investLabel}</h3>
              <p className="text-2xl font-black text-white-custom italic">{priceRange}</p>
            </div>
            <div className="bg-card-bg rounded-3xl p-8 border border-white/5 text-center">
              <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-black text-text-muted uppercase tracking-widest mb-2">{ui.deliveryLabel}</h3>
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
            <h2 className="text-3xl md:text-4xl font-black text-white-custom tracking-tighter italic">
              {ui.faqTitle}
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

      {/* Other Services */}
      <section className="py-24 bg-card-bg/30 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted opacity-40">{ui.catalogLabel}</h2>
            <h3 className="text-2xl md:text-3xl font-black text-white-custom tracking-tighter italic">
              {ui.otherTitle.split(ciudad.name)[0]}
              <span className="text-primary">{ciudad.name}</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviciosProgramaticos
              .filter(s => s.id !== servicio.id)
              .slice(0, 6)
              .map(s => (
                <Link
                  key={s.id}
                  href={`/servicios/${s.id}/${ciudadId}`}
                  className="group bg-card-bg rounded-2xl p-5 border border-white/5 hover:border-primary/30 transition-all flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-bold text-white-custom group-hover:text-primary transition-colors italic mb-1">
                      {isUS && s.nameEn ? s.nameEn : s.name}
                    </p>
                    <p className="text-[10px] text-text-muted/50">
                      {isUS && s.priceRangeUsd ? s.priceRangeUsd : s.priceRange.split('(')[0].trim()}
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
              {ui.viewAll}
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Internal Linking */}
      <section className="py-16 bg-background border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted opacity-40">{ui.resourcesLabel}</h2>
            <h3 className="text-xl md:text-2xl font-black text-white-custom tracking-tighter italic">
              {ui.resourcesTitle}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href={ui.blog1Href} className="group bg-card-bg rounded-2xl p-6 border border-white/5 hover:border-primary/30 transition-all">
              <p className="text-sm font-bold text-white-custom group-hover:text-primary transition-colors italic mb-2">{ui.blog1Title}</p>
              <p className="text-xs text-text-muted/60">{ui.blog1Sub}</p>
            </Link>
            <Link href={ui.blog2Href} className="group bg-card-bg rounded-2xl p-6 border border-white/5 hover:border-primary/30 transition-all">
              <p className="text-sm font-bold text-white-custom group-hover:text-primary transition-colors italic mb-2">{ui.blog2Title}</p>
              <p className="text-xs text-text-muted/60">{ui.blog2Sub}</p>
            </Link>
            <Link href={ui.blog3Href} className="group bg-card-bg rounded-2xl p-6 border border-white/5 hover:border-primary/30 transition-all">
              <p className="text-sm font-bold text-white-custom group-hover:text-primary transition-colors italic mb-2">{ui.blog3Title}</p>
              <p className="text-xs text-text-muted/60">{ui.blog3Sub}</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
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
        <p className="text-sm text-text-muted font-medium italic opacity-60 leading-relaxed">{description}</p>
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
