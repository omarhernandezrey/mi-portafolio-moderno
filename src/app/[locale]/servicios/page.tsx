import React from 'react';
import { buildMetadata } from '@/lib/seo';
import { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Code2, Zap, ShoppingCart, LineChart, Target, Smartphone, Search, Link2, Wrench, MapPin, CheckCircle } from 'lucide-react';
import Footer from '@/components/shared/Footer';
import JsonLd from '@/components/seo/JsonLd';
import { serviciosProgramaticos } from '@/data/servicios';
import { ciudades } from '@/data/ciudades';
import OpenChatButton from '@/components/shared/OpenChatButton';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';

  return buildMetadata(
    isEn
      ? {
          title: 'Web Development & Software Services | Colombia',
          description: 'Web development, e-commerce, technical SEO, and automation with React and Next.js. Projects from $300 USD for Colombia, the US, and LATAM.',
          path: '/servicios',
          locale: 'en',
          ogSubtitle: 'Colombia & Remote — From $300 USD',
          keywords: [
            'hire web developer colombia',
            'freelance developer colombia',
            'full stack developer colombia',
            'professional web development colombia',
            'e-commerce colombia',
            'process automation colombia',
            'technical seo colombia',
          ],
        }
      : {
          title: 'Servicios de Desarrollo Web y Software | Colombia',
          description: 'Desarrollo web, e-commerce, SEO técnico y automatización con React y Next.js. Proyectos desde $300 USD para Colombia, USA y LATAM.',
          path: '/servicios',
          locale: 'es',
          ogSubtitle: 'Colombia & Remoto — Desde $300 USD',
          keywords: [
            'contratar desarrollador web colombia',
            'programador freelance colombia',
            'desarrollador full stack colombia',
            'desarrollo web profesional colombia',
            'e-commerce colombia',
            'automatizacion de procesos colombia',
            'seo tecnico colombia',
            'full stack developer colombia',
            'ingeniero de software freelance',
            'aplicaciones web colombia',
            'react developer colombia',
          ],
        }
  );
}

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  'desarrollo-web': <Code2 size={28} />,
  'automatizacion': <Zap size={28} />,
  'e-commerce': <ShoppingCart size={28} />,
  'consultoria-tech': <LineChart size={28} />,
  'landing-page': <Target size={28} />,
  'aplicacion-movil': <Smartphone size={28} />,
  'seo-tecnico': <Search size={28} />,
  'integracion-apis': <Link2 size={28} />,
  'mantenimiento-web': <Wrench size={28} />,
};

const COLOMBIA_CITIES = ['bogota', 'medellin', 'cali', 'barranquilla', 'bucaramanga'];

