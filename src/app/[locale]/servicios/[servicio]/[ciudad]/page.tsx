import React from 'react';
import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { serviciosProgramaticos } from '@/data/servicios';
import { ciudades, CIUDADES_INDEXABLES, CIUDAD_CONTEXTO } from '@/data/ciudades';
import WhatsAppCTA from '@/components/whatsapp/WhatsAppCTA';
import { ArrowRight, Shield, Zap, Globe, Target, UserCheck, CheckCircle, Clock, DollarSign, HelpCircle } from 'lucide-react';
import Footer from '@/components/shared/Footer';
import PricingReviewedNote from '@/components/shared/PricingReviewedNote';
import JsonLd from '@/components/seo/JsonLd';
import HeroImage from '@/components/shared/HeroImage';
import TiltImageCard from '@/components/shared/TiltImageCard';
import ScrollReveal from '@/components/shared/ScrollReveal';
import StatCounter from '@/components/shared/StatCounter';
import HeroParallax from '@/components/shared/HeroParallax';
import RevealText from '@/components/shared/RevealText';
import SmoothScrollProvider from '@/components/shared/SmoothScrollProvider';
import { servicioHeroImages, servicioSecondaryImages, globalTechBanner, unsplashUrl } from '@/data/heroImages';
import { buildMetadata, withBrand } from '@/lib/seo';
import { Sparkles } from 'lucide-react';
import ParticleField from '@/components/shared/ParticleFieldLoader';

interface Props {
  params: Promise<{
    locale: string;
    servicio: string;
    ciudad: string;
  }>;
}

// Solo se generan páginas para ciudades curadas, en ambos locales. Las URLs
// de ciudades no curadas responden 301 hacia la página pilar del servicio
// (ver abajo), consolidando señales en lugar de repartirlas entre cientos
// de páginas casi idénticas.
export async function generateStaticParams() {
  const paths = [];
  for (const locale of ['es', 'en']) {
    for (const servicio of serviciosProgramaticos) {
      for (const ciudadId of CIUDADES_INDEXABLES) {
        paths.push({
          locale,
          servicio: servicio.id,
          ciudad: ciudadId,
        });
      }
    }
  }
  return paths;
}

function esCiudadIndexable(ciudadId: string): boolean {
  return (CIUDADES_INDEXABLES as readonly string[]).includes(ciudadId);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, servicio: servicioId, ciudad: ciudadId } = await params;
  const servicio = serviciosProgramaticos.find(s => s.id === servicioId);
  const ciudad = ciudades.find(c => c.id === ciudadId);

  if (!servicio || !ciudad || !esCiudadIndexable(ciudadId)) return {};

  const isEn = locale === 'en';

  const title = isEn && servicio.h1En
    ? servicio.h1En.replace('{city}', ciudad.name)
    : servicio.h1.replace('{ciudad}', ciudad.name);

  const description = isEn && servicio.descriptionEn
    ? servicio.descriptionEn.replace('{city}', ciudad.name).replace('{country}', ciudad.country)
    : servicio.description.replace('{ciudad}', ciudad.name).replace('{country}', ciudad.country);

  const keywords = isEn && servicio.keywordsEn
    ? servicio.keywordsEn.map(k => k.replace('{city}', ciudad.name))
    : servicio.keywords.map(k => k.replace('{ciudad}', ciudad.name).replace('{country}', ciudad.country));

  const serviceName = isEn && servicio.nameEn ? servicio.nameEn : servicio.name;

  return buildMetadata({
    title: withBrand(title),
    description,
    path: `/servicios/${servicioId}/${ciudadId}`,
    locale: isEn ? 'en' : 'es',
    ogSubtitle: serviceName + (isEn ? ' in ' : ' en ') + ciudad.name,
    keywords,
  });
}