export default async function ServiciosPage({ params }: Props) {
  const { locale } = await params;
  const isEn = locale === 'en';
  const base = isEn ? 'https://omarhernandezrey.com/en' : 'https://omarhernandezrey.com';
  const ciudadesPrincipales = ciudades.filter(c => COLOMBIA_CITIES.includes(c.id));

  const svcName = (s: typeof serviciosProgramaticos[number]) => (isEn ? s.nameEn ?? s.name : s.name);
  const svcDescription = (s: typeof serviciosProgramaticos[number]) =>
    (isEn ? s.descriptionEn ?? s.description : s.description)
      .replace('{ciudad}', 'Colombia').replace('{city}', 'Colombia').replace('{country}', 'Colombia');
  const svcBenefits = (s: typeof serviciosProgramaticos[number]) => (isEn ? s.benefitsEn ?? s.benefits : s.benefits);
  const svcDeliveryTime = (s: typeof serviciosProgramaticos[number]) => (isEn ? s.deliveryTimeEn ?? s.deliveryTime : s.deliveryTime);

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': isEn ? 'Web Development & Software Services — Omar Hernández Rey' : 'Servicios de Desarrollo Web y Software — Omar Hernández Rey',
    'description': isEn
      ? 'Professional full stack web development, e-commerce, and automation services for Colombia and LATAM.'
      : 'Servicios profesionales de desarrollo web full stack, e-commerce y automatización para Colombia y LATAM.',
    'url': `${base}/servicios`,
    'numberOfItems': serviciosProgramaticos.length,
    'itemListElement': serviciosProgramaticos.map((s, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'name': svcName(s),
      'description': svcDescription(s),
      'url': `${base}/servicios/${s.id}`,
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': isEn ? 'Home' : 'Inicio', 'item': base },
      { '@type': 'ListItem', 'position': 2, 'name': isEn ? 'Services' : 'Servicios', 'item': `${base}/servicios` },
    ],
  };

  const professionalServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${base}/servicios#service-catalog`,
    'name': isEn ? 'Omar Hernández Rey — Freelance Web Development Services' : 'Omar Hernández Rey — Servicios de Desarrollo Web Freelance',
    'url': `${base}/servicios`,
    'telephone': '+573219052878',
    'priceRange': '$$-$$$',
    'areaServed': ['CO', 'US', 'MX', 'AR', 'CL', 'PE'],
    'provider': {
      '@type': 'Person',
      '@id': 'https://omarhernandezrey.com/#person',
    },
    'isPartOf': {
      '@id': 'https://omarhernandezrey.com/#organization',
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `${base}/servicios`,
    },
    'hasOfferCatalog': {
      '@type': 'OfferCatalog',
      'name': isEn ? 'Web Development Services' : 'Servicios de Desarrollo Web',
      'itemListElement': serviciosProgramaticos.map(s => ({
        '@type': 'Offer',
        'priceCurrency': 'USD',
        'price': s.priceRangeUsd
          ? parseInt(s.priceRangeUsd.replace(/[^0-9]/g, '').slice(0, 4)) || undefined
          : undefined,
        'itemOffered': {
          '@type': 'Service',
          'name': svcName(s),
          'description': svcDescription(s),
          'url': `${base}/servicios/${s.id}`,
        },
      })),
    },
  };

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col selection:bg-primary/30">
      <JsonLd data={itemListSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={professionalServiceSchema} />

      {/* Hero */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden border-b border-white/5 bg-card-bg/20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-[15%] left-[5%] w-80 h-80 bg-primary/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[5%] w-80 h-80 bg-accent/8 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-[90rem] mx-auto px-[var(--grid-margin)]">
          <div className="max-w-4xl space-y-8">
            <div className="font-mono-label inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[0.65rem]">
              {isEn ? 'Freelance Web Developer · Colombia & Remote' : 'Desarrollador Web Freelance · Colombia & Remoto'}
            </div>
            <h1 className="font-display italic text-5xl md:text-7xl font-medium text-white-custom tracking-tight leading-[0.9]">
              {isEn ? (
                <>Web Development<br /><span className="text-primary">& Software</span><br />Services</>
              ) : (
                <>Servicios de<br /><span className="text-primary">Desarrollo Web</span><br />y Software</>
              )}
            </h1>
            <p className="text-lg md:text-xl text-text-muted font-medium max-w-2xl leading-relaxed opacity-80">
              {isEn
                ? "I'm Omar Hernández, a freelance full stack developer in Colombia. I build custom websites and applications for companies and entrepreneurs looking to grow digitally. Available for projects in Colombia and remote for the US and LATAM."
                : 'Soy Omar Hernández, desarrollador full stack freelance en Colombia. Creo webs y aplicaciones a medida para empresas y emprendedores que quieren crecer digitalmente. Disponible para proyectos en Colombia y remoto para USA y LATAM.'}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {['React & Next.js', 'Node.js', 'PostgreSQL', isEn ? 'Technical SEO' : 'SEO Técnico', 'E-commerce'].map(tech => (
                <span key={tech} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-text-muted">
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <OpenChatButton
                message={isEn ? "Hi Omar, I'm coming from the services page. I want to know more about what you offer." : "Hola Omar, vengo de la página de servicios. Quiero saber más sobre lo que ofreces."}
                className="inline-flex items-center gap-3 bg-primary text-background px-8 py-4 rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl shadow-primary/20"
              >
                {isEn ? 'Free Consultation' : 'Consulta Gratis'}
                <ArrowRight size={16} />
              </OpenChatButton>
              <Link
                href="#servicios"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-[24px] border border-white/10 text-sm font-bold text-text-muted hover:text-white-custom hover:border-white/20 transition-all"
              >
                {isEn ? 'View all services' : 'Ver todos los servicios'}
              </Link>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-16 border-t border-white/5">
            {(isEn
              ? [
                  { value: '+30', label: 'Projects delivered' },
                  { value: '5+', label: 'Years of experience' },
                  { value: '$500 USD', label: 'Starting price' },
                  { value: '24h', label: 'Response time' },
                ]
              : [
                  { value: '+30', label: 'Proyectos entregados' },
                  { value: '5+', label: 'Años de experiencia' },
                  { value: '$500 USD', label: 'Desde por proyecto' },
                  { value: '24h', label: 'Tiempo de respuesta' },
                ]
            ).map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-black text-primary italic">{stat.value}</div>
                <div className="text-xs text-text-muted/60 font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="servicios" className="py-24 md:py-32 bg-background">
        <div className="max-w-[90rem] mx-auto px-[var(--grid-margin)] space-y-16">
          <div className="text-center space-y-4">
            <p className="font-mono-label text-[0.65rem] text-primary/60">{isEn ? 'Service catalog' : 'Catálogo de servicios'}</p>
            <h2 className="font-display italic text-3xl md:text-5xl font-medium text-white-custom tracking-tight">
              {isEn ? 'What can I do for your business?' : '¿Qué puedo hacer por tu negocio?'}
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto leading-relaxed opacity-70">
              {isEn
                ? 'From websites to AI-powered automation systems. Every service is available for clients in Colombia and remote for the US and LATAM.'
                : 'Desde sitios web hasta sistemas de automatización con IA. Cada servicio está disponible para clientes en Colombia y remoto para USA y LATAM.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviciosProgramaticos.map((servicio) => (
              <article key={servicio.id} className="group bg-card-bg rounded-[28px] border border-white/5 p-7 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    {SERVICE_ICONS[servicio.id] ?? <Code2 size={28} />}
                  </div>
                  <span className="text-[10px] font-black text-text-muted/40 uppercase tracking-wider">
                    {svcDeliveryTime(servicio)}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white-custom italic mb-3 group-hover:text-primary transition-colors">
                  {svcName(servicio)}
                </h3>
                <p className="text-sm text-text-muted/70 leading-relaxed flex-1 mb-5">
                  {svcDescription(servicio)}
                </p>

                <div className="space-y-2 mb-6">
                  {svcBenefits(servicio).slice(0, 3).map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-text-muted/60">
                      <CheckCircle size={13} className="text-primary shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-5 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-black text-primary/80 italic">{servicio.priceRange.split('(')[0].trim()}</span>
                  <Link
                    href={`/servicios/${servicio.id}`}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white-custom transition-colors"
                  >
                    {isEn ? 'View service' : 'Ver servicio'}
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section className="py-24 border-t border-white/5 bg-card-bg/20">
        <div className="max-w-[90rem] mx-auto px-[var(--grid-margin)] space-y-12">
          <div className="text-center space-y-4">
            <p className="font-mono-label text-[0.65rem] text-primary/60">{isEn ? 'Coverage' : 'Cobertura'}</p>
            <h2 className="font-display italic text-3xl md:text-4xl font-medium text-white-custom tracking-tight">
              {isEn ? (
                <>I work with clients across Colombia<br /><span className="text-primary">and remote for the US and LATAM</span></>
              ) : (
                <>Trabajo con clientes en toda Colombia<br /><span className="text-primary">y en remoto para USA y LATAM</span></>
              )}
            </h2>
            <p className="text-text-muted max-w-xl mx-auto opacity-70 text-sm leading-relaxed">
              {isEn
                ? 'You can hire my services from anywhere in Colombia. I work 100% remote, with video calls and WhatsApp communication.'
                : 'Puedes contratar mis servicios desde cualquier ciudad de Colombia. Trabajo 100% remoto, con videollamadas y comunicación por WhatsApp.'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {ciudadesPrincipales.map(ciudad => (
              <Link
                key={ciudad.id}
                href={`/servicios/desarrollo-web/${ciudad.id}`}
                className="group flex items-center gap-2 p-4 bg-card-bg rounded-2xl border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <MapPin size={14} className="text-primary shrink-0" />
                <span className="text-sm font-bold text-text-muted group-hover:text-white-custom transition-colors">{ciudad.name}</span>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <p className="text-xs text-text-muted/40">
              {isEn
                ? 'Also serving: Medellín, Cali, Barranquilla, Cartagena, Bucaramanga, Pereira, Manizales, and all of Colombia. Remote for: Miami, New York, Mexico City, Buenos Aires, Lima, Santiago.'
                : 'También atiendo: Medellín, Cali, Barranquilla, Cartagena, Bucaramanga, Pereira, Manizales y toda Colombia. Remoto para: Miami, New York, Ciudad de México, Buenos Aires, Lima, Santiago.'}
            </p>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-background">
        <div className="max-w-[90rem] mx-auto px-[var(--grid-margin)] space-y-16">
          <div className="text-center space-y-4">
            <p className="font-mono-label text-[0.65rem] text-primary/60">{isEn ? 'How I work' : 'Cómo trabajo'}</p>
            <h2 className="font-display italic text-3xl md:text-4xl font-medium text-white-custom tracking-tight">
              {isEn ? 'Clear process, real results' : 'Proceso claro, resultados reales'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {(isEn
              ? [
                  { n: '01', title: 'Free consultation', desc: "We talk via video call or WhatsApp. You tell me about your project and I explain how I'd approach it." },
                  { n: '02', title: 'Clear proposal', desc: 'You receive a detailed proposal with scope, timeline, and price. No surprises.' },
                  { n: '03', title: 'Agile development', desc: 'I work in short sprints. You see progress every week and can give constant feedback.' },
                  { n: '04', title: 'Delivery & support', desc: 'I deliver the project production-ready with documentation and post-launch support.' },
                ]
              : [
                  { n: '01', title: 'Consulta gratis', desc: 'Hablamos por videollamada o WhatsApp. Me cuentas tu proyecto y yo te explico cómo lo haría.' },
                  { n: '02', title: 'Propuesta clara', desc: 'Recibes una propuesta detallada con alcance, tiempos y precio. Sin sorpresas.' },
                  { n: '03', title: 'Desarrollo ágil', desc: 'Trabajo por sprints cortos. Ves el avance cada semana y puedes dar feedback constante.' },
                  { n: '04', title: 'Entrega y soporte', desc: 'Entrego el proyecto listo para producción con documentación y soporte post-lanzamiento.' },
                ]
            ).map(step => (
              <div key={step.n} className="bg-card-bg rounded-2xl p-7 border border-white/5">
                <div className="text-5xl font-black text-primary/15 mb-5">{step.n}</div>
                <h3 className="text-lg font-black text-white-custom italic mb-3">{step.title}</h3>
                <p className="text-sm text-text-muted/70 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-white/5 bg-card-bg/30">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center space-y-8">
          <h2 className="font-display italic text-3xl md:text-5xl font-medium text-white-custom tracking-tight">
            {isEn ? (
              <>Ready to start<br /><span className="text-primary">your project?</span></>
            ) : (
              <>¿Listo para arrancar<br /><span className="text-primary">tu proyecto?</span></>
            )}
          </h2>
          <p className="text-lg text-text-muted opacity-70 leading-relaxed">
            {isEn
              ? "The initial consultation is free with no obligation. Tell me your idea and I'll tell you within 24 hours how I can help."
              : 'La consulta inicial es gratis y sin compromiso. Cuéntame tu idea y te digo en menos de 24 horas cómo puedo ayudarte.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <OpenChatButton
              message={isEn ? "Hi Omar, I want to hire your web development services. I'd like to schedule a consultation." : "Hola Omar, quiero contratar tus servicios de desarrollo web. Me gustaría agendar una consulta."}
              className="inline-flex items-center gap-3 bg-primary text-background px-10 py-5 rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl shadow-primary/20"
            >
              {isEn ? 'Schedule Free Consultation' : 'Agendar Consulta Gratis'}
              <ArrowRight size={16} />
            </OpenChatButton>
            <Link
              href="/blog"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-[28px] border border-white/10 text-sm font-bold text-text-muted hover:text-white-custom hover:border-white/20 transition-all"
            >
              {isEn ? 'Read the technical blog' : 'Leer el blog técnico'}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