export default async function ServicioCiudadPage({ params }: Props) {
  const { locale, servicio: servicioId, ciudad: ciudadId } = await params;
  const servicio = serviciosProgramaticos.find(s => s.id === servicioId);
  const ciudad = ciudades.find(c => c.id === ciudadId);

  if (!servicio || !ciudad) {
    notFound();
  }

  // 301: las ciudades retiradas del programa SEO consolidan en la página pilar
  if (!esCiudadIndexable(ciudadId)) {
    permanentRedirect(`/servicios/${servicioId}`);
  }

  const servicioHero = servicioHeroImages[servicio.id];
  const servicioSecondary = servicioSecondaryImages[servicio.id];

  const isEn = locale === 'en';

  const h1 = isEn && servicio.h1En
    ? servicio.h1En.replace('{city}', ciudad.name)
    : servicio.h1.replace('{ciudad}', ciudad.name);

  const h2 = isEn && servicio.h2En
    ? servicio.h2En.replace('{city}', ciudad.name).replace('{country}', ciudad.country)
    : servicio.h2.replace('{ciudad}', ciudad.name).replace('{country}', ciudad.country);

  const description = isEn && servicio.descriptionEn
    ? servicio.descriptionEn.replace('{city}', ciudad.name).replace('{country}', ciudad.country)
    : servicio.description.replace('{ciudad}', ciudad.name).replace('{country}', ciudad.country);

  // Contexto de mercado real por ciudad (no plantilla) — reduce el % de
  // contenido idéntico entre páginas de ciudad que Google trata como thin content.
  const cityContexto = CIUDAD_CONTEXTO[ciudad.id];
  const marketContext = cityContexto ? (isEn ? cityContexto.marketContext.en : cityContexto.marketContext.es) : '';

  const benefits = isEn && servicio.benefitsEn ? servicio.benefitsEn : servicio.benefits;
  const process = isEn && servicio.processEn ? servicio.processEn : servicio.process;
  // FAQ local real (huso horario / modalidad remota), distinta a la del servicio,
  // para que cada ciudad no sea solo la misma plantilla con el nombre cambiado.
  const localFaq = isEn
    ? (ciudad.id === 'bogota'
      ? {
          q: 'Are you based in Bogotá, or fully remote?',
          a: `I'm based in Bogotá, Colombia. All collaboration happens remotely via video call and messaging — no on-site presence needed for a ${ciudad.name} project.`,
        }
      : {
          q: 'What time zone do you work in?',
          a: `I'm based in Colombia (UTC-5), at most 1 hour behind US Eastern Time — real-time collaboration during your business hours in ${ciudad.name} is easy, no overnight delays.`,
        })
    : ciudad.id === 'bogota'
      ? {
          q: '¿Podemos reunirnos en persona en Bogotá?',
          a: 'Sí. Estoy radicado en Bogotá y, si el proyecto lo amerita, coordinamos una reunión presencial; el resto del trabajo se hace remoto.',
        }
      : {
          q: '¿Trabajas de forma remota o necesito estar en Bogotá?',
          a: `100% remoto. Coordinamos todo por videollamada y mensajería — no necesitas viajar ni yo debo desplazarme a ${ciudad.name}.`,
        };

  const paymentFaq = cityContexto ? (isEn ? cityContexto.paymentFaq.en : cityContexto.paymentFaq.es) : null;

  const faqs = [
    ...(isEn && servicio.faqsEn
      ? servicio.faqsEn.map(f => ({ q: f.q.replace('{city}', ciudad.name), a: f.a }))
      : servicio.faqs.map(f => ({ q: f.q.replace('{ciudad}', ciudad.name), a: f.a }))),
    localFaq,
    ...(paymentFaq ? [paymentFaq] : []),
  ];
  const priceRange = isEn && servicio.priceRangeUsd ? servicio.priceRangeUsd : servicio.priceRange;
  const deliveryTime = isEn && servicio.deliveryTimeEn ? servicio.deliveryTimeEn : servicio.deliveryTime;
  const serviceName = isEn && servicio.nameEn ? servicio.nameEn : servicio.name;

  const splitWord = isEn ? ' in ' : ' en ';
  const h1Parts = h1.split(splitWord);
  const cityLabel = isEn ? `in ${ciudad.name}` : `en ${ciudad.name}`;

  const ui = isEn ? {
    ctaAudit: `Start Project in ${ciudad.name}`,
    infraTitle: `Infrastructure designed for ${ciudad.name}'s market`,
    geoTitle: 'Geographic Relevance',
    geoDesc: `I coordinate with clients in ${ciudad.name} in real time: Colombia (UTC-5) is at most 1 hour behind US Eastern Time, and I invoice in USD via PayPal — no time-zone friction, no currency conversion headaches.`,
    effTitle: 'Execution Efficiency',
    effDesc: `We don't just write code — we deploy revenue-generating assets. From ultra-fast loading systems to outcompete in ${ciudad.name}.`,
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
    geoDesc: ciudad.id === 'bogota'
      ? 'Con base en Bogotá, trabajo de forma remota para todo el país y puedo coordinar reuniones presenciales si tu proyecto lo requiere.'
      : `Trabajo 100% remoto para clientes en ${ciudad.name}, en el mismo huso horario (COT, UTC-5) y con pagos en pesos colombianos vía Nequi o Wompi — sin fricciones de zona horaria ni cambio de moneda.`,
    effTitle: 'Eficiencia de Ejecución',
    effDesc: `No solo consolidamos código; desplegamos activos financieros. Desde sistemas de carga ultra-rápida para la competencia local en ${ciudad.name}.`,
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

  // Cifras ya usadas en /servicios (listado) — no se inventan datos nuevos.
  const stats = isEn
    ? [
        { value: 30, prefix: '+', label: 'Projects delivered' },
        { value: 5, suffix: '+', label: 'Years of experience' },
        { value: 24, suffix: 'h', label: 'Response time' },
        { value: 100, suffix: '%', label: 'Remote' },
      ]
    : [
        { value: 30, prefix: '+', label: 'Proyectos entregados' },
        { value: 5, suffix: '+', label: 'Años de experiencia' },
        { value: 24, suffix: 'h', label: 'Tiempo de respuesta' },
        { value: 100, suffix: '%', label: 'Remoto' },
      ];

  const base = isEn ? 'https://omarhernandezrey.com/en' : 'https://omarhernandezrey.com';

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "ProfessionalService"],
    "@id": `${base}/servicios/${servicioId}/${ciudadId}`,
    "name": `Omar Hernández Rey — ${serviceName} in ${ciudad.name}`,
    "url": `${base}/servicios/${servicioId}/${ciudadId}`,
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
      "priceCurrency": isEn ? "USD" : "COP",
      "priceRange": isEn && servicio.priceRangeUsd ? servicio.priceRangeUsd : servicio.priceRange,
    },
    "inLanguage": isEn ? "en" : "es",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": isEn ? "Home" : "Inicio", "item": base },
      { "@type": "ListItem", "position": 2, "name": isEn ? "Services" : "Servicios", "item": `${base}/servicios` },
      { "@type": "ListItem", "position": 3, "name": serviceName, "item": `${base}/servicios/${servicioId}` },
      { "@type": "ListItem", "position": 4, "name": `${serviceName} ${cityLabel}`, "item": `${base}/servicios/${servicioId}/${ciudadId}` },
    ],
  };

  return (
    <SmoothScrollProvider>
    <div className="min-h-screen bg-background text-text-main flex flex-col selection:bg-primary/30">
      <JsonLd data={localBusinessSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* Hero */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden border-b border-white/5 bg-card-bg/20 backdrop-blur-sm">
        <HeroParallax className="absolute inset-0 -z-10">
          <div data-parallax-speed="0.25" className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
          </div>
          <div data-parallax-speed="0.4" className="absolute inset-0">
            <ParticleField className="w-full h-full opacity-60" />
          </div>
          <div data-parallax-speed="0.12" className="bg-tech-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
        </HeroParallax>

        <div className="max-w-[90rem] mx-auto px-[var(--grid-margin)] relative z-10 text-center space-y-12">
          <div className="space-y-6 max-w-4xl mx-auto">
            <ScrollReveal y={16}>
              <div className="font-mono-label inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[0.65rem]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                </span>
                Regional Engineering Hub • {ciudad.name}
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h1 className="font-display italic text-4xl sm:text-5xl md:text-8xl font-medium text-white-custom tracking-tight leading-[0.9]">
                {h1Parts[0]}{' '}
                <span className="text-primary italic">{cityLabel}</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <h2 className="text-xl md:text-2xl font-bold text-text-muted italic opacity-60 tracking-tight leading-relaxed max-w-2xl mx-auto">
                {h2}
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <p className="text-lg text-text-muted/70 font-medium leading-relaxed max-w-2xl mx-auto italic">
                {description}
              </p>
            </ScrollReveal>
            {marketContext && (
              <ScrollReveal delay={0.35}>
                <p className="text-sm text-text-muted/50 font-medium leading-relaxed max-w-2xl mx-auto">
                  {marketContext}
                </p>
              </ScrollReveal>
            )}
          </div>

          <ScrollReveal delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <WhatsAppCTA
                message={ui.chatMsg}
                className="group inline-flex items-center gap-4 bg-primary text-background px-10 py-5 rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl shadow-primary/20"
              >
                {ui.ctaAudit}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </WhatsAppCTA>
            </div>
          </ScrollReveal>

          {servicioHero && (
            <ScrollReveal delay={0.5} y={32}>
              <TiltImageCard
                src={unsplashUrl(servicioHero.photoId)}
                alt={isEn ? servicioHero.alt.en : servicioHero.alt.es}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
                priority
                className="w-full max-w-5xl mx-auto aspect-[3/2] sm:aspect-[4/3] lg:aspect-[16/9] rounded-[32px] border border-white/5 shadow-2xl"
              />
            </ScrollReveal>
          )}

          <ScrollReveal delay={0.6}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 border-t border-white/5">
              {stats.map((stat) => (
                <StatCounter key={stat.label} value={stat.value} prefix={stat.prefix} suffix={stat.suffix} label={stat.label} />
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="max-w-[90rem] mx-auto px-[var(--grid-margin)] space-y-24">
          <ScrollReveal>
            <div className="text-center space-y-4">
              <h2 className="font-mono-label text-[0.6rem] text-text-muted opacity-40">Methodology &amp; Performance</h2>
              <h3 className="font-display italic text-3xl md:text-5xl font-medium text-white-custom tracking-tight">
                {ui.infraTitle.split(ciudad.name)[0]}
                <span className="text-primary text-outline-primary">{ciudad.name}</span>
                {ui.infraTitle.split(ciudad.name)[1]}
              </h3>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
            <div className="lg:col-span-2 space-y-8">
              <ScrollReveal delay={0.1}>
                <ValueCard icon={<Globe size={32} />} title={ui.geoTitle} description={ui.geoDesc} />
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <ValueCard icon={<Zap size={32} />} title={ui.effTitle} description={ui.effDesc} />
              </ScrollReveal>
            </div>

            {servicioSecondary && (
              <ScrollReveal delay={0.3} className="lg:col-span-3 relative">
                <TiltImageCard
                  src={unsplashUrl(servicioSecondary.photoId)}
                  alt={isEn ? servicioSecondary.alt.en : servicioSecondary.alt.es}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 800px"
                  className="w-full aspect-[4/3] md:aspect-[16/10] rounded-[32px] md:rounded-[48px] border border-white/5 shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-3 bg-card-bg/90 backdrop-blur-xl border border-primary/20 rounded-2xl px-5 py-4 shadow-2xl">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">{isEn ? 'Verified Stack' : 'Stack Verificado'}</p>
                    <p className="text-[10px] text-text-muted/60 font-medium">{serviceName}</p>
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 border-t border-white/5 bg-background/50">
        <div className="max-w-[90rem] mx-auto px-[var(--grid-margin)]">
          <ScrollReveal>
            <div className="text-center space-y-4 mb-16">
              <h2 className="font-mono-label text-[0.6rem] text-text-muted opacity-40">{ui.benefitsLabel}</h2>
              <h3 className="font-display italic text-3xl md:text-4xl font-medium text-white-custom tracking-tight">
                {ui.benefitsTitle}
              </h3>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => (
              <ScrollReveal key={idx} delay={(idx % 3) * 0.1}>
                <div className="flex items-start gap-4 bg-card-bg rounded-2xl p-6 border border-white/5 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
                  <CheckCircle className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-text-muted italic">{benefit}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="max-w-[90rem] mx-auto px-[var(--grid-margin)]">
          <ScrollReveal>
            <div className="text-center space-y-4 mb-16">
              <h2 className="font-mono-label text-[0.6rem] text-text-muted opacity-40">{ui.processLabel}</h2>
              <h3 className="font-display italic text-3xl md:text-4xl font-medium text-white-custom tracking-tight">
                {ui.processTitle}
              </h3>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((step, idx) => {
              const [title, desc] = step.split(': ');
              return (
                <ScrollReveal key={idx} delay={idx * 0.1} className="relative">
                  <div className="bg-card-bg rounded-2xl p-6 border border-white/5 hover:border-primary/20 transition-colors h-full">
                    <div className="text-4xl font-black text-primary/20 mb-4">0{idx + 1}</div>
                    <h4 className="text-lg font-bold text-white-custom italic mb-2">{title}</h4>
                    <p className="text-sm text-text-muted/70 font-medium italic">{desc}</p>
                  </div>
                  {idx < 3 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-white/10" />
                  )}
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Global Reach Banner */}
      <section className="relative isolate py-32 md:py-48 overflow-hidden border-y border-white/5">
        <HeroImage
          src={unsplashUrl(globalTechBanner.photoId)}
          alt={isEn ? globalTechBanner.alt.en : globalTechBanner.alt.es}
          sizes="100vw"
          className="z-0"
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-background via-background/85 to-background/50" />
        <ScrollReveal className="relative z-10">
          <div className="max-w-3xl mx-auto px-[var(--grid-margin)] text-center space-y-8">
            <RevealText
              text={`“${ui.quote}”`}
              className="text-xl md:text-3xl text-white-custom font-medium italic leading-relaxed [text-shadow:0_2px_20px_rgba(0,0,0,0.6)]"
            />
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-px bg-primary/50" />
              <WhatsAppCTA
                message={ui.chatMsg}
                className="text-primary font-black text-[11px] uppercase tracking-[0.4em] hover:scale-105 transition-transform italic"
              >
                {ui.ctaConsult}
              </WhatsAppCTA>
              <div className="w-12 h-px bg-primary/50" />
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Price & Time */}
      <section className="py-24 border-t border-white/5 bg-card-bg/30">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ScrollReveal>
              <div className="bg-card-bg rounded-3xl p-8 border border-white/5 text-center hover:border-primary/20 transition-colors">
                <DollarSign className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-black text-text-muted uppercase tracking-widest mb-2">{ui.investLabel}</h3>
                <p className="text-2xl font-black text-white-custom italic">{priceRange}</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="bg-card-bg rounded-3xl p-8 border border-white/5 text-center hover:border-primary/20 transition-colors">
                <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-black text-text-muted uppercase tracking-widest mb-2">{ui.deliveryLabel}</h3>
                <p className="text-2xl font-black text-white-custom italic">{deliveryTime}</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center space-y-4 mb-16">
              <HelpCircle className="w-12 h-12 text-primary mx-auto" />
              <h2 className="font-display italic text-3xl md:text-4xl font-medium text-white-custom tracking-tight">
                {ui.faqTitle}
              </h2>
            </div>
          </ScrollReveal>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <ScrollReveal key={idx} delay={Math.min(idx * 0.08, 0.4)}>
                <div className="bg-card-bg rounded-2xl p-6 border border-white/5">
                  <h3 className="text-lg font-bold text-white-custom italic mb-3">{faq.q}</h3>
                  <p className="text-sm text-text-muted/70 font-medium leading-relaxed italic">{faq.a}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Other Services */}
      <section className="py-24 bg-card-bg/30 border-t border-white/5">
        <div className="max-w-[90rem] mx-auto px-[var(--grid-margin)]">
          <ScrollReveal>
            <div className="text-center space-y-4 mb-12">
              <h2 className="font-mono-label text-[0.6rem] text-text-muted opacity-40">{ui.catalogLabel}</h2>
              <h3 className="font-display italic text-2xl md:text-3xl font-medium text-white-custom tracking-tight">
                {ui.otherTitle.split(ciudad.name)[0]}
                <span className="text-primary">{ciudad.name}</span>
              </h3>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviciosProgramaticos
              .filter(s => s.id !== servicio.id)
              .slice(0, 6)
              .map((s, idx) => (
                <ScrollReveal key={s.id} delay={(idx % 3) * 0.1}>
                <Link
                  href={`/servicios/${s.id}/${ciudadId}`}
                  className="group bg-card-bg rounded-2xl p-5 border border-white/5 hover:border-primary/30 transition-all flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-bold text-white-custom group-hover:text-primary transition-colors italic mb-1">
                      {isEn && s.nameEn ? s.nameEn : s.name}
                    </p>
                    <p className="text-[10px] text-text-muted/50">
                      {isEn && s.priceRangeUsd ? s.priceRangeUsd : s.priceRange.split('(')[0].trim()}
                    </p>
                  </div>
                  <ArrowRight size={14} className="text-text-muted/30 group-hover:text-primary transition-colors shrink-0" />
                </Link>
                </ScrollReveal>
              ))}
          </div>
          <div className="text-center mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/servicios/${servicioId}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-primary/80 hover:text-primary transition-colors"
            >
              {isEn ? `${serviceName} — full service page` : `Página completa de ${serviceName}`}
              <ArrowRight size={14} />
            </Link>
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
          <ScrollReveal>
            <div className="text-center space-y-3 mb-10">
              <h2 className="font-mono-label text-[0.6rem] text-text-muted opacity-40">{ui.resourcesLabel}</h2>
              <h3 className="font-display italic text-xl md:text-2xl font-medium text-white-custom tracking-tight">
                {ui.resourcesTitle}
              </h3>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScrollReveal delay={0}>
              <Link href={ui.blog1Href} className="group bg-card-bg rounded-2xl p-6 border border-white/5 hover:border-primary/30 transition-all block">
                <p className="text-sm font-bold text-white-custom group-hover:text-primary transition-colors italic mb-2">{ui.blog1Title}</p>
                <p className="text-xs text-text-muted/60">{ui.blog1Sub}</p>
              </Link>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <Link href={ui.blog2Href} className="group bg-card-bg rounded-2xl p-6 border border-white/5 hover:border-primary/30 transition-all block">
                <p className="text-sm font-bold text-white-custom group-hover:text-primary transition-colors italic mb-2">{ui.blog2Title}</p>
                <p className="text-xs text-text-muted/60">{ui.blog2Sub}</p>
              </Link>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <Link href={ui.blog3Href} className="group bg-card-bg rounded-2xl p-6 border border-white/5 hover:border-primary/30 transition-all block">
                <p className="text-sm font-bold text-white-custom group-hover:text-primary transition-colors italic mb-2">{ui.blog3Title}</p>
                <p className="text-xs text-text-muted/60">{ui.blog3Sub}</p>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <ScrollReveal>
        <div className="flex flex-wrap justify-center gap-12 py-16 opacity-20 border-t border-white/5">
          <TrustItem icon={<Shield size={14} />} text="Secure Deployment" />
          <TrustItem icon={<UserCheck size={14} />} text="Verified Consultant" />
          <TrustItem icon={<Target size={14} />} text="Data Driven Strategy" />
        </div>
      </ScrollReveal>

      <PricingReviewedNote isEn={isEn} />
      <Footer />
    </div>
    </SmoothScrollProvider>
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
    <div className="font-mono-label flex items-center gap-2 text-[0.55rem] text-text-muted">
      {icon}
      {text}
    </div>
  );
}
